const http = require('http');
const enhanceRequest = require('./request');
const enhanceResponse = require('./response');
const Router = require('./router');
const { bodyParser } = require('./middleware');

class App {
  constructor() {
    this.globalMiddlewares = [];
    this.mountedRouters = [];
    this.routes = {};
    this.errorHandler = this.defaultErrorHandler.bind(this);
    
    
    this.globalMiddlewares.push(bodyParser);
  }
  
  
  use(pathOrMiddleware, routerOrMiddleware) {
    
    if (typeof pathOrMiddleware === 'function' && !routerOrMiddleware) {
      this.globalMiddlewares.push(pathOrMiddleware);
      return this;
    }
    
    
    if (typeof pathOrMiddleware === 'string' && routerOrMiddleware instanceof Router) {
      this.mountedRouters.push({
        path: pathOrMiddleware,
        router: routerOrMiddleware
      });
      return this;
    }
    
    
    if (typeof pathOrMiddleware === 'string' && typeof routerOrMiddleware === 'function') {
      this.globalMiddlewares.push((req, res, next) => {
        if (req.pathname.startsWith(pathOrMiddleware)) {
          routerOrMiddleware(req, res, next);
        } else {
          next();
        }
      });
      return this;
    }
    
    return this;
  }
  
  
  get(path, ...handlers) {
    const key = `GET:${path}`;
    this.routes[key] = handlers;
    return this;
  }
  
  post(path, ...handlers) {
    const key = `POST:${path}`;
    this.routes[key] = handlers;
    return this;
  }
  
  put(path, ...handlers) {
    const key = `PUT:${path}`;
    this.routes[key] = handlers;
    return this;
  }
  
  patch(path, ...handlers) {
    const key = `PATCH:${path}`;
    this.routes[key] = handlers;
    return this;
  }
  
  delete(path, ...handlers) {
    const key = `DELETE:${path}`;
    this.routes[key] = handlers;
    return this;
  }
  
  
  findMountedRoute(method, pathname) {
    for (const mounted of this.mountedRouters) {
      
      if (pathname === mounted.path || pathname.startsWith(mounted.path + '/')) {
        
        let remainingPath = pathname.slice(mounted.path.length);
        
        
        if (!remainingPath || remainingPath === '') {
          remainingPath = '/';
        }
        
        
        if (!remainingPath.startsWith('/')) {
          remainingPath = '/' + remainingPath;
        }
        
        console.log(`[DEBUG] Mounted path: ${mounted.path}, Full path: ${pathname}, Remaining: ${remainingPath}`);
        
        const route = mounted.router.findRoute(method, remainingPath);
        
        if (route) {
          return route;
        }
      }
    }
    return null;
  }
  
  
  findAppRoute(method, pathname) {
    const key = `${method}:${pathname}`;
    if (this.routes[key]) {
      return {
        handlers: this.routes[key],
        params: {}
      };
    }
    return null;
  }
  
  
  setErrorHandler(handler) {
    this.errorHandler = handler;
  }
  
  
  defaultErrorHandler(err, req, res) {
    console.error('Error:', err);
    
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: err.message
      });
    }
  }
  
  
  handleRequest(req, res) {
    req = enhanceRequest(req);
    res = enhanceResponse(res);
    
    console.log(`[REQUEST] ${req.method} ${req.pathname}`);
    
    
    let route = this.findMountedRoute(req.method, req.pathname);
    
    if (!route) {
      route = this.findAppRoute(req.method, req.pathname);
    }
    
    if (!route) {
      console.log(`[404] Route not found: ${req.method} ${req.pathname}`);
      res.status(404).json({ 
        success: false,
        error: 'Not Found',
        path: req.pathname,
        method: req.method
      });
      return;
    }
    
    console.log(`[FOUND] Route found with ${route.handlers.length} handlers, params:`, route.params);
    req.params = route.params;
    
    const allHandlers = [...this.globalMiddlewares, ...route.handlers];
    
    let index = 0;
    
    const next = (err) => {
      if (err) {
        this.errorHandler(err, req, res);
        return;
      }
      
      if (index >= allHandlers.length) {
        return;
      }
      
      const handler = allHandlers[index++];
      
      try {
        handler(req, res, next);
      } catch(error) {
        this.errorHandler(error, req, res);
      }
    };
    
    next();
  }
  
  
  listen(port, callback) {
    const server = http.createServer((req, res) => {
      this.handleRequest(req, res);
    });
    
    server.listen(port, () => {
      if (callback) callback();
    });
    
    return server;
  }
}

module.exports = App;
