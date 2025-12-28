const url = require('url');

function enhanceRequest(req) {
  
  const parsedUrl = url.parse(req.url, true);
  req.query = parsedUrl.query;
  req.pathname = parsedUrl.pathname;
  
  
  req.params = {};
  req.body = {};
  
  return req;
}

module.exports = enhanceRequest;
