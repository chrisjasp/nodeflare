import {AppRoot} from '../../src/index';
import {UserEntity, CreateUser} from '../../src/user/user-common';
import {UserKernel} from '../../src/user/user-kernel';
import {UserStore} from '../../src/user/user-store';
import {UserCatalog} from '../../src/user/user-cache';
import {SqliteConnection, PgConnection} from '../../src/common/db-connection';
import {PasswordHasher} from '../../src/support/password-hasher';
import {AuthenticationProvider} from '../../src/authentication/authentication-provider';
import uuid from 'uuid/v4';
import {Di} from 'ctjs-di';
import {EventHub} from 'ctjs-event';

export class UserTestIocBuilder{
  static buildPg(){

    let appRoot = {
      config: {
        hostname: '',
        tokenkey: '12345'
      }
    };

    global.ctx = Di.createContext();
    ctx.register('AppRoot').object(appRoot);
    ctx.register('db', PgConnection,['localhost', 'viewspark','krapsweiv','viewspark-test']);
    ctx.register('UserStore', UserStore);
    ctx.register('UserKernel', UserKernel);
    ctx.register('PasswordHasher', PasswordHasher);
    ctx.register('AuthenticationProvider', AuthenticationProvider);
    ctx.register('UserCatalog', UserCatalog);
    ctx.register('EventHub', EventHub);
    ctx.initialize();

    // Clear DB and generate Data
    let userCatalog = ctx.get('UserCatalog');

    let db = ctx.get('db');
    let eventHub = ctx.get('EventHub');
    return db.sync({force: true}).then(() => {
      let us = ctx.get('UserStore');
      let ue1 = UserEntity.create(uuid, new PasswordHasher(), new CreateUser({
        emailAddress: 'password.test@me.com',
        password: 'changeme'
      }));

      let ue = UserEntity.create(uuid, new PasswordHasher(), new CreateUser({
        emailAddress: 'buster.posey@sfgiants.com',
        password: 'newpassword'
      }));
      return us.saveUser(ue1).then(e => {
        // return us.saveUser(ue).then(x => userCatalog.updateCatalog());
        return us.saveUser(ue).then(x => eventHub.publish(UserCatalog.Update));
      });
    });
  }

  static buildSqlite(){

    let appRoot = {
      config: {
        hostname: '',
        tokenkey: '12345'
      }
    };

    global.ctx = Di.createContext();
    ctx.register('AppRoot').object(appRoot);
    ctx.register('db', SqliteConnection,[null]);
    ctx.register('UserStore', UserStore);
    ctx.register('UserKernel', UserKernel);
    ctx.register('PasswordHasher', PasswordHasher);
    ctx.register('AuthenticationProvider', AuthenticationProvider);
    ctx.register('UserCatalog', UserCatalog);
    ctx.register('EventHub', EventHub);
    ctx.initialize();

    // Clear DB and generate Data
    let userCatalog = ctx.get('UserCatalog');

    let db = ctx.get('db');
    let eventHub = ctx.get('EventHub');
    return db.sync({force: true}).then(() => {
      let us = ctx.get('UserStore');
      let ue1 = UserEntity.create(uuid, new PasswordHasher(), new CreateUser({
        emailAddress: 'password.test@me.com',
        password: 'changeme'
      }));

      let ue = UserEntity.create(uuid, new PasswordHasher(), new CreateUser({
        emailAddress: 'buster.posey@sfgiants.com',
        password: 'newpassword'
      }));
      return us.saveUser(ue1).then(e => {
        // return us.saveUser(ue).then(x => userCatalog.updateCatalog());
        return us.saveUser(ue).then(x => eventHub.publish(UserCatalog.Update));
      });
    });
  }
}