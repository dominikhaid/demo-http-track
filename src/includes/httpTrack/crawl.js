const https = require('https');
const http = require('http');

module.exports.crawl = async (url) => {
  const promisifiedRequest = function (options, url) {
    return new Promise((resolve, reject) => {
      meth = http;
      if (/https/.test(url)) meth = https;
     
      const req = meth.request(url, options, res => {
        const {statusCode, statusMessage} = res;
        const {server, date} = res.headers;
        const contentType = res.headers['content-type'];
        const httpVersion = res.httpVersion;
     
        res.setEncoding('utf8');
        let body = '';

        res.on('data', chunk => {
          body += chunk;
        });

        res.on('end', () => {
          try {
            return resolve({
              url,
              statusCode,
              statusMessage,
              server,
              date,
              contentType,
              httpVersion,
              body,
            });
          } catch (e) {
            return reject(e);
          }
        });
      });

      req.on('error', e => {
        return reject(e.message);
      });

      req.end();
    });
  };

  const options = {
    // url: 'https://www.dominikhaid.de',
    method: 'GET',
    auth: '',
    headers: {
      'Content-Type': 'application/text-html',
      // 'Content-Length': Buffer.byteLength(postData)
    },
    time: true,
  };

  let response = await promisifiedRequest(options, url);

  return response;
};
