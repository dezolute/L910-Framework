class Router {
  constructor() {
    this.routes = {};
    this.middlewares = [];
  }
  
  
  use(middleware) {
    this.middlewares.push(middleware);
    return this;
  }
  
  
  addRoute(method, path, ...handlers) {
    const key = `${method}:${path}`;
    if (!this.routes[key]) {
      this.routes[key] = [];
    }
    this.routes[key].push(...handlers);
  }
  
  
  get(path, ...handlers) {
    this.addRoute('GET', path, ...handlers);
    return this;
  }
  
  post(path, ...handlers) {
    this.addRoute('POST', path, ...handlers);
    return this;
  }
  
  put(path, ...handlers) {
    this.addRoute('PUT', path, ...handlers);
    return this;
  }
  
  patch(path, ...handlers) {
    this.addRoute('PATCH', path, ...handlers);
    return this;
  }
  
  delete(path, ...handlers) {
    this.addRoute('DELETE', path, ...handlers);
    return this;
  }
  
  
  findRoute(method, pathname) {
    const exactKey = `${method}:${pathname}`;
    if (this.routes[exactKey]) {
      return {
        handlers: [...this.middlewares, ...this.routes[exactKey]],
        params: {}
      };
    }
    
    
    for (const key in this.routes) {
      
      const firstColonIndex = key.indexOf(':');
      const routeMethod = key.substring(0, firstColonIndex);
      const routePath = key.substring(firstColonIndex + 1);
      
      if (routeMethod !== method) continue;
      const params = this.matchPath(routePath, pathname);
      
      if (params) {
        return {
          handlers: [...this.middlewares, ...this.routes[key]],
          params
        };
      }
    }

    return null;
  }
  
  
  matchPath(routePath, pathname) {
    
    const normalizeSlash = (str) => {
      return str.replace(/^\/+|\/+$/g, '');
    };
    
    const normalizedRoutePath = normalizeSlash(routePath);
    const normalizedPathname = normalizeSlash(pathname);
    
    const routeParts = normalizedRoutePath.split('/').filter(Boolean);
    const pathParts = normalizedPathname.split('/').filter(Boolean);
    
    if (routeParts.length !== pathParts.length) {
      return null;
    }
    
    const params = {};
    
    for (let i = 0; i < routeParts.length; i++) {
      if (routeParts[i].startsWith(':')) {
        
        const paramName = routeParts[i].slice(1);
        params[paramName] = pathParts[i];
      } else if (routeParts[i] !== pathParts[i]) {
        
        return null;
      }
    }

    return params;
  }
}

module.exports = Router;