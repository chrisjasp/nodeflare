export {User, UserEntity, CreateUser, ChangePassword, EditUser} from './user';

export class AuthenticationRequest{
  constructor(data){
    this.load(data);
  }

  load(data){
    data = data != null ? data : {};
    this.emailAddress = data.username;
    this.password = data.password;
  }
}