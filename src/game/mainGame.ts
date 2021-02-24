import 'phaser';

interface PlayerConfig {
  x: number,
  y: number,
  width: number,
  height: number,
  speed: number,
  numJumps: number,
  maxJumps: number,
  flipX: boolean,
  walkFrameRate: number,
}

export class HomeScene extends Phaser.Scene {
  // game window width
  private gWidth: number = 800; // (this.sys.game.config.width || 800) as number;
  // game window height
  private gHeight: number = 600; // (this.sys.game.config.height || 600) as number;
  // map width: 30 tiles * 70 px/tile = 2100 px
  private mWidth = 2100;
  // map height: 20 tiles * 70 px/tile = 1400 px
  private mHeight = 1400;
  private gravity: number = 500;
  private groundDrag: number = 500;
  private map;// : Phaser.Physics.Arcade.World; or Phaser.Tilemaps.Tilemap

  private groundLayer;
  private coinLayer;
  private gemLayer;
  private starLayer;
  private numCoins: number;
  private numGems: number;
  private numStars: number;
  private text;
  private scoreString: string;

  private player; // : Phaser.Physics.Arcade.Sprite;
  private playerConfig: PlayerConfig = {
    width: 66,
    height: 92,
    x: 140, // player starting x loc
    y: (this.mHeight-70*5), // player starting y loc
    speed: 200,
    numJumps: 0,
    maxJumps: 2,
    flipX: false,
    walkFrameRate: 15,
  };

  private cursors;
  private printDebugKey;

  constructor() {
    super({
      key: 'HomeScene'
    });
  }
  init(params): void {
    this.numCoins = 0;
    this.numGems = 0;
    this.numStars = 0;
    this.scoreString = `Coins: ${this.numCoins} Gems: ${this.numGems} Stars: ${this.numStars}`;
  }
  preload(): void {
    // this.load.setBaseURL('./assets/');
    // this.load.image('player', 'player/blue/front.png');

    this.load.setBaseURL('./../tutorial/source/assets/');
    // map made with Tiled in JSON format
    this.load.tilemapTiledJSON('map', 'map_1.json');
    // tiles in spritesheet 
    this.load.spritesheet('tiles', 'tiles.png', {frameWidth: 70, frameHeight: 70});
    // simple coin image
    this.load.image('coin', 'coin.png');
    // simple gem image
    this.load.image('gem', 'gem.png');
    // simple star image
    this.load.image('star', 'star.png');
    // player animations
    this.load.atlas('player', 'player.png', 'player.json');
  }

  create(): void {

    // load the map 
    this.map = this.make.tilemap({key: 'map'});
    
    // tiles for the ground layer
    var groundTiles = this.map.addTilesetImage('tiles');
    // create the ground layer
    this.groundLayer = this.map.createDynamicLayer('World', groundTiles, 0, 0);
    // the player will collide with this layer
    this.groundLayer.setCollisionByExclusion([-1]);
    // coin image used as tileset
    const coinTiles = this.map.addTilesetImage('coin');
    // add coins as tiles
    this.coinLayer = this.map.createDynamicLayer('Coins', coinTiles, 0, 0);
    // star image used as tileset
    const starTiles = this.map.addTilesetImage('star');
    // // add stars as tiles
    this.starLayer = this.map.createDynamicLayer('Stars', starTiles, 0, 0);
    // // star image used as tileset
    const gemTiles = this.map.addTilesetImage('gem');
    // // add stars as tiles
    this.gemLayer = this.map.createDynamicLayer('Gems', gemTiles, 0, 0);
 
    // set the boundaries of our game world
    this.physics.world.bounds.width = this.groundLayer.width;
    this.physics.world.bounds.height = this.groundLayer.height;

    // configure the player's sprite
    this.player = this.physics.add.sprite(this.playerConfig.x, this.playerConfig.y, 'player');
    this.player.setDisplaySize(this.playerConfig.width, this.playerConfig.height);
    this.player.setBounce(0.0);
    this.player.setCollideWorldBounds(true);

    // keep the player from falling through the ground
    this.physics.add.collider(this.groundLayer, this.player);

    // track user input events
    this.cursors = this.input.keyboard.createCursorKeys();
    // get key object for print debugging
    this.printDebugKey = this.input.keyboard.addKey('P');

    // set bounds so the camera won't go outside the game world
    this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
    // make the camera follow the player
    this.cameras.main.startFollow(this.player);

    // collision with the coin tiles
    this.coinLayer.setTileIndexCallback(17, this.collectCoin, this); // the coin id is 17
    // when the player overlaps with a tile with index 17, collectCoin will be called    
    this.physics.add.overlap(this.player, this.coinLayer);

    // collision with the gem tiles
    this.gemLayer.setTileIndexCallback(18, this.collectGem, this); // the gem id is 17
    // when the player overlaps with a tile with index 18, collectGem will be called    
    this.physics.add.overlap(this.player, this.gemLayer);

    // collision with the star tiles
    this.starLayer.setTileIndexCallback(19, this.collectStar, this); // the gem id is 19
    // when the player overlaps with a tile with index 19, collectStar will be called    
    this.physics.add.overlap(this.player, this.starLayer);

    // animate the player walking
    this.anims.create({
      key: 'walk',
      frames: this.anims.generateFrameNames('player', { prefix: 'p1_walk', start: 1, end: 11, zeroPad: 2 }),
      frameRate: this.playerConfig.walkFrameRate,
      repeat: -1
    });

    // animate the idle player 
    this.anims.create({
      key: 'idle',
      frames: this.anims.generateFrameNames('player', { prefix: 'p1_stand', start: 0, end: 0, zeroPad: 1 }),
      frameRate: 10,
      repeat: -1
    });

    // animate the jumping player 
    this.anims.create({
      key: 'jump',
      frames: this.anims.generateFrameNames('player', { prefix: 'p1_jump', start: 0, end: 0, zeroPad: 1 }),
      frameRate: 10,
      repeat: -1
    });

    // text to show score, etc.
    this.text = this.add.text(20, 570, this.scoreString, {
      fontSize: '20px',
      fill: '#ffffff'
    });
    this.text.setScrollFactor(0);

  }
  update(time: number): void {
    this.renderPlayer();
  }

  private renderPlayer(): void {
    this.player.setDragX(0);
    if (this.cursors.left.isDown) { // if the left arrow key is down
      this.player.body.setVelocityX(this.playerConfig.speed*-1); // move left
      // this.player.anims.play('walk', true);
      this.player.flipX = true;
      // console.log("blue player moving left");
    } else if (this.cursors.right.isDown) { // if the right arrow key is down
      this.player.body.setVelocityX(this.playerConfig.speed); // move right
      // this.player.anims.play('walk', true);
      this.player.flipX = false;
      // console.log("blue player moving right");
    } else {
      this.player.setDragX(this.groundDrag);
      this.player.anims.play('idle', true);
    }

    if ((this.cursors.left.isDown || this.cursors.right.isDown) && this.player.body.onFloor()) {
      this.player.anims.play('walk', true);
      this.playerConfig.numJumps = 0;
    } else if (!(this.player.body.onFloor())) {
      this.player.anims.play('jump', true);
    } else { // this.player.body.onFloor()
      this.playerConfig.numJumps = 0;
    }

    if ((Phaser.Input.Keyboard.JustDown(this.cursors.space) || Phaser.Input.Keyboard.JustDown(this.cursors.up)) && this.playerConfig.numJumps < this.playerConfig.maxJumps) {
      this.player.body.setVelocityY(this.gravity*-0.67); // jump up
      this.playerConfig.numJumps++;
    }

    // print debugging for the player
    if (Phaser.Input.Keyboard.JustDown(this.printDebugKey)) {
      console.log("Player Info:");
      console.log(`x: ${this.player.x}`);
      console.log(`y: ${this.player.y}`);
    }
  }

  private collectCoin(sprite: any, tile: any): boolean {
    console.log("Coin collected!")
    this.coinLayer.removeTileAt(tile.x, tile.y);
    this.numCoins++;
    this.updateScoreText();
    return false;
  }

  private collectGem(sprite: any, tile: any): boolean {
    console.log("Gem collected!")
    this.gemLayer.removeTileAt(tile.x, tile.y);
    this.numGems++;
    this.updateScoreText();
    return false;
  }

  private collectStar(sprite: any, tile: any): boolean {
    console.log("Star collected!")
    this.starLayer.removeTileAt(tile.x, tile.y);
    this.numStars++;
    this.updateScoreText();
    return false;
  }

  private updateScoreText() {
    this.scoreString = `Coins: ${this.numCoins} Gems: ${this.numGems} Stars: ${this.numStars}`;
    this.text.setText(this.scoreString);
  }
};