import Sequelize from 'sequelize';

export class PgConnection extends Sequelize{
  constructor(host, username, pass, dbname, withSSL){
    super(dbname, username, pass,
        {
          dialect: 'postgres',
          dialectOptions: {
            ssl: withSSL
          },
          host: host,
          logging: false
        }
    );
  }
}

export class PgConnectionUri extends Sequelize{
  constructor(uri, withSSL){
    super(uri, {
      dialect: 'postgres',
      dialectOptions: {
        ssl: withSSL
      },
      logging: false
    });
  }
}

export class SqliteConnection extends Sequelize{
  constructor(path, username = '', pass = '', dbname = ''){
    super(dbname, username, pass,
        {
          dialect: 'sqlite',
          logging: false,
          storage: path
        }
    );
  }
}
