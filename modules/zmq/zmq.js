const Observable  = require('rxjs/Observable').Observable;
const rxIpc       = require('rx-ipc-electron/lib/main').default;
const log         = require('electron-log');

const ZMQ_CHANNEL = "zmq";

const SPY_ON_ZMQ = true;

let mainReference = null;

exports.init = function (mainWindow) {
    mainReference = mainWindow;
}

exports.send = function(subchannel, ...data) {
    log.debug(" [rm] sending zmq coolaid from node -> angular");
    try {
      rxIpc.runCommand(ZMQ_CHANNEL, mainReference.webContents, subchannel, ...data)
        .subscribe(
        (returnData) => {
            if(SPY_ON_ZMQ) {
                log.debug('zmq.send: ', returnData);
            }
        },
        (error) => {
          log.error("zmq.send: subchan: " + subchannel + " data: " + data + " error: " + err);
        },
        () => {
          log.debug("completed!");
        }
        );
    } catch (error) {
      log.debug("zmq.send: failed to runCommand (maybe window closed): " + error);
    }

  }

  exports.test = function() {
    exports.send("wtxhash", "somehashtoget");
    setTimeout(exports.test, 30 * 1000);
  }
