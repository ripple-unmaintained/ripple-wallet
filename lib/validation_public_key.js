
module.exports = function(options) { // inject sjcl dependency
  var sjcl = options.sjcl
  var base58 = require(__dirname+'/base58.js')({ sjcl: sjcl });
  var PublicGenerator = require(__dirname+'/public_generator.js')({ sjcl: options.sjcl });
  var PublicKey = require(__dirname+'/public_key.js')({ sjcl: options.sjcl });
  var RippleAddress = require(__dirname+'/ripple_address.js')({ sjcl: options.sjcl });

  function ValidationPublicKey(validationPublicKey){
    this.value = validationPublicKey;
  }

  ValidationPublicKey.fromPublicGenerator = function(publicGenerator){
    return new this(base58.encode_base_check(28,
      publicGenerator.toBytesCompressed()))
  }

  ValidationPublicKey.fromSeed = function(seed){
    var publicGenerator = PublicGenerator.fromSeed(seed);
    return new this(base58.encode_base_check(28,
      publicGenerator.value.toBytesCompressed()))
  }

  ValidationPublicKey.prototype.getAddress = function(){
    var self = this;
    return RippleAddress.fromValidationPublicKey(self.value).value;
  };

  return ValidationPublicKey;
}
