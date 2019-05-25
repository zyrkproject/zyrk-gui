const log         = require('electron-log');
const http        = require('http');
const fs          = require('fs');
const electron    = require('electron');
const rxIpc       = require('rx-ipc-electron/lib/main').default;
const Observable  = require('rxjs/Observable').Observable;

const cookie      = require('./cookie');
const _options    = require('../options');
const got         = require('got');
const daemon      = require('../daemon/daemon');

const spyOnRpc = true;

let HOSTNAME;
let PORT;
let TIMEOUT = 30000;
let rpcOptions;
let auth;

exports.init = function() {
  let options = _options.get();

  HOSTNAME = options.rpcbind || 'localhost';
  PORT     = 19656;
  auth     = cookie.getAuth(_options.get());

  initIpcListener();
}

exports.destroy = function() {
  destroyIpcListener();
}

exports.call = function(method, params, callback) {

  if (!auth) {
    exports.init()
  }

  if (!callback) {
    callback = function (){};
  }

  const timeout = [ 'extkeyimportmaster', 'extkeygenesisimport'].includes(method) ? 240 * 1000 : TIMEOUT;
  const postData = JSON.stringify({
    method: method,
    params: params
  });
  
  if(spyOnRpc) {
    log.debug('rpc.call:', postData);
  }

  if (!rpcOptions) {
    rpcOptions = {
      hostname: HOSTNAME,
      port:     PORT,
      path:     '/',
      method:   'POST',
      headers:  { 'Content-Type': 'application/json' }
    }
  }

  if (auth && rpcOptions.auth !== auth) {
    rpcOptions.auth = auth
  }

  rpcOptions.headers['Content-Length'] = postData.length;

  const request = http.request(rpcOptions, response => {
    let data = '';
    response.setEncoding('utf8');
    response.on('data', chunk => data += chunk);
    response.on('end', () => {
      if (response.statusCode === 401) {
        callback({
          status: 401,
          message: 'Unauthorized'
        });
        return ;
      }
      if (response.statusCode === 503) {
        callback({
          status: 503,
          message: 'Service Unavailable',
        });
        return ;
      }

      try {
        console.log('status code :' +response.statusCode);
        console.log('data :' +  data)
        data = JSON.parse(data);
      } catch(e) {
        log.error('ERROR: should not happen', e, data);
        callback(e);
      }

      if (data.error !== null) {
        callback(data);
        return ;
      }

      callback(null, data);
    });
  });

  request.on('error', error => {
    switch (error.code) {
      case 'ECONNRESET':
        callback({
          status: 0,
          message: 'Timeout'
        });
        break;
      case 'ECONNREFUSED':
        callback({
          status: 502,
          message: 'Daemon not connected, retrying connection',
          _error: error
        });
        break;
      default:
        callback(error);
    }
  });

  request.setTimeout(timeout, error => {
    return request.abort();
  });

  request.write(postData);
  request.end();
}

exports.getTimeoutDelay = () => { return TIMEOUT }
exports.setTimeoutDelay = function(timeout) { TIMEOUT = timeout }

function initIpcListener() {

  destroyIpcListener();

  rxIpc.registerListener('rpc-channel', (method, params) => {
    return Observable.create(observer => {
      if (['restart-daemon'].includes(method)) {
        daemon.restart(() => observer.next(true));
      } else if (['setup-new-masternode'].includes(method)) {
        const BINARY_URL = 'https://zyrk.io/clientBinaries/clientBinaries.json';
        got(BINARY_URL, {
          timeout: 10000,
          json: true
        }).then(res => {
          let version = res.body.clients.zyrkd.version; 
          version = version.substring(0, version.length - 2);         
          let commands = [
            'zyrk-cli stop',
            `wget https://github.com/ZyrkProject/zyrk-core/releases/download/v${version}/zyrk-${version}-x86_64-linux-gnu.tar.gz;`,
            `tar -xvzf zyrk-${version}-x86_64-linux-gnu.tar.gz;`,
            `chmod +x -R zyrk-${version};`,
            `cp ./zyrk-${version}/bin/zyrkd /bin`,
            `cp ./zyrk-${version}/bin/zyrk-cli /bin`,
            `zyrkd -masternode=1 -externalip=${params[0]}:19655 -masternodeprivkey=${params[2]} -daemon`,
            `zyrk-cli getwalletinfo`
          ];
          runCommands('setup-new-masternode', commands, params);
          fs.appendFile(cookie.findCookiePath() + '/masternode.conf', `\n${params[3]} ${params[0]}:19655 ${params[2]} ${params[4]} ${params[5]}`, err => {
            if (err) throw err;
          })
        }).catch(err => {
          throw err;
        });        
      } else if (['update-zyrk-version'].includes(method)) {
        const BINARY_URL = 'https://zyrk.io/clientBinaries/clientBinaries.json';
        got(BINARY_URL, {
          timeout: 10000,
          json: true
        }).then(res => {
          let version = res.body.clients.zyrkd.version;
          version = version.substring(0, version.length - 2);
          getPrivateKey(params[2])
          .then(masternodePrivKey => {
            let commands = [
              'zyrk-cli stop',
              `wget https://github.com/ZyrkProject/zyrk-gui/releases/download/v${version}/zyrk-${version}-x86_64-linux-gnu.tar.gz;`,
              `tar -xvzf zyrk-${version}-x86_64-linux-gnu.tar.gz;`,
              `chmod +x -R zyrk-${version};`,
              `cp ./zyrk-${version}/bin/zyrkd /bin`,
              `cp ./zyrk-${version}/bin/zyrk-cli /bin`,
              `zyrkd -masternode=1 -externalip=${params[0]}:19655 -masternodeprivkey=${masternodePrivKey} -daemon`,
            ];
            runCommands('update-zyrk-version', commands, params);
          }).catch(err => {
            throw err;
          })
        }).catch(err => {
          throw err;
        });
      } else {
        exports.call(method, params, (error, response) => {
          try {
            if(error) {
              observer.error(error);
            } else {
              observer.next(response || undefined);
              observer.complete();
            }
          } catch (err) {
            if (err.message == 'Object has been destroyed') {
            } else {
              log.error(err);
            }
          }
        });
      }
    });
  });
}

function runCommands(name, commands, params) {
  let command     = '';
  let pwSent      = false;
  let sudosu      = false;
  let password    = ' ';
  let Client = require('ssh2').Client;
  let conn = new Client();
  let zyrk_server = false;

  conn.on('ready', () => {
    console.log('Connection :: ready');
    conn.shell( (err, stream) => {
      if (err) console.log('-------------------------', err);
      stream.on('close', () => {
        console.log('Stream :: close');
        conn.end();
      }).on('data', (data) => {
      if (command.indexOf("sudo") !== -1 && !pwSent) {
        if (command.indexOf("sudo su") > -1) {
            sudosu = true;
        }
        if (data.indexOf(":") >= data.length - 2) {
            pwSent = true;
            stream.write(password + '\n');
        }
      } else {
        let dataLength = data.length;
        if (dataLength > 2 && (data.indexOf("$") >= dataLength - 2 || data.indexOf("#") >= dataLength - 2 )) {

          if (commands.length > 0) {
            command = commands.shift();
            stream.write(command + '\n');
            console.log('==============COMMAND===============', command);
          } else {
            if (sudosu) {
              sudosu = false;
              stream.write('exit\n');
            } else {
              stream.end();
            }
          }
        } else {
          console.log('STDOUT: (' + command + ') -----\n' + data);
          if (data == 'Zyrk server starting')  zyrk_server = true;
          if (zyrk_server && command == commands[commands.length - 1] && data.length > 10 && !data.includes('error')) {
            let message;
            if (name == 'start-masternode') {
              message = 'Your masternode has been successfully started.'
            } else if (name == 'update-zyrk-verison') {
              message = 'Zyrk wallet version of your masternode has been successfully updated.'
            } else if (name == 'setup-new-masternode') {
              message = "You've setup a new masternode successfully. Please restart your wallet and then click start on your new masternode.";
            }

            electron.dialog.showMessageBox({
              type: 'info',
              buttons: ['Ok'],
              message: message,
            }, (response) => {
            });
          } else if (data.includes('Error:')) {
            electron.dialog.showMessageBox({
              type: 'error',
              buttons: ['Ok'],
              message: data
            }, (response) => {
            });
          }
        }
      }
    }).stderr.on('data', function(data) {
      console.log('STDERR: ' + data);
    });
  
    command = commands.shift();
    stream.write( command + '\n' );
  
    });
  }).connect({
    host: params[0],
    port: 22,
    username: 'root',
    password: params[1],
    tryKeyboard: true,
    readyTimeout: 10000
  });
}

function getPrivateKey(aliasName) {
  return new Promise((resolve, reject) => fs.readFile(cookie.findCookiePath() + '/masternode.conf', 'utf8', (err, data) => {
    if (err) reject(err);
    let lines = [];
    lines = data.split('\n');

    for (let i = 0; i < lines.length; i++){
      let element = lines[i];
      if (element.indexOf(aliasName + ' ') !== -1) {
        resolve(element.split(' ')[2]);
      }
    }
  }))
}

function destroyIpcListener() {
  rxIpc.removeListeners('rpc-channel');
}