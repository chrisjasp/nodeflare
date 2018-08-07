import Promise from 'bluebird';

export class UserCatalog{
  constructor(){
    this.dependencies = 'userStore=UserStore,passwordHasher=PasswordHasher,eventHub=EventHub';
  }

  static get UpdateComplete(){
    return 'UpdateUserCatalogComplete';
  }

  static get Update(){
    return 'UpdateUserCatalog';
  }

  ready(){
    this.eventHub.attachEventHub(this);
    this.subscribe(UserCatalog.Update, () => this.updateCatalog());
    this._catalog = {
      version: 0,
      users: []
    };
  }

  get version(){
    return this._catalog.version;
  }

  updateCatalog(){
    this._catalog.version++;
    this._catalog.users = [];
    return this.userStore.fetchAll()
      .then(u =>{
        this._catalog.users = u.map(e => e.toUser());
      });
  }

  push(newUser){
    let userIdx = this._catalog.users.findIndex(e => e.id === newUser.id);

    if(userIdx === -1){
      this._catalog.users.push(newUser);
    }else{
      this._catalog.users[userIdx] = newUser;
    }
    this._catalog.version++;
    this.publish(UserCatalog.UpdateComplete, newUser);
  }

  remove(user){
    let userIdx = this._catalog.users.findIndex(e => e.id === user.id);

    if(userIdx !== -1){
      this._catalog.users.splice(userIdx, 1);
      this._catalog.version++;
      this.publish(UserCatalog.UpdateComplete, user);
    }
  }

  fetchUser(id){
    let user = this._catalog.users.find(e => {
      return e.id === id;
    });

    if(user == null){
      throw Error('User Not Found');
    }
    return Promise.resolve(user);
  }

  fetchByEmail(email){
    let user = this._catalog.users.find(e => {
      return e.emailAddress === email;
    });

    if(user == null){
      throw Error('User Not Found');
    }
    return Promise.resolve(user);
  }
}