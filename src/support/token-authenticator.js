
let _wl = ['/favicon.ico', '/auth/login', '/auth/passwordreset', '/my/user/create'];

export class TokenAuthenticator{

  static get whitelist(){
    return _wl;
  }

  static addwhitelist(val){
    if(Array.isArray(val)){
      for(let v of val){
        _wl.push(v);
      }
    }else{
      _wl.push(val);
    }
  }

  static handleRequest(req, res, next){
    let authHeader = req.header('Authorization');
    let path = req.originalUrl;
    // If in the whitelist then continue, otherwise if there is an authHeader and it isn't in the whitelist then Auth the header
    if(TokenAuthenticator.whitelist.some(u => path.startsWith(u))){
      return next();
    }else if(authHeader != null && !TokenAuthenticator.whitelist.some(u => path.startsWith(u))){
      return TokenAuthenticator.authenticateHeader(authHeader)
          .then(token => {
            req.sessionData = token;
            return next();
          })
          .catch(e => {
            if(e.message === 'Invalid Token'){
              return next();
            }
            return next(new Error(e.message));
          });
    }else{
      return next(new Error('Authentication Failed'));
    }
  }

  static authenticateHeader(authHeader){
    let authProvider = ctx.get('AuthenticationProvider');

    let token = authHeader.split('Token ');
    if(!(token.length === 2)){
      return Promise.reject(new Error('Authentication Failed'));
    }
    return authProvider.authenticateToken(token[1]);
  }
}
