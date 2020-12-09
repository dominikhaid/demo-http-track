const moment = require('moment');
const jsonWebToken = require('jsonwebtoken');
const checkReqErrors = require('./status').checkReqErrors;
const fireBaseUtils = require('./firebase/admin');

const myJWTSecretKey = () => {
  const buffer = Buffer.from(process.env.JWTSecret, 'base64');
  return buffer;
};

module.exports.myJWTSecretKey = myJWTSecretKey;

const swignInJWT = e => {
  const userJWT = {
    email: e.email,
    id: e.uid,
    name: e.displayName,
    role: e.customClaims && e.customClaims.admin ? 'admin' : 'user',
    issuer: 'https://dev.dominikhaid.de',
    exp: moment().add(1, 'hours').unix(),
  };
  // sign with default (HMAC SHA256)
  const token = jsonWebToken.sign(userJWT, myJWTSecretKey());
  return {token: token};
};

async function geToken(req, res) {
  return fireBaseUtils.fireAdminUser(req).then(e => {
    checkReqErrors(e, res, signInJWT);
  });
}

module.exports.geToken = geToken;

async function verfiyToken(req, res) {
  let token = req.headers.authorization
    ? req.headers.authorization.replace(/^Bearer\s/, '')
    : null;
  if (!token) token = req.params.token ? req.params.token : null;

  try {
    if (!token) checkReqErrors({error: 'You are not Authorized'}, res);
    const tokenDecodedData = jsonWebToken.verify(token, myJWTSecretKey());
    checkReqErrors({tokenDecode: tokenDecodedData}, res);
  } catch (error) {
    checkReqErrors({error: error}, res);
  }
}

module.exports.verfiyToken = verfiyToken;
