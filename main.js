const electron = require('electron');
const app = electron.app;
const { autoUpdater } = require('electron-updater');
const BrowserWindow = electron.BrowserWindow;
const menu          = electron.Menu;
const dialog        = electron.dialog;
const path          = require('path');
const fs            = require('fs');
const url           = require('url');
const platform      = require('os').platform();
const rxIpc         = require('rx-ipc-electron/lib/main').default;
const Observable    = require('rxjs/Observable').Observable;
const log           = require('electron-log');
const isDev         = require('electron-is-dev');

const userDataPath = app.getPath('userData');
if (!fs.existsSync(userDataPath)) {
  fs.mkdir(userDataPath);
}

log.transports.file.level = 'debug';
log.transports.file.appName = (process.platform == 'linux' ? '.zyrk' : 'zyrk');
log.transports.file.file = log.transports.file
  .findLogPath(log.transports.file.appName)
  .replace('log.log', 'zyrk.log');

log.debug(`console log level: ${log.transports.console.level}`);
log.debug(`file log level: ${log.transports.file.level}`);

const _options = require('./modules/options');
const init = require('./modules/init');
const rpc = require('./modules/rpc/rpc');
const daemon = require('./modules/daemon/daemon');

let mainWindow;
let tray;
let options;
let openDevTools = false;

if (process.argv.includes('-opendevtools'))
  openDevTools = true;

if (app.getVersion().includes('RC'))
  process.argv.push(...['-testnet', '-printtoconsole']);

app.on('ready', () => {
  log.debug('app ready')
  options = _options.parse();
  initMainWindow();
  init.start(mainWindow);
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit()
  }
});

app.on('activate', function () {
  if (mainWindow === null) {
    initMainWindow()
  }
});

app.on('browser-window-created', function (e, window) {
  window.setMenu(null);
});

function initMainWindow() {
  if (platform !== "darwin") {
    let trayImage = makeTray();
  }

  mainWindow = new BrowserWindow({
    width:     1366,
    minWidth:  1366,
    height:    860,
    minHeight: 675,
    icon:      path.join(__dirname, 'resources/icon.png'),

    webPreferences: {
      nodeIntegration: false,
      sandbox: true,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
  });

  if (options.dev) {
    mainWindow.loadURL('http://localhost:4200');
  } else {
    mainWindow.loadURL(url.format({
      protocol: 'file:',
      pathname: path.join(__dirname, 'dist/index.html'),
      slashes: true
    }));
  }

  if (openDevTools || options.devtools) {
    mainWindow.webContents.openDevTools()
  }

  mainWindow.webContents.on('new-window', (event, url) => {
    event.preventDefault();
    electron.shell.openExternal(url);
  });

  mainWindow.on('closed', function () {
    mainWindow = null
  });

  autoUpdater.checkForUpdates();

  setInterval(() => {
    autoUpdater.checkForUpdates();
  }, 600 * 1000)

}

function makeTray() {

  let trayImage = path.join(__dirname, 'resources/icon.png');

  const contextMenu = electron.Menu.buildFromTemplate([
    {
      label: 'View',
      submenu: [
        {
          label: 'Reload',
          click() { mainWindow.webContents.reloadIgnoringCache(); }
        },
        {
          label: 'Open Dev Tools',
          click() { mainWindow.openDevTools(); }
        }
      ]
    },
    {
      role: 'window',
      submenu: [
        {
          label: 'Close',
          click() { app.quit() }
        },
        {
          label: 'Hide',
          click() { mainWindow.hide(); }
        },
        {
          label: 'Show',
          click() { mainWindow.show(); }
        },
        {
          label: 'Maximize',
          click() { mainWindow.maximize(); }
        }
      ]
    },
    {
      role: 'help',
      submenu: [
        {
          label: 'About ' + app.getName(),
          click() { electron.shell.openExternal('https://zyrk.io'); }
        },
        {
          label: 'Visit Zyrk.io',
          click() { electron.shell.openExternal('https://zyrk.io'); }
        },
        {
          label: 'Visit Electron',
          click() { electron.shell.openExternal('https://electron.atom.io'); }
        }
      ]
    }
  ]);
  tray = new electron.Tray(trayImage)

  tray.setToolTip('Zyrk GUI+ ' + app.getVersion());
  tray.setContextMenu(contextMenu)

  tray.on('click', function () {
    mainWindow.show();
  });

  return trayImage;
}
