import 'babel-polyfill'
import assert from 'assert';
import {UserTestIocBuilder} from './user-ioc';
import {AuthenticationProvider} from '../../src/authentication/authentication-provider';
import {AuthenticationRequest, CreateUser, ChangePassword, EditUser} from '../../src/user/user-common'
import {UserCatalog} from '../../src/user/user-cache';

describe('User Cache', function() {

  before(() => {
    return UserTestIocBuilder.buildPg();
  });

  it('Check if user in cache', () => {
    let uc = ctx.get('UserCatalog');
    let uk = ctx.get('UserKernel');
    let newUser = new CreateUser({
      emailAddress: 'chrisjasp@gmail.com',
      password: 'Giants#1',
      details: {
        firstName: 'Chris',
        lastName: 'Jasper',
        phoneNumber: '123-123-1234',
        postalCode: '93614',
        wantsSpam: true,
        termsAndConditions: true
      }
    });
    let oldCategoryVersion = uc.version;
    // Create the user and fetch it
    return uk.execute(newUser)
        .then(x => {
          assert.notEqual(uc.version, oldCategoryVersion);
          return uc.fetchByEmail(newUser.emailAddress)
        })
        .then(user => {
          assert.equal(user.emailAddress, newUser.emailAddress);
          assert.equal(user.firstName, newUser.details.firstName);
          assert.equal(user.passwordHash, null);
          assert.notEqual(uc.version, 0);
        });
  });

  it('Edit User through Catalog', () => {
    let uk = ctx.get('UserKernel');
    let newUser = new CreateUser({
      emailAddress: 'password.test.edit@me.com',
      password: 'Giants#1'
    });
    return uk.execute(newUser)
        .then(x => {
          return uk.fetchByEmail('password.test.edit@me.com')
              .then(user => {
                assert.equal(user.firstName, null);
                assert.equal(user.lastName, null);
                let edit = new EditUser({
                  id: user.id, version: user.version, emailAddress: user.emailAddress,
                  details: {firstName: 'Fred', lastName: 'Norris'}
                });
                return uk.execute(edit);
              })
              .then(response => {
                return uk.fetchByEmail('password.test.edit@me.com');
              })
              .then(user => {
                assert.equal(user.firstName, 'Fred');
                assert.equal(user.lastName, 'Norris');
              });
        });
  });

  it('Change Password Increments Catalog', () => {
    let uk = ctx.get('UserKernel');
    let uc = ctx.get('UserCatalog');
    let authProvider = ctx.get('AuthenticationProvider');
    let changePassword = new ChangePassword({emailAddress: 'password.test@me.com', password: 'passwordchanged', confirmpassword: 'passwordchanged'});
    let oldCatalogVersion = uc.version;
    return uk.execute(changePassword)
        .then(r => {
          assert.notEqual(uc.version, oldCatalogVersion);
          return authProvider.authenticate({emailAddress: r.user.emailAddress, password: 'passwordchanged'});
        })
        .then(authResponse => {
          assert.notEqual(authResponse.sessionData, null);
          assert.notEqual(authResponse.token, null);
        });
  });

  it('Validate User Token against User Catalog', () => {
    let authProvider = ctx.get('AuthenticationProvider');
    let request = new AuthenticationRequest({
      username: 'buster.posey@sfgiants.com', password: 'newpassword'
    });
    return authProvider.authenticate(request)
        .then(authResponse => {
          return authProvider.authenticateToken(authResponse.token);
        })
        .then(userData => {
          assert.equal(userData.user.emailAddress, request.emailAddress);
          assert.equal(userData.user.password, null);
          assert.equal(userData.user.passwordHash, null);
          assert.equal(userData.user.passwordSalt, null);
        });
  });

  it('Invalid token error', () => {
    let authProvider = ctx.get('AuthenticationProvider');
    let request = new AuthenticationRequest({
      emailAddress: 'buster.posey@sfgiants.com', password: 'newpassword'
    });
    return authProvider.authenticateToken('somecrap')
        .then(assert.fail)
        .catch(e => {
          assert.equal(e.message, 'Invalid Token');
        });
  });

});
