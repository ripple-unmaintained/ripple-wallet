var Base58 = require(__dirname+'/base58.js');
var Ripple = require('ripple-lib');
var sjcl = Ripple.sjcl;
var MasterKey = require(__dirname+'/master_key.js');

var RippleWallet = (function () {
  function append_int(a, i) {
    return [].concat(a, i >> 24, (i >> 16) & 0xff, (i >> 8) & 0xff, i & 0xff)
  }

  function firstHalfOfSHA512(bytes) {
    return sjcl.bitArray.bitSlice(
      sjcl.hash.sha512.hash(sjcl.codec.bytes.toBits(bytes)),
      0, 256
    );
  }

  function SHA256_RIPEMD160(bits) {
    return sjcl.hash.ripemd160.hash(sjcl.hash.sha256.hash(bits));
  }

  return function (seed) {
    this.seed = Base58.decode_base_check(33, seed);

    if (!this.seed) {
      throw "Invalid seed."
    }

    this.getAddress = function (seq) {
      seq = seq || 0;

      var private_gen, public_gen, i = 0;
      do {
        // Compute the hash of the 128-bit seed and the sequence number
        private_gen = sjcl.bn.fromBits(firstHalfOfSHA512(append_int(this.seed, i)));
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
      var pubKey = sjcl.ecc.curves.c256.G.mult(sec).toJac().add(public_gen).toAffine();

      // Finally encode the EC public key as a ripple address using SHA256 and then RIPEMD160
      return Base58.encode_base_check(0, sjcl.codec.bytes.fromBits(SHA256_RIPEMD160(sjcl.codec.bytes.toBits(pubKey.toBytesCompressed()))));
    };
  };
})();

RippleWallet.generate = function() {
  
  // Generate a 128-bit master key that can be used to make any number of private / public key pairs and accounts
  var secretKey = MasterKey.getRandom().value;
  var address = new RippleWallet(secretKey);

  return {
    address: address.getAddress(),
    secret: secretKey 
  }
}

Ripple.Wallet = RippleWallet;
exports.Ripple = Ripple;

