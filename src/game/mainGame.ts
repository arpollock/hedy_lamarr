import 'phaser';
import MovingPlatform from './MovingPlatform';
import ObstacleButton from './ObstacleButton';
import ObstacleOverlay from './ObstacleOverlay';
import LaserDoor from './LaserDoor';
import Goal from './Goal';
import eventsCenter from './EventsCenter';
import {
  gravity,
  groundDrag,
  MainGameConfig,
  HudMenuConfig,
  PlayerConfig,
  ObFixConfig,
  ConversionConfig,
  width,
  height,
  mapHeight,
  backgroundColor,
  assetBaseURL,
  partNames,
  tiledPropertyNames,
  tiledLayerNames,
  sceneNames, 
  eventNames,
  mapWidth,
  pauseKeyCode,
  ScoreUpdate,
} from '../Constants';
import { ObstacleFixMenu } from './ObstacleFixMenu';

// low-priority-level todo: checkout https://phaser.io/examples/v3/view/audio/web-audio/audiosprite for buttons, etc.

class PlayerSprite extends Phaser.Physics.Arcade.Sprite {
  public isOnPlatform: boolean;
  public currentPlatform: any;
  public isOnObsOverlap: boolean; // todo, make this clickable instead of the overlap instead(?)
}

export class HomeScene extends Phaser.Scene {
  private levelSeedData: MainGameConfig;

  private zoomFactor: number;
  private map: Phaser.Tilemaps.Tilemap;

  private groundLayer;
  private coinLayer;
  private gemLayer;
  private starLayer;

  private numCoins: number;
  private numGems: number;
  private numStars: number;

  private gradeLevel: number;
  private containsStars: boolean;

  private player: PlayerSprite; // extends Phaser.Physics.Arcade.Sprite;
  private playerConfig: PlayerConfig;

  private buttonObjs: Array<ObstacleButton>;
  private platformObjs: Array<MovingPlatform>;
  private doorObjs: Array<LaserDoor>;

  private overlayObjs: Array<ObstacleOverlay>;

  private goalObjs: Array<Goal>;
  private goalReached: boolean;

  // private creatures: Phaser.Physics.Arcade.Sprite; // to do make goal creatures own group for efficiency

  private cursors;
  private pauseKey: Phaser.Input.Keyboard.Key;
  private printDebugKey: Phaser.Input.Keyboard.Key;

  private isInObstacleMenu: boolean;

  private conversionValues: ConversionConfig;

  constructor() {
    super({
      key: sceneNames.mainGame
    });
  }
  public init(data: MainGameConfig): void {

    this.levelSeedData = data;

    console.log(data);

    this.coinLayer = null;
    this.gemLayer = null;
    this.starLayer = null;
    this.groundLayer = null;

    this.gradeLevel = data.grade_level;
    this.containsStars = this.gradeLevel > 3 ? true : false;

    this.numCoins = 0;
    this.numGems = 0;
    this.numStars = 0;

    this.zoomFactor = 0.5;

    this.buttonObjs = [];
    this.platformObjs = [];
    this.doorObjs = [];
    this.goalObjs = [];
    this.overlayObjs = [];

    this.goalReached = false;

    this.playerConfig = {
      width: 66,
      height: 92,
      // x and y will be overridden by Tiled map if available
      // this serves as a backup (bottom left corner)
      x: 140, // player starting x loc // right next to goal for debugging mapWidth - 200,
      y: (mapHeight-70*5), // player starting y loc // 10
      speed: 200,
      numJumps: 0,
      maxJumps: 2,
      flipX: false,
      walkFrameRate: 15,
    };

    this.isInObstacleMenu = false;

    // todo, set these randomly according to difficulty config
    // todo, create double converters, converters that accept converters, and/or n star : m gem converters
    const possibleGemValues: number[] = [];
    const possibleStarValues: number[] = [];
    switch(this.gradeLevel) {
      // 4th and 5th grade worry about coins, gems, and stars
      // 5th does everything 4th and 3rd can do, 4th can do anything 3rd, etc. 
      // might change ^ if teachers feel is appropriate,
      // probs would have to change w/ ML update to how game updates as you play

      // currently have the graphics to support min conversions for:
      // Gems : Coins ==> 2, 3
      // Gems : Stars ==> 3, 4
      case 5:
        possibleStarValues.push(3);
      case 4: 
        possibleStarValues.push(4);
      case 3: // 3rd grade only worries about coins and gems
        possibleGemValues.push(2);
        possibleGemValues.push(3);
        break;
      default:
          break;
    }
    if (possibleStarValues.length === 0) {
      possibleStarValues.push(0); // == 0 used to hide star sprites, etc. throughout misc. scenes
    }
    this.conversionValues = {
      valGems: possibleGemValues[Math.floor(Math.random() * possibleGemValues.length)], // can also be: 3
      valStars: possibleStarValues[Math.floor(Math.random() * possibleStarValues.length)], // can also be: 4
    };
  }
  public preload(): void {
    this.load.setBaseURL(assetBaseURL);
    // map made with Tiled in JSON format
    // TODO: make this a randomized/seeded selection
    this.load.tilemapTiledJSON('map', 'map_1.json');
    // this.load.tilemapTiledJSON('map', 'test_map.json');
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
    // the overlay sprite to fix an obstacle
    this.load.image('obstacleFix', 'obstacleFix.png');
    // player animations
    this.load.atlas('player', 'player.png', 'player.json');
    // creatures to save + animations
    this.load.atlasXML('creature', 'spritesheet_creatures.png', 'spritesheet_creatures.xml');
  }

  public create(): void {
    this.events.on('destroy', this.onDestroy, this); // docs on event names valid with this pattern: https://newdocs.phaser.io/docs/3.55.2/Phaser.Scenes.Events
    eventsCenter.on(eventNames.closeObFixMenu, this.closeObFixMenu, this);
    eventsCenter.on(eventNames.pauseGame, this.pauseGame, this);
    const hudConfig: HudMenuConfig = {
      containsStars: this.containsStars,
      coins: this.numCoins,
      gems: this.numGems,
      stars: this.numStars
    };
    this.scene.launch(sceneNames.hudMenu, hudConfig);
    this.scene.launch(sceneNames.tabletMenu, this.conversionValues);
    // this.scene.sleep(sceneNames.tabletMenu);
    this.scene.bringToTop(sceneNames.hudMenu);

    // load the map 
    this.map = this.make.tilemap({key: 'map'});
    
    // tiles for the ground layer
    var groundTiles = this.map.addTilesetImage('tiles');
    // create the ground layer
    this.groundLayer = this.map.createLayer(tiledLayerNames.world, groundTiles, 0, 0);
    // the player will collide with this layer
    this.groundLayer.setCollisionByExclusion([-1]);
    // coin image used as tileset
    const coinTiles = this.map.addTilesetImage('coin');
    // add coins as tiles
    this.coinLayer = this.map.createLayer(tiledLayerNames.coins, coinTiles, 0, 0);
    // star image used as tileset
    const starTiles = this.containsStars ? this.map.addTilesetImage('star') : null;
    // // add stars as tiles
    this.starLayer = this.containsStars ? this.map.createLayer(tiledLayerNames.stars, starTiles, 0, 0) : null;
    // // star image used as tileset
    const gemTiles = this.map.addTilesetImage('gem');
    // // add stars as tiles
    this.gemLayer = this.map.createLayer(tiledLayerNames.gems, gemTiles, 0, 0);

    // set the boundaries of our game world
    this.physics.world.bounds.width = this.groundLayer.width;
    this.physics.world.bounds.height = this.groundLayer.height;

    // add the player's sprite
    // first get the correct starting location from Tiled (if available)
    const startingLocs = this.map.filterObjects(tiledLayerNames.playerStart, p => p.name == 'start');
    startingLocs.forEach(startingLoc => {
      // this is stubbed out to support multiplayer w/ different starting locs
      const forPlayerIdx: number = this.tiledObjectHasProperty(tiledPropertyNames.player, startingLoc);
      const forPlayer: number = (forPlayerIdx >= 0) ? startingLoc.properties[forPlayerIdx].value : 1;
      if (forPlayer === 1) {
        this.playerConfig.x = startingLoc.x;
        this.playerConfig.y = startingLoc.y;
      }
    });
    this.player = (this.physics.add.sprite(this.playerConfig.x, this.playerConfig.y, 'player') as PlayerSprite);
    this.player.setDisplaySize(this.playerConfig.width, this.playerConfig.height);
    this.player.setBounce(0.0);
    this.player.setCollideWorldBounds(true);
    this.player.setDepth(999);
    this.player.isOnObsOverlap = false;

    // add the goal objects as specified in the object layer of the map
    const goals = this.map.filterObjects(tiledLayerNames.goal, p => p.name == 'goal');
    goals.forEach(g => {
      const partNameIdx: number = this.tiledObjectHasProperty(tiledPropertyNames.part, g);
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
      const obstacleNumIdx = this.tiledObjectHasProperty(tiledPropertyNames.obstacleNum, g);
      if (obstacleNumIdx >= 0) {
        goal[tiledPropertyNames.obstacleNum] = g.properties[obstacleNumIdx].value;
      }
      this.goalObjs.push(goal);
    });

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
    const plats = this.map.filterObjects(tiledLayerNames.movingPlatforms, p => p.name == 'platform');
    plats.forEach(p => {
      const plat = new MovingPlatform(this, p.x, p.y, 'platform');
      plat.setOrigin(0, 1); // change the origin to the top left to match the default for Tiled
      if (this.tiledObjectPropertyIsTrue(tiledPropertyNames.platformMoveVertical, p)) {
        plat.movesV = true;
      } else if(this.tiledObjectPropertyIsTrue(tiledPropertyNames.platformMoveHorizontal, p)) {
        plat.movesH = true;
      }
      if (this.tiledObjectPropertyIsTrue(tiledPropertyNames.opposite, p)) {
        plat.moveOpposite();
      }
      const obstacleNumIdx = this.tiledObjectHasProperty(tiledPropertyNames.obstacleNum, p)
      if (obstacleNumIdx >= 0) {
        plat.obstacleNum = p.properties[obstacleNumIdx].value;
        if (plat.obstacleNum == -1) { // code to have the platform moving @ start (versus having to be fixed)
          plat.isFixed = true;
        }
      }
      if (plat.isFixed) {
        this.movePlatform(plat);
      }
      this.platformObjs.push(plat);
    });
    this.physics.world.enable(this.platformObjs, Phaser.Physics.Arcade.DYNAMIC_BODY);

    // add the buttons (to enable the player to interact with obstacles) as specified in the object layer of the map
    // also add the obstacle overlays (to enable the player to see broken obstacles)
    // as specified in the object layer of the map
    const buttons = this.map.filterObjects(tiledLayerNames.buttons, p => p.name == 'button');
    buttons.forEach(b => {
      const butt = new ObstacleButton(this, b.x, b.y, 'buttonOff');

      const minCoinValueIdx = this.tiledObjectHasProperty(tiledPropertyNames.minCoinValue, b);
      const maxCoinValueIdx = this.tiledObjectHasProperty(tiledPropertyNames.maxCoinValue, b);
      let minCoinValue = 1.0;
      let maxCoinValue = 2.0;
      if (minCoinValueIdx >= 0 && maxCoinValueIdx >= 0) {
        minCoinValue = b.properties[minCoinValueIdx].value;
        maxCoinValue = b.properties[maxCoinValueIdx].value;
      } // else map did not specify the difficulty level of the obstacle uses defaults 1 and 2
      const overlay = new ObstacleOverlay(this, b.x, b.y, 'obstacleFix', this.containsStars, this.gradeLevel, minCoinValue, maxCoinValue, this.conversionValues);
      
      butt.setOrigin(0, 1); // change the origin to the top left to match the default for Tiled
      overlay.setOrigin(0, 1);
      const obstacleNumIdx = this.tiledObjectHasProperty(tiledPropertyNames.obstacleNum, b);
      if (obstacleNumIdx >= 0) {
        butt.obstacleNum = b.properties[obstacleNumIdx].value;
        overlay.obstacleNum = b.properties[obstacleNumIdx].value;
      }
      this.buttonObjs.push(butt);
      this.overlayObjs.push(overlay);
    });
    this.physics.world.enable(this.buttonObjs, Phaser.Physics.Arcade.STATIC_BODY);
    this.physics.world.enable(this.overlayObjs, Phaser.Physics.Arcade.STATIC_BODY);

    // add the laser doors as specified in the object layer of the map
    const doors = this.map.filterObjects(tiledLayerNames.doors, p => p.name == 'door');
    doors.forEach(d => {
      const partNameIdx: number = this.tiledObjectHasProperty(tiledPropertyNames.part, d);
      const partName: string = (partNameIdx >= 0) ? d.properties[partNameIdx].value : '';

      const ld = new LaserDoor(this, d.x, d.y, 'sheet_lasers', this.laserDoorPartToFrameNum(partName));
      ld.setOrigin(0, 1); // change the origin to the top left to match the default for Tiled
      const obstacleNumIdx: number = this.tiledObjectHasProperty(tiledPropertyNames.obstacleNum, d)
      if (obstacleNumIdx >= 0) {
        ld.obstacleNum = d.properties[obstacleNumIdx].value;
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

    // handle collisions with the obstacle buttons
    this.buttonObjs.forEach(bObj => {
      bObj.body.setSize((bObj.body.width * 3 / 4), (bObj.body.height / 10));
      const collisionObstacleButton = () => {
        if (bObj.body.touching.up && this.player.body.touching.down) {
          if (bObj.isEnabled) { // only enable a collision if the button has been enabled (w/ user math screen)
            if ( !(bObj.isFixed) ) { // activate if off
              bObj.isFixed = true
              this.fixObstacle(bObj);
            }   
          } 
        }
      };

      const directionCollisionObstacleButton = () => {
        const buttonY: number = (bObj.body.y - bObj.body.height - 10);
        const isFromTop: boolean = buttonY > this.player.y;
        if (isFromTop && bObj.isEnabled) { // only enable a collision if the button has been enabled (w/ user math screen)
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

    // handle collisions with the broken obstacle button overlays
    this.overlayObjs.forEach(overlayObj => {
      const obstacleOverlapTriggerFixMenu = () => {
        
        const obstacleNum: number = overlayObj.obstacleNum;
        if (obstacleNum >= 0) {
          this.buttonObjs.forEach(bObj => {
            if (bObj.obstacleNum == obstacleNum) {
              // trigger the obstacle fix scene
              this.player.isOnObsOverlap = true;
              this.isInObstacleMenu = true;
              this.player.setVelocity(0); // pause the player
              if(this.playerOnFloor()) { // stop any animations
                this.player.anims.play('idle', true);
              }
              this.scene.sleep(sceneNames.hudMenu);
              // todo, fixypoo
              const obFixData: ObFixConfig = {
                numCoins: this.numCoins,
                numGems: this.numGems,
                numStars: this.numStars,
                // todo get this from the map and load it into the button
                // or probs generate it randomly once and keep it true for the whole scene? - so can channge difficulty indept of level
                // todo also need to figure out how to lay out mult currnecies when they are convertable
                goalCoins: overlayObj.getCoinsNeeded(), // 3
                goalGems: overlayObj.getGemsNeeded(), // 1,
                goalStars: overlayObj.getStarsNeeded(), // 2,
                buttonObj: bObj,
                conversions: this.conversionValues,
                containsStars: this.containsStars
              };
              this.scene.add(sceneNames.obFixMenu, ObstacleFixMenu, true, obFixData);
              this.scene.bringToTop(sceneNames.obFixMenu);
            }
          });
        }
      };

      const obstacleOverlapDetectFirstTime = () => {
        if (!(this.player.isOnObsOverlap)) {
          return true;
        }
        return false;
      };
      this.physics.add.overlap(
        this.player,
        overlayObj,
        obstacleOverlapTriggerFixMenu,
        obstacleOverlapDetectFirstTime,
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
      // Only allow collisions from top
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
    if (this.containsStars) {
      this.starLayer.setTileIndexCallback(19, this.collectStar, this); // the gem id is 19
      // when the player overlaps with a tile with index 19, collectStar will be called    
      this.physics.add.overlap(this.player, this.starLayer);
    }

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

  }

  public pauseGame(): void {
    if( !(this.scene.isPaused()) ) {
      this.scene.bringToTop(sceneNames.pause);
      this.scene.switch(sceneNames.pause);
    }
  }

  public update(time: number): void {
    if (!this.isInObstacleMenu) {
      this.renderPlayer();
    }
    // detect if the player wants to pause the game
    if (Phaser.Input.Keyboard.JustDown(this.pauseKey)) {
      this.pauseGame();
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
      console.log('Player Info:');
      console.log(`x: ${this.player.x}`);
      console.log(`y: ${this.player.y}`);
    }
  }

  private collectCoin(sprite: any, tile: any): boolean {
    // console.log('Coin collected!')
    this.coinLayer.removeTileAt(tile.x, tile.y);
    this.numCoins++;
    this.updateScoreText();
    return false;
  }

  private triggerWinScreen(): void {
    this.coinLayer.setTileIndexCallback(17, null, this);
    this.coinLayer = null;
    this.gemLayer.setTileIndexCallback(18, null, this);
    this.gemLayer = null;
    if (this.containsStars) {
      this.starLayer.setTileIndexCallback(19, null, this);
      this.starLayer = null;
    }
    
    console.log('win screen triggered!');
    this.scene.stop(sceneNames.hudMenu);
    this.scene.stop(sceneNames.tabletMenu);
    this.scene.stop(sceneNames.pause);
    this.scene.start(sceneNames.win, this.levelSeedData);
  }

  private triggerEnableObFixMenu(): void {
    this.player.isOnObsOverlap = false;
  }

  private closeObFixMenu(params: { success: boolean, num_coins_consumed: number, num_gems_consumed: number, num_stars_consumed: number, buttonObj: ObstacleButton }): void {
    this.isInObstacleMenu = false;
    // create a window before the user can trigger the obstacle fix screen again
    // not ideal but works (would prefer to detect first frame of overlap, low priority TODO fix)
    // doesn't let the player trigger an obstacle screen until 5 seconds have passed
    const retriggerWindowTimer = new Phaser.Time.TimerEvent( {delay: 5000, callback: this.triggerEnableObFixMenu, callbackScope: this} );
    this.time.addEvent(retriggerWindowTimer);
    this.scene.stop(sceneNames.obFixMenu);
    this.scene.remove(sceneNames.obFixMenu);
    this.player.setVelocity(0);

    if (params.success) {
      params.buttonObj.isEnabled = true;
      this.numCoins -= params.num_coins_consumed;
      this.numGems -= params.num_gems_consumed;
      this.numStars -= params.num_stars_consumed;
      this.updateScoreText();
      this.overlayObjs.forEach(overlayObj => {
        const obstacleNum: number = overlayObj.obstacleNum;
        if (params.buttonObj.obstacleNum == obstacleNum) {
          overlayObj.destroy();
        }
      });
    }
    const hudConfig: HudMenuConfig = {
      containsStars: this.containsStars,
      coins: this.numCoins,
      gems: this.numGems,
      stars: this.numStars
    }
    this.scene.run(sceneNames.hudMenu, hudConfig);
    this.scene.bringToTop(sceneNames.hudMenu);
  }

  private triggerGoalReached(): boolean {
    // console.log('goal reached!');
    this.goalReached = true;
    this.goalObjs.forEach(g => {
      if(g.part === partNames.laser) {
        g.destroy();
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
    // console.log('Gem collected!')
    this.gemLayer.removeTileAt(tile.x, tile.y);
    this.numGems++;
    this.updateScoreText();
    return false;
  }

  private collectStar(sprite: any, tile: any): boolean {
    // console.log('Star collected!')
    this.starLayer.removeTileAt(tile.x, tile.y);
    this.numStars++;
    this.updateScoreText();
    return false;
  }

  private updateScoreText() {
    const scoreUp: ScoreUpdate = {
      coins: this.numCoins,
      gems: this.numGems,
      stars: this.numStars,
    };
    eventsCenter.emit(eventNames.updateScoreText, scoreUp);
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
    // console.log(`fixing obstacle num: ${ob.obstacleNum}`)
    this.platformObjs.forEach( p => {
      if (p.obstacleNum == ob.obstacleNum) {
        // console.log('obstacle found (platform)!')
        ob.setTexture('buttonOn');
        ob.body.setSize(ob.body.width, 0); // change the height of the collison box to match a pressed button
        p.isFixed = true;
        this.movePlatform(p);
        return
      }
    });
    var foundDoor: boolean = false;
    this.doorObjs.forEach( d => {
      if (d.obstacleNum == ob.obstacleNum) {
        foundDoor = true;
        if (d.part === partNames.laser) {
          d.destroy(); // todo
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

  private onDestroy(): void {
    eventsCenter.off(eventNames.closeObFixMenu);
    eventsCenter.off(eventNames.pauseGame);
  }
};