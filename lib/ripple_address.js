
module.exports = function(options) { // inject sjcl dependency
  var sjcl = options.sjcl
  var base58 = require(__dirname+'/base58.js')({ sjcl: sjcl });
  var PublicKey = require(__dirname+'/public_key.js')({
    sjcl: options.sjcl
  });

  function SHA256_RIPEMD160(bits) {
    return sjcl.hash.ripemd160.hash(sjcl.hash.sha256.hash(bits));
  }

  function RippleAddress(address){
    this.value = address;
  }

  RippleAddress.fromPublicKey = function(publicKey){
    /* Encode the EC public key as a ripple address
       using SHA256 and then RIPEMD160
    */
    var hashedPublicKey = sjcl.codec.bytes.fromBits(SHA256_RIPEMD160(
      sjcl.codec.bytes.toBits(publicKey.value.toBytesCompressed())));
    return new this(base58.encode_base_check(0, hashedPublicKey));
  }

  RippleAddress.fromPublicKeyBytes = function(publicKeyBytes){
    /* Encode the EC public key as a ripple address
       using SHA256 and then RIPEMD160
    */
    var hashedPublicKey = sjcl.codec.bytes.fromBits(SHA256_RIPEMD160(
      sjcl.codec.bytes.toBits(publicKeyBytes)));
    return new this(base58.encode_base_check(0, hashedPublicKey));
  }

  RippleAddress.fromSeed = function(seed){
    var publicKey = PublicKey.fromSeed(seed);
    return RippleAddress.fromPublicKey(publicKey);
  }

  RippleAddress.fromValidationPublicKey = function(validation_public_key){
    var publicKey = PublicKey.fromValidationPublicKey(validation_public_key);
    return RippleAddress.fromPublicKey(publicKey);
  }

  return RippleAddress;
}
