const xss = require('xss');
const xssOptions = {
  whiteList: [], // empty, means filter out all tags
  stripIgnoreTag: true, // filter out all HTML not in the whitelist
  stripIgnoreTagBody: ['script'], // the script tag is a special case, we need
  // to filter out its content
};

//FILTER AND SANITIZE QUERY AND BODY FIELDS
module.exports = function (a) {
  let queryFields = new Object();
  let bodyFields = new Object();

  a.forEach((element, index) => {
    if (
      Object.keys(this.body).length === 0 &&
      Object.keys(this.query).length === 0 &&
      !this.query.params &&
      Object.keys(this.params).length > 0
    ) {
      let tmp = Object.keys(this.params);
      this.query.params = this.params[tmp[0]];
    }
    if (
      (this.query.params && index === 0) ||
      (this.params[`${element}`] && index === 0)
    ) {
      queryFields[`${element}`] = xss(
        this.query.params ? this.query.params : this.params[`${element}`],
        xssOptions,
      );
    }
    if (this.query.hasOwnProperty(element)) {
      queryFields[`${element}`] = xss(this.query[element], xssOptions);
    }
    if (this.body.hasOwnProperty(element)) {
      bodyFields[`${element}`] = xss(this.body[element], xssOptions);
    }
  });

  if (Object.keys(queryFields).length > 0 && Object.keys(bodyFields).length > 0)
    return [queryFields, bodyFields];

  if (Object.keys(queryFields).length > 0)
    return [queryFields, (bodyFields = null)];

  if (Object.keys(bodyFields).length > 0)
    return [(queryFields = null), bodyFields];
  return [null, null];
};
