function bodyParser(req, res, next) {
  if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
    let body = '';
    
    req.on('data', chunk => {
      body += chunk.toString();
    });
    
    req.on('end', () => {
      try {
        req.body = body ? JSON.parse(body) : {};
      } catch(e) {
        req.body = body;
      }
      next();
    });
    
    req.on('error', (err) => {
      next(err);
    });
  } else {
    next();
  }
}

module.exports = { bodyParser };
