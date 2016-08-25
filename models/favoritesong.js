'use strict';
module.exports = function(sequelize, DataTypes) {
  var favoriteSong = sequelize.define('favoriteSong', {
    trackTitle: DataTypes.STRING,
    trackArtist: DataTypes.STRING,
    albumName: DataTypes.STRING,
    userId: DataTypes.INTEGER
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
        models.favoriteSong.belongsTo(models.user);
      }
    }
  });
  return favoriteSong;
};