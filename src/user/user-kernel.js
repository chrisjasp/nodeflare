import {UserEntity, User} from './user';
import uuid from 'uuid/v4';

export class UserKernel{
  constructor(){
    this.dependencies = 'userStore=UserStore,passwordHasher=PasswordHasher,userCatalog=UserCatalog,eventHub=EventHub';
  }

  execute(userAction){
    // @todo: Allow for customizable UserEo and User
    if(userAction.commandType === 'create'){
      let userEo = UserEntity.create(uuid, this.passwordHasher, userAction);
      return this.userStore.hasUser(userAction.emailAddress)
          .then(u => {
            if(!u){
              throw Error('Account in use.')
            }
            return this.userStore.saveUser(userEo);
          })
          .then(userSaveEo => {
            this.userCatalog.push(userSaveEo.toUser());
            return {user: userSaveEo.toUser(), message: 'User Created', actionType: 'create'};
          });
    }else{
      let response;
      return this.userStore.fetchUserByEmail(userAction.emailAddress)
          .then(userFetch => {
            response = userFetch.execute(userAction, this.passwordHasher);
            return this.userStore.updateUser(userFetch);
          })
          .then(updateResponse => {
            this.userCatalog.push(updateResponse.toUser());
            return {user: updateResponse.toUser(), message: response.message, actionType: userAction.commandType };
      });
    }
  }

  fetchUser(id){
    return this.userCatalog.fetchUser(id)
        .then(user => user);
  }

  fetchByEmail(email){
    return this.userCatalog.fetchByEmail(email)
        .then(user => user);
  }
}