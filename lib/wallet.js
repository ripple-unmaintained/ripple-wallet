module.exports = function(options) {
  var EC = require('elliptic').ec;
  var ec = new EC('secp256k1');

  var sjcl = options.sjcl; // inject sjcl dependency

  var base58 = require(__dirname+'/base58.js')({ sjcl: options.sjcl });;
  var MasterKey = require(__dirname+'/master_key.js')({ sjcl: options.sjcl });
  var RippleAddress = require(__dirname+'/ripple_address.js')({ sjcl: options.sjcl });
  var PublicGenerator = require(__dirname+'/public_generator.js')({ sjcl: options.sjcl });

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

  RippleWallet.prototype = {
    getSeed: function(){
      var self = this;
      return {
        value: sjcl.codec.hex.fromBits(sjcl.codec.bytes.toBits(self.getPrivateKey()))
      }
    },

    getPrivateKey: function(){
      var self = this;
      return base58.decode_base_check(33, self.secret);
    },

    getPrivateGenerator: function(privateKey){
      var i = 0;
      do {
        // Compute the hash of the 128-bit privateKey and the sequenceuence number
        privateGenerator = sjcl.bn.fromBits(firstHalfOfSHA512(append_int(privateKey, i)));
        i++;
        // If the hash is equal to or greater than the SECp256k1 order, increment sequenceuence and try agin
      } while (!sjcl.ecc.curves.c256.r.greaterEquals(privateGenerator));
      return privateGenerator;
    },

    getPublicGenerator: function (){
      var privateKey = this.getPrivateKey();
      var privateGenerator = this.getPrivateGenerator(privateKey);
      return PublicGenerator.fromPrivateGenerator(privateGenerator);
    },

    getPublicKey: function(publicGenerator){
      var sec;
      var i = 0;
      do {
        // Compute the hash of the public generator with the sub-sequence number
        sec = sjcl.bn.fromBits(firstHalfOfSHA512(append_int(append_int(publicGenerator.toBytesCompressed(), 0), i)));
        i++;
        // If the hash is equal to or greater than the SECp256k1 order, increment the sequence and retry
      } while (!sjcl.ecc.curves.c256.r.greaterEquals(sec));
      // Treating this hash as a private key, compute the corresponding public key as an EC point. 
      return sjcl.ecc.curves.c256.G.mult(sec).toJac().add(publicGenerator).toAffine();
    },

    getAddress: function(){
      var publicGenerator = this.getPublicGenerator().value;
      var publicKey = this.getPublicKey(publicGenerator);
      return RippleAddress.fromPublicKey(publicKey);
    },

    getAddressFromValidationPublicKey: function(validation_public_key){
      var compressedPublicGenerator = base58.decode_base_check(28, validation_public_key);
      var ec_x = compressedPublicGenerator.slice(1);
      var point = ec.curve.pointFromX(ec_x, compressedPublicGenerator[0] === 0x03)
      var x = sjcl.bn.fromBits(sjcl.codec.bytes.toBits(ec_x));
      var y = sjcl.bn.fromBits(sjcl.codec.bytes.toBits(point.y.toArray()))
      var publicGenerator = new sjcl.ecc.point (sjcl.ecc.curves.c256, x, y)
      var publicKey = this.getPublicKey(publicGenerator);
      return RippleAddress.fromPublicKey(publicKey);
    },

    getAccountPublicKey: function(){
      var publicGenerator = this.getPublicGenerator().value;
      var publicKey = this.getPublicKey(publicGenerator);
      return {
        value: base58.encode_base_check(35, publicKey.toBytesCompressed())
      };
    },

    getValidationPublicKey: function(){
      var publicGenerator = this.getPublicGenerator().value;
      return {
        value: base58.encode_base_check(28, publicGenerator.toBytesCompressed())
      };
    },

    getAddressFromAccountPublicKey: function(account_public_key){
      var publicKey = base58.decode_base_check(35, account_public_key);
      return RippleAddress.fromPublicKeyBytes(publicKey);
    }
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
      address: wallet.getAddress().value,
      secret: secretKey
    };
  };

  return RippleWallet;
};
