## Ripple Wallet

This is a simple, lightweight tool to generate a new ripple wallet,
which consists of public and secret key components.

Beyond portability, the tool was created to isolate the cryptography
behind wallet generation in the ripple client and ripple-lib.

### Usage

    ```js
    var RippleWallet = require('ripple-wallet');

    RippleWallet.generate();
    ```
    
will generate a random, unfunded Ripple address and secret.

    ```js
    { 
      address: 'r3sBHwjwAb6eFpHbCEbJmhC8scmDeqXZyZ',
      secret: 'snovmDoPbb5Y14JVA5wxtBtPgHNaP' 
    }
    ```

Or generate multiple addresses for a given secret

    ```js
      wallet = RippleWallet.getRandom();
      console.log('SECRET:', wallet.secret);
      console.log('ADDRESS 0:', wallet.getAddress(0);
      console.log('ADDRESS 1:', wallet.getAddress(1);
      console.log('ADDRESS 2:', wallet.getAddress(2);
    ```

Will produce the output of multiple address

    ```js
    SECRET: sngAmh9y4YnynSdJoBxDqmidYVk8Z
    ADDRESS 0: rJv55Ftoogpp6T1NFLknNvgMEzrLjMP2Xf
    ADDRESS 1: rDBCTRPk7MMFNNew4uhiovz6LhAdoS7R7X
    ADDRESS 2: rwLTwid3FJTme2uvMfjoLCxiJsnZfkVNfq
    }
    ```
    
### Algorithm Docs and Test Vectors

A description of the Cryptography can be found on the [Wiki](https://ripple.com/wiki/Account_Family).

