import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import {IocBuilder} from './support/ioc-builder';
import {TokenAuthenticator} from './support/token-authenticator';
import Promise from 'bluebird';
import {UserCatalog} from './user/user-cache';
import {SqliteConnection, PgConnection, PgConnectionUri} from './common/db-connection';
import {Di} from 'ctjs-di';
import {Util} from 'ctjs-util';

export {TokenAuthenticator} from './support/token-authenticator';
export {Router} from 'express';
export {MailSender} from './support/mail-sender';

class AppRoot{
  constructor(config){
    this.config = config;
    this._expApp = express();
    this.enableAuthSevices = false;
    this._registeredRouters = [];
  }

  withAuth(){
    let authErrorHandler = (err, req, res, next) => {
      if(err.message.includes('Authentication') || err.message === 'Invalid Token') {
        res.status(401).json({message: err.message});
      }else if(err.message.includes('Not Found')){
        res.status(404).json({message: err.message});
      }else{
        res.status(400).json({message: err.message});
        // next(err);
      }
    };

    this._expApp.use(TokenAuthenticator.handleRequest);
    this._expApp.use('/auth', this.AuthenticationService.router);
    this._expApp.use('/my', this.MyService.router);
    this._expApp.use(authErrorHandler);
  }

  start(){
    this.AuthenticationService = ctx.get('AuthenticationService');
    this.MyService = ctx.get('MyService');

    global.Promise = Promise;

    // 3rd party middleware
    this._expApp.use(cors({
      exposedHeaders: "Link"
    }));

    let defaultContentTypeMiddleware =  (req, res, next) => {
      req.headers['content-type'] = req.headers['content-type'] === 'text/plain;charset=UTF-8' ? 'application/json' : req.headers['content-type'];
      next();
    };

    this._expApp.use(defaultContentTypeMiddleware);
    this._expApp.use(bodyParser.json());
    this._expApp.use(bodyParser.urlencoded({ extended: true }));

    if(this.enableAuthSevices){
      this.withAuth();
    }

    for(let r of this._registeredRouters){
      let c = ctx.get(r.name);
      this._expApp.use(r.path, c.router);
    }
  }
}

class Utilities{
  static configureDb(config){
    if(config.database == null || config.database.type === 'sqlite'){
      if(config.database == null || config.database.path == null){
        ctx.register('db', SqliteConnection, [null]);
      }else{
        ctx.register('db', SqliteConnection, [config.database.path]);
      }
    }else if(config.database.type === 'pg'){
      if(config.database.uri != null && config.database.uri !== ''){
        ctx.register('db', PgConnectionUri, [config.database.uri, config.database.ssl]);
      }else{
        ctx.register('db', PgConnection, [config.database.host, config.database.user, config.database.password, config.database.db, config.database.ssl]);
      }
    }else if(config.database.type === 'pg-heroku'){
      let uri = process.env.DATABASE_URL;
      ctx.register('db', PgConnectionUri, [uri]);
    }
  }
}

export class NodeFlare{
  constructor(config){
    global.ctx = Di.createContext();
    this.config = config;

    if(config != null && config.port == null) throw Error('You must define a port in your config object');
    if(config.port === 'heroku-port'){
      this.port = process.env.PORT;
    }else{
      this.port = config.port;
    }

    this.appRoot = new AppRoot(config);
    IocBuilder.build(this.appRoot);

    Utilities.configureDb(this.config);
  }

  appSet(setting, val){
    if(!Util.isString(setting) || !Util.isString(setting))
      throw Error('Both Setting and Value must be a string');

    this.appRoot._expApp.set(setting, val);
    return this;
  }

  appUse(path, func){
    if(!Util.isFunction(path)){
      if(!Util.isFunction(func))
        throw Error('AppUse requires a function');
      this.appRoot._expApp.use(path, func);
    }else{
      this.appRoot._expApp.use(path);
    }
    return this;
  }

  static(dir){
    if(dir == null || dir.length <= 0) throw Error('Directory Must be Defined');
    if(arguments.length > 1){
      let virtualPath = arguments[1];
      this.appRoot._expApp.use(virtualPath, express.static(dir));
    }else{
      this.appRoot._expApp.use(express.static(dir));
    }
    return this;
  }

  withAuthServices(){
    this.appRoot.enableAuthSevices = true;
    return this;
  }

  withTokenAuth(tokenAuth) {
    if (!Util.isFunction(tokenAuth))
      throw Error('Token Authenticator must be a function');
    this.appRoot._expApp.use(tokenAuth);
    return this;
  }

  whitelist(val){
    TokenAuthenticator.addwhitelist(val);
    return this;
  }

  register(name, obj, constructorArgs){
    if(Util.isArray(constructorArgs)){
      ctx.register(name, obj, constructorArgs);
    }else{
      ctx.register(name, obj);
    }
    return this;
  }

  registerAndUse(path, name, obj, constructorArgs){
    if(Util.isArray(constructorArgs)){
      ctx.register(name, obj, constructorArgs);
    }else{
      ctx.register(name, obj);
    }
    this.appRoot._registeredRouters.push({'name': name, 'path': path});
    return this;
  }

  registerInstance(name, instance){
    ctx.register(name).object(instance);
  }

  start(){
    ctx.initialize();
    // Create the tables if they don't exist
    let db = ctx.get('db');
    db.sync({});
    // Create the built in services
    let appRoot = ctx.get('AppRoot');
    appRoot.start();
    // Fire the update catalog event so that we build the initial catalog
    let eventHub = ctx.get('EventHub');
    eventHub.publish(UserCatalog.Update);

    appRoot._expApp.listen(this.port, () => console.log(`App is listening on port ${this.port}`));
    return appRoot._expApp;
  }
}
