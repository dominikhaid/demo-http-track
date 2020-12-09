const mongoose = require('mongoose');
const utils = require('../functions/utils');

/**
 * READ CONNECTION OTIONS FROM ./contig/CONFIG.JSON
 */
const options = {
  useNewUrlParser: true,
  useCreateIndex: true,
  autoIndex: true, //this is the code I added that solved it all
  keepAlive: true,
  poolSize: 10,
  bufferMaxEntries: 0,
  connectTimeoutMS: 10000,
  socketTimeoutMS: 45000,
  family: 4, // Use IPv4, skip trying IPv6
  useFindAndModify: false,
  useUnifiedTopology: true,
};

let configDb;
try {
  configDb = require('../../../config/mongo-config.json');
} catch (error) {
  console.log(error);
}

if (process.env.NODE_ENV === 'development') {
  configDb = configDb.development;
} else if (process.env.NODE_ENV === 'production') {
  configDb = configDb.production;
} else {
  configDb = configDb.test;
}

/**
 * MAKE CONNECTION AND REGISTER MODELS
 */

module.exports = function connectionFactory() {
  const con = mongoose.createConnection(configDb.host, options);

  const Websites  = con.model('Website', require('../schemas/schemas').websites);
  const Users = con.model('User', require('../schemas/schemas').users);
  const Logs = con.model('Log', require('../schemas/schemas').logs);


  con.on('error', error => {
    console.error.bind(console, 'connection error:');
    con.close();
    console.log(error);
    return error;
  });

  // con.once('open', function () {
  //   console.info(`
	// 			_________________

	// 			MongoDB Connected
	// 			_________________`);

  // });

  // con.on('close', msg => {
  //   console.info.bind(console, 'connection info:');
  //   console.info(`
	// 			_________________

	// 			  Disconnected
	// 			_________________`);
  // });

  return con;
};
