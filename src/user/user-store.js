import Sequelize from 'sequelize';
import {UserEntity} from './user';
import {Util} from 'ctjs-util';

const UserPo = {
  id : {type: Sequelize.TEXT, primaryKey: true},
  version: Sequelize.INTEGER,
  emailaddress: Sequelize.TEXT,
  search: Sequelize.TEXT,
  json: Sequelize.JSONB
};

export class UserStore{
  constructor() {
    this.dependencies = 'db=db';
  }

  ready() {
    this.user = this.db.define('bsuser', UserPo, {tableName: 'bsuser', timestamps: false});
  }

  updateUser(user){
    let userPo = {
      id: user.id, version: user.version, emailaddress: user.emailAddress, search: '',
      json: user
    };
    return this.user.findOne({
      where: {
        id: user.id
      }
    })
    .then(u => {
      return u.update(userPo, {where: {
        id: user.id, version: (user.version - 1)
        }
      })
      .then(res => {
        let json = res.dataValues.json;
        json = Util.isString(json) ? JSON.parse(json) : json;
        return new UserEntity(json)
      });
    });
  }

  fetchUser(userId){
    return this.user.findOne({
      where: {
        id: userId
      }
    })
    .then(user => {
      if(user == null){
        throw Error('User Not Found');
      }
      let json = res.dataValues.json;
      json = Util.isString(json) ? JSON.parse(json) : json;
      return new UserEntity(json)
    });
  }

  fetchUserByEmail(email){
    return this.user.findOne({
      where: {
        emailaddress: email
      }
    })
    .then(user => {
      if(user == null){
        throw Error('User Not Found');
      }
      let json = user.dataValues.json;
      json = Util.isString(json) ? JSON.parse(json) : json;
      return new UserEntity(json)
    });
  }

  saveUser(user){
    let userPo = {
      id: user.id, version: user.version, emailaddress: user.emailAddress, search: '',
      json: user
    };
    return this.user
        .build(userPo)
        .save()
        .then(res => {
          let json = res.dataValues.json;
          json = Util.isString(json) ? JSON.parse(json) : json;
          return new UserEntity(json)
        });
  }

  hasUser(email){
    return this.user.findOne({
      where: {
        emailaddress: email
      }
    })
    .then(user => {
      return user == null;
    });
  }

  fetchAll(){
    return this.user.findAll()
      .then(users => {
        return users.map(res => {
          let json = res.dataValues.json;
          json = Util.isString(json) ? JSON.parse(json) : json;
          return new UserEntity(json)
        });
      });
  }
}
