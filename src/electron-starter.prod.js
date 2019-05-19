/* eslint-disable import/no-extraneous-dependencies */

const electron = require('electron');

const { app, BrowserWindow, ipcMain } = electron;

const path = require('path');
const url = require('url');

process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = 'true';

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1600,
    height: 800,
    frame: true,
    show: false,
    transparent: true,
    webPreferences: {
      nodeIntergation: true,
      preload: __dirname + '/preload.js',
      webSecurity: false,
    },
  });

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
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
      pathname: path.join(__dirname, '/../build/index.html'),
      protocol: 'file:',
      slashes: true,
    });

  mainWindow.setMenu(null);
  mainWindow.loadURL(startUrl);
  // mainWindow.webContents.openDevTools();

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}
app.commandLine.appendArgument('enable-transparent-visuals');
// app.on('ready', createWindow);
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
