## Ripple Wallet

This is a simple, lightweight tool to generate a new ripple wallet,
which consists of public and secret key components.

Beyond portability, the tool was created to isolate the cryptography
behind wallet generation in the ripple client and ripple-lib.

The algorithm for generating wallets is [described here](https://ripple.com/wiki/Account_Family).

### Usage

    var WalletGenerator = require('ripple-wallet').Generator;

    var walletGenerator = new WalletGenerator();

    walletGenerator.generate();
    
will generate a random, unfunded Ripple address and secret.

    { 
      address: 'r3sBHwjwAb6eFpHbCEbJmhC8scmDeqXZyZ',
      secret: 'snovmDoPbb5Y14JVA5wxtBtPgHNaP' 
    }
    
### Docs and Test Vectors

A description of the Cryptography can be found on the [Wiki](https://ripple.com/wiki/Account_Family).

