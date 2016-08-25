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
var db = require('./models');
var $ = require('jQuery');

//require('events').EventEmitter.prototype._maxListeners = 100;
var currentUserId;

var app = express();

var http = require('http').Server(app);

var io = require('socket.io')(http);


app.set('view engine', 'ejs');

app.use(require('morgan')('dev'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(ejsLayouts);
app.use(express.static('public'));

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

function getFavorites(callback){
  var favoriteList;
  db.user.findOne({where: {id: process.env.userId}}).then(function(user){
      if(user){
        user.getFavoriteSongs().then(function(favorites){
          if(favorites){
            callback(null, favorites);
          }
          else{
            callback(null, {favs: {trackTitle: "ahh", trackArtist : "uhh"}});
          }
          //res.render('profile', {superfav: superfav, favorites: favorites});
        });  
      }
      else{
        callback(null, {favs: {trackTitle: "ahh", trackArtist : "uhh"}});
      }
  });
}

app.get('/', function(req, res) {
  if(req.session.isLoggedIn){
    currentUserId = req.currentUser.Id;
  }


  async.series([getCurrentTrack, getLatestPlays, getFavorites], function(err, results){
    if(results[0].Artist == undefined){
      var airBreak = {Artist: {Name: "Air Break"}, Track : {Name: "-"}};
      console.log(results);
      res.render('index', {currentSong: airBreak, recentPlays: results[1], favorites: results[2]});
    }
    else{
      console.log(results);
      res.render('index', {currentSong: results[0], recentPlays: results[1], favorites: results[2]});
    }
  });
});

app.get('/profile', isLoggedIn, function(req, res) {
  db.user.findOne({where: {email: req.user.email}}).then(function(user){
    db.favoriteSong.findOne({where :{id: req.user.superfav}}).then(function(superfav){  
      user.getFavoriteSongs().then(function(favorites){
        res.render('profile', {superfav: superfav, favorites: favorites});
      });
    });
  });
  
});

app.use('/auth', require('./controllers/auth'));

function getDateNumber(dateData){
  return dateData.match(/[0-9]+/g);
}


io.on('connection', function (socket) {
  socket.on('clickedFav', function (data) {
    addSongToFavorites(data);
  });
});

var PORT = process.env.PORT || 3000;

http.listen(PORT, function() {
  console.log('Running server on ' + PORT);
});

function addSongToFavorites(data){
  var dateNumber = getDateNumber(data);
  var dateString = formatDateForQuery(dateNumber);
  var favedSong;
  request('http://cache.kexp.org/cache/plays?startTime=' + dateString, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      data = JSON.parse(body);
      favedSong = data.Plays[0];
      if(process.env.userId){
        db.favoriteSong.create({
          trackTitle: favedSong.Track.Name,
          trackArtist: favedSong.Artist.Name,
          albumName: favedSong.Release.Name,
          userId: process.env.userId
        }).then(function(data){
            db.user.findOne({where: {id: process.env.userId}}).then(function(user){
              user.addFavoriteSong(data);
            });
        });
      }
      else{

      }
    }
    else{
      favedSong = null;
    }

  });
}

function formatDateForQuery(dateNumber){
  var songDate = new Date(0);
  songDate.setUTCMilliseconds(dateNumber);
  return(songDate.toISOString());
}

app.delete('/delete/:songid', function(req, res) {
  var songToDelete = req.params.songid;
  console.log('delete route for ' + songToDelete);
  db.favoriteSong.destroy({
    where: {id : songToDelete}
  }).then(function(){
    res.redirect('localhost:3000/profile');
  });
  
});

app.put('/superfav/:songid', function(req, res){
  var songToUpdate = req.params.songid;
  console.log('adding superfav ' + songToUpdate);

  db.user.update({
    superfav: songToUpdate
  }, {
    where: {
      id: process.env.userId
    }
  }).then(function(user) {
    // do something when done updating
  });


});
