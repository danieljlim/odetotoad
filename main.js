// TODO:
// [X] resize for mobile
// [X] scale to fit screen
// [X] refactor constants
// [X] add particle effects when collecting bread
// [X] add snake 
// [ ] refactor item collection
// [X] add toad 
// [X] make snake frequency increase with score

const SIZES = {
    WIDTH: 1024,
    HEIGHT: 1024
}

const GRAVITY = 450;
const JUMP_VELOCITY = -300;
const ITEM_VELOCITY = -100;

const BREAD_DELAY_MIN = 1500;
const BREAD_DELAY_MAX = 3000;
const SNAKE_DELAY_MIN = 5000;
const SNAKE_DELAY_MAX = 10000;
const TOAD_DELAY_MIN = 5000;
const TOAD_DELAY_MAX = 10000;

const SCORE_TEXT_X = 16;
const SCORE_TEXT_Y = 16;
const HIGH_SCORE_TEXT_X = 16;
const HIGH_SCORE_TEXT_Y = 48;
const FONT_SIZE = '32px';
const FONT_COLOR = '#000';

const SCORE_TEXT_PREFIX = 'Score: ';
const HIGH_SCORE_TEXT_PREFIX = 'High Score: ';


var config = {
    type: Phaser.AUTO,
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: SIZES.WIDTH,
        height: SIZES.HEIGHT
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: GRAVITY }
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

var game = new Phaser.Game(config);

var score = 0;
var scoreText;

var highScore = 0;
var highScoreText

function preload() {
    this.load.image('background', 'assets/background.png');
    this.load.spritesheet('player', 'assets/yoko.png', { frameWidth: 88, frameHeight: 128 });
    this.load.image('bread', 'assets/bread.png');
    this.load.image('breadcrumb', 'assets/breadcrumb2.png');
    this.load.image('toad', 'assets/toad-icon.png');
    this.load.image('toad-text', 'assets/toad-text.png');
    this.load.image('snake', 'assets/snake.png');
}

function create() {
    this.background = this.add.tileSprite(SIZES.WIDTH/2, SIZES.HEIGHT/2, 1792, 1024, 'background');

    this.player = this.physics.add.sprite(100, SIZES.HEIGHT/2, 'player');

    this.player.setBounce(0.2);
    this.player.setCollideWorldBounds(true);
    this.player.setScale(1.3); 

    // Create a group for the bread items
    this.breads = this.physics.add.group({
        allowGravity: false // Disable gravity
    });

    // Create a new bread item every 1.5-3 seconds
    this.time.addEvent({
        delay: Phaser.Math.Between(BREAD_DELAY_MIN, BREAD_DELAY_MAX),
        callback: function() {
            var bread = this.breads.create(SIZES.HEIGHT, Phaser.Math.Between(SIZES.HEIGHT*0.1, SIZES.HEIGHT*0.9), 'bread');
            bread.setVelocityX(ITEM_VELOCITY); // Set the horizontal velocity
        },
        callbackScope: this,
        loop: true
    });

    // Create a group for the snake items
    this.snakes = this.physics.add.group({
        allowGravity: false // Disable gravity
    });

    // Create a new snake item every 5-10 seconds
    this.time.addEvent({
        delay: Math.max(Phaser.Math.Between(SNAKE_DELAY_MIN, SNAKE_DELAY_MAX) - score * 50, 300),
        callback: function() {
            var snake = this.snakes.create(SIZES.HEIGHT, Phaser.Math.Between(SIZES.HEIGHT*0.15, SIZES.HEIGHT*0.8), 'snake');
            snake.setVelocityX(ITEM_VELOCITY*3); // Set the horizontal velocity
            snake.setScale(0.8);
        },
        callbackScope: this,
        loop: true
    });

    // Create a group for the toad items
    this.toads = this.physics.add.group({
        allowGravity: false // Disable gravity
    });

    // Create a new toad item every 5-10 seconds
    this.time.addEvent({
        delay: Phaser.Math.Between(TOAD_DELAY_MIN, TOAD_DELAY_MAX),
        callback: function() {
            var toad = this.toads.create(SIZES.HEIGHT, Phaser.Math.Between(SIZES.HEIGHT*0.15, SIZES.HEIGHT*0.8), 'toad');
            toad.setVelocityX(ITEM_VELOCITY*6); // Set the horizontal velocity
        },
        callbackScope: this,
        loop: true
    });

    // Initialize the particles property
    this.particles = this.add.particles('breadcrumb');
    
    // Function to make the player jump
    var jump = () => {
        this.player.setVelocityY(JUMP_VELOCITY);
    };

    // Make the player jump when the spacebar is pressed
    this.input.keyboard.on('keydown-SPACE', jump, this);

    // Make the player jump when the game canvas is clicked
    this.input.on('pointerdown', jump, this);
    
    // Detect collisions between the player and the bread items
    this.physics.add.overlap(this.player, this.breads, collectBread, null, this);
    
    // Detect collisions between the player and the toad items
    this.physics.add.overlap(this.player, this.toads, collectToad, null, this);

    // Add a collision handler between the player and the snake items
    this.physics.add.collider(this.player, this.snakes, function(player, snake) {
        // Reset the game here
        this.scene.restart();

        // Reset the current score
        score = 0;
    }, null, this);

    // Display the score
    scoreText = this.add.text(SCORE_TEXT_X, SCORE_TEXT_Y, SCORE_TEXT_PREFIX + '0', { fontSize: FONT_SIZE, fill: FONT_COLOR });
    highScoreText = this.add.text(HIGH_SCORE_TEXT_X, HIGH_SCORE_TEXT_Y, HIGH_SCORE_TEXT_PREFIX + highScore, { fontSize: FONT_SIZE, fill: FONT_COLOR });
}

function update() {
    // Scroll the background
    this.background.tilePositionX += 1;
}

// Function to handle collecting a bread item
function collectBread(player, bread) {
    bread.disableBody(true, true);

    makePlayerHappy(player, this)

    addToScore(1);
    
    // Create a new particle emitter
    var emitter = this.add.particles(bread.x, bread.y, 'breadcrumb', {
        speed: 50,
        scale: { start: 0.3, end: 0.8, random: true },
        angle: { min: 0, max: 360 },
        rotate: { min: 0, max: 360 },
        blendMode: 'NORMAL',
        radial: true 
    });

    // Stop emitting particles after a short time
    this.time.addEvent({
        delay: 150,
        callback: function() {
            emitter.stop();
        },
        callbackScope: this
    });
}

// Function to handle collecting a bread item
function collectToad(player, toad) {
    toad.disableBody(true, true);

    makePlayerHappy(player, this)

    addToScore(5);
    
    // Create a new particle emitter
    var emitter = this.add.particles(toad.x, toad.y, 'toad-text', {
        speed: 100,
        scale: { start: 0.1, end: 0.4, random: true },
        angle: { min: 0, max: 360 },
        blendMode: 'NORMAL',
        radial: true 
    });

    // Stop emitting particles after a short time
    this.time.addEvent({
        delay: 150,
        callback: function() {
            emitter.stop();
        },
        callbackScope: this
    });
}

function addToScore(amount) {
    score += amount;
    scoreText.setText(SCORE_TEXT_PREFIX + score);

    // Update and display the high score
    if (score > highScore) {
        highScore = score;
        highScoreText = highScoreText.setText(HIGH_SCORE_TEXT_PREFIX + highScore);
    }
}

function makePlayerHappy(player, scene) {
    // Change the player's sprite to the second frame
    player.setFrame(1);

    // If there's a previous timer, cancel it
    if (player.resetFrameTimer) {
        player.resetFrameTimer.remove(false);
    }

    // Change the player's sprite back to the first frame after a delay
    player.resetFrameTimer = scene.time.delayedCall(500, function() {
        player.setFrame(0);
    }, [], scene);
}