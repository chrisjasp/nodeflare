import express from 'express';
import {EditUser, CreateUser} from '../user/user';

export class MyService{
  constructor(){
    this.dependencies = 'userKernel=UserKernel';
    this.router = new express.Router();
  }

  ready(){
    this.router.get('/user', this.user.bind(this));
    this.router.post('/user/create', this.createUser.bind(this));
    this.router.post('/user/edit', this.editUser.bind(this));
  }

  user(req, res, next){
    let session = req.sessionData.user;
    this.userKernel.fetchUser(session.id)
        .then(user => {
          res.json(user);
        })
        .catch(next);
  }

  createUser(req, res, next){
    let newUser = new CreateUser(req.body);
    this.userKernel.execute(newUser)
        .then(r => {
          res.json(r);
        }).catch(next);
  }

  editUser(req, res, next){
    let user = req.sessionData.user;
    let editUser = new EditUser(req.body);
    if(user.emailAddress !== editUser.emailAddress){
      throw Error('You can only edit the user you are logged in as');
    }
    this.userKernel.execute(editUser)
        .then(resp => {
          res.json(resp);
        })
        .catch(next);
  }
}
