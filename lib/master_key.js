module.exports = function(options) {
  var sjcl = options.sjcl;
  var base58 = require(__dirname+'/base58.js')({ sjcl: sjcl });

  function MasterKey(key){ 
    this.value = key;
  };

  MasterKey.fromBytes = function(bytes){
    return new MasterKey(base58.encode_base_check(33, bytes));
  };

  MasterKey.getRandom = function(){
    for (var i = 0; i < 8; i++) {
      sjcl.random.addEntropy(Math.random(), 32, "Math.random()");
    }
    var randomBytes = sjcl.codec.bytes.fromBits(sjcl.random.randomWords(4));
    return MasterKey.fromBytes(randomBytes);
  };
  return MasterKey;
}
