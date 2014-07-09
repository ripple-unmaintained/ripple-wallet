module.exports = function(options) { // inject sjcl dependency
  var sjcl = options.sjcl; 

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

  PublicGenerator.prototype = {
    toString: function() {
      return this.value.toString();
    }
  }

  return PublicGenerator;
}

