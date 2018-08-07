# NodeFlare
A framework built on [Express](https://expressjs.com/) with built in JWT authentication, Dependency Injection, and Eventing.

## Getting Started
There are only a few steps to getting NodeFlare up and running.

### Install
```
npm install --save nodeflare sequelize sqlite3
```
### Run It!
```javascript
import {NodeFlare} from 'nodeflare';

let config = {hostname: 'http://localhost', port: 61370, tokenkey: '12345'};
let app = new NodeFlare(config).start();
              
export default app;
```

## Features
By default, NodeFlare starts up as an empty application listening on the port you configured. You can enable additional
features prior to calling .start() on the NodeFlare object.
### Auth Services
To enable the authentication services you can call .withAuthServices()
```javascript
let app = new NodeFlare(config)
              .withAuthServices()
              .start();
```
### App Settings
You can configure application settings with .appSet(setting, value). You can set existing [Express Settings](http://expressjs.com/en/4x/api.html#app.settings.table)
```javascript
let app = new NodeFlare(config)
              .appSet('view engine', 'pug')
              .start();
```
### Middleware
You can pass an optional path and function to .appUse(path, function) to add middleware to your application. You can pass
in a Router as a function. This will allow you to more easily encapsulate Routers into their own classes.
```javascript
import {NodeFlare, Router} from 'nodeflare';

let router = new Router();
router.get('/fun', (req, res, next) => {
  res.json({message: 'Yay'});
});

let app = new NodeFlare(config)
              .appUse('/api', router)
              .start();
```
This will create path /api/fun and will execute the router function.

If you turn on the Authentication Services, by default all new services you create are protected and you must preset a valid auth token. 
If you wish to allow (whitelist) certain services, you can call .whitelist(string|array).
```javascript
let app = new NodeFlare(config)
              .withAuthServices()
              .whitelist('/custom/url')
              .start();
```

## Dependency Injection
When you call start on a NodeFlare object, this creates the Application Context. This is available as global.ctx. You can register 
your own classes prior to calling start().
```javascript
let app = new NodeFlare(config)
              .register('Name', '<Class>')
              .register('Name', '<Class>', ['<Constructor Args>'])
              .start();
```
```javascript
let app = new NodeFlare(config)
              .registerInstance('Name', '<Object Instance>')
              .start();
```
```javascript
let app = new NodeFlare(config)
              .registerAndUse('/custom/url', 'Name', '<Class>', '[Constructor args]')
              .registerAndUse('/custom/url', 'Name', '<Class>')
              .start();
```
Onces you have started your application, you can call ctx.get('Name') to get the instance of the class you registered.

## Event Hub
You can get a reference to the EventHub from the application context
```javascript
let eventHub = ctx.get('EventHub');
```
### Subscriptions
You can subscribe to events with the key and channel and provide an event handler. Currently only unsubscribing from a key is supported.
```javascript
let eventHub = ctx.get('EventHub');

eventHub.subscribe(SomeClassName, 'Updated', (data) => {
  console.log(data);
});

eventHub.unsubscribe(SomeClassName);
```

### Publish
You can publish events to any channel.
```javascript
let eventHub = ctx.get('EventHub');

eventHub.publish('Updated', {}); // Channel & Payload. Payload is optional
```

## Configuration
Below is the configuration that is available.
The following properties are required, everything else is optional depending on your environment.
* hostname
* port
* tokenkey
```json
{
	"hostname": "http://localhost:61370",
	"port": 61370,
	"tokenkey": "<Some Random>",
	"passwordresettoken": "<Some Random>",
  "database": {
    "type": "<pg|mysql|sqlite>", 
    "db": "<Database Name>", 
    "path": "<File path for Sqlite. Empty for in memory>", 
    "host": "<Hostname for mysql/postgres>", 
    "user": "<DB User for mysql/postgres>", 
    "password": "<DB Password for mysql/postgres>"
  },
  "mail": {
    "disabled": true,
    "api": "<Api Url for Mail Gun>",
    "from": "",
    "message": "<Message for the Password Reset Email>",
    "subject": "<Password Reset Email Subject>"
  }
}
```
### Database
NodeFlare uses Sqlite by default to store users. Through configuration you can specify PostgreSQL or MySQL which are both supported.

## Built in User & Authentication Services
### Authentication Service
#### /auth/login -> Method: Post
Request Object
```json
{
  "username": "<User Account Email Address>",
  "password": "<Account Password>"
}
```
Json Response
```json
{"token": "<Authentication Token>", "sessionData": "<Custom Session Data Object>"}
```

#### /auth/passwordreset -> Method: Post
Request Object
```json
{
  "emailAddress": "<User Account Email Address>",
  "passwordresettoken": "<Token that was provided through configuration>"
}
```
Json Response
```json
{"token": "<Request Token>", "emailAddress": "<Account Email Address>"}
```

### The **My** Service
#### /my/user -> Method: Get
Json Response
```json
{
  "id": "user.id",
  "version": "user.version",
  "emailAddress": "user.emailAddress"
}
```
In addition to the above properties, all the properties you specify in the details of the create will be included.

#### /my/user/create -> Method: Post
Request Object
```json
{
  "emailAddress": "<Email>",
  "password": "<Password>",
  "details": {} // any data you want stored with the user as an object
}
```
Json Response

#### /my/user/edit -> Method: Post
Request Object
```json
{
  "id": "<ID>",
  "version": "<VERSION>",
  "emailAddress": "<Email>",
  "details": {} // User object you want to edit.
}
```
Json Response

## Who do I talk to? ###
Contact chrisjasp@gmail.com