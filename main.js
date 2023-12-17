// TODO:
// [X] resize for mobile
// [X] scale to fit screen
// [X] refactor constants
// [X] add particle effects when collecting bread
// [ ] refactor item collection
// [ ] add toad 

const SIZES = {
    WIDTH: 1024,
    HEIGHT: 1024
}

const GRAVITY = 450;
const JUMP_VELOCITY = -300;


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

function preload() {
    // Load assets here
    this.load.image('background', 'assets/background2.png');
    this.load.spritesheet('player', 'assets/yoko.png', { frameWidth: 88, frameHeight: 128 });
    this.load.spritesheet('bread', 'assets/bread.png', { frameWidth: 128, frameHeight: 88 });
    this.load.image('breadcrumb', 'assets/breadcrumb.png');
}

function create() {
    // Create game objects here
    // Add the background image as a tile sprite
    this.background = this.add.tileSprite(SIZES.WIDTH/2, SIZES.HEIGHT/2, 1792, 1024, 'background');

    // Add the player sprite
    this.player = this.physics.add.sprite(100, SIZES.HEIGHT/2, 'player');

    // Set player properties
    this.player.setBounce(0.2);
    this.player.setCollideWorldBounds(true);

    // Create a group for the bread items
    this.breads = this.physics.add.group({
        allowGravity: false // Disable gravity
    });

    // Create a new bread item every 2 seconds
    this.time.addEvent({
        delay: 2000,
        callback: function() {
            var bread = this.breads.create(1024, Phaser.Math.Between(100, 900), 'bread');
            bread.setVelocityX(-100); // Set the horizontal velocity
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

    // Display the score
    scoreText = this.add.text(16, 16, 'score: 0', { fontSize: '32px', fill: '#000' });
}

function update() {
    // Scroll the background
    this.background.tilePositionX += 1;
}

// Function to handle collecting a bread item
function collectBread(player, bread) {
    bread.disableBody(true, true);

    makePlayerHappy(player, this)

    // Increase and display the score
    score += 1;
    scoreText.setText('Score: ' + score);
    
    // Create a new particle emitter
    var emitter = this.add.particles(bread.x, bread.y, 'breadcrumb', {
        speed: 50,
        scale: { start: 0.3, end: 0.6 },
        angle: { min: 0, max: 360 },
        blendMode: 'NORMAL'
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