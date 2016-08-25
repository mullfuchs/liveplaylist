$( document ).ready(function() {

  console.log('loaded front end js');

  var socket = io();

  socket.on('connect', function() {
     console.log('Connected front end');
    $('.fav-this-song').on('click', function() {
      var link = $(this).attr("data-song");
      console.log('clicked' + link);
      socket.emit('clickedFav', link);
      $('.recent-favs').append("<p>" + $(this).attr("data-track") + "</p>");
    });
  });

  $('.delete-link').on('click', function(e) {
  e.preventDefault();
  var songElement = $(this);
  var songUrl = songElement.attr('href');
  $.ajax({
      method: 'DELETE',
      url: songUrl
    }).done(function(data) {
      songElement.parent().remove();
      window.location = "/profile";
    });
  });

  $('.super-fav').on('click', function(e){
    e.preventDefault();
    var songUrl = $(this).attr('href');
    $.ajax({
      method: 'PUT',
      url: songUrl
    }).done(function(){
      window.location = "/profile";
    });
  });


});

