var express = require('express');
var ejsLayouts = require('express-ejs-layouts');
var bodyParser = require('body-parser');
var session = require('express-session');
var passport = require('./config/ppConfig');
var flash = require('connect-flash');
var request = require('request');
var isLoggedIn = require('./middleware/isLoggedIn');
var async = require('async');
var fs = require('fs');
var frontend = require('./public/js/frontend');
var $ = require('jQuery');

//require('events').EventEmitter.prototype._maxListeners = 100;

var app = express();

var http = require('http').Server(app);

var io = require('socket.io')(http);

app.set('view engine', 'ejs');

app.use(require('morgan')('dev'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(ejsLayouts);

app.use(session({
  secret: process.env.SESSION_SECRET || "DLKAJSFEIOEJ69QSDFGSDLFGD43FGRER",
  resave: false,
  saveUninitialized: true
}));

app.use(flash());

app.use(passport.initialize());
app.use(passport.session());

app.use(function(req,res,next){
  res.locals.alerts = req.flash();
  res.locals.currentUser = req.user;
  next();
});

function getCurrentTrack(callback){
  var currentSong;
  request('http://cache.kexp.org/cache/latestPlay', function (error, response, body) {
    if (!error && response.statusCode == 200) {
      data = JSON.parse(body);
      currentSong = data.Plays[0];
      callback(null, currentSong);
    }
    else{
      callback(error, currentSong);
    }
  });
  
}

function getLatestPlays(callback){
  var recentPlays;
  request('http://cache.kexp.org/cache/recentPlays', function(error, response, body) {
      if(!error && response.statusCode == 200){
        recentPlays = JSON.parse(body);
        callback(null, recentPlays);
      }
      else{
        callback(error, recentPlays);
      }
  });
}

app.get('/', function(req, res) {
  async.series([getCurrentTrack, getLatestPlays], function(err, results){
    res.render('index', {currentSong: results[0], recentPlays: results[1]});
  });
});

app.get('/profile', isLoggedIn, function(req, res) {
  res.render('profile');
});

app.get('/addfav/:date', function(req, res){
  console.log('clicked fav button');
  console.log(getDateNumber(req.params.date));
});

app.use('/auth', require('./controllers/auth'));

//var server = app.listen(process.env.PORT || 3000);

//module.exports = server;


function getDateNumber(dateData){
  return dateData[0].match(/[0-9]+/g);
}


io.on('connection', function (socket) {
  socket.emit('news', function(){
    console.log("connection on");
  });
  socket.on('my other event', function (data) {
    console.log("index.js" + data);
  });
});

var PORT = process.env.PORT || 3000;

http.listen(PORT, function() {
  console.log('Running server on ' + PORT);
});


/*
GET /
GET /Profile
GET /auth/login
GET /auth/signup
*/