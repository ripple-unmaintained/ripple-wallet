var generate = require('./lib/wallet').Ripple.Wallet.generate;

function WalletGenerator(){}

WalletGenerator.prototype.generate = function(){
  return generate();  
};


module.exports = { Generator: WalletGenerator };
