module.exports = function(options) { // inject sjcl dependency
  var EC = require('elliptic').ec;
  var ec = new EC('secp256k1');
  var sjcl = options.sjcl; 
  var base58 = require(__dirname+'/base58.js')({ sjcl: sjcl });
  var PrivateGenerator = require(__dirname+'/private_generator.js')({ sjcl: options.sjcl });

  function PublicGenerator(eccPoint) {
    if (eccPoint instanceof sjcl.ecc.point) {
      this.value = eccPoint;
    } else {
      throw new Error('eccPoint must be a sjcl.ecc.point'); 
    }
  }

  PublicGenerator.fromPrivateGenerator = function(privateGenerator) {
    /* Compute the public generator using from the 
       private generator on the elliptic curve
    */
    return new this(sjcl.ecc.curves.c256.G.mult(privateGenerator));
  };

  PublicGenerator.fromSeed = function(seed) {
    var privateGenerator = PrivateGenerator.fromSeed(seed);
    return new this(sjcl.ecc.curves.c256.G.mult(privateGenerator.value));
  }

  PublicGenerator.fromValidationPublicKey = function(validationPublicKey) {
    var compressedPublicGenerator = base58.decode_base_check(28, validationPublicKey);
    var ec_x = compressedPublicGenerator.slice(1);
    var point = ec.curve.pointFromX(ec_x, compressedPublicGenerator[0] === 0x03)

    // Convert elliptic point to sjcl point
    var x = sjcl.bn.fromBits(sjcl.codec.bytes.toBits(ec_x));
    var y = sjcl.bn.fromBits(sjcl.codec.bytes.toBits(point.y.toArray()))
    return new this(new sjcl.ecc.point (sjcl.ecc.curves.c256, x, y))
  }

  PublicGenerator.prototype = {
    toString: function() {
      return this.value.toString();
    }
  }

  return PublicGenerator;
}

