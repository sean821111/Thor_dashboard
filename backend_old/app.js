var express = require('express');
var session = require('express-session');
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var cors = require('cors');
var db = require('./database/db');
var mqtt = require('./mqtt/mqtt');

var users = require('./routes/users');
var pairsDevices = require('./routes/pairs_devices');
var thorDevices = require('./routes/thor_devices');
var residents = require('./routes/residents');

var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser())

app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

app.use(cors({origin: 'http://localhost:9528', credentials: true}));
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:9528'),
  res.header('Access-Control-Allow-Credentials', true),
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

app.use('/api/v1/users', users);
app.use('/api/v1/pairs/devices', pairsDevices);
app.use('/api/v1/thor/devices', thorDevices);
app.use('/api/v1/residents', residents);

// passport config
var User = require('./database/models/user');
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

module.exports = app;
