import 'phaser';
import MovingPlatform from './MovingPlatform';
import ObstacleButton from './ObstacleButton';

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
  private gWidth: number;//  = 800; // (this.sys.game.config.width || 800) as number;
  // game window height
  private gHeight: number; //  = 600; // (this.sys.game.config.height || 600) as number;

  private zoomFactor: number; //  = 0.5;
  // map width: 30 tiles * 70 px/tile = 2100 px
  private mWidth; // = 2100;
  // map height: 20 tiles * 70 px/tile = 1400 px
  private mHeight; //  = 1400;
  private gravity: number; // = 500;
  private groundDrag: number; // = 500;
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
  private playerConfig: PlayerConfig;

  private cursors;
  private pauseKey: Phaser.Input.Keyboard.Key;
  private printDebugKey: Phaser.Input.Keyboard.Key;

  constructor() {
    super({
      key: 'HomeScene'
    });
  }
  init(params): void {
    this.gWidth = 800;
    this.gHeight = 600;
    this.zoomFactor = 0.5;
    this.mWidth = 2100;
    this.mHeight = 1400;
    this.gravity = 500;
    this.groundDrag = 500;
    this.playerConfig = {
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
    this.load.tilemapTiledJSON('map', 'map_1.4.json');
    // tiles in spritesheet 
    this.load.spritesheet('tiles', 'tiles.png', {frameWidth: 70, frameHeight: 70});
    // simple coin image
    this.load.image('coin', 'coin.png');
    // simple gem image
    this.load.image('gem', 'gem.png');
    // simple star image
    this.load.image('star', 'star.png');
    // the elevator/moving platform image
    this.load.image('platform', 'platform.png');
    // the button (on and off) images
    this.load.image('buttonOff', 'buttonOff.png');
    this.load.image('buttonOn', 'buttonOn.png');
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

    // add the player's sprite
    this.player = this.physics.add.sprite(this.playerConfig.x, this.playerConfig.y, 'player');
    this.player.setDisplaySize(this.playerConfig.width, this.playerConfig.height);
    this.player.setBounce(0.0);
    this.player.setCollideWorldBounds(true);

    // add the moving platforms as specified in the object layer of the map
    const plats = this.map.filterObjects("Platforms", p => p.name == "platform");
    const platformObjs: Array<MovingPlatform> = [];
    plats.forEach(p => {
      const plat = new MovingPlatform(this, p.x, p.y, 'platform');
      plat.setOrigin(0, 1); // change the origin to the top left to match the default for Tiled
      if (plat.isFixed) {
        if (this.tiledObjectPropertyIsTrue('moveVertical', p)) {
          plat.moveVertically();
        } else if(this.tiledObjectPropertyIsTrue('moveHorizontal', p)) {
          plat.moveHorizontally();
        }
      }
      const obstacleNumIdx = this.tiledObjectHasProperty('obstacleNum', p)
      if (obstacleNumIdx >= 0) {
        plat.objectNum = p.properties[obstacleNumIdx].value;
        // console.log(`platform obstacle num: ${plat['objectNum']}`)
      }
      platformObjs.push(plat);
    });
    this.physics.world.enable(platformObjs, Phaser.Physics.Arcade.DYNAMIC_BODY); //Phaser.Physics.Arcade.STATIC_BODY

    // add the buttons to enable the player to interact with obstacles
    // add the moving platforms as specified in the object layer of the map
    const buttons = this.map.filterObjects("Buttons", p => p.name == "button");
    const buttonObjs: Array<ObstacleButton> = [];
    buttons.forEach(b => {
      const butt = new ObstacleButton(this, b.x, b.y, 'buttonOff');
      butt.setOrigin(0, 1); // change the origin to the top left to match the default for Tiled
      const obstacleNumIdx = this.tiledObjectHasProperty('obstacleNum', b)
      if (obstacleNumIdx >= 0) {
        butt.objectNum = b.properties[obstacleNumIdx].value;
        // console.log(`platform obstacle num: ${plat['objectNum']}`)
      }
      buttonObjs.push(butt);
    });
    this.physics.world.enable(buttonObjs, Phaser.Physics.Arcade.STATIC_BODY);
    
    // keep the player from falling through the ground
    this.physics.add.collider(this.groundLayer, this.player);

    // handle collisions with moving platforms
    buttonObjs.forEach(bObj => {

      const collisionObstacleButton = () => {
        console.log(`collision with button # ${bObj.objectNum}`)
      };
      //Only allow collisions from top
      const isCollisionFromTop = () => { // todo fix this/figure out how to remove
        return true;//bObj.body.y > this.player.body.y;
      };

      this.physics.add.collider(
        this.player,
        bObj,
        collisionObstacleButton,
        isCollisionFromTop,
        this.scene
      );
    });

    // handle collisions with button
    platformObjs.forEach(pObj => {
      (pObj.body as Phaser.Physics.Arcade.Body).setImmovable();
      (pObj.body as Phaser.Physics.Arcade.Body).setAllowGravity(false);

      const collisionMovingPlatform = () => {
        if (pObj.body.touching.up && this.player.body.touching.down) {
          this.player.isOnPlatform = true;
          this.player.currentPlatform = pObj;      
        }
      };
      //Only allow collisions from top
      const isCollisionFromTop = () => {
        return pObj.body.y > this.player.body.y;
      };

      this.physics.add.collider(
        this.player,
        pObj,
        collisionMovingPlatform,
        isCollisionFromTop,
        this.scene
      );
    });

    // track user input events
    this.cursors = this.input.keyboard.createCursorKeys();
    // get key object for print debugging
    this.printDebugKey = this.input.keyboard.addKey('P');
    // get key object for pausing the game (the escape button)
    this.pauseKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC.valueOf());

    // todo below is line to 'view whole world' will need to move to in-game phone option?
    this.cameras.main.setZoom(this.zoomFactor);
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
    const textX = 0 - (this.gWidth / this.zoomFactor) / 5;
    const textY = this.gHeight / this.zoomFactor - 400;
    console.log(`text location: ${textX}, ${textY}`);
    this.text = this.add.text(textX, textY, this.scoreString, {
      fontSize: '32px',
      fill: '#ffffff'
    });
    this.text.setScrollFactor(0);

  }

  public update(time: number): void {
    this.renderPlayer();
    // detect if the player wants to pause the game
    if (Phaser.Input.Keyboard.JustDown(this.pauseKey)) {
      console.log('Pause button pushed!');
      if( !(this.scene.isPaused()) ) {
        console.log('Game paused!');
        this.scene.switch('PauseScene');
      }
    }
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

    if ((this.cursors.left.isDown || this.cursors.right.isDown) && this.playerOnFloor()) {
      this.player.anims.play('walk', true);
      this.playerConfig.numJumps = 0;
    } else if (!(this.playerOnFloor())) {
      this.player.anims.play('jump', true);
    } else { // this.player.body.onFloor()
      this.playerConfig.numJumps = 0;
    }

    if (this.player.isOnPlatform && this.player.currentPlatform) {
      this.player.body.position.x += this.player.currentPlatform.getVx();
      this.player.body.position.y += this.player.currentPlatform.getVy();

      this.player.isOnPlatform = false;
      this.player.currentPlatform = null;
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

  // returns -1 if prop is not found
  private tiledObjectHasProperty(p: string, tObj: any): number {
    if (tObj.hasOwnProperty('properties')) {
      var propIdx = -1;
      var i = 0;
      tObj.properties.forEach(prop => {
        if (prop.hasOwnProperty('name') && prop['name'] === p) {
          // propFound = true;
          propIdx = i;
        }
        i++;
      });
    }
    // console.log(`tiledObjectHasProperty returning ${propFound} for property ${p}`);
    return propIdx;
  }

  private tiledObjectPropertyIsTrue(p: string, tObj: any): boolean {
    const propIdx = this.tiledObjectHasProperty(p, tObj);
    if ( propIdx >= 0 ) {
      if (tObj.properties[propIdx].value === true) {
        return true;
      }
    }
    // console.log(`tiledObjectPropertyIsTrue returning false for property ${p}`);
    return false;
  }

  private playerOnFloor() {
    if (this.player.body.onFloor() || this.player.isOnPlatform) {
      return true;
    }
    return false;
  }
};