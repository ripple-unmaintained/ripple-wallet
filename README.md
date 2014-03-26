## Ripple Wallet

This is a simple, lightweight tool to generate a new ripple wallet,
which consists of public and secret key components.

Beyond portability, the tool was created to isolate the cryptography
behind wallet generation in the ripple client and ripple-lib.

The algorithm for generating wallets is [described here](https://ripple.com/wiki/Account_Family).

### Usage

```js
  var Wallet = require('ripple-wallet');
  var keypair = Wallet.generate();
```

will generate a random, unfunded Ripple address and secret.

```js
  {
    address: 'r3sBHwjwAb6eFpHbCEbJmhC8scmDeqXZyZ',
    secret: 'snovmDoPbb5Y14JVA5wxtBtPgHNaP'
  }
```

### Docs and Test Vectors

A description of the Cryptography can be found on the [Wiki](https://ripple.com/wiki/Account_Family).
