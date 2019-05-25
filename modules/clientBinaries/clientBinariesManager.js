"use strict";

const got  = require('got'),
         _ = require('lodash'),
        fs = require('fs'),
    crypto = require('crypto'),
      path = require('path'),
       tmp = require('tmp'),
    mkdirp = require('mkdirp'),
     unzip = require('node-unzip-2'),
     spawn = require('buffered-spawn'),
       log = require('electron-log'),
  progress = require('cli-progress'),
  EventEmitter = require('events').EventEmitter;


function copyFile(src, dst) {
  return new Promise((resolve, reject) => {
    var rd = fs.createReadStream(src);

    rd.on("error", (err) => {
      reject(err);
    });

    var wr = fs.createWriteStream(dst);
    wr.on("error", (err) => {
      reject(err);
    });
    wr.on("close", (ex) => {
      resolve();
    });

    rd.pipe(wr);
  });
}

function checksum(filePath, algorithm) {
  return new Promise((resolve, reject) => {
    const checksum = crypto.createHash(algorithm);

    const stream = fs.ReadStream(filePath);

    stream.on('data', (d) => checksum.update(d));

    stream.on('end', () => {
      resolve(checksum.digest('hex'));
    });

    stream.on('error', reject);
  });
}

class Manager {

  constructor (config) {
    this._config = config;

    this._logger = log;
  }

  get config () {
    return this._config;
  }

  get clients () {
    return this._clients;
  }

  init(options) {
    this._logger.info('Initializing Manager...');

    this._resolvePlatform();

    return this._scan(options);
  }

  download (clientId, options) {
    options = Object.assign({
      downloadFolder: null,
      unpackHandler: null,
      urlRegex: null
    }, options);

    this._logger.info(`Download binary for ${clientId} ...`);

    const client = _.get(this._clients, clientId);

    const activeCli = _.get(client, `activeCli`),
      downloadCfg = _.get(activeCli, `download`);

    return Promise.resolve()
    .then(() => {
      // not for this machine?
      if (!client) {
        throw new Error(`${clientId} missing configuration for this platform.`);
      }

      if (!_.get(downloadCfg, 'url') || !_.get(downloadCfg, 'type')) {
        throw new Error(`Download info not available for ${clientId}`);
      }

      if (options.urlRegex) {
        this._logger.debug('Checking download URL against regex ...');

        if (!options.urlRegex.test(downloadCfg.url)) {
          throw new Error(`Download URL failed regex check`);
        }
      }

      let resolve, reject;
      const promise = new Promise((_resolve, _reject) => {
        resolve = _resolve;
        reject = _reject;
      });

      this._logger.debug('Generating download folder path ...');

      const downloadFolder = path.join(
        options.downloadFolder || tmp.dirSync().name,
        client.id
      );

      this._logger.debug(`Ensure download folder ${downloadFolder} exists ...`);

      mkdirp.sync(downloadFolder);

      const downloadFile = path.join(downloadFolder, `archive.${downloadCfg.type}`);

      this._logger.info(`Downloading package from ${downloadCfg.url} to ${downloadFile} ...`);

      const writeStream = fs.createWriteStream(downloadFile);

      const stream = got.stream(downloadCfg.url);
      let progressBar = undefined;

      stream.pipe(writeStream);

      stream.on('downloadProgress', (info) => {
        if (progressBar) {
          progressBar.update(info.transferred);
        } else {
          progressBar = new progress.Bar({}, progress.Presets.shades_classic);
          progressBar.start(info.total, info.transferred);
        }
      });

      stream.on('error', (err) => {
        if (progressBar) {
          progressBar.stop();
        }
        this._logger.error(err);
        reject(new Error(`Error downloading package for ${clientId}: ${err.message}`));
      });

      stream.on('end', () => {
        if (progressBar) {
          progressBar.stop();
        }
        this._logger.debug(`Downloaded ${downloadCfg.url} to ${downloadFile}`);
        try {
          fs.accessSync(downloadFile, fs.F_OK | fs.R_OK);
          resolve({
            downloadFolder: downloadFolder,
            downloadFile: downloadFile
          });
        } catch (err) {
          reject(new Error(`Error downloading package for ${clientId}: ${err.message}`));
        }
      });

      return promise;
    })
    .then((dInfo) => {
      const downloadFolder = dInfo.downloadFolder,
        downloadFile = dInfo.downloadFile;

      let value, algorithm, expectedHash;

      if ((value = _.get(downloadCfg, 'md5'))) {
          expectedHash = value;
          algorithm = 'md5';
      } else if ((value = _.get(downloadCfg, 'sha256'))) {
          expectedHash = value;
          algorithm = 'sha256';
      }

      if (algorithm) {
        return checksum(dInfo.downloadFile, algorithm)
          .then((hash) => {
              this._logger.error(algorithm);
              this._logger.error(hash);
              this._logger.error(expectedHash);
            if (expectedHash !== hash) {
              throw new Error(`Hash mismatch: ${expectedHash}`);
            }
            return dInfo;
          });
      } else {
        return dInfo;
      }
    })
    .then((dInfo) => {
      const downloadFolder = dInfo.downloadFolder,
        downloadFile = dInfo.downloadFile;

      const unpackFolder = path.join(downloadFolder, 'unpacked');

      this._logger.debug(`Ensure unpack folder ${unpackFolder} exists ...`);

      mkdirp.sync(unpackFolder);

      this._logger.debug(`Unzipping ${downloadFile} to ${unpackFolder} ...`);

      let promise;

      if (options.unpackHandler) {
        this._logger.debug(`Invoking custom unpack handler ...`);
        promise = options.unpackHandler(downloadFile, unpackFolder);
      } else {
        switch (downloadCfg.type) {
          case 'zip':
            this._logger.debug(`Using unzip ...`);

            promise = new Promise((resolve, reject) => {
              try {
                fs.createReadStream(downloadFile)
                  .pipe(
                    unzip.Extract({ path: unpackFolder })
                    .on('close', resolve)
                    .on('error', reject)
                  )
                  .on('error', reject);
              } catch (err) {
                reject(err);
              }
            });
            break;
          case 'tar':
            this._logger.debug(`Using tar ...`);

            promise = this._spawn('tar', ['-xf', downloadFile, '-C', unpackFolder]);
            break;
          default:
            throw new Error(`Unsupported archive type: ${downloadCfg.type}`);
        }
      }

      return promise.then(() => {
        this._logger.debug(`Unzipped ${downloadFile} to ${unpackFolder}`);

        const linkPath = path.join(unpackFolder, activeCli.bin);

        if (downloadCfg.bin) {
          let realPath = path.join(unpackFolder, downloadCfg.bin);
          try {
            fs.accessSync(linkPath, fs.R_OK);
            fs.unlinkSync(linkPath);
          } catch (e) {
            if (e.code !== 'ENOENT')
              this._logger.warn(e);
          }
          return copyFile(realPath, linkPath).then(() => linkPath);
        } else {
          return Promise.resolve(linkPath);
        }
      })
      .then((binPath) => {
        try {
          fs.chmodSync(binPath, '755');
        } catch (e) {
          this._logger.warn(e);
        }

        return {
          downloadFolder: downloadFolder,
          downloadFile: downloadFile,
          unpackFolder: unpackFolder
        };
      });
    })
    .then((info) => {
      return this._verifyClientStatus(client, {
        folders: [info.unpackFolder]
      })
      .then(() => {
        info.client = client;

        return info;
      });
    });
  }

  _resolvePlatform () {
    this._logger.info('Resolving platform...');

    switch (process.platform) {
      case 'win32':
        this._os = 'win';
        break;
      case 'darwin':
        this._os = 'mac';
        break;
      default:
        this._os = process.platform;
    }

    this._arch = process.arch;

    return Promise.resolve();
  }

  _scan (options) {
    this._clients = {};

    return this._calculatePossibleClients()
    .then((clients) => {
      this._clients = clients;

      const count = Object.keys(this._clients).length;

      this._logger.info(`${count} possible clients.`);

      if (_.isEmpty(this._clients)) {
        return;
      }

      this._logger.info(`Verifying status of all ${count} possible clients...`);

      return Promise.all(_.values(this._clients).map(
        (client) => this._verifyClientStatus(client, options)
      ));
    });
  }

  _calculatePossibleClients () {
    return Promise.resolve()
    .then(() => {

      this._logger.info('Calculating possible clients...');

      const possibleClients = {};

      for (let clientName in _.get(this._config, 'clients', {})) {
        let client = this._config.clients[clientName];

        if (_.get(client, `platforms.${this._os}.${this._arch}`)) {
          possibleClients[clientName] =
            Object.assign({}, client, {
              id: clientName,
              activeCli: client.platforms[this._os][this._arch]
            });
        }
      }

      return possibleClients;
    });
  }

  _verifyClientStatus (client, options) {
    options = Object.assign({
      folders: []
    }, options);

    this._logger.info(`Verify ${client.id} status ...`);

    return Promise.resolve().then(() => {
      const binName = client.activeCli.bin;

      client.state = {};
      delete client.activeCli.binPath;

      this._logger.debug(`${client.id} binary name: ${binName}`);

      const binPaths = [];
      let command;
      let args = [];

      if (process.platform === 'win32') {
          command = 'where';
      } else {
          command = 'which';
      }
      args.push(binName);

      return this._spawn(command, args)
      .then((output) => {
        const systemPath = _.get(output, 'stdout', '').trim();

        if (_.get(systemPath, 'length')) {
          this._logger.debug(`Got PATH binary for ${client.id}: ${systemPath}`);

          binPaths.push(systemPath);
        }
      }, (err) => {
        this._logger.debug(`Command ${binName} not found in path.`);
      })
      .then(() => {

        if (_.get(options, 'folders.length')) {
          options.folders.forEach((folder) => {
            this._logger.debug(`Checking for ${client.id} binary in ${folder} ...`);

            const fullPath = path.join(folder, binName);

            try {
              fs.accessSync(fullPath, fs.F_OK | fs.X_OK);

              this._logger.debug(`Got optional folder binary for ${client.id}: ${fullPath}`);

              binPaths.push(fullPath);
            } catch (err) {

            }
          });
        }
      })
      .then(() => {
        if (!binPaths.length) {
          throw new Error(`No binaries found for ${client.id}`);
        }
      })
      .catch((err) => {
        this._logger.error(`Unable to resolve ${client.id} executable: ${binName}`);

        client.state.available = false;
        client.state.failReason = 'notFound';

        throw err;
      })
      .then(() => {

        return Promise.all(binPaths.map((binPath) => {
          this._logger.debug(`Running ${client.id} sanity check for binary: ${binPath} ...`);

          return this._runSanityCheck(client, binPath)
          .catch((err) => {
            this._logger.debug(`Sanity check failed for: ${binPath}`);
          });
        }))
        .then(() => {

          if (client.activeCli.fullPath) {
            return;
          }

          client.state.available = false;
          client.state.failReason = 'sanityCheckFail';

          throw new Error('All sanity checks failed');
        });
      })
      .then(() => {
        client.state.available = true;
      })
      .catch((err) => {
        this._logger.debug(`${client.id} deemed unavailable`);

        client.state.available = false;
      })
    });
  }

  _runSanityCheck (client, binPath) {
    this._logger.debug(`${client.id} binary path: ${binPath}`);

    this._logger.info(`Checking for ${client.id} sanity check ...`);

    const sanityCheck = _.get(client, 'activeCli.commands.sanity');

    return Promise.resolve()
    .then(() => {
      if (!sanityCheck) {
        throw new Error(`No ${client.id} sanity check found.`);
      }
    })
    .then(() => {
      this._logger.info(`Checking sanity for ${client.id} ...`)

      return this._spawn(binPath, sanityCheck.args);
    })
    .then((output) => {
      const haystack = output.stdout + output.stderr;

      this._logger.debug(`Sanity check output: ${haystack}`);

      const needles = sanityCheck.output || [];

      for (let needle of needles) {
        if (0 > haystack.indexOf(needle)) {
          throw new Error(`Unable to find "${needle}" in ${client.id} output`);
        }
      }

      this._logger.debug(`Sanity check passed for ${binPath}`);

      client.activeCli.fullPath = binPath;
    })
    .catch((err) => {
      this._logger.error(`Sanity check failed for ${client.id}`, err);

      throw err;
    });
  }

  _spawn(cmd, args) {
    args = args || [];

    this._logger.debug(`Exec: "${cmd} ${args.join(' ')}"`);

    return spawn(cmd, args);
  }
}

exports.Manager = Manager;
