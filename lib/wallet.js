module.exports = function(options) {
  var sjcl = options.sjcl; // inject sjcl dependency

  var base58 = require(__dirname+'/base58.js')({ sjcl: options.sjcl });;
  var MasterKey = require(__dirname+'/master_key.js')({ sjcl: options.sjcl });
  var AccountPublicKey = require(__dirname+'/account_public_key.js')({
    sjcl: options.sjcl
  });
  var RippleAddress = require(__dirname+'/ripple_address.js')({
    sjcl: options.sjcl
  });
  var ValidationPublicKey = require(__dirname+'/validation_public_key.js')({
    sjcl: options.sjcl
  });

  function RippleWallet(secret){
    this.secret = secret;

    if (!this.secret) {
      throw "Invalid secret."
    }
  }

  RippleWallet.prototype = {
    _getPrivateKey: function() {
      var self = this;
      return base58.decode_base_check(33, self.secret);
    },

    getSeed: function(){
      var self = this;
      return sjcl.codec.hex.fromBits(sjcl.codec.bytes.toBits(self._getPrivateKey()))
    },

    getAddress: function(){
      var self = this;
      return RippleAddress.fromSeed(self.secret).value;
    },

    getAccountPublicKey: function(){
      var self = this;
      return AccountPublicKey.fromSeed(self.secret).value;
    },

    getValidationPublicKey: function(){
      var self = this;
      return ValidationPublicKey.fromSeed(self.secret).value;
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
