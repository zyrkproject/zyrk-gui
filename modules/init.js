const electron      = require('electron');
const log           = require('electron-log');

const ipc           = require('./ipc/ipc');
const rpc           = require('./rpc/rpc');
const zmq           = require('./zmq/zmq');

const daemon        = require('./daemon/daemon');
const daemonManager = require('./daemon/daemonManager');
const multiwallet   = require('./multiwallet');
const notification   = require('./notification/notification');

function daemonStarted() { log.info('daemon started'); }

exports.start = function (mainWindow) {

  rpc.init();
  notification.init();
  zmq.init(mainWindow);

  exports.startDaemonManager();
}

exports.startDaemonManager = function() {
  daemon.check()
    .then(()            => log.info('daemon already started'))
    .catch(()           => daemonManager.init())
    .catch((error)      => log.error(error));
}

daemonManager.on('status', (status, msg) => {

  if(status === 'done') {
    log.info('daemonManager returned successfully, starting daemon!');
    multiwallet.get()
    .then(chosenWallets => daemon.start(chosenWallets, daemonStarted))
    .catch(err          => log.error(err));



  } else if (status === 'error') {
    if (msg === 'Request timed out') {
      log.error('Unable to fetch the latest clients.');

      electron.dialog.showMessageBox({
        type: 'warning',
        buttons: ['Stop', 'Retry'],
        message: 'Unable to check for updates, please check your connection. Do you want to retry?'
      }, (response) => {
        if(response === 1) {
          exports.startDaemonManager();
        }
      });
    }

    log.debug('daemonManager errored: ' + msg);
  }

});

electron.app.on('before-quit', function beforeQuit(event) {
  log.debug('received quit signal');

  event.preventDefault();
  electron.app.removeListener('before-quit', beforeQuit);

  rpc.destroy(); 
  notification.destroy();

  daemon.stop();
});

electron.app.on('quit', (event, exitCode) => {
  log.debug('Goodbye!');
});
