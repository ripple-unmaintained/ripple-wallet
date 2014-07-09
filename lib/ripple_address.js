
module.exports = function(options) { // inject sjcl dependency
  var sjcl = options.sjcl
  var base58 = require(__dirname+'/base58.js')({ sjcl: sjcl });


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
    var publicKeyBytes = sjcl.codec.bytes.fromBits(SHA256_RIPEMD160(sjcl.codec.bytes.toBits(publicKey.toBytesCompressed())));
    return new this(base58.encode_base_check(0, publicKeyBytes));
  }

  return RippleAddress;
}
