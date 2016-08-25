# KEXP Live Playlist

A live playlist of what's on KEXP, allows users to save recently played tracks, save a track as their "Super Favorite" and delete saved tracks.

## Technologies used
* Express .js for dynamic files
* Request to request api calls
* Socket.io for realtime database updates without running Get routes
* Font Awesome for icons

## Approach

I wanted to have a way to listen to KEXP and save tracks that are currently playing for future use. I wanted to favorite these and not interrupt music playback, and be able to manage saved tracks and mark one as your current favorite, or "your jam". I also wanted to keep the design simple so that it'd run on mobile browser and display in a clean way.

## Install instructions

* Run `npm install` to install dependencies
  * Use `npm run lint:js` to lint your JS
  * Use `npm run lint:css` to lint your CSS
  * Use `npm test` to run tests
* Setup the databases
  * Change the database names in `config/config.json` to reflect your project
  * Run `createdb project_name_development` to create the development database

## Unsolved problems

* KEXP's API is really nice, and I'd like to have a chance to display more information and possibly album art. 
* Use socket.io more extensivly to get realtime playback info and an auto-updating playlist without refreshing the page
* a page to see all users' "Superfaved" tracks
