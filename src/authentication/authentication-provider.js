import nJwt from 'njwt';
import secureRandom from 'secure-random';
import uuid from 'uuid/v4';
import {MailSender} from '../support/mail-sender';
import {ChangePassword} from '../user/user';

export class AuthenticationProvider{
  constructor(){
    this.dependencies = "userStore=UserStore,passwordHasher=PasswordHasher,userKernel=UserKernel,userCatalog=UserCatalog,appRoot=AppRoot";
    this.passwordRequests = [];
  }
  
  ready(){
    // Create the Token
    // let buf = secureRandom(512, {type: 'Buffer'});
    // this.signingKey = buf.toString('base64');

    if(this.appRoot.config == null) throw Error('Not a valid config object');
    if(this.appRoot.config.hostname == null) throw Error('You must specify the hostname for this server in your config');
    if(this.appRoot.config.tokenkey == null) throw Error('You must specify a tokenkey in your server config');

    this.HOSTNAME = this.appRoot.config.hostname;
    this.signingKey = this.appRoot.config.tokenkey;
    this.mail = this.appRoot.config.mail;
  }

  authenticate(authenticationRequest){
    return this.userStore.fetchUserByEmail(authenticationRequest.emailAddress)
        .then(userEo => {
          if(!this.passwordHasher.verifyPassword(authenticationRequest.password, userEo.passwordSalt, userEo.passwordHash)){
            throw Error('Authentication Failed');
          }

          let claims = {
            iss: this.HOSTNAME,
            sub: authenticationRequest.emailAddress,
            scope: "user"
          };

          let jwt = nJwt.create(claims, this.signingKey);
          // Todo: Set Expiration time for token
          jwt.setExpiration(new Date(new Date().setFullYear(new Date().getFullYear() + 1)));
          return {
            sessionData: {},
            token: jwt.compact()
          };
        })
        .catch(e => {
          // Probably no user found
          throw Error('Authentication Failed');
        });
  }

  authenticateToken(token){
    try{
      let verifiedJwt = nJwt.verify(token, this.signingKey);
      let emailAddress = verifiedJwt.body.sub;
      return this.userCatalog.fetchByEmail(emailAddress)
        .then(user => {
          //@todo - Need to review pass reset required
          // if(userEo.passwordResetRequired){
          //   throw Error('Authentication Failed');
          // }
          // Session Data
          return {
            user: user
          }
        });
    }catch(e){
      return Promise.reject(new Error('Invalid Token'));
    }
  }

  validateResetToken(token){
      return this.passwordRequests.findIndex(pr => pr.token === token) != -1;
  }

  passwordResetRequest(authRequest){
    // @todo: validate mail config
    let token = uuid();
    let message = this.mail.message;
    message += `"\r\n\r\n${this.HOSTNAME}/api/password/form/${token}`;
    let self = this;
    return this.userCatalog.fetchByEmail(authRequest.emailAddress)
        .then(user => {
          if(user == null){ throw Error('No Valid user to send password Reset'); }
          if(self.mail.disabled != null && self.mail.disabled === true){
            return Promise.resolve({});
          }else{
            return MailSender.send(self.mail.api, user.emailAddress, self.mail.from, message, self.mail.subject)
                .catch(e => {
                  throw Error(e.message);
                });
          }
        })
        .then(r => {
          let response = {token: token, emailAddress: authRequest.emailAddress};
          if(self.passwordRequests.findIndex(pr => pr.token === token) != -1){
            let i = self.passwordRequests.findIndex(pr => pr.token === token);
            self.passwordRequests.splice(i, 1);
          }

          self.passwordRequests.push(response);
          return response;
        });
  }

  passwordReset(passwordReset){
    // passwordReset = {password, confirmPassword, token}
    let token = passwordReset.token;
    if(token != null || token != ''){
      let email = '';
      let req = this.passwordRequests.find(e => e.token === token);
      let self = this;
      if(req != null){
        email = req.emailAddress;
        return this.userCatalog.fetchByEmail(email)
          .then(user => {
            let change = new ChangePassword(user);
            change.password = passwordReset.password;
            change.confirmpassword = passwordReset.confirmPassword;
            return this.userKernel.execute(change);
          })
          .then(resp => {
            let i = self.passwordRequests.findIndex(r => r.token === token);
            if(i != -1){ self.passwordRequests.splice(i, 1); }
            return resp;
          });
      }else{
        return Promise.reject(new Error('Invalid Reset Token'));
      }
    }
  }
}
