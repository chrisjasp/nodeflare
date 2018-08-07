import 'babel-polyfill'
import assert from 'assert';
import {UserTestIocBuilder} from './user-ioc';
import {AuthenticationProvider} from '../../src/authentication/authentication-provider';
import {AuthenticationRequest, CreateUser, ChangePassword} from '../../src/user/user-common'

describe('Postgres UserStore', function() {

  before(() => {
    return UserTestIocBuilder.buildPg();
  });

  it('Create User and check if created', () => {
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

    // Create the user and fetch it
    return uk.execute(newUser)
        .then(r => {
          return uk.fetchByEmail('chrisjasp@gmail.com');
        })
        .then(user => {
          assert.equal(user.emailAddress, 'chrisjasp@gmail.com');
          assert.equal(user.phoneNumber, '123-123-1234');
          assert.equal(user.postalCode, '93614');
          assert.equal(user.passwordHash, null);
        });
  });

  it('Change Password Success', () => {
    let uk = ctx.get('UserKernel');
    let authProvider = ctx.get('AuthenticationProvider');
    let changePassword = new ChangePassword({emailAddress: 'password.test@me.com', password: 'passwordchanged', confirmpassword: 'passwordchanged'});
    return uk.execute(changePassword)
        .then(r => {
          return authProvider.authenticate({emailAddress: r.user.emailAddress, password: 'passwordchanged'});
        })
        .then(authResponse => {
          assert.notEqual(authResponse.sessionData, null);
          assert.notEqual(authResponse.token, null);
        });
  });

  it('Validate User Password Success', () => {
    let authProvider = ctx.get('AuthenticationProvider');
    let request = new AuthenticationRequest({
      username: 'buster.posey@sfgiants.com', password: 'newpassword'
    });
    return authProvider.authenticate(request)
        .then(authResponse => {
          assert.notEqual(authResponse.sessionData, null);
          assert.notEqual(authResponse.token, null);
        });
  });

  it('Validate User Password Failed', () => {
    let authProvider = ctx.get('AuthenticationProvider');
    let request = new AuthenticationRequest({
      emailAddress: 'buster.posey@sfgiants.com', password: 'newpassword1'
    });
    return authProvider.authenticate(request)
        .then(assert.fail)
        .catch((e) => {
          assert.equal(e.message, "Authentication Failed");
        });
  });

});
