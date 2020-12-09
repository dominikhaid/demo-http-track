const server = require('./src/bin/main').server;
const serverOptions = require('./src/bin/main').serverOptions;

/**
 *  STARTUP SERVER
 */
let http, https, httpServer, httpsServer;

if (serverOptions.http) {
  http = require('http');
  httpServer = http.createServer(server);
}

if (serverOptions.https) {
  https = require('https');
  privateKey = fs.readFileSync('certificates/key.pem', 'utf8');
  certificate = fs.readFileSync('certificates/cert.pem', 'utf8');
  credentials = {key: privateKey, cert: certificate};
  httpsServer = https.createServer(credentials, server);
}

//./bin/express.js
if (serverOptions.server === 'express') {
  const startExpress = require('./src/bin/express').startServer;
  startExpress(server, serverOptions, {
    http: http,
    httpServer: httpServer,
    https: https,
    httpsServer: httpsServer,
  });
  return;
}
