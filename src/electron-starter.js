const electron = require('electron');

const { app, BrowserWindow, ipcMain } = electron;

const path = require('path');
const url = require('url');
const { webPreferences } = require('./electron.utils');

app.commandLine.appendSwitch('disable-renderer-backgrounding');
process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = 'true';

let mainWindow;
let secondWindow;
let thirdWindow;
let forthWindow;

function closeAllWindows() {
  if (process.platform !== 'darwin') {
    app.quit();
  }
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1600,
    height: 800,
    frame: true,
    show: false,
    title: 'bonana image viewer',
    icon: path.join(__dirname, 'assets/icons/64x64.png'),
    webPreferences,
  });

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    mainWindow.webContents.openDevTools();
    createSecondWindow();
    createThirdWindow();
    createForthWindow();
  });

  const startUrl =
    process.env.ELECTRON_START_URL ||
    url.format({
      pathname: path.join(__dirname, '/../build/index.html'),
      protocol: 'file:',
      slashes: true,
    });

  mainWindow.loadURL(startUrl);

  mainWindow.on('closed', closeAllWindows);
}

function createSecondWindow() {
  secondWindow = new BrowserWindow({
    title: 'electron-props',
    show: false,
    webPreferences,
  });

  // secondWindow.show();
  const startUrl = url.format({
    pathname: path.join(__dirname, '/../src/secondWindow/index.html'),
    protocol: 'file:',
    slashes: true,
  });

  secondWindow.loadURL(startUrl);
  secondWindow.on('closed', closeAllWindows);
}

function createThirdWindow() {
  thirdWindow = new BrowserWindow({
    title: 'electron-props',
    show: false,
    webPreferences,
  });

  // thirdWindow.show();
  const startUrl = url.format({
    pathname: path.join(__dirname, '/../src/secondWindow/index.html'),
    protocol: 'file:',
    slashes: true,
  });

  thirdWindow.loadURL(startUrl);
  thirdWindow.on('closed', closeAllWindows);
}

function createForthWindow() {
  forthWindow = new BrowserWindow({
    title: 'electron-props',
    show: true,
    webPreferences,
  });

  // forthWindow.show();
  const startUrl = url.format({
    pathname: path.join(__dirname, '/../src/secondWindow/index.html'),
    protocol: 'file:',
    slashes: false,
  });

  forthWindow.loadURL(startUrl);
  forthWindow.on('closed', closeAllWindows);
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('active', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

ipcMain.on('asynchronous-message', (event, arg) => {
  // console.log(arg);
  const { data, type } = arg;
  switch (type) {
    case 'GET_PROPS': {
      secondWindow.webContents.send('asynchronous-message', arg);
      break;
    }

    case 'SEND_PROPS': {
      mainWindow.webContents.send('asynchronous-message', arg);
      break;
    }

    case 'GET_RESIZED': {
      secondWindow.webContents.send('asynchronous-message', arg);
      break;
    }

    case 'SEND_RESIZED': {
      mainWindow.webContents.send('asynchronous-message', arg);
      break;
    }

    case 'GET_COLOR': {
      secondWindow.webContents.send('asynchronous-message', arg);
      break;
    }

    case 'SEND_COLOR': {
      mainWindow.webContents.send('asynchronous-message', arg);
      break;
    }

    case 'GET_BLURED': {
      thirdWindow.webContents.send('asynchronous-message', arg);
      break;
    }

    case 'SEND_BLURED': {
      mainWindow.webContents.send('asynchronous-message', arg);
      break;
    }

    case 'GET_FILELIST': {
      forthWindow.webContents.send('asynchronous-message', arg);
      break;
    }

    case 'SEND_FILELIST': {
      mainWindow.webContents.send('asynchronous-message', arg);
      break;
    }
    default:
      break;
  }
});
