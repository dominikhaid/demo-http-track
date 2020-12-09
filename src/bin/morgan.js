morgan = require('morgan');
module.exports.startMorgan = function (app, accessLogStream) {
  // log only 4xx and 5xx responses to console
  app.use(
    morgan('combined', {
      skip: function (req, res) {
        return res.statusCode < 400;
      },
      stream: accessLogStream,
    }),
  );
};
