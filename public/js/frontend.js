$( document ).ready(function() {

  console.log('loaded front end js');

  var socket = io();

  socket.on('connect', function() {
     console.log('Connected front end');
    $('.btn').on('click', function() {
      var link = $(this).attr("data-song");
      console.log('clicked' + link);
      socket.emit('clickedFav', link);
    });
  });



});
// var io = require('socket.io')(app);
// var fs = require('fs');

// //db stuff goes here somewhere

// function handler (req, res) {
//   fs.readFile(__dirname + '/index.html',
//   function (err, data) {
//     if (err) {
//       res.writeHead(500);
//       return res.end('Error loading index.html');
//     }

//     res.writeHead(200);
//     res.end(data);
//   });
// }


// io.on('connection', function (socket) {
//   socket.emit('news', { hello: 'world' });
//   socket.on('my other event', function (data) {
//     console.log(data);
//   });
// });
