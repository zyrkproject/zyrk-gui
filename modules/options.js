const path = require('path');

let _options = {};

exports.parse = function() {

  let options = {};
  if (process.argv[0].match(/[Ee]lectron/)) {
    process.argv = process.argv.splice(2);
  } else {
    process.argv = process.argv.splice(1);
  }

  process.argv.forEach((arg, index) => {
    if (arg.includes('=')) {
      arg = arg.split('=');
      options[arg[0].substr(1)] = arg[1];
    } else if (arg[1] === '-'){
      options[arg.substr(2)] = true;
    } else if (arg[0] === '-') {
      options[arg.substr(1)] = true;
    }
  });

  options.port = options.rpcport
    ? options.rpcport 
    : options.testnet
      ? 26955  
      : 16955;

  _options = options;
  return options;
}

exports.get = function() {
  return _options;
}
