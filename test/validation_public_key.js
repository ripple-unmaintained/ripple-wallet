var assert = require('assert');
var sjcl = require('ripple-lib').sjcl;
var ValidationPublicKey = require(__dirname+'/../lib').ValidationPublicKey({
  sjcl: sjcl
});

// Test vectors from the Ripple Wiki
// https://ripple.com/wiki/Account_Family
var HUMAN_SEED = 'shHM53KPZ87Gwdqarm1bAmPeXg8Tn';
var ACCOUNT_ID = 'rhcfR9Cg98qCxHpCcPBmMonbDBXo84wyTn';
var VALIDATION_PUBLIC_KEY = 'n9MXXueo837zYH36DvMc13BwHcqtfAWNJY5czWVbp7uYTj7x17TH';

describe('validation_public_key', function() {

  before(function() {
    validationPublicKey = new ValidationPublicKey(VALIDATION_PUBLIC_KEY);
  });

  it('should generate from seed', function() {
    assert.strictEqual(ValidationPublicKey.fromSeed(HUMAN_SEED).value, VALIDATION_PUBLIC_KEY);
  });

  it('should produce an account_id', function() {
    assert.strictEqual(validationPublicKey.getAddress(), ACCOUNT_ID);
  });

});
