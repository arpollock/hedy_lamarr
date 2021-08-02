import 'phaser';
import {
  assetBaseURL,
  gameName,
  altBackgroundColor,
  sceneNames,
  width,
  height,
  textConfig,
  numDifficulties,
  MainGameConfig,
  assetGameControlUiUrl,
  ConversionConfig,
  possibleMapNumbers,
  numObstacleColors
} from './../Constants';
import {
  get_rand_map_number,
  get_rand_conversion_values,
  map_num_to_key
} from './../Utilities';
import { HomeScene } from './MainGame';
import { HudMenu } from './HudMenu';
import { TabletMenu } from './TabletMenu';

class DifficultyLevelButton extends Phaser.GameObjects.Sprite {
  private difficulty: number;

  constructor(scene: Phaser.Scene, x: number, y: number, texture: string, d: number) {
		super(scene, x, y, texture);
    this.difficulty = d;
    this.setOrigin(0.5);
    scene.add.existing(this);
	}

  public get_difficulty() {
    return this.difficulty;
  }

}

export class StartScene extends Phaser.Scene {

  private titleText: Phaser.GameObjects.Text;
  private titleTextString: string;
  private difficultyText: Phaser.GameObjects.Text;
  private difficultyTextString: string;
  private startGameButton: Phaser.GameObjects.Sprite;
  private difficultyLevelButtons: DifficultyLevelButton[];
  private activeGradeLevel: number;

  constructor() {
    super({
      key: sceneNames.start
    });
    this.startGameButton = null;
    this.difficultyTextString = 'Choose your grade level:'
    this.activeGradeLevel = 4;
    this.difficultyLevelButtons = [];
  }

  public init(params): void {
    
  }
  public preload(): void {
    this.load.setBaseURL(assetBaseURL);
    // load image assets
    this.load.image('start_game', `${assetGameControlUiUrl}start_game.png`);
    this.load.image('difficulty3', `${assetGameControlUiUrl}difficulty3.png`);
    this.load.image('difficulty4', `${assetGameControlUiUrl}difficulty4.png`);
    this.load.image('difficulty5', `${assetGameControlUiUrl}difficulty5.png`);
    this.load.image('difficulty3_hover', `${assetGameControlUiUrl}difficulty3_hover.png`);
    this.load.image('difficulty4_hover', `${assetGameControlUiUrl}difficulty4_hover.png`);
    this.load.image('difficulty5_hover', `${assetGameControlUiUrl}difficulty5_hover.png`);
    this.load.image('difficulty3_active', `${assetGameControlUiUrl}difficulty3_active.png`);
    this.load.image('difficulty4_active', `${assetGameControlUiUrl}difficulty4_active.png`);
    this.load.image('difficulty5_active', `${assetGameControlUiUrl}difficulty5_active.png`);
    // these are technically shared across the hud and tablet menu, but they
    // need to be preloaded here since the other scenes are added dynamically
    this.load.image('coinHud', 'coin.png');
    this.load.image('gemHud', 'gem.png');
    this.load.image('starHud', 'star.png');
    // these are for the pause AND win screens
    this.load.image('main_menu_button', 'main_menu.png');
    this.load.image('back_start_button', 'back_to_start.png');
    this.load.image('play_new_level', 'play_new_level.png');
    this.load.image('play_same_level', 'play_same_level.png');
    // main game stuff:
    this.load.setBaseURL(assetBaseURL);
    // map made with Tiled in JSON format
    for (let i = 0; i < possibleMapNumbers.length; i++) {
      const mapFileNum: number = possibleMapNumbers[i];
      const mapFileName: string = `maps/map_${mapFileNum.toString()}.json`;
      this.load.tilemapTiledJSON( map_num_to_key(mapFileNum), mapFileName);
    // this.load.tilemapTiledJSON('map', 'test_map.json');
    }
    
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
    for( let i: number = 0; i < numObstacleColors; i++ ) {
      this.load.image(`platform_${i}`, `platform_${i}.png`);
      this.load.image(`platform_${i}`, `platform_${i}.png`);
    }
    // the button (on and off) images
    for( let i: number = 0; i < numObstacleColors; i++ ) {
      this.load.image(`buttonOff_${i}`, `buttonOff_${i}.png`);
      this.load.image(`buttonOn_${i}`, `buttonOn_${i}.png`);
    }
    // the switch (on and off) images
    for( let i: number = 0; i < numObstacleColors; i++ ) {
      this.load.image(`switchOff_${i}`, `switchOff_${i}.png`);
      this.load.image(`switchOn_${i}`, `switchOn_${i}.png`);
    }
    // the barrier (on and off) images
    for( let i: number = 0; i < numObstacleColors; i++ ) {
      this.load.image(`barrierOff_${i}`, `barrierOff_${i}.png`);
      this.load.image(`barrierOn_${i}`, `barrierOn_${i}.png`);
    }
    // the overlay sprite to fix an obstacle
    this.load.image('obstacleFix', 'obstacleFix.png');
    // player animations
    this.load.atlas('player', 'player.png', 'player.json');
    // creatures to save + animations
    this.load.atlasXML('creature', 'spritesheet_creatures.png', 'spritesheet_creatures.xml');
    // background image
    this.load.image('background', 'clouds.png');
  }

  public create(): void {
    // add music control
    if ( !(this.scene.isActive(sceneNames.musicControl)) ) {
      this.scene.launch(sceneNames.musicControl);
    }
    this.scene.bringToTop(sceneNames.musicControl);
    // add the main game into the scene manager
    this.scene.add(sceneNames.mainGame, HomeScene, false);

    this.cameras.main.setBackgroundColor(altBackgroundColor);
    // text to show the game title
    this.titleTextString = gameName;
    const verticalMargin: number = 100;
    const padding: number = 50;
    const centerX: number = width / 2; 
    const titleTextY: number =  verticalMargin;
    this.titleText = this.add.text(centerX, titleTextY, this.titleTextString, {
      fontSize: textConfig.mainTitleFontSize,
      color: textConfig.secondaryFillColor,
      fontFamily: textConfig.fontFams,
      align: 'center',
    }).setOrigin(0.5); // set origin makes it so we can center the text easily
    this.titleText.setScrollFactor(0);
    // text to push the user to choose their grade level
    const difficultyTextY: number = titleTextY + padding * 2.5;
    this.difficultyText = this.add.text(centerX, difficultyTextY, this.difficultyTextString, {
      fontSize: textConfig.tertiaryTitleFontSize,
      color: textConfig.secondaryFillColor,
      fontFamily: textConfig.fontFams,
    }).setOrigin(0.5); // set origin makes it so we can center the text easily
    this.difficultyText.setScrollFactor(0);
    // buttons to select difficulty level, start w/ 4th grade active
    for(let i = 0; i < numDifficulties; i++) {
      const horizontalOffset: number = 200;
      const currGrade: number = i + 3;// i = 0 ==> grade 3
      const tempButtonSpr = new DifficultyLevelButton(this, (centerX - horizontalOffset + (i * horizontalOffset)), 0, `difficulty${currGrade}`,currGrade);//this.add.sprite().setOrigin(0.5);
      tempButtonSpr.setScale(0.33);
      tempButtonSpr.setInteractive({
        useHandCursor: true
      });
      const difficultyButtonY: number = difficultyTextY + (tempButtonSpr.displayHeight / 2) + padding;
      tempButtonSpr.setY(difficultyButtonY)
      if (this.activeGradeLevel === currGrade) {
        tempButtonSpr.setTexture(`difficulty${currGrade}_active`);
      }
      tempButtonSpr.on('pointerover', (pointer: Phaser.Input.Pointer, localX: number, localY: number, event: Phaser.Types.Input.EventData) => {
        tempButtonSpr.setTexture(`difficulty${currGrade}_hover`);
      }, tempButtonSpr);
      tempButtonSpr.on('pointerout', (pointer: Phaser.Input.Pointer, localX: number, localY: number, event: Phaser.Types.Input.EventData, d:number=this.activeGradeLevel) => {
        if (tempButtonSpr.get_difficulty() != d) {
          tempButtonSpr.setTexture(`difficulty${currGrade}`);
        } else {
          tempButtonSpr.setTexture(`difficulty${currGrade}_active`);
        }
      }, this);
      tempButtonSpr.on('pointerdown', () => {
        this.activeGradeLevel = currGrade;
        this.difficultyLevelButtons.forEach( (btn: DifficultyLevelButton) => {
          if (btn) {
            console.log('btn is not null:');
            console.log('btn:');
            console.log(btn);
            
            if (this.activeGradeLevel == btn.get_difficulty()) {
              console.log(`is active grade level: ${this.activeGradeLevel}`);
              btn.setTexture(`difficulty${this.activeGradeLevel}_active`);
              console.log('Set active texture ok!');
            } else {
              console.log(`is not active grade level (${this.activeGradeLevel}): ${btn.get_difficulty()}`);
              btn.setTexture(`difficulty${btn.get_difficulty()}`);
              console.log('Set non-active texture ok!');
            }
          } else {
            console.log('btn is null!!');
          }
          console.log('======================================');
        });
      }, this);
      this.difficultyLevelButtons.push(tempButtonSpr);
    }
    // start game button click detection
    const startGameButtonY: number = height - verticalMargin;
    this.startGameButton = this.add.sprite(centerX, startGameButtonY,'start_game').setOrigin(0.5);
    this.startGameButton.setScale(0.33);
    this.startGameButton.setInteractive({
      useHandCursor: true
    });
    this.startGameButton.on('pointerover', this.onStartGameButtonHoverEnter, this);
    this.startGameButton.on('pointerout', this.onStartGameButtonHoverExit, this);
    this.startGameButton.on('pointerdown', this.startGame, this);
  }

  public update(time: number): void {

  }

  private onStartGameButtonHoverEnter(pointer: Phaser.Input.Pointer, localX: number, localY: number, event: Phaser.Types.Input.EventData): void { }

  private onStartGameButtonHoverExit(pointer: Phaser.Input.Pointer, localX: number, localY: number, event: Phaser.Types.Input.EventData): void { }

  private startGame(): void {
    this.startGameButton.removeListener('pointerover', this.onStartGameButtonHoverEnter, this);
    this.startGameButton.removeListener('pointerout', this.onStartGameButtonHoverExit, this);
    this.startGameButton.removeListener('pointerdown', this.startGame, this);
    this.difficultyLevelButtons.forEach( (btn: DifficultyLevelButton) => {
      btn.removeListener('pointerover');
      btn.removeListener('pointerout');
      btn.removeListener('pointerdown');
      // need to remove the old buttons
      // so a relaunch of the start game scene won't trigger
      // multiple overlapping event listeners??
      // IDK it was broken and this fixed it
      btn.destroy(); 
    });

    this.difficultyLevelButtons = [];
    // generate the seed data for the level 
    // todo, set these randomly according to difficulty config
    // todo, create double converters, converters that accept converters, and/or n star : m gem converters
    const currencyValues: ConversionConfig = get_rand_conversion_values(this.activeGradeLevel);
    const mainGameData: MainGameConfig = {
      grade_level: this.activeGradeLevel,
      map_number: get_rand_map_number(),
      conversion_values: currencyValues,
    };
    this.startGameButton.destroy();
    this.startGameButton = null;
    this.scene.add(sceneNames.hudMenu, HudMenu, false);
    this.scene.add(sceneNames.tabletMenu, TabletMenu, false);
    // the next lines achieve the == of 'this.scene.start(sceneNames.mainGame, mainGameData);'
    // BUT keeps master music control running properly in the bg
    this.scene.sendToBack(sceneNames.musicControl);
    this.scene.launch(sceneNames.mainGame, mainGameData);
    this.scene.stop(sceneNames.start);
  }
};