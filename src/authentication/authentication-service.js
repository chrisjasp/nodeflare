import express from 'express';
import {AuthenticationRequest} from '../user/user-common';

export class AuthenticationService {
  constructor(){
    this.dependencies = 'authProvider=AuthenticationProvider,appRoot=AppRoot';
    this.router = new express.Router();
  }

  ready(){
    this.passwordResetToken = this.appRoot.config.passwordresettoken;
    this.router.post('/login', this.login.bind(this));
    this.router.post('/passwordreset', this.passwordReset.bind(this));
    // this.router.get('/passwordresetform/:token', this.passwordResetView.bind(this));
    // this.router.post('/passwordresetsubmit', this.passwordResetSubmit.bind(this));
  }

  login(req, res, next){
    let authRequest = new AuthenticationRequest(req.body);

    this.authProvider.authenticate(authRequest)
        .then(authResponse => {
          res.json(authResponse);
        })
        .catch(next);
  }

  passwordReset(req, res){
    let authRequest = req.body;
    if(this.passwordResetToken == null) throw Error("Invalid Token");
    if(authRequest.token === this.passwordResetToken){
      this.authProvider.passwordResetRequest(authRequest)
          .then(response => {
            res.json(response);
          });
    }else{
      res.json({emailAddress: authRequest.emailAddress, token: ''})
    }
  }

  // passwordResetSubmit(req, res, next){
  //   this.authProvider.passwordReset(req.body)
  //       .then(response => {
  //         res.json('passresetconfirm', response);
  //       })
  //       .catch(next);
  // }
}
