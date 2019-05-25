const electron = require('electron');
const log      = require('electron-log');
const spawn    = require('child_process').spawn;
const rxIpc    = require('rx-ipc-electron/lib/main').default;

const _options      = require('../options');
const rpc           = require('../rpc/rpc');
const cookie        = require('../rpc/cookie');
const daemonManager = require('../daemon/daemonManager');
const multiwallet   = require('../multiwallet');

let daemon = undefined;
let exitCode = 0;
let restarting = false;
let chosenWallets = [];

function daemonData(data, logger) {
  logger(data.toString().trim());
}

exports.restart = function (cb) {
  log.info('restarting daemon...')
  restarting = true;

  return exports.stop().then(function waitForShutdown() {
    log.debug('waiting for daemon shutdown...')

    exports.check().then(waitForShutdown).catch((err) => {
      if (err.status == 502) {
        log.debug('daemon stopped network, waiting 10s before restarting...');
        setTimeout(() => {

          exports.start(chosenWallets, cb)
            .then(() => restarting = false)
            .catch(error => log.error(error));

        }, 10 * 1000);
      } else {
        waitForShutdown();
      }
    });
  });
}

exports.start = function (wallets, callback) {
  return (new Promise((resolve, reject) => {

    chosenWallets    = wallets;

    rpc.init();
    exports.check().then(() => {
      log.info('daemon already started');
      resolve(undefined);

    }).catch(() => {
      let options      = _options.get();
      const daemonPath = options.customdaemon
                       ? options.customdaemon
                       : daemonManager.getPath();

      wallets = wallets.map(wallet => `-wallet=${wallet}`);
      log.info(`starting daemon ${daemonPath} ${process.argv} ${wallets}`);

      const child = spawn(daemonPath, [...process.argv, ...wallets])
      .on('close', code => {
        daemon = undefined;
        if (code !== 0) {
          reject();
          log.error(`daemon exited with code ${code}.\n${daemonPath}\n${process.argv}`);
        } else {
          log.info('daemon exited successfully');
        }
        if (!restarting)
          electron.app.quit();
      })

      child.stdout.on('data', data => daemonData(data, console.log));
      child.stderr.on('data', data => daemonData(data, console.log));

      daemon = child;
      callback = callback ? callback : () => { log.info('no callback specified') };
      exports.wait(wallets, callback).then(resolve).catch(reject);
    });

  }));
}

exports.wait = function(wallets, callback) {
  return new Promise((resolve, reject) => {

    const maxRetries  = 100; // Some slow computers...
    let   retries     = 0;
    let   errorString = '';

    const daemonStartup = () => {
      exports.check()
        .then(() => { callback(); resolve(); })
        .catch(() => {
          if (exitCode === 0 && retries < maxRetries)
            setTimeout(daemonStartup, 1000);
        });

      if (exitCode !== 0 || ++retries >= maxRetries) {
        if (errorString.includes('-reindex')) {
          log.info('Corrupted block database detected, '
                 + 'restarting the daemon with the -reindex flag.');
          process.argv.push('-reindex');
          exitCode = 0; 

          exports.start(wallets, callback);
          return;
        }
        log.error('Could not connect to daemon.')
        reject();
      }
    } 

    if (daemon && exitCode === 0) {
      daemon.stderr.on('data', data => errorString = data.toString('utf8'));
      setTimeout(daemonStartup, 1000);
    }

  });
}

exports.check = function() {
  return new Promise((resolve, reject) => {

    const _timeout = rpc.getTimeoutDelay();
    rpc.init();
    rpc.call('getnetworkinfo', null, (error, response) => {
      rxIpc.removeListeners();
      if (error) {
        reject(error);
      } else if (response) {
        resolve(response);
      }
    });
    rpc.setTimeoutDelay(_timeout);

  });
}

exports.stop = function() {
  return new Promise((resolve, reject) => {

    if (daemon) {
      rpc.call('stop', null, (error, response) => {
        if (error) {
          log.error('Calling SIGINT!');
          reject();
        } else {
          log.debug('Daemon stopping gracefully...');
          resolve();
        }
      });
    } else
    {
        log.debug('Daemon not managed by gui.');
        resolve();
        electron.app.quit();
    }

  }).catch(() => {
    if (daemon)
      daemon.kill('SIGINT')
  });
}
