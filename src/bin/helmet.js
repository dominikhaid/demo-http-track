const helmet = require('helmet');
module.exports.startHelmet = function (app) {
  if (process.env.NODE_ENV !== 'development') {
    app.use(helmet());
    app.use(
      helmet.contentSecurityPolicy({
        directives: {
          defaultSrc: ["'self'", process.env.HELMET_DEFAULT],
          styleSrc: ["'self'", "'unsafe-inline'", process.env.HELMET_SCRIPTS],
          scriptSrc: ["'self'", "'unsafe-inline'", process.env.HELMET_SCRIPTS],
          fontSrc: ["'self'", process.env.HELMET_SCRIPTS],
        },
      }),
    );
    app.use(helmet.dnsPrefetchControl());
    app.use(helmet.frameguard({action: 'deny'}));
    app.use(helmet.hidePoweredBy());
    app.use(helmet.ieNoOpen());
    app.use(helmet.noSniff());
    app.use(helmet.permittedCrossDomainPolicies({permittedPolicies: 'none'}));
    app.use(helmet.referrerPolicy({policy: 'same-origin'}));
    app.use(helmet.xssFilter());
    app.use(
      helmet.hsts({
        maxAge: 5184000,
      }),
    );
  } else {
    app.use(helmet());
    app.use(
      helmet.contentSecurityPolicy({
        directives: {
          defaultSrc: ["'self'", process.env.HELMET_DEFAULT],
          styleSrc: ["'self'", "'unsafe-inline'", process.env.HELMET_SCRIPTS],
          scriptSrc: ["'self'", "'unsafe-inline'", process.env.HELMET_SCRIPTS],
          fontSrc: ["'self'", process.env.HELMET_SCRIPTS],
        },
      }),
    );
    app.use(helmet.dnsPrefetchControl());
    app.use(helmet.frameguard({action: 'deny'}));
    app.use(helmet.hidePoweredBy());
    app.use(helmet.ieNoOpen());
    app.use(helmet.noSniff());
    app.use(helmet.permittedCrossDomainPolicies({permittedPolicies: 'none'}));
    app.use(helmet.referrerPolicy({policy: 'same-origin'}));
    app.use(helmet.xssFilter());
    app.use(
      helmet.hsts({
        maxAge: 5184000,
      }),
    );
  }
};

module.exports.helmet = helmet;
