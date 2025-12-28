function enhanceResponse(res) {
  
  res.statusCode = 200;
  
  
  res.status = function(code) {
    this.statusCode = code;
    return this;
  };
  
  
  res.send = function(data) {
    if (typeof data === 'object') {
      this.setHeader('Content-Type', 'application/json');
      this.writeHead(this.statusCode);
      this.end(JSON.stringify(data));
    } else {
      this.setHeader('Content-Type', 'text/html');
      this.writeHead(this.statusCode);
      this.end(String(data));
    }
  };
  
  
  res.json = function(data) {
    this.setHeader('Content-Type', 'application/json');
    this.writeHead(this.statusCode);
    this.end(JSON.stringify(data));
  };
  
  return res;
}

module.exports = enhanceResponse;
