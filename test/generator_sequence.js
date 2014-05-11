var RippleWallet = require(__dirname+'/../lib/wallet.js');

var wallet = RippleWallet.getRandom();

for (i=0; i<5; i++){
  address = wallet.getAddress(i);
  console.log('SEQUENCE:', i);
  console.log('KEY:', wallet.secret);
  console.log('ADDRESS:', address.value);
  console.log();
}

