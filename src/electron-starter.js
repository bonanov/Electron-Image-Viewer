/* eslint-disable import/no-extraneous-dependencies */

const electron = require('electron');
// const config = require('config');

// const dbConfig = config.get('Main');

const { app, BrowserWindow, ipcMain } = electron;

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
      console.log('get');
      secondWindow.webContents.send('asynchronous-message', arg);
      break;
    }

    case 'SEND_RESIZED': {
      mainWindow.webContents.send('asynchronous-message', arg);
      break;
    }

    default:
      break;
  }
  // event.reply('asynchronous-reply', 'pon');
});

const path = require('path');
const url = require('url');

process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = 'true';

let mainWindow;
let secondWindow;

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
    transparent: true,
    webPreferences: {
      nodeIntergation: true,
      experimentalFeatures: true,
      nodeIntegrationInWorker: true,
      preload: __dirname + '/preload.js',
      webSecurity: false,
    },
  });

  mainWindow.once('ready-to-show', () => {
    // [REACT_DEVELOPER_TOOLS].forEach(extension => {
    //   installExtension(extension)
    //     .then(name => console.log(`Added Extension: ${name}`))
    //     .catch(err => console.log('An error occurred: ', err));
    // });
    mainWindow.show();
    mainWindow.webContents.openDevTools();
    createSecondWindow();
  });

  // ipcMain.on('mainWindowLoaded', () => {
  //   const result = knes.select('test').from('test');
  //   result.then(rows => {
  //     mainWindow.webContents.send('resultSent', rows);
  //   });
  // });
  const startUrl =
    process.env.ELECTRON_START_URL ||
    url.format({
      pathname: path.join(__dirname, '/../src/resizeWindow/index.html'),
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
    webPreferences: {
      nodeIntergation: true,
      experimentalFeatures: true,
      nodeIntegrationInWorker: true,
      preload: __dirname + '/preload.js',
      webSecurity: false,
    },
  });
  secondWindow.setTitle('electron-props');
  secondWindow.once('ready-to-show', () => {
    secondWindow.show();
    // secondWindow.webContents.openDevTools();
  });
  const startUrl = url.format({
    pathname: path.join(__dirname, '/../src/resizeWindow/index.html'),
    protocol: 'file:',
    slashes: true,
  });

  secondWindow.on('page-title-updated', function(e) {
    e.preventDefault();
  });

  secondWindow.loadURL(startUrl);

  secondWindow.on('closed', closeAllWindows);
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
