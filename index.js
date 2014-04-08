"use strict";

var Base58 = require('./lib/base58')
var Ripple = require('ripple-lib');
var sjcl = Ripple.sjcl;

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

      function computePrivateGenerator(seed) {
        let i = 0, private_gen;
        
        do {
          // Compute the hash of the 128-bit seed and the sequence number
          private_gen = sjcl.bn.fromBits(firstHalfOfSHA512(append_int(seed, i)));
          i++;
          // If the hash is equal to or greater than the SECp256k1 order, increment sequence and try agin
        } while (!sjcl.ecc.curves.c256.r.greaterEquals(private_gen));

        return {
          generator: private_gen,
          sequence: i
        }
      }

      function computePublicGenerator(privateGenerator) {
        return sjcl.ecc.curves.c256.G.mult(privateGenerator);
      }

      var computed = computePrivateGenerator(seed);

      var privateGenerator = computed.generator;
      var sequence = computed.sequence;
      var publicGenerator = computePublicGenerator(privateGenerator);

      var sec;
      var i = 0;
      do {
        // Compute the hash of the public generator with sub-sequence number
        sec = sjcl.bn.fromBits(firstHalfOfSHA512(append_int(append_int(publicGenerator.toBytesCompressed(), sequence), i)));
        i++;
        // If the hash is equal to or greater than the SECp256k1 order, increment the sequence and retry
      } while (!sjcl.ecc.curves.c256.r.greaterEquals(sec));

      // Treating this hash as a private key, compute the corresponding public key as an EC point. 
      // Add this EC point to the public generator EC point. 
      // The resulting point is the public key for this account. 
      var pubKey = sjcl.ecc.curves.c256.G.mult(sec).toJac().add(publicGenerator).toAffine();

      // Finally encode the EC public key as a ripple address using SHA256 and then RIPEMD160
      return Base58.encode_base_check(0, sjcl.codec.bytes.fromBits(SHA256_RIPEMD160(sjcl.codec.bytes.toBits(pubKey.toBytesCompressed()))));
    };
  };
})();


RippleWallet._generateMasterSeed = function() {
  for (let i = 0; i < 8; i++) {
    sjcl.random.addEntropy(Math.random(), 32, "Math.random()");
  }

  var seed = Base58.encode_base_check(33, sjcl.codec.bytes.fromBits(sjcl.random.randomWords(4)));
  return seed;
}

RippleWallet.generate = function() {
  var masterSeed = this._generateMasterSeed();
  let address = new RippleWallet(masterSeed);

  return {
    address: address.getAddress(),
    secret: masterSeed 
  }
}

RippleWallet._computePrivateGenerator = function(seed) {
  let i = 0;
  do {
    // Compute the hash of the 128-bit seed and the sequence number
    let private_gen = sjcl.bn.fromBits(firstHalfOfSHA512(append_int(seed, i)));
    i++;
    // If the hash is equal to or greater than the SECp256k1 order, increment sequence and try agin
  } while (!sjcl.ecc.curves.c256.r.greaterEquals(private_gen));

  return {
    generator: private_gen,
    sequence: i
  }
}

Ripple.Wallet = RippleWallet;
exports.Ripple = Ripple;

