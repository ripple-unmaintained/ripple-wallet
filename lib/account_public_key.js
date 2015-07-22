
module.exports = function(options) { // inject sjcl dependency
  var sjcl = options.sjcl;
  var base58 = require(__dirname+'/base58.js')({ sjcl: sjcl });
  var PublicKey = require(__dirname+'/public_key.js')({
    sjcl: options.sjcl
  });
  var RippleAddress = require(__dirname+'/ripple_address.js')({
    sjcl: options.sjcl
  });

  function AccountPublicKey(accountPublicKey){
    this.value = accountPublicKey;
  }

  AccountPublicKey.fromSeed = function(seed){
    var publicKey = PublicKey.fromSeed(seed);
    return new this(base58.encode_base_check(35,
      publicKey.value.toBytesCompressed()));
  }

  AccountPublicKey.prototype.getAddress = function(){
    var self = this;
    var publicKey = base58.decode_base_check(35, self.value);
    return RippleAddress.fromPublicKeyBytes(publicKey).value;
  };

  return AccountPublicKey;
}
