const { app, dialog } = require('electron');
const EventEmitter    = require('events').EventEmitter;

const _    = require('lodash');
const Q    = require('bluebird');
const fs   = require('fs');
const got  = require('got');
const path = require('path');
const log  = require('electron-log');

const ClientBinariesManager = require('../clientBinaries/clientBinariesManager').Manager;
const rpc = require('../rpc/rpc');

let options;

const BINARY_URL = 'https://zyrk.io/clientBinaries/clientBinaries.json';

class DaemonManager extends EventEmitter {
  constructor() {
    super();
    this._availableClients = {};
  }

  getPath() {
    return this._availableClients['zyrkd'].binPath;
  }

  init(_options) {
    log.info('Initializing...');
    options = _options;
    this._resolveBinPath();
    return this._checkForNewConfig();
  }

  getClient(clientId) {
    return this._availableClients[clientId.toLowerCase()];
  }

  _writeLocalConfig(json) {
    log.info('Write new client binaries local config to disk ...');

    fs.writeFileSync(
      path.join(app.getPath('userData'), 'clientBinaries.json'),
      JSON.stringify(json, null, 2)
    );
  }

  _checkForNewConfig() {
    const nodeType = 'zyrkd';
    let binariesDownloaded = false;
    let nodeInfo;

    log.info(`Checking for new client binaries config from: ${BINARY_URL}`);

    this._emit('loadConfig', 'Fetching remote client config');

    return got(BINARY_URL, {
      timeout: 5000,
      json: true
    })
    .then((res) => {
      if (!res || _.isEmpty(res.body)) {
        throw new Error('Invalid fetch result');
      } else {
        return res.body;
      }
    })
    .catch((err) => {
      log.warn('Error fetching client binaries config from repo', err);
      this._emit('error', err.message);
    })
    .then((latestConfig) => {

      if (!latestConfig) {
        return ;
      }

      let localConfig;
      let skipedVersion;
      const nodeVersion = latestConfig.clients[nodeType].version;

      this._emit('loadConfig', 'Fetching local config');

      try {
        localConfig = JSON.parse(
          fs.readFileSync(path.join(app.getPath('userData'), 'clientBinaries.json')).toString()
        );
      } catch (err) {
        log.warn(`Error loading local config - assuming this is a first run: ${err}`);

        if (latestConfig) {
          localConfig = latestConfig;

          this._writeLocalConfig(localConfig);
        } else {
          throw new Error('Unable to load local or remote config, cannot proceed!');
        }
      }

      try {
        skipedVersion = fs.readFileSync(path.join(app.getPath('userData'), 'skippedNodeVersion.json')).toString();
      } catch (err) {
        log.info('No "skippedNodeVersion.json" found.');
      }

      const platform = process.platform
        .replace('darwin', 'mac')
        .replace('win32', 'win')
        .replace('freebsd', 'linux')
        .replace('sunos', 'linux');
      const binaryVersion = latestConfig.clients[nodeType].platforms[platform][process.arch];
      const checksums = _.pick(binaryVersion.download, 'sha256', 'md5');
      const algorithm = _.keys(checksums)[0].toUpperCase();
      const hash = _.values(checksums)[0];

      nodeInfo = {
        type: nodeType,
        version: nodeVersion,
        checksum: hash,
        algorithm
      };

      if (latestConfig
        && JSON.stringify(localConfig) !== JSON.stringify(latestConfig)
        && nodeVersion !== skipedVersion) {

        return new Q((resolve) => {

          log.debug('New client binaries config found, asking user if they wish to update...');

          log.debug('skipping ask user because Electron is not yet linked for that');
          this._writeLocalConfig(latestConfig);
          resolve(latestConfig);
        });
      }

      return localConfig;
    })
    .then((localConfig) => {

      if (!localConfig) {
        log.info('No config for the ClientBinariesManager could be loaded, using local clientBinaries.json.');

        const localConfigPath = path.join(app.getPath('userData'), 'clientBinaries.json');
        localConfig = (fs.existsSync(localConfigPath))
          ? require(localConfigPath)
          : require('./clientBinaries.json');
      }
      const mgr = new ClientBinariesManager(localConfig);
      mgr.logger = log;

      this._emit('scanning', 'Scanning for binaries');

      return mgr.init({
        folders: [ path.join(app.getPath('userData'), 'zyrkd', 'unpacked') ]
      })
      .then(() => {
        const clients = mgr.clients;

        this._availableClients = {};

        const available = _.filter(clients, c => !!c.state.available);

        if (!available.length) {
          if (_.isEmpty(clients)) {
            throw new Error('No client binaries available for this system!');
          }

          this._emit('downloading', 'Downloading binaries');

          return Q.map(_.values(clients), (c) => {
            binariesDownloaded = true;

            return mgr.download(c.id, {
              downloadFolder: path.join(app.getPath('userData'))
            });
          });
        }
      })
      .then(() => {

        this._emit('filtering', 'Filtering available clients');

        _.each(mgr.clients, (client) => {
          if (client.state.available) {
            const idlcase = client.id.toLowerCase();

            this._availableClients[idlcase] = {
              binPath: client.activeCli.fullPath,
              version: client.version
            };
          }
        });

        this._emit('done');
      });
    })
    .catch((err) => {
      log.error(err);

      this._emit('error', err.message);

      if (err.message.indexOf('Hash mismatch') !== -1) {
        dialog.showMessageBox({
          type: 'warning',
          buttons: ['OK'],
          message: 'Checksum mismatch in downloaded node!',
          detail: `${nodeInfo.algorithm}:${nodeInfo.checksum}\n\nPlease install the ${nodeInfo.type} node version ${nodeInfo.version} manually.`
        }, () => {
          app.quit();
        });

        throw err;
      }
    });
  }

  _emit(status, msg) {
    log.debug(`Status: ${status} - ${msg}`);
    this.emit('status', status, msg);
  }


  _resolveBinPath() {
    log.info('Resolving path to client binary ...');

    let platform = process.platform;

    if (platform.indexOf('win') === 0) {
      platform = 'win';
    } else if (platform.indexOf('darwin') === 0) {
      platform = 'mac';
    }

    log.debug(`Platform: ${platform}`);

    let binPath = path.join(app.getPath('userData'), 'zyrkd', 'unpacked', 'zyrkd');

    if (platform === 'win') {
      binPath += '.exe';
    }

    log.info(`Client binary path: ${binPath}`);

    this._availableClients.zyrkd = {
      binPath
    };
  }
}

module.exports = new DaemonManager();
