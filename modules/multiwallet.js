const app   = require('electron').app;
const spawn = require('buffered-spawn');
const path  = require('path');
const log   = require('electron-log');

let wallets = [];

exports.getPath = function () {

  const platform = process.platform
    .replace('freebsd', 'linux')
    .replace('sunos',   'linux');

  if (platform == 'linux') {
    return path.join(app.getPath('home'), '.zyrk');
  } else {
    return app.getPath('userData');
  }
}

exports.get = function () {
  return new Promise((resolve, reject) => {

    if (wallets.length > 0) {
      resolve(wallets);
    }

    resolve([]);
    return;

    spawn('ls', [ exports.getPath() ]).then(files => {

      files = files.stdout.split('\n');
      files = files.filter(file => /(wallet\.dat|wallet_.+\.dat)/.test(file));
      log.debug('found wallets: ' + files);
      resolve(files);

    }).catch(error => log.error('Couldn\'t get wallet list', error));

  });
}
