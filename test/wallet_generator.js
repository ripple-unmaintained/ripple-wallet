var assert = require('assert');
var sjcl = require('ripple-lib').sjcl;
var RippleWallet = require(__dirname+'/../lib').Wallet({ sjcl: sjcl });

// Test vectors from the Ripple Wiki
// https://ripple.com/wiki/Account_Family
var MASTER_SEED = '71ED064155FFADFA38782C5E0158CB26';
var HUMAN_SEED = 'shHM53KPZ87Gwdqarm1bAmPeXg8Tn';
var PRIVATE_GENERATOR = '7CFBA64F771E93E817E15039215430B53F7401C34931D111EAB3510B22DBB0D8';
var PUBLIC_GENERATOR = 'fht5yrLWh3P8DrJgQuVNDPQVXGTMyPpgRHFKGQzFQ66o3ssesk3o';
var ACCOUNT_PUBLIC_KEY = 'aBRoQibi2jpDofohooFuzZi9nEzKw9Zdfc4ExVNmuXHaJpSPh8uJ';
var ACCOUNT_ID = 'rhcfR9Cg98qCxHpCcPBmMonbDBXo84wyTn';
var VALIDATION_PUBLIC_KEY = 'n9MXXueo837zYH36DvMc13BwHcqtfAWNJY5czWVbp7uYTj7x17TH';

describe('generating a ripple account', function() {

  before(function() {
    wallet = new RippleWallet(HUMAN_SEED);
  });

  it('should get the human readable seed', function() {
    assert.strictEqual(wallet.secret, HUMAN_SEED);
  });

  it('should get the master seed from the human readable seed', function() {
    assert.strictEqual(wallet.getSeed().toUpperCase(), MASTER_SEED);
  });

  it('should generate the correct address from a master seed in base 58 format', function() {
    assert.strictEqual(wallet.getAddress(), ACCOUNT_ID);
  });

  it('should generate the account public key from a master seed', function() {
    assert.strictEqual(wallet.getAccountPublicKey(), ACCOUNT_PUBLIC_KEY);
  });

  it('should generate the correct validation public key from a master seed', function() {
    assert.strictEqual(wallet.getValidationPublicKey(), VALIDATION_PUBLIC_KEY);
  });

});
