var Base58 = require('./base58')
var Ripple = require('ripple-lib');
var sjcl = Ripple.sjcl;

;(function() {
  'use strict';

  function halfSHA512(bytes) {
    return sjcl.bitArray.bitSlice(
      sjcl.hash.sha512.hash(sjcl.codec.bytes.toBits(bytes)), 0, 256
    );
  };

  function RIPEMD160(bits) {
    return sjcl.hash.ripemd160.hash(sjcl.hash.sha256.hash(bits));
  };

  function appendInt(a, i) {
    return [].concat(a, i >> 24, (i >> 16) & 0xff, (i >> 8) & 0xff, i & 0xff);
  };

  function getAddress(seed) {
    var seed = Base58.decode_base_check(33, seed);

    if (!seed) {
      throw new Error('Invalid seed');
    }

    var seq = seq || 0;
    var privGen;
    var pubGen;
    var i = 0;

    do {
      // Compute the hash of the 128-bit seed and the sequence number
      privGen = sjcl.bn.fromBits(halfSHA512(appendInt(seed, ++i)));
      // If the hash is equal to or greater than the SECp256k1 order, increment sequence and try agin
    } while (!sjcl.ecc.curves.c256.r.greaterEquals(privGen));

    // Compute the public generator using from the private generator on the elliptic curve
    pubGen = sjcl.ecc.curves.c256.G.mult(privGen);

    var i = 0;
    var sec;

    do {
      // Compute the hash of the public generator with sub-sequence number
      sec = sjcl.bn.fromBits(halfSHA512(appendInt(appendInt(pubGen.toBytesCompressed(), seq), ++i)));
      // If the hash is equal to or greater than the SECp256k1 order, increment the sequence and retry
    } while (!sjcl.ecc.curves.c256.r.greaterEquals(sec));

    // Treating this hash as a private key, compute the corresponding public key as an EC point.
    var pubKey = sjcl.ecc.curves.c256.G.mult(sec).toJac().add(pubGen).toAffine();

    // Finally encode the EC public key as a ripple address using SHA256 and then RIPEMD160
    var encKey = sjcl.codec.bytes.fromBits(RIPEMD160(sjcl.codec.bytes.toBits(pubKey.toBytesCompressed())));

    return Base58.encode_base_check(0, encKey);
  };

  function generate() {
    for (var i=0; i<8; i++) {
      sjcl.random.addEntropy(Math.random(), 32, 'Math.random()');
    }

    // Generate a 128-bit master key that can be used to make any number of private / public key pairs and accounts
    var masterkey = Base58.encode_base_check(33, sjcl.codec.bytes.fromBits(sjcl.random.randomWords(4)));

    return {
      address: getAddress(masterkey),
      secret: masterkey
    }
  };

  exports.generate = generate;
})();

