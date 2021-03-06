var express = require('express');
var session = require('express-session');
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var cors = require('cors');
var db = require('./database/db');
// var mqtt = require('./mqtt/mqtt');
var compression = require('compression');
const createError = require("http-errors");

var users = require('./routes/users');
var pairsDevices = require('./routes/pairs_devices');
var thorDevices = require('./routes/thor_devices');
var residents = require('./routes/residents');
var deviceUpdate = require('./routes/device_update');

var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser())
app.use(compression())

app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

var url = 'http://localhost:9528'
if (process.env.NODE_ENV == 'prod') {
  url = process.env.HOST;
  // url = 'http://192.168.50.161:9526';
}
console.log('Allow-Origin: ' + url)
console.log('NODE_ENV: ' + process.env.NODE_ENV);

app.use((req, res, next) => {
  // const allowedOrigins = ['http://localhost:9526', 'http://localhost:9528';
  // const origin = req.headers.origin;
  // if (allowedOrigins.includes(origin)) {
  //      res.setHeader('Access-Control-Allow-Origin', origin);
  // }
  res.header('Access-Control-Allow-Origin', url),
  res.header('Access-Control-Allow-Credentials', true),
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

app.use('/api/v1/users', users);
app.use('/api/v1/pairs/devices', pairsDevices);
app.use('/api/v1/thor/devices', thorDevices);
app.use('/api/v1/residents', residents);
app.get('/api/v1/device/update', deviceUpdate.sse.init);

app.use((error, req, res, next) => {
  if (res.headerSent)
    return next(error);
  console.log(error.code);
  res.status(error.code || 500);
  res.end({ message: error.message || 'An unknown error occurred!' });
  //end send json
});

// passport config
var User = require('./database/models/user');
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

setTimeout(() => {
  const axios = require('axios')
  axios
    .post('http://localhost:3000/api/v1/users/register', {
      username:"admin",
      password:"123456", 
      roles: ["admin"]
    })
    .then(res => {
      console.log(`statusCode: ${res.status}`)
      // console.log(res)
    })
    .catch(error => {
      console.error(error)
    })
  }, 1000);

module.exports = app;



