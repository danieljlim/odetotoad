var config = {
    type: Phaser.AUTO,
    width: 1024,
    height: 1024,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 200 }
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
}

function create() {
    // Create game objects here
    // Add the background image as a tile sprite
    this.background = this.add.tileSprite(512, 512, 1792, 1024, 'background');

    // Add the player sprite
    this.player = this.physics.add.sprite(100, 450, 'player');

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
    
    // Function to make the player jump
    var jump = () => {
        this.player.setVelocityY(-330);
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

    // Change the player's sprite to the second frame
    player.setFrame(1);


    // If there's a previous timer, cancel it
    if (player.resetFrameTimer) {
        player.resetFrameTimer.remove(false);
    }

    // Change the player's sprite back to the first frame after a delay
    player.resetFrameTimer = this.time.delayedCall(500, function() {
        player.setFrame(0);
    }, [], this);   

    // Increase and display the score
    score += 1;
    scoreText.setText('Score: ' + score);
}