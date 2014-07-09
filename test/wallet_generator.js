var assert = require('assert');
var sjcl = require('ripple-lib').sjcl;
var RippleWallet = require(__dirname+'/../lib/wallet.js')({ sjcl: sjcl });
var PublicGenerator = require(__dirname+'/../lib/public_generator')({ sjcl: sjcl });

// Test vectors from the Ripple Wiki
// https://ripple.com/wiki/Account_Family
var MASTER_SEED = '71ED064155FFADFA38782C5E0158CB26';
var HUMAN_SEED = 'shHM53KPZ87Gwdqarm1bAmPeXg8Tn';
var PRIVATE_GENERATOR = '7CFBA64F771E93E817E15039215430B53F7401C34931D111EAB3510B22DBB0D8';
var PUBLIC_GENERATOR = 'fht5yrLWh3P8DrJgQuVNDPQVXGTMyPpgRHFKGQzFQ66o3ssesk3o';
var PUBLIC_KEY = 'aBRoQibi2jpDofohooFuzZi9nEzKw9Zdfc4ExVNmuXHaJpSPh8uJ';
var ACCOUNT_ID = 'rhcfR9Cg98qCxHpCcPBmMonbDBXo84wyTn';

describe('generating a ripple account', function() {

  before(function() {
    wallet = new RippleWallet(HUMAN_SEED);
  });

  it('should get the master seed from the human readable seed', function() {
    assert.strictEqual(wallet.getSeed().value, MASTER_SEED);
  });

  it('should gen the correct address from a master seed in base 58 format', function() {
    assert.strictEqual(wallet.getAddress().value, ACCOUNT_ID);
  });

  it('should derive a private generator function from the master seed', function() {
    assert.strictEqual(wallet.getPrivateGenerator().value, PRIVATE_GENERATOR);
  });

  it('should derive a ecdsa private key with the private generator', function() {
    assert.strictEqual(wallet.getPrivateKey().value, PRIVATE_KEY);
  });

  it('should derive a public generator elliptic curve point from the private key', function() {
    var publicGenerator = wallet.getPublicGenerator();
    assert(publicGenerator instanceof PublicGenerator); 
    assert(publicGenerator.value instanceof sjcl.ecc.point);
    assert.strictEqual(publicGenerator.toString(), PUBLIC_GENERATOR);
  });

  it('should generate the first public key from the public generator', function() {
    assert.strictEqual(wallet.getPublicKey().value, PUBLIC_KEY);
  });

  it('should convert the public key to a ripple account address', function() {
    assert.strictEqual(wallet.getAccountId(), ACCOUNT_ID);
  });

});

