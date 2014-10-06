// Create player object and send to server.
var createPlayer = function(id){

  // Create player object with randomized values.
  var colorsOptions = ["red", "orange", "yellow", "blue", "green"];
  player = {
    'id':id,
    'x':($canvas.width() / 4 * Math.random()),
    'y':($canvas.height() / 4 * Math.random()),
    'r':20,
    'color': colorsOptions[id%colorsOptions.length],
    'connected': true
  }

  // Set an element on page to match player's color.
  $('#ip').css('color',player.color);

  // Send created player object to server.
  socket.emit('playerCreated',player);
};

// Render a player circle on the page.
var renderPlayer = function(player){
  
  // Create circle with class 'player'.
  var playerIcon = d3.select('.canvas')
                     .append("circle")
                     .attr("class", "player");

  // Add player object's data to player's circle:
  playerIcon.data([player])
            .attr("cx", function(d) { return d.x; })
            .attr("cy", function(d) { return d.y; })
            .attr("r", function(d) {return d.r; })
            .style('fill', function(d) {return d.color; })
            .attr('id',function(d) { return 'player'+d.id; });

  // Listen for player movement data from server to move player circle:
  socket.on('playerMove', function(player){
    d3.select('#player'+player.id)
    .transition()
    .duration(timestep)
    .attr("cx", player.x)
    .attr("cy", player.y);
  });
};

// Remove all players' circles.
var removePlayer = function(playerID){
  d3.select('#player'+playerID).remove()
};
