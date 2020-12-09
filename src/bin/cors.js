const cors = require('cors');
module.exports.startCors = function (app) {
  var whitelist = process.env.ORIGINS.split(',');
  var corsOptions = {
    origin: function (origin, callback) {
      if (whitelist.indexOf(origin) !== -1 || !origin) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    //   methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    optionsSuccessStatus: 200,
  };

  app.use(cors(corsOptions), (req, res, next) => {
    next();
  });
};
module.exports.cors = cors;
