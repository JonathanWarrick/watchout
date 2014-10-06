// Global variables (mostly game settings):
var timestep = 5;
var score = 0;
var highScore = 0;
var collisionCounter = 0;
var player;
var updateScoreboardInterval;
var seed = 0;
var $canvas = $('.canvas');

// Start the game.
var init = function(){

  // Listen for server IP to display on page:
  socket.on('serverIP', function(serverIP){
    $('#ip').html("Server IP: <a href='http://"+serverIP+":3000' >"+serverIP+":3000</a>");
  });

  // Listen for server to assign a player ID.
  socket.on('assignPlayerID', function(id){
    console.log("Connected as player",id);
    // then create player and ask server to restart with new seed.
    // Create player object and broadcast (but don't render yet).
    createPlayer(id);
    // Ask server to tell all players to restart with a new seed.
    socket.emit('requestRestart', player.id);
  });

  // Listen for server to send a player to render on the page.
  socket.on('renderPlayer', function(player){
    renderPlayer(player);
  });

  // Create enemies and start their movement.
  initializeEnemies();

  // Listen for restart commands from server to use new random seed for synced enemy movement.
  socket.on('restart', function(receivedSeed){
    restart(receivedSeed);
  });

  // Listen for a player diconnecting to remove their player.
  socket.on('removePlayer', function(playerID){
    removePlayer(playerID);
  });
};

// Restart the game.
var restart = function(receivedSeed){
  seed = receivedSeed;
  console.log("Restarting with seed:", seed);

  // If enemies have started, reset their movement interval, else initialize enemies.
  clearInterval(updateEnemiesInterval);
  if( updateEnemiesInterval ){
    updateEnemiesInterval = setInterval( updateEnemiesLoc, 1000 );
  } else {
    initializeEnemies()
  }

  // Reset scoreboard/collision interval.
  clearInterval(updateScoreboardInterval);
  updateScoreboardInterval = setInterval( updateScoreboard, timestep*10 );

  // Listen for dragging movement and send updated player object to server.
  $(document).ready(function() {
    var mousemoveHandler;

    // if player icon is within certain bounds of mouse upon click
    // and only move if the player is close enough to the mouse
    $("#player"+player.id).mousedown(function() {
      mousemoveHandler = $(".canvas").mousemove(function(event) {
        canvasOffset = $canvas.offset();
        player.x = event.pageX - canvasOffset.left;
        player.y = event.pageY - canvasOffset.top;
        socket.emit('playerMove', player);
      });
    });
    $("#player"+player.id).mouseup(function() {
      mousemoveHandler.unbind('mousemove');
    });
  });
};

// Random number generator from a seed:
var random = function() {
    var x = Math.sin(seed++) * 10000;
    return x - Math.floor(x); 
    // return Math.random();
};

// Update scoreboard; reset score to 0 upon collision.
var updateScoreboard = function(){
  // Increment score:
  score++;
  // If collision detected, increment collisionCounter and reset score.
  if( collision() === true ){
    if($('.main').css('-webkit-animation') !== 'collideFlash 0.5s ease 0s 1 normal none running '){
      $('.main').css('-webkit-animation', 'collideFlash .5s');
      collisionCounter++;
      score = 0;
      setTimeout(function(){$('.main').css('-webkit-animation', 'none');}, 500);
    }
  }
  // Update high score:
  if(score > highScore){
    highScore = score;
  }
  // Update scoreboard text:
  $('.highScore').text('High score: '+highScore);
  $('.currentScore').text('Current score: '+score);
  $('.collisions').text('Collisions: '+collisionCounter);
};

// Check whether the player has collided with an enemy.
var collision = function(){
  // Player coordinates at time of collision check.
  player.x = +d3.select("#player"+player.id).attr('cx');
  player.y = +d3.select("#player"+player.id).attr('cy');
  player.r = +d3.select("#player"+player.id).attr('r');
  var collided = false;
  d3.selectAll('.enemy')
    .each(function(d, i) {
      // Enemy coordinates at time of collision check.
      var enemyX = +d3.select(this).attr('cx');
      var enemyY = +d3.select(this).attr('cy');
      var enemyR = +d3.select(this).attr('r');
      var distanceBetween = (player.x - enemyX) * (player.x - enemyX) +
                            (player.y - enemyY) * (player.y - enemyY);
      if (distanceBetween <= (player.r + enemyR) * (player.r + enemyR)) {
        console.log("Collision!");
        collided = true;
      }
  });
  return collided;
};
