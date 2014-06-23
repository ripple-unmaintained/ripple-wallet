var sjcl = require('ripple-lib').sjcl;
var base58 = require(__dirname+'/base58.js');
var MasterKey = require(__dirname+'/master_key.js');
var RippleAddress = require(__dirname+'/ripple_address.js');

function firstHalfOfSHA512(bytes) {
  return sjcl.bitArray.bitSlice(
    sjcl.hash.sha512.hash(sjcl.codec.bytes.toBits(bytes)),
    0, 256
  );
}

function append_int(a, i) {
  return [].concat(a, i >> 24, (i >> 16) & 0xff, (i >> 8) & 0xff, i & 0xff)
}

function RippleWallet(secret){
  this.secret = secret;

  if (!this.secret) {
    throw "Invalid secret."
  }
}

RippleWallet.prototype.getPrivateKey = function(secret){
  return base58.decode_base_check(33, secret);
}

RippleWallet.prototype.getPrivateGenerator = function(privateKey){
  var i = 0;
  do {
    // Compute the hash of the 128-bit privateKey and the sequenceuence number
    privateGenerator = sjcl.bn.fromBits(firstHalfOfSHA512(append_int(privateKey, i)));
    i++;
    // If the hash is equal to or greater than the SECp256k1 order, increment sequenceuence and try agin
  } while (!sjcl.ecc.curves.c256.r.greaterEquals(privateGenerator));
  return privateGenerator; 
}

RippleWallet.prototype.getPublicGenerator = function (privateGenerator){
  /* Compute the public generator using from the 
     private generator on the elliptic curve
  */
  return sjcl.ecc.curves.c256.G.mult(privateGenerator);
}

RippleWallet.prototype.getPublicKey = function(publicGenerator, sequence){
  var sec;
  var i = 0;
  do {
    // Compute the hash of the public generator with sub-sequenceuence number
    sec = sjcl.bn.fromBits(firstHalfOfSHA512(append_int(append_int(publicGenerator.toBytesCompressed(), sequence), i)));
    i++;
    // If the hash is equal to or greater than the SECp256k1 order, increment the sequenceuence and retry
  } while (!sjcl.ecc.curves.c256.r.greaterEquals(sec));
  // Treating this hash as a private key, compute the corresponding public key as an EC point. 
  return sjcl.ecc.curves.c256.G.mult(sec).toJac().add(publicGenerator).toAffine();
}

RippleWallet.prototype.getAddress = function(sequence){
  sequence = sequence || 0;

  var privateKey = this.getPrivateKey(this.secret);
  var privateGenerator = this.getPrivateGenerator(privateKey);
  var publicGenerator = this.getPublicGenerator(privateGenerator);
  var publicKey = this.getPublicKey(publicGenerator, sequence);

  return RippleAddress.fromPublicKey(publicKey);
}

RippleWallet.getRandom = function(){
  var secretKey = MasterKey.getRandom().value;
  return new RippleWallet(secretKey);
};

RippleWallet.generate = function() {
  /* Generate a 128-bit master key that can be used to make 
     any number of private / public key pairs and accounts
  */
  var secretKey = MasterKey.getRandom().value;
  var wallet = new RippleWallet(secretKey);

  return {
    address: wallet.getAddress(0).value,
    secret: secretKey 
  };
};

module.exports = RippleWallet;

