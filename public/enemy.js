// Enemy properties
var numberOfEnemies = 10;
var enemyRadius = 10;

// Generate random locations for enemies.
var randomLocations = function(numberOfEnemies){
  var enemyLocations = [];
  for( var i = 0; i < numberOfEnemies; i++ ){
    var x = random()*$canvas.width();
    var y = random()*$canvas.height();
    enemyLocations.push({'x':x, 'y':y});
  }
  return enemyLocations;
}

// Update enemy positions.
var updateEnemiesLoc = function(){
  var enemyLocations = randomLocations(numberOfEnemies);
  d3.selectAll('.enemy')
    .data(enemyLocations)
    .transition()
    .duration(1000)
    .attr("cx", function(d){ return d.x; })
    .attr("cy", function(d){ return d.y; })
}

// Initialize enemy elements:
var updateEnemiesInterval;
var initializeEnemies = function() {
  d3.select('.canvas')
    .selectAll('circle')
    .data(randomLocations(numberOfEnemies))
    .enter()
    .append('circle')
    .attr("cx", function(d){ return d.x; })
    .attr("cy", function(d){ return d.y; })
    .attr("r", enemyRadius)
    .attr("class", "enemy")
    .style({
      '-webkit-animation': 'colorChange 1s infinite'
    });

  // Update enemy positions every second.
  updateEnemiesInterval = setInterval(updateEnemiesLoc, 1000);
};
