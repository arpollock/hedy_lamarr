import 'phaser';
import MovingPlatform from './MovingPlatform';
import ObstacleButton from './ObstacleButton';
import LaserDoor from './LaserDoor';
import Goal from './Goal';
import eventsCenter from './EventsCenter';
import {
  gravity,
  groundDrag,
  PlayerConfig,
  width,
  height,
  mapHeight,
  backgroundColor,
  partNames,
  sceneNames, 
  mapWidth,
  pauseKeyCode,
  initScoreStr
} from './../Constants';
import { Scene } from 'phaser';

class PlayerSprite extends Phaser.Physics.Arcade.Sprite{
  public isOnPlatform: boolean;
  public currentPlatform: any;
}

export class HomeScene extends Phaser.Scene {
  private zoomFactor: number;
  private map;// : Phaser.Physics.Arcade.World; or Phaser.Tilemaps.Tilemap

  private groundLayer;
  private coinLayer;
  private gemLayer;
  private starLayer;

  private numCoins: number;
  private numGems: number;
  private numStars: number;

  // private text;
  private scoreString: string;

  private player: PlayerSprite; // extends Phaser.Physics.Arcade.Sprite;
  private playerConfig: PlayerConfig;

  private buttonObjs: Array<ObstacleButton>;
  private platformObjs: Array<MovingPlatform>;
  private doorObjs: Array<LaserDoor>;

  private goalObjs: Array<Goal>;
  private goalReached: boolean;

  // private creatures: Phaser.Physics.Arcade.Sprite; // to do make goal creatures own group for efficiency

  private cursors;
  private pauseKey: Phaser.Input.Keyboard.Key;
  private printDebugKey: Phaser.Input.Keyboard.Key;

  constructor() {
    super({
      key: sceneNames.mainGame
    });
  }
  public init(params): void {

    this.zoomFactor = 0.5;

    this.buttonObjs = [];
    this.platformObjs = [];
    this.doorObjs = [];
    this.goalObjs = [];

    this.goalReached = false;

    this.playerConfig = {
      width: 66,
      height: 92,
      x: 140, // player starting x loc // right next to goal for debugging mapWidth - 200,
      y: (mapHeight-70*5), // player starting y loc // 10
      speed: 200,
      numJumps: 0,
      maxJumps: 2,
      flipX: false,
      walkFrameRate: 15,
    };

    this.numCoins = 0;
    this.numGems = 0;
    this.numStars = 0;
    this.scoreString = initScoreStr;
  }
  public preload(): void {
    this.scene.launch(sceneNames.hudMenu);
    this.scene.bringToTop(sceneNames.hudMenu);
    // this.load.setBaseURL('./assets/');
    this.load.setBaseURL('./../tutorial/source/assets/');
    // map made with Tiled in JSON format
    this.load.tilemapTiledJSON('map', 'map_1.4.json');
    // tiles in spritesheet 
    this.load.spritesheet('tiles', 'tiles.png', {frameWidth: 70, frameHeight: 70});
    // tiles in spritesheet 
    this.load.spritesheet('sheet_lasers', 'sheet_lasers.png', {frameWidth: 70, frameHeight: 70});
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
    // creatures to save + animations
    this.load.atlasXML('creature', 'spritesheet_creatures.png', 'spritesheet_creatures.xml');
  }

  public create(): void {

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
    this.player = (this.physics.add.sprite(this.playerConfig.x, this.playerConfig.y, 'player') as PlayerSprite);
    this.player.setDisplaySize(this.playerConfig.width, this.playerConfig.height);
    this.player.setBounce(0.0);
    this.player.setCollideWorldBounds(true);
    this.player.setDepth(999);
    // add the goal objects as specified in the object layer of the map
    const goals = this.map.filterObjects("Goal", p => p.name == "goal");
    goals.forEach(g => {
      const partNameIdx: number = this.tiledObjectHasProperty('part', g);
      const partName: string = (partNameIdx >= 0) ? g.properties[partNameIdx].value : '';
      let goal: Goal;
      if (partName !== partNames.creature) {
        goal = new Goal(this, g.x, g.y, 'sheet_lasers', this.laserDoorPartToFrameNum(partName)); 
        goal.setDepth(1);
        goal.setOrigin(0, 1); // change the origin to the top left to match the default for Tiled
        this.physics.world.enable(goal, Phaser.Physics.Arcade.STATIC_BODY);
      } else { // creature object
        goal = new Goal(this, g.x, g.y, partNames.creature, 'creatureRed_stand.png');// this.textures.get('creature').frames['creatureBlue_stand.png']);
        goal.setDepth(0);
        goal.setOrigin(-0.4, 1); // change the origin to the top left to match the default for Tiled
        this.physics.world.enable(goal, Phaser.Physics.Arcade.DYNAMIC_BODY);
        this.physics.add.collider(this.groundLayer, goal); // the creatures are affected by gravity, so they need to collide with the ground
      }
      goal.part = partName;
      const obstacleNumIdx = this.tiledObjectHasProperty('obstacleNum', g);
      if (obstacleNumIdx >= 0) {
        goal['objectNum'] = g.properties[obstacleNumIdx].value;
        // console.log(`platform obstacle num: ${plat['objectNum']}`)
      }
      this.goalObjs.push(goal);
    });
    // this.physics.world.enable(this.goalObjs, Phaser.Physics.Arcade.STATIC_BODY);

    this.goalObjs.forEach(gObj => {
      const collisionGoalObject = () => {
        if(gObj.part === partNames.lever && !this.goalReached) {
          this.triggerGoalReached();
        }
      };
      const directionCollisonGoalObject = () => {
        if (gObj.part === partNames.lever) {
          return true;
        }
        return false;
      };
   
      this.physics.add.overlap(this.player, gObj, collisionGoalObject, directionCollisonGoalObject, this.scene);
    });

    // add the moving platforms as specified in the object layer of the map
    const plats = this.map.filterObjects("Platforms", p => p.name == "platform");
    plats.forEach(p => {
      const plat = new MovingPlatform(this, p.x, p.y, 'platform');
      plat.setOrigin(0, 1); // change the origin to the top left to match the default for Tiled
      if (this.tiledObjectPropertyIsTrue('moveVertical', p)) {
        plat.movesV = true;
      } else if(this.tiledObjectPropertyIsTrue('moveHorizontal', p)) {
        plat.movesH = true;
      }
      if (plat.isFixed) {
        this.movePlatform(plat);
      }
      const obstacleNumIdx = this.tiledObjectHasProperty('obstacleNum', p)
      if (obstacleNumIdx >= 0) {
        plat.objectNum = p.properties[obstacleNumIdx].value;
      }
      this.platformObjs.push(plat);
    });
    this.physics.world.enable(this.platformObjs, Phaser.Physics.Arcade.DYNAMIC_BODY);

    // add the buttons (to enable the player to interact with obstacles) as specified in the object layer of the map
    const buttons = this.map.filterObjects("Buttons", p => p.name == "button");
    buttons.forEach(b => {
      const butt = new ObstacleButton(this, b.x, b.y, 'buttonOff');
      butt.setOrigin(0, 1); // change the origin to the top left to match the default for Tiled
      const obstacleNumIdx = this.tiledObjectHasProperty('obstacleNum', b)
      if (obstacleNumIdx >= 0) {
        butt.objectNum = b.properties[obstacleNumIdx].value;
      }
      this.buttonObjs.push(butt);
    });
    this.physics.world.enable(this.buttonObjs, Phaser.Physics.Arcade.STATIC_BODY);

    // add the laser doors as specified in the object layer of the map
    const doors = this.map.filterObjects("Doors", p => p.name == "door");
    doors.forEach(d => {
      const partNameIdx: number = this.tiledObjectHasProperty('part', d);
      const partName: string = (partNameIdx >= 0) ? d.properties[partNameIdx].value : '';

      const ld = new LaserDoor(this, d.x, d.y, 'sheet_lasers', this.laserDoorPartToFrameNum(partName));
      ld.setOrigin(0, 1); // change the origin to the top left to match the default for Tiled
      const obstacleNumIdx: number = this.tiledObjectHasProperty('obstacleNum', d)
      if (obstacleNumIdx >= 0) {
        ld.objectNum = d.properties[obstacleNumIdx].value;
      }
      ld.part = partName;
      this.doorObjs.push(ld);
    });
    // specify how collisons with door objects works
    this.physics.world.enable(this.doorObjs, Phaser.Physics.Arcade.STATIC_BODY);
    this.doorObjs.forEach(dObj => {
      if (dObj.part === partNames.laser) {
        dObj.body.setSize((dObj.body.width*0.30), dObj.body.height);
      } else {
        dObj.body.setSize((dObj.body.width - 10), dObj.body.height);
      }
      this.physics.add.collider(dObj, this.player);
    });
    
    
    // keep the player from falling through the ground
    this.physics.add.collider(this.groundLayer, this.player);

    // handle collisions with moving platforms
    this.buttonObjs.forEach(bObj => {
      bObj.body.setSize((bObj.body.width * 3 / 4), (bObj.body.height / 10));
      const collisionObstacleButton = () => {
        if (bObj.body.touching.up && this.player.body.touching.down) {
          if ( !(bObj.isFixed) ) { // activate if off
            bObj.isFixed = true
            this.fixObstacle(bObj);
          }    
        }
      };

      const directionCollisionObstacleButton = () => {
        const buttonY: number = (bObj.body.y - bObj.body.height - 10);
        const isFromTop: boolean = buttonY > this.player.y;
        if (isFromTop) {
          return true;
        }
        return false;
      };

      this.physics.add.collider(
        this.player,
        bObj,
        collisionObstacleButton,
        directionCollisionObstacleButton,
        this.scene
      );
    });

    // handle collisions with moving platform
    this.platformObjs.forEach(pObj => {
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
    this.pauseKey = this.input.keyboard.addKey(pauseKeyCode);

    // todo below is line to 'view whole world' will need to move to in-game phone option?
    this.cameras.main.setBackgroundColor(backgroundColor);
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
    // const textX = 0 - (width / this.zoomFactor) / 5;
    // const textY = height / this.zoomFactor - 400;
    // console.log(`text location: ${textX}, ${textY}`);
    // this.text = this.add.text(textX, textY, this.scoreString, {
    //   fontSize: '32px',
    //   fill: '#ffffff'
    // });
    // this.text.setScrollFactor(0);

  }

  public update(time: number): void {
    this.renderPlayer();
    // detect if the player wants to pause the game
    if (Phaser.Input.Keyboard.JustDown(this.pauseKey)) {
      if( !(this.scene.isPaused()) ) {
        this.scene.switch(sceneNames.pause);
      }
    }
    // todo this is broken, low priority
    // this.goalObjs.forEach(g => {
    //   if (g.part === partNames.creature && (g.body as Phaser.Physics.Arcade.Body).onFloor()) {
    //     g.setFrame('creatureRed_stand.png')
    //   }
    // });
  }

  private renderPlayer(): void {
    this.player.setDragX(0);
    if (this.cursors.left.isDown) { // if the left arrow key is down
      (this.player.body as Phaser.Physics.Arcade.Body).setVelocityX(this.playerConfig.speed*-1); // move left
      this.player.flipX = true;
    } else if (this.cursors.right.isDown) { // if the right arrow key is down
      (this.player.body as Phaser.Physics.Arcade.Body).setVelocityX(this.playerConfig.speed); // move right
      this.player.flipX = false;
    } else {
      this.player.setDragX(groundDrag);
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
      (this.player.body as Phaser.Physics.Arcade.Body).setVelocityY(gravity*-0.67); // jump up
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

  private triggerWinScreen(): void {
    console.log('win screen triggered!');
    this.scene.stop(sceneNames.hudMenu);
    this.scene.start(sceneNames.win);
  }

  private triggerGoalReached(): boolean {
    console.log('goal reached!');
    this.goalReached = true;
    this.goalObjs.forEach(g => {
      if(g.part === partNames.laser) {
        g.destroy(true);
      } else if (g.part === partNames.lever) {
        g.setFrame(84, false, false);
      } else if (g.part === partNames.creature) {
        (g.body as Phaser.Physics.Arcade.Body).setVelocityY(gravity*-0.67); // jump up
        g.setFrame('creatureRed_hit.png');
      }
    });
    const pauseForWinScreen = new Phaser.Time.TimerEvent( {delay: 900, callback: this.triggerWinScreen, callbackScope: this} );
    this.time.addEvent(pauseForWinScreen);
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
    eventsCenter.emit('updateScoreText', this.scoreString);
  }

  // returns -1 if prop is not found
  private tiledObjectHasProperty(p: string, tObj: any): number {
    if (tObj.hasOwnProperty('properties')) {
      var propIdx = -1;
      var i = 0;
      tObj.properties.forEach(prop => {
        if (prop.hasOwnProperty('name') && prop['name'] === p) {
          propIdx = i;
        }
        i++;
      });
    }
    return propIdx;
  }

  private tiledObjectPropertyIsTrue(p: string, tObj: any): boolean {
    const propIdx = this.tiledObjectHasProperty(p, tObj);
    if ( propIdx >= 0 ) {
      if (tObj.properties[propIdx].value === true) {
        return true;
      }
    }
    return false;
  }

  private playerOnFloor(): boolean {
    if ((this.player.body as Phaser.Physics.Arcade.Body).onFloor() || this.player.isOnPlatform) {
      return true;
    }
    return false;
  }

  private fixObstacle(ob: ObstacleButton): void {
    console.log(`fixing obstacle num: ${ob.objectNum}`)
    this.platformObjs.forEach( p => {
      if (p.objectNum == ob.objectNum) {
        console.log('obstacle found (platform)!')
        ob.setTexture('buttonOn');
        ob.body.setSize(ob.body.width, 0); // change the height of the collison box to match a pressed button
        p.isFixed = true;
        this.movePlatform(p);
        return
      }
    });
    var foundDoor: boolean = false;
    this.doorObjs.forEach( d => {
      if (d.objectNum == ob.objectNum) {
        foundDoor = true;
        if (d.part === partNames.laser) {
          d.destroy(true);
        }
      }
    });
    if (foundDoor) {
      ob.setTexture('buttonOn');
      ob.body.setSize(ob.body.width, 0);
    }
  }

  private movePlatform(plat: MovingPlatform) {
    if(plat.isFixed) {
      if (plat.movesV) {
        plat.moveVertically();
      } else if(plat.movesH) {
        plat.moveHorizontally();
      }
    }
  }

  private laserDoorPartToFrameNum(partName: string): number {
    if (partName === partNames.base_ground) {
      return 89; // 91 is the short one
    }
    if (partName === partNames.base_ceiling) {
      return 75;
    }
    if (partName === partNames.laser) {
      return 78;
    }
    if (partName === partNames.lever) {
      return 85;
    }
    return 1;
  }
};