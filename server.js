// Initialize express.js, http, and socket.io modules.
var express = require('express');
var app = express();
var http = require('http');
http = http.Server(app);
var io = require('socket.io');
io = io(http);
var port = process.env.PORT || 3000;
var host = process.env.HOST || '0.0.0.0';

// The ip module displays the server IP address in console and on client page.
var ip = require('ip');
console.log( 'Running on', ip.address() );

// Serve index.html to the client.
app.get('/', function(req, res){
  res.sendfile('index.html');
});

// Make files in /public dir available to index.html.
app.use(express.static(__dirname + '/public'));

// Some global game-related variables keep track of players.
var numPlayers = 0;
var players = [];

// Listen for incoming connections and pass a socket to each one.
// io is essentially "the server" while an individual socket is "a client".

// For each now connection, create a socket.
io.on('connection', function(socket){

  var connectionID = numPlayers;
  console.log('Player',connectionID,'connected.');
  
  // When a new player connects, assign them a new id.
  socket.emit('assignPlayerID', connectionID);
  numPlayers++;

  // When a player is created, broadcast that player object to all players to render.
  socket.on('playerCreated', function(player){

    io.sockets.emit('renderPlayer', player);

    // Send list of current players to new joinee for them to render:
    for( var id = 0; id < players.length; id++ ){
      if( players[id].connected ){
        socket.emit( 'renderPlayer', players[id] );
      }
    }

    // Store the player's player object (has coordinates, radius, color, etc).
      // This is so we can send all players to new players for them to render. 
    players[player.id] = player;
  
    // Send server IP so it can be displayed on the client page.
    socket.emit( 'serverIP', ip.address() );
  });

  // Sync game via random seed and restart:
  socket.on('requestRestart', function(playerID){
    // Randomly generate a seed number from 0 to 999.
    var seed = Math.floor(Math.random()*1000);
    console.log('Player',playerID,'requested restart. Sending seed',seed);

    // Broadcast the 'restart' command to all clients, passing in the new seed.
    io.sockets.emit('restart', seed);

  });

  // On receiving a player's move, broadcast it to all players.
  socket.on('playerMove', function(player){
    players[player.id] = player;
    io.sockets.emit('playerMove', player);
  });

  // Disconnect players.
  socket.on('disconnect', function(){
    console.log('Player',connectionID,'disconnected');
    players[connectionID].connected = false;
    io.sockets.emit('removePlayer', connectionID);
  });
});

// Listen for incoming HTTP traffic on port 3000.
http.listen(port, function(){
  console.log('listening on *:'+port);
});
