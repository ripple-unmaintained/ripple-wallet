module.exports = function(options) { // inject sjcl dependency
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

  PublicGenerator._decompress = function(compressedPublicGenerator) {
    var pub_bits = sjcl.codec.bytes.toBits(compressedPublicGenerator);
    var curve = sjcl.ecc.curves.c256;
    var w = sjcl.bitArray;
    var was_odd = w.extract(pub_bits, 0, 8) & 0x01;
    var x = curve.field.fromBits(w.bitSlice(pub_bits, 8));
    var a = curve.a;
    var b = curve.b;
    var root_exp = curve.field.prototype.modulus.add(1).div(4);
    var y = x.mul(x.square().add(a)).add(b).power(root_exp);
    y.fullReduce();
    var is_odd = y.limbs[0] & 0x01;
    if (is_odd !== was_odd) {
      var q = curve.field.prototype.modulus;
      y = new curve.field(q.sub(y));
    }
    return new this(new sjcl.ecc.point(curve, x, y));
  }

  PublicGenerator.fromValidationPublicKey = function(validationPublicKey) {
    var compressedPublicGenerator = base58.decode_base_check(28, validationPublicKey);
    return PublicGenerator._decompress(compressedPublicGenerator);
  }

  PublicGenerator.prototype = {
    toString: function() {
      return this.value.toString();
    }
  }

  return PublicGenerator;
}

