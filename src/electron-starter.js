// eslint-disable-next-line import/no-extraneous-dependencies
const electron = require('electron');

const { app, BrowserWindow, ipcMain, Tray, Menu, clipboard } = electron;

const path = require('path');
const url = require('url');
const isDev = require('electron-is-dev');
const Store = require('electron-store');
const parseArgs = require('electron-args');
const fs = require('fs');
const os = require('os');

const cpuCount = os.cpus().length > 2 ? os.cpus().length : 2;

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
  slideTimeOut: 1000,
  backgroundColor: false,
  numberOfExtraThreads: 3,
};

const config = conf.get('default');
if (!config) conf.set('default', defaultConfig);
if (!conf.get('default.backgroundColor')) conf.set('default.backgroundColor', false);
if (!conf.get('default.slideTimeOut')) conf.set('default.slideTimeOut', 1000);
if (!conf.get('default.numberOfExtraThreads'))
  conf.set('default.numberOfExtraThreads', 3);

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
// process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = 'true';

let tray;
let mainWindow;
const extraWindows = [];
// let secondWindow;
// let thirdWindow;
// let forthWindow;
const width = 1280;
const height = 720;
let maxWidth = 1920;
let maxHeight = 1080;

// const wins = {
//   secondWindow,
//   thirdWindow,
//   forthWindow,
// };

function closeOnly() {
  mainWindow.close();
  // wins.secondWindow.close();
  // wins.thirdWindow.close();
  // wins.forthWindow.close();
}

function closeAllWindows() {
  // closeOnly();
  if (process.platform !== 'darwin') {
    app.quit();
  }
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width,
    height,
    frame: true,
    transparent: false,
    show: false,
    title: 'bonana image viewer',
    icon: path.join(__dirname, 'assets/icons/64x64.png'),
    webPreferences,
  });

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    initTray();
    mainWindow.on('show', initContextMenu);
    mainWindow.on('hide', initContextMenu);
    // mainWindow.webContents.openDevTools();
  });

  const indexUrl = isDev ? '/../build/index.html' : 'index.html';

  const startUrl =
    process.env.ELECTRON_START_URL ||
    url.format({
      pathname: path.join(__dirname, indexUrl),
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

function createAdditionalWindow() {
  const winName = new BrowserWindow({
    title: 'background thread',
    show: false,
    webPreferences,
  });

  const indexUrl = isDev
    ? '/../src/secondWindow/index.html'
    : 'static/js/secondWindow/index.html';

  const startUrl = url.format({
    pathname: path.join(__dirname, indexUrl),
    protocol: 'file:',
    slashes: true,
  });

  winName.on('closed', closeAllWindows);

  winName.loadURL(startUrl);
  extraWindows.push(winName);
}

function initWindows() {
  const n = cpuCount;
  for (let i = 0; i < n; i++) {
    createAdditionalWindow();
    if (i === n - 1) createWindow();
  }
}

function toggleWindow() {
  if (mainWindow.isVisible()) mainWindow.hide();
  else mainWindow.show();
}

const trayMenu = () => [
  {
    label: mainWindow.isVisible() ? 'Hide' : 'Open',
    type: 'normal',
    click() {
      toggleWindow();
    },
  },
  {
    label: 'Quit',
    click() {
      closeAllWindows();
    },
  },
];

function initTray() {
  tray = new Tray(iconPath);
  tray.on('click', toggleWindow);
  initContextMenu();
}

const initContextMenu = () => tray.setContextMenu(Menu.buildFromTemplate(trayMenu()));

app.on('ready', () => {
  ({
    width: maxWidth,
    height: maxHeight,
  } = electron.screen.getPrimaryDisplay().workAreaSize);
  initWindows();

  // initTray();
});

app.on('will-quit', function() {
  if (process.platform !== 'darwin') app.quit();
});

app.on('window-all-closed', function() {
  if (process.platform !== 'darwin') app.quit();
});

app.on('before-quit', e => {
  mainWindow.removeAllListeners('close');
  app.quit();
  e.preventDefault();
});

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
  const curConf = conf.get('default');
  conf.set('default', { ...curConf, ...confs });
}

function handleWindowSize(data) {}

const mod = (n, m) => ((n % m) + m) % m;

let winNum = -1;

ipcMain.on('asynchronous-message', (event, arg) => {
  const { data, type } = arg;
  winNum = mod(winNum + 1, extraWindows.length);
  switch (type) {
    case 'LOG':
      if (isDev) console.log(arg);
      break;

    case 'SET_WINDOW_SIZE':
      handleWindowSize(data);
      break;

    case 'GET_PROPS':
      extraWindows[winNum].webContents.send('asynchronous-message', arg);
      break;

    case 'SEND_PROPS':
      mainWindow.webContents.send('asynchronous-message', arg);
      break;

    case 'GET_RESIZED':
      extraWindows[winNum].webContents.send('asynchronous-message', arg);
      break;

    case 'SEND_RESIZED':
      mainWindow.webContents.send('asynchronous-message', arg);
      break;

    case 'GET_COLOR':
      extraWindows[winNum].webContents.send('asynchronous-message', arg);
      break;

    case 'SEND_COLOR':
      mainWindow.webContents.send('asynchronous-message', arg);
      break;

    case 'GET_BLURED':
      extraWindows[winNum].webContents.send('asynchronous-message', arg);
      break;

    case 'SEND_BLURED':
      mainWindow.webContents.send('asynchronous-message', arg);
      break;

    case 'GET_EXIF':
      extraWindows[winNum].webContents.send('asynchronous-message', arg);
      break;

    case 'SEND_EXIF':
      mainWindow.webContents.send('asynchronous-message', arg);
      break;

    case 'GET_FILELIST':
      extraWindows[winNum].webContents.send('asynchronous-message', arg);
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

    case 'WRITE_IMAGE_TO_CLIPBOARD':
      clipboard.writeImage(data.path, 'clipboard');
      break;

    default:
      break;
  }
});
