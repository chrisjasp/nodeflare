export default () => (
    {
      entry: './src/index.js',
      output: {
        path: './dist',
        filename: 'nodeflare.js',
        libraryTarget: 'umd',
        library: 'nodeflare'
      },
      target: 'node',
      externals: {
        'sequelize':{
          commonjs: 'sequelize',
          commonjs2: 'sequelize',
          amd: 'sequelize',
          root: 'sequelize'
        },
        'sqlite3':{
          commonjs: 'sqlite3',
          commonjs2: 'sqlite3',
          amd: 'sqlite3',
          root: 'sqlite3'
        },
        'bluebird': {
          commonjs: 'bluebird',
          commonjs2: 'bluebird',
          amd: 'bluebird',
          root: 'bluebird'
        },
        'express': {
          commonjs: 'express',
          commonjs2: 'express',
          amd: 'express',
          root: 'express'
        },
        'pg': {
          commonjs: 'pg',
          commonjs2: 'pg',
          amd: 'pg',
          root: 'pg'
        },
        'mysql': {
            commonjs: 'mysql',
            commonjs2: 'mysql',
            amd: 'mysql',
            root: 'mysql'
        }
      },
      module: {
        exprContextCritical: false,
        rules: [
          {test: /\.js$/, exclude: /node_modules/, loader: "babel-loader"}
        ]
      },
    }
);