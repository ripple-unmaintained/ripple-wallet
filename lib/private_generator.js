module.exports = function(options) { // inject sjcl dependency
  var sjcl = options.sjcl;
  var base58 = require(__dirname+'/base58.js')({ sjcl: sjcl });

  function firstHalfOfSHA512(bytes) {
    return sjcl.bitArray.bitSlice(
      sjcl.hash.sha512.hash(sjcl.codec.bytes.toBits(bytes)),
      0, 256
    );
  }

  function append_int(a, i) {
    return [].concat(a, i >> 24, (i >> 16) & 0xff, (i >> 8) & 0xff, i & 0xff)
  }

  function PrivateGenerator(privateGenerator) {
    this.value = privateGenerator;
  }

  PrivateGenerator.fromSeed = function(seed) {
    var privateKey = base58.decode_base_check(33, seed);

    var i = 0;
    var privateGenerator;
    do {
      // Compute the hash of the 128-bit privateKey and the sequenceuence number
      privateGenerator = sjcl.bn.fromBits(firstHalfOfSHA512(
        append_int(privateKey, i)));
      i++;
      // If the hash is equal to or greater than the SECp256k1 order, increment sequenceuence and try agin
    } while (!sjcl.ecc.curves.c256.r.greaterEquals(privateGenerator));

    return new this(privateGenerator);
  }

  return PrivateGenerator;
}

