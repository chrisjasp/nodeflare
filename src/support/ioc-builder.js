import {AuthenticationService} from '../authentication/authentication-service';
import {AuthenticationProvider} from '../authentication/authentication-provider';
import {PasswordHasher} from '../support/password-hasher';
import {UserStore} from '../user/user-store';
import {UserKernel} from '../user/user-kernel';
import {UserCatalog} from '../user/user-cache';
import {MyService} from '../my/my-service';
import {EventHub} from 'ctjs-event';

import {UserEntity, CreateUser} from '../user/user-common';
import uuid from 'uuid/v4';

export class IocBuilder{
  static build(AppRoot){
    // Main
    ctx.register('AppRoot').object(AppRoot);
    // Stores Registration
    ctx.register('UserStore', UserStore);
    // Services
    ctx.register('AuthenticationService', AuthenticationService);
    ctx.register('MyService', MyService);
    // Authentication
    ctx.register('AuthenticationProvider', AuthenticationProvider);
    ctx.register('PasswordHasher', PasswordHasher);
    // Caching
    ctx.register('UserCatalog', UserCatalog);
    // Kernels
    ctx.register('UserKernel', UserKernel);
    // EventHub
    ctx.register('EventHub', EventHub);

    // ctx.initialize();

    // Build Test Data
    // Clear DB and generate Data
    // let db = ctx.get('db');
    // db.sync({force: true}).then(() => {
    //   let us = ctx.get('UserStore');
    //   let ue = UserEntity.create(uuid, new PasswordHasher(), new CreateUser({
    //     emailAddress: 'chrisjasp@gmail.com',
    //     password: 'Giants#1', firstName: 'Chris', lastName: 'Jasper', wantsSpam: false, termsAndConditions: true
    //   }));
    //
    //   us.saveUser(ue);
    // });
  }
}