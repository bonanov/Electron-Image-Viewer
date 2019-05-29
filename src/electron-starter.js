const electron = require('electron');

const { app, BrowserWindow, ipcMain, Tray, Menu, clipboard } = electron;
const path = require('path');
const url = require('url');
const isDev = require('electron-is-dev');
const Store = require('electron-store');
const parseArgs = require('electron-args');

let argv = process.argv;

const cliText = `
    Image Viewer

    Usage
      $ image-viewer [path]

    Options
      --help        show help
      -o, --omit    skip directory parse and show only single file

    Examples
      $ sample-viewer image.jpg
      $ sample-viewer image.jpg --omit
  `;

const cliConf = {
  alias: {
    h: 'help',
    o: 'omit',
    v: 'version',
  },
  default: {
    omit: false,
  },
};

const conf = new Store();

const defaultConfig = {
  trayIcon: true,
  keepInstance: true,
  preloadImages: true,
  imagesToPreload: 1,
  backgroundBlur: true,
  hqResize: true,
};

const config = conf.get('default');
if (!config) conf.set('default', defaultConfig);
if (conf.get('default.backgroundColor')) conf.set('default.backgroundColor', false);

const preload = path.join(__dirname, 'preload.js');

const webPreferences = {
  nodeIntergation: true,
  experimentalFeatures: true,
  nodeIntegrationInWorker: true,
  preload,
  webSecurity: false,
};

const iconPath = path.join(__dirname, 'assets/icons/64x64.png');

const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  closeAllWindows();
}

app.commandLine.appendSwitch('disable-renderer-backgrounding');
process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = 'true';

let tray;
let mainWindow;
let secondWindow;
let thirdWindow;
let forthWindow;
const width = 1280;
const height = 720;
let maxWidth = 1920;
let maxHeight = 1920;

const wins = {
  secondWindow,
  thirdWindow,
  forthWindow,
};

function closeAllWindows() {
  if (process.platform !== 'darwin') {
    app.quit();
  }
}

function closeOnly() {
  mainWindow.close();
  wins.secondWindow.close();
  wins.thirdWindow.close();
  wins.forthWindow.close();
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width,
    height,
    frame: true,
    show: false,
    title: 'bonana image viewer',
    icon: path.join(__dirname, 'assets/icons/64x64.png'),
    webPreferences,
  });
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    // mainWindow.webContents.openDevTools();
  });

  const startUrl =
    process.env.ELECTRON_START_URL ||
    url.format({
      pathname: path.join(__dirname, '/../build/index.html'),
      protocol: 'file:',
      slashes: true,
    });

  mainWindow.loadURL(startUrl);

  mainWindow.on('minimize', () => {
    mainWindow.hide();
  });

  mainWindow.on('close', e => {
    e.preventDefault();
    mainWindow.hide();
  });

  mainWindow.on('closed', closeAllWindows);
}

function createAdditionalWindow(ref) {
  wins[ref] = new BrowserWindow({
    title: 'background thread',
    show: false,
    webPreferences,
  });

  const startUrl = url.format({
    pathname: path.join(__dirname, '/../src/secondWindow/index.html'),
    protocol: 'file:',
    slashes: true,
  });

  wins[ref].on('closed', closeAllWindows);

  wins[ref].loadURL(startUrl);
}

function initWindows() {
  createAdditionalWindow('secondWindow');
  createAdditionalWindow('thirdWindow');
  createAdditionalWindow('forthWindow');
  createWindow();
}

function initTray() {
  tray = new Tray(iconPath);
  tray.on('click', () => {
    if (mainWindow.isVisible()) mainWindow.hide();
    else mainWindow.show();
  });
}

app.on('ready', () => {
  ({
    width: maxWidth,
    height: maxHeight,
  } = electron.screen.getPrimaryDisplay().workAreaSize);

  initWindows();
  initTray();
});

app.on('window-all-closed', closeAllWindows);

// app.on('active', () => {
//   if (mainWindow === null) {
//     createWindow();
//   }
// });

function parseArgumets(args) {
  const argvs = args.slice(isDev ? 2 : 1);
  const cli = parseArgs({ text: cliText, argv: argvs }, cliConf);
  if (cli.flags.v || cli.flags.h) return closeAllWindows();
  return cli.flags;
}

app.on('second-instance', (event, commandLine, workingDirectory) => {
  if (!mainWindow) initWindows();
  argv = commandLine;
  const args = parseArgumets(argv);
  if (!args) return;
  if (args._.length) {
    mainWindow.webContents.send('asynchronous-message', {
      type: 'SEND_ARGUMENTS',
      data: args,
    });
  }

  if (mainWindow.isMinimized()) mainWindow.restore();
  if (!mainWindow.isVisible()) mainWindow.show();
  mainWindow.focus();
});

function updateConfigs({ confs }) {
  conf.set('default', confs);
}

ipcMain.on('asynchronous-message', (event, arg) => {
  const { data, type } = arg;
  switch (type) {
    case 'GET_PROPS':
      wins.secondWindow.webContents.send('asynchronous-message', arg);
      break;

    case 'SEND_PROPS':
      mainWindow.webContents.send('asynchronous-message', arg);
      break;

    case 'GET_RESIZED':
      wins.secondWindow.webContents.send('asynchronous-message', arg);
      break;

    case 'SEND_RESIZED':
      mainWindow.webContents.send('asynchronous-message', arg);
      break;

    case 'GET_COLOR':
      wins.secondWindow.webContents.send('asynchronous-message', arg);
      break;

    case 'SEND_COLOR':
      mainWindow.webContents.send('asynchronous-message', arg);
      break;

    case 'GET_BLURED':
      wins.thirdWindow.webContents.send('asynchronous-message', arg);
      break;

    case 'SEND_BLURED':
      mainWindow.webContents.send('asynchronous-message', arg);
      break;

    case 'GET_EXIF':
      wins.secondWindow.webContents.send('asynchronous-message', arg);
      break;

    case 'SEND_EXIF':
      mainWindow.webContents.send('asynchronous-message', arg);
      break;

    case 'GET_FILELIST':
      wins.forthWindow.webContents.send('asynchronous-message', arg);
      break;

    case 'SEND_FILELIST':
      mainWindow.webContents.send('asynchronous-message', arg);
      break;

    case 'GET_CONFIGS': {
      const message = { type: 'CONFIGS', data: conf.get('default') };
      mainWindow.webContents.send('asynchronous-message', message);
      break;
    }

    case 'GET_ARGUMENTS': {
      const message = { type: 'SEND_ARGUMENTS', data: parseArgumets(argv) };
      if (!message.data) return;
      mainWindow.webContents.send('asynchronous-message', message);
      break;
    }

    case 'UPDATE_CONFIGS':
      updateConfigs(data);
      break;

    case 'WRITE_TO_CLIPBOARD':
      clipboard.writeText(data.text.toString());
      break;

    default:
      break;
  }
});
