export class User{
  constructor(data){
    data = data != null ? data : {};
    if(data.details != null){
      for(let o of Object.keys(data.details)){
        this[o] = data.details[o];
      }
    }
    this.id = data.id;
    this.version = data.version;
    this.emailAddress = data.emailAddress;
    // this.user = data;
  }
}

export class CreateUser{
  constructor(data){
    data = data != null ? data : {};
    this.commandType = 'create';
    this.emailAddress = data.emailAddress;
    this.password = data.password;
    this.details = {};
    if(data.details != null){
      for(let o of Object.keys(data.details)){
        this.details[o] = data.details[o];
      }
    }
  }
}
export class ChangePassword{
  constructor(data){
    data = data != null ? data : {};
    this.commandType = 'resetpassword';
    this.emailAddress = data.emailAddress;
    this.password = data.password;
    this.confirmpassword = data.confirmpassword;
  }
}
export class EditUser{
  constructor(data){
    this.commandType = 'edit';
    this.id = data.id;
    this.version = data.version;
    this.emailAddress = data.emailAddress;
    this.details = {};
    if(data.details != null){
      for(let o of Object.keys(data.details)){
        this.details[o] = data.details[o];
      }
    }
  }
}

export class UserEntity{
  constructor(data){
    data = data != null ? data : {};
    this.id = data.id;
    this.version = data.version;
    this.emailAddress = data.emailAddress;
    this.passwordHash = data.passwordHash;
    this.passwordSalt = data.passwordSalt;
    this.passwordResetRequired = data.passwordResetRequired;
    this.details = {};
    if(data.details != null){
      for(let o of Object.keys(data.details)){
        this.details[o] = data.details[o];
      }
    }
  }

  static create(idGenerator, passwordHasher, data){
    let passHash = passwordHasher.generateHash(data.password);
    return new UserEntity({
      id: idGenerator(),
      version: 1,
      emailAddress: data.emailAddress,
      passwordHash: passHash.hash,
      passwordSalt: passHash.salt,
      passwordResetRequired: false,
      details: data.details
    });
  }

  execute(action, passwordHasher){
    this.version++;

    switch(action.commandType){
      case 'edit':
        return this.editUser(action);
        break;
      case 'resetpassword':
        return this.updatePassword(action, passwordHasher);
        break;
      default:
        throw Error('Invalid Command');
    }
  }

  updatePassword(action, passwordHasher){
    if(action.password !== action.confirmpassword){ throw Error('Passwords Do Not Match')}

    let passHash = passwordHasher.generateHash(action.password);
    this.passwordHash = passHash.hash;
    this.passwordSalt = passHash.salt;
    return {user: this, message: 'Password Updated'};
  }

  editUser(action){
    this.details = action.details;
    return {user: this, message: 'Updated User'};
  }

  toUser(){
    return new User({
      id: this.id,
      version: this.version,
      emailAddress: this.emailAddress,
      details: this.details
    });
  }
}