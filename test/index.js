
var Base58 = Base58Utils = require('../lib/base58')
var Ripple = require('ripple-lib');
var sjcl = Ripple.sjcl;

function generateMasterSeed() {
  var seed;

  return seed;
}

function computePrivateGenerator(seed) {
  var generator, sequence;

  return {
    generator: generator,
    sequence: sequence
  };
}

function computePublicGenerator(privateGenerator) {
  var publicGenerator, subsequence;

  return { 
    generator: publicGenerator,
    subsequence: subsequence
  }
}

function computePublicKey(publicGenerator, subsequence, sequence) {
  var publicKey

  return publicKey;
}

function computeAccountId(publicKey) {
  var accountId

  return accountId;
}

describe("generating a ripple wallet", function() {

  it('should generate a random seed', function(){

    seed = generateMasterSeed();  

  });

  it('should compute a private generator', function() {

    privateGenerator = computePrivateGenerator(seed).generator;
    sequence = computePrivateGenerator(seed).sequence;

  });

  it('should compute a public generator', function() {

    publicGenerator = computePublicGenerator(privateGenerator).generator;
    subsequence = computePublicGenerator(privateGenerator).subsequence;

  });

  it('should compute the public key', function() {

    publicKey = computePublicKey(publicGenerator, subsequence, sequence);

  });

  it('should compute a ripple account id', function() {

    accountId = computeAccountId(publicKey);
    console.log(accountId);

  });

});

