
module.exports = function(options) { // inject sjcl dependency
  var sjcl = options.sjcl
  var base58 = require(__dirname+'/base58.js')({ sjcl: sjcl });
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

  function PublicKey(publicKey){
    this.value = publicKey;
  }

  PublicKey.fromPublicGenerator = function(publicGenerator){
    var sec;
    var i = 0;
    do {
      // Compute the hash of the public generator with the sub-sequence number
      sec = sjcl.bn.fromBits(firstHalfOfSHA512(append_int(append_int(publicGenerator.value.toBytesCompressed(), 0), i)));
      i++;
      // If the hash is equal to or greater than the SECp256k1 order, increment the sequence and retry
    } while (!sjcl.ecc.curves.c256.r.greaterEquals(sec));
    // Treating this hash as a private key, compute the corresponding public key as an EC point.
    return new this(sjcl.ecc.curves.c256.G.mult(sec).toJac()
      .add(publicGenerator.value).toAffine());
  }

  PublicKey.fromSeed = function(seed){
    var publicGenerator = PublicGenerator.fromSeed(seed);
    // console.log(publicGenerator)
    // console.log(publicGenerator.value)
    return PublicKey.fromPublicGenerator(publicGenerator);
  }

  PublicKey.fromValidationPublicKey = function(validationPublicKey){
    var publicGenerator = PublicGenerator.fromValidationPublicKey(validationPublicKey);
    return PublicKey.fromPublicGenerator(publicGenerator);
  }

  return PublicKey;
}
