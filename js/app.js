'use strict';

/**
* @description Represents commmon properties of the objects
* @constructor
* @param {number} x - The x coordinate
* @param {number} y - The y coordinate
*/

function Character(x, y) {
    this.x = x;
    this.y = y;
}

/**
* @description Represents commmon function: rendering the objects
* @constructor
*/

Character.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

/**
* @description Enemy Object
* @constructor
*/

function Enemy(x, row, speed) {
    var VERTICAL_SPACE = 85;
    var TOP_MARGIN = 80;
    var y = TOP_MARGIN + row * VERTICAL_SPACE;
    Character.call(this, x, y);

    this.speed = speed;
    this.sprite = "images/enemy-bug.png";
}

Enemy.prototype = Object.create(Character.prototype);
Enemy.prototype.constructor = Enemy;

var allEnemies = [];

// Show ememies when offscreen
var HORIZONTAL_SPACE_ENEMY = 105;
var virtualMinX = -(HORIZONTAL_SPACE_ENEMY * 3);
var virtualMaxX = HORIZONTAL_SPACE_ENEMY * 10;

// Flag for game over
var game_over = false;

/**
* @description Check Collisions when Player hits enemies
*/

Enemy.prototype.checkCollisions = function() {
    // calculate the distance between the player and enemyies, if it hits game over
    var xDiff = Math.pow((player.x - this.x), 2);
    var yDiff = Math.pow((player.y - this.y), 2);
    var theDisstance = Math.sqrt(xDiff + yDiff);

    if (theDisstance < 40 && !game_over) {
        gameOver();
    }
};

/**
* @description Updates
* @param {number} dt - delta time, ensures the game has the same speed for all computers
* @param {number} speed - The speed of an enemy
*/

Enemy.prototype.update = function(dt, speed) {
    if (!game_over) {
        this.x += this.speed * dt;

        if (this.x > virtualMaxX && this.speed > 0) {
            this.x -= (virtualMaxX - virtualMinX);
        } else if (this.x < virtualMinX && this.speed < 0) {
            this.x += (virtualMaxX - virtualMinX);
        }
    }
    this.checkCollisions();

};

// Enemies's different speed from row to row
var speeds = [];
speeds.push(20 + Math.round(Math.random() * 30));
speeds.push(-(20 + Math.round(Math.random() * 30)));
speeds.push(20 + Math.round(Math.random() * 30));

// Push objects in to the array called allEnemies
// Horizontal difference between enemies
for (var row = 0; row < 3; row++) {
    var prev_position = virtualMinX;
    for (var i = 0; i < 80; i++) {
        var speedEnemy = speeds[row];
        var difference = HORIZONTAL_SPACE_ENEMY + Math.round(Math.random() * 2) * HORIZONTAL_SPACE_ENEMY;
        var new_position = prev_position + difference;
        if (new_position > virtualMaxX) {
            break;
        }

        var enemy = new Enemy(new_position, row, speedEnemy);
        allEnemies.push(enemy);
        prev_position = new_position;
    }
}

/**
* @description Represents a Player
* @constructor Player
*/

function Player(x, y) {
    Character.call(this);

    this.sprite = "images/char-boy.png";
    this.setInitPosition();
    this.myscore = 0;
}

Player.prototype = Object.create(Character.prototype);
Player.prototype.constructor = Player;

/**
* @description Player initial location
*/

Player.prototype.setInitPosition = function() {
    this.x = 202;
    this.y = 404;
};

// Flag for game won
var game_won = false;

/**
* @description Game over resets the game
*/

function gameOver() {
    game_over = true;
    setTimeout(function resetGame() {
        player.setInitPosition();
        game_over = false;
        gameStartInMs = Date.now();
        player.myscore = 0;
    }, 3000);
}

/**
* @description Resets the game if game won
*/

function gameWon() {
     setTimeout(function resetGame() {
        player.setInitPosition();
        game_won = false;
    }, 2000);
}

/**
* @description Timer
* @returns {number} Remaining time until game over
*/

var gameStartInMs = Date.now();

function remainingTime() {
    var currentTime = Date.now();
    var remain = ( ( (gameStartInMs + 20000) - currentTime)/1000);
    return remain;
}

/**
* @description Player update when game over or game won
*/

Player.prototype.update = function() {
    if (this.y <= 10 && !game_won) {
        gameWon();
        this.myscore++;
        game_won = true;
    }
    if (!game_over && !game_won && remainingTime() <= 0 ) {
        gameOver();
    }
};

/**
* @description Render the player on the screen
*/

Player.prototype.render = function() {
    Character.prototype.render.call(this);
    ctx.clearRect(0, 0, 505, 50);
    if (game_over) {
        ctx.save();
        ctx.beginPath();
        ctx.fillStyle = "rgba(1, 1, 1, 0.5)";
        ctx.rect(50.5, 75, 400, 350);
        ctx.fill();
        ctx.font = "65px Verdana";
        ctx.beginPath();
        ctx.fillStyle = "red";
        ctx.fillText("Game Over", 56, 202);
        ctx.fill();
        ctx.restore();
    }
    if (game_won) {
        ctx.font = "45px Verdana";
        ctx.fillText("Game Won", 10, 40);
    }
    ctx.font="25px Verdana";
    ctx.textAlign="cener";
    ctx.fillText("Score: " + this.myscore, 380, 40);
    if (!game_over && !game_won) {
        var convertTimeNumber = Math.round( remainingTime() );
        ctx.fillText("Time left: " + convertTimeNumber, 10, 40);
    }
};
/**
* @description Moves the player and setts the borders
* @param {string} key - Pressed keys on keyboard
*/

Player.prototype.handleInput = function(key) {
    if (key == "left") {
        if (this.x > 50) {
            this.x -= 101/2;
        }
    } else if (key == "up") {
        if (this.y > 10){
            this.y -= 83;
        }
    } else if (key == "right") {
        if ((this.x + 50 + 100) < 505) {
            this.x += 101/2;
        }
    } else if (key == "down") {
        if ((this.y + 110 + 100) < 606) {
            this.y += 83;
        }
    }
};

// This listens for key presses and sends the keys to your
// Player.handleInput() method. You don't need to modify this.
// Modified: player moves only when !game over and !game won

document.addEventListener("keyup", function(e) {
    var allowedKeys = {
        37: "left",
        38: "up",
        39: "right",
        40: "down"
    };
    if (!game_over && !game_won) {
        player.handleInput(allowedKeys[e.keyCode]);
    }
});

var player = new Player();
