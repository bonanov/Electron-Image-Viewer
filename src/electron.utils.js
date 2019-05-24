module.exports.webPreferences = {
  nodeIntergation: true,
  experimentalFeatures: true,
  nodeIntegrationInWorker: true,
  preload: __dirname + '/preload.js',
  webSecurity: false,
};
