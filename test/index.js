
var Base58 = Base58Utils = require('./lib/base58')
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

var seed = generateMasterSeed();

var privateGenerator = computePrivateGenerator(seed).generator;
var sequence = computePrivateGenerator(seed).sequence;

var publicGenerator = computePublicGenerator(privateGenerator).generator;
var subsequence = computePublicGenerator(privateGenerator).subsequence;

var publicKey = computePublicKey(publicGenerator, subsequence, sequence);

var accountId = computeAccountId(publicKey);

console.log(accountId);

