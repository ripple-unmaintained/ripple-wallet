
module.exports = function(options) {
  var sjcl = options.sjcl;
  var base58 = require('./base58.js')({ sjcl: sjcl });

  function MasterKey(key) {
    this.value = key;
  }

  MasterKey.fromBytes = function(bytes) {
    return new MasterKey(base58.encode_base_check(33, bytes));
  };

  MasterKey.getRandom = function() {
    if (typeof window === 'object' && window.crypto) {
      // Browser with crypto
      var entropy = new Uint32Array(32);
      window.crypto.getRandomValues(entropy);
      sjcl.random.addEntropy(entropy, 1024, 'crypto.getRandomValues');
    } else if (typeof module === 'object' && module.exports) {
      // Node
      var entropy = require('crypto').randomBytes(128);
      entropy = new Uint32Array(new Uint8Array(entropy).buffer);
      sjcl.random.addEntropy(entropy, 1024, 'crypto.randomBytes');
    } else {
      for (var i = 0; i < 8; i++) {
        sjcl.random.addEntropy(Math.random(), 32, 'Math.random()');
      }
    }

    var randomBytes = sjcl.codec.bytes.fromBits(sjcl.random.randomWords(4));

    return MasterKey.fromBytes(randomBytes);
  };

  return MasterKey;
}
