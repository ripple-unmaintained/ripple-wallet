var base58 = require(__dirname+'/base58.js');
var Ripple = require('ripple-lib');
var sjcl = Ripple.sjcl;
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

function RippleWallet(seed){
  this.privateKey = base58.decode_base_check(33, seed);

  if (!this.privateKey) {
    throw "Invalid privateKey."
  }

  this.getAddress = function (seq) {
    seq = seq || 0;

    var private_gen, public_gen, i = 0;
    do {
      // Compute the hash of the 128-bit privateKey and the sequence number
      private_gen = sjcl.bn.fromBits(firstHalfOfSHA512(append_int(this.privateKey, i)));
      i++;
      // If the hash is equal to or greater than the SECp256k1 order, increment sequence and try agin
   } while (!sjcl.ecc.curves.c256.r.greaterEquals(private_gen));

    // Compute the public generator using from the private generator on the elliptic curve
    public_gen = sjcl.ecc.curves.c256.G.mult(private_gen);

    var sec;
    i = 0;
    do {
      // Compute the hash of the public generator with sub-sequence number
      sec = sjcl.bn.fromBits(firstHalfOfSHA512(append_int(append_int(public_gen.toBytesCompressed(), seq), i)));
      i++;
      // If the hash is equal to or greater than the SECp256k1 order, increment the sequence and retry
    } while (!sjcl.ecc.curves.c256.r.greaterEquals(sec));
    // Treating this hash as a private key, compute the corresponding public key as an EC point. 
    var publicKey = sjcl.ecc.curves.c256.G.mult(sec).toJac().add(public_gen).toAffine();

    return RippleAddress.fromPublicKey(publicKey);
  };
}

RippleWallet.generate = function() {
  /* Generate a 128-bit master key that can be used to make 
     any number of private / public key pairs and accounts
  */
  var secretKey = MasterKey.getRandom().value;
  var address = new RippleWallet(secretKey);

  return {
    address: address.getAddress().value,
    secret: secretKey 
  };
};

Ripple.Wallet = RippleWallet;
exports.Ripple = Ripple;

