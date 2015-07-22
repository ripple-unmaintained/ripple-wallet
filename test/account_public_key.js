var assert = require('assert');
var sjcl = require('ripple-lib').sjcl;
var AccountPublicKey = require(__dirname+'/../lib').AccountPublicKey({
  sjcl: sjcl
});

// Test vectors from the Ripple Wiki
// https://ripple.com/wiki/Account_Family
var HUMAN_SEED = 'shHM53KPZ87Gwdqarm1bAmPeXg8Tn';
var ACCOUNT_ID = 'rhcfR9Cg98qCxHpCcPBmMonbDBXo84wyTn';
var ACCOUNT_PUBLIC_KEY = 'aBRoQibi2jpDofohooFuzZi9nEzKw9Zdfc4ExVNmuXHaJpSPh8uJ';

describe('account_public_key', function() {

  before(function() {
    accountPublicKey = new AccountPublicKey(ACCOUNT_PUBLIC_KEY);
  });

  it('should generate from seed', function() {
    assert.strictEqual(AccountPublicKey.fromSeed(HUMAN_SEED).value, ACCOUNT_PUBLIC_KEY);
  });

  it('should produce an account_id', function() {
    assert.strictEqual(accountPublicKey.getAddress(), ACCOUNT_ID);
  });

});
