const moment = require('moment');

const checkReqErrors = (e, res, callback) => {
  if (e.code || e.error) return res.status(200).jsonp({error: e});

  //Do not exit Request
  if (callback === 'break') return;
  //Succes Callback
  return res.status(200).jsonp({
    success: e,
    callback: !callback ? false : callback(e),
  });
};

module.exports.checkReqErrors = checkReqErrors;

const signInJWT = (e, jsonWebToken, myJWTSecretKey) => {
  const userJWT = {
    email: e.email,
    id: e.uid,
    name: e.displayName,
    role:
      e.customClaims && e.customClaims.admin
        ? 'adminApiRequest'
        : 'userApiRequest',
    issuer: 'https://dev.dominikhaid.de',
    exp: moment().add(1, 'hours').unix(),
  };
  // sign with default (HMAC SHA256)
  const token = jsonWebToken.sign(userJWT, myJWTSecretKey);
  return {token: token};
};

module.exports.signInJWT = signInJWT;

const checkRole = (role, level, res) => {
  //console.debug(role)
  if (!role.body || !role.body.role || !level)
    return checkReqErrors({error: 'Your are not authenticated'}, res, 'break');
  if (role.body.role !== level) return false;
  return true;
};

module.exports.checkRole = checkRole;
