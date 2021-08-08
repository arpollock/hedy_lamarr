import 'phaser';
import {
  assetBaseURL,
  assetObsUiURL,
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
  numObstacleColors,
  screenEdgePadding
} from './../Constants';

import {
  get_rand_map_number,
  get_rand_conversion_values,
  map_num_to_key
} from './../Utilities';

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
  private tutorialButton: Phaser.GameObjects.Sprite;
  private difficultyLevelButtons: DifficultyLevelButton[];
  private activeGradeLevel: number;

  constructor() {
    super({
      key: sceneNames.start
    });
    this.startGameButton = null;
    this.difficultyTextString = 'Choose your difficulty level:'
    this.activeGradeLevel = 4;
    this.difficultyLevelButtons = [];
    this.tutorialButton = null;
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
    this.load.image('help', 'help.png');
    this.load.image('help_hover', 'help_hover.png');
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
    // pause menu stuff
    this.load.image('resume_game_button', `${assetGameControlUiUrl}resume.png`);

    // obstacle fix menu stuff
    this.load.image('back_button', `${assetObsUiURL}back.png`);
    this.load.image('submit_button', `${assetObsUiURL}submit.png`);
    this.load.image('clear_button', `${assetObsUiURL}clear.png`);
    this.load.image('bgPanelLeft', `${assetObsUiURL}bgPanelLeft_2.png`);
    this.load.image('bgPanelRight', `${assetObsUiURL}bgPanelRight_2.png`);
    this.load.image('buttonReject', `${assetObsUiURL}buttonOff.png`);
    this.load.image('buttonAccept', `${assetObsUiURL}buttonOn.png`);
    this.load.image('coinUi', `${assetObsUiURL}coinUi.png`);
    this.load.image('gemUi', `${assetObsUiURL}gemUi.png`);
    this.load.image('starUi', `${assetObsUiURL}starUi.png`);
    this.load.image('coinUi_empty', `${assetObsUiURL}coinUi_empty.png`);
    this.load.image('gemUi_empty', `${assetObsUiURL}gemUi_empty.png`);
    this.load.image('starUi_empty', `${assetObsUiURL}starUi_empty.png`);
    this.load.image('coinUi_accept', `${assetObsUiURL}coinUi_accept.png`);
    this.load.image('gemUi_accept', `${assetObsUiURL}gemUi_accept.png`);
    this.load.image('starUi_accept', `${assetObsUiURL}starUi_accept.png`);
    this.load.image('coinUi_zero', `${assetObsUiURL}coinUi_zero.png`);
    this.load.image('gemUi_zero', `${assetObsUiURL}gemUi_zero.png`);
    this.load.image('starUi_zero', `${assetObsUiURL}starUi_zero.png`);
    // converter module assets
    // 1 gem = 2 coin
    this.load.image('gem_2coin_00', `${assetObsUiURL}gem_2coin_00.png`);
    this.load.image('gem_2coin_10', `${assetObsUiURL}gem_2coin_10.png`);
    this.load.image('gem_2coin_11', `${assetObsUiURL}gem_2coin_11.png`);
    // 1 gem = 3 coin
    this.load.image('gem_3coin_000', `${assetObsUiURL}gem_3coin_000.png`);
    this.load.image('gem_3coin_100', `${assetObsUiURL}gem_3coin_100.png`);
    this.load.image('gem_3coin_110', `${assetObsUiURL}gem_3coin_110.png`);
    this.load.image('gem_3coin_111', `${assetObsUiURL}gem_3coin_111.png`);
    // 1 star = 3 coin
    this.load.image('star_3coin_000', `${assetObsUiURL}star_3coin_000.png`);
    this.load.image('star_3coin_100', `${assetObsUiURL}star_3coin_100.png`);
    this.load.image('star_3coin_110', `${assetObsUiURL}star_3coin_110.png`);
    this.load.image('star_3coin_111', `${assetObsUiURL}star_3coin_111.png`);
    // 1 star = 4 coin
    this.load.image('star_4coin_0000', `${assetObsUiURL}star_4coin_0000.png`);
    this.load.image('star_4coin_1000', `${assetObsUiURL}star_4coin_1000.png`);
    this.load.image('star_4coin_1100', `${assetObsUiURL}star_4coin_1100.png`);
    this.load.image('star_4coin_1110', `${assetObsUiURL}star_4coin_1110.png`);
    this.load.image('star_4coin_1111', `${assetObsUiURL}star_4coin_1111.png`);
    // 1 star = 2 gem // a special case, not always available
    this.load.image('star_2gem_00', `${assetObsUiURL}star_2gem_00.png`);
    this.load.image('star_2gem_10', `${assetObsUiURL}star_2gem_10.png`);
    this.load.image('star_2gem_11', `${assetObsUiURL}star_2gem_11.png`);
    // arrows to toggle between conversion modules for the same output currency (aka only star)
    this.load.image('arrow_left', `${assetObsUiURL}arrow_left.png`);
    this.load.image('arrow_right', `${assetObsUiURL}arrow_right.png`);
  }

  public create(): void {
    // add music control
    if ( !(this.scene.isActive(sceneNames.musicControl)) ) {
      this.scene.launch(sceneNames.musicControl);
    }
    this.scene.bringToTop(sceneNames.musicControl);

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
            if (this.activeGradeLevel == btn.get_difficulty()) {
              // console.log(`is active grade level: ${this.activeGradeLevel}`);
              btn.setTexture(`difficulty${this.activeGradeLevel}_active`);
              // console.log('Set active texture ok!');
            } else {
              // console.log(`is not active grade level (${this.activeGradeLevel}): ${btn.get_difficulty()}`);
              btn.setTexture(`difficulty${btn.get_difficulty()}`);
              // console.log('Set non-active texture ok!');
            }
          }
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

    // tutorial button click detection
    this.tutorialButton = this.add.sprite(width - screenEdgePadding, screenEdgePadding,'help').setOrigin(1, 0);
    this.tutorialButton.setScale(0.5);
    this.tutorialButton.setInteractive({
      useHandCursor: true
    });
    this.tutorialButton.on('pointerover', this.onTutorialButtonHoverEnter, this);
    this.tutorialButton.on('pointerout', this.onTutorialButtonHoverExit, this);
    this.tutorialButton.on('pointerdown', this.goToTutorial, this);
  }

  public update(time: number): void {

  }

  private onTutorialButtonHoverEnter(pointer: Phaser.Input.Pointer, localX: number, localY: number, event: Phaser.Types.Input.EventData): void {
    this.tutorialButton.setTexture('help_hover');
  }

  private onTutorialButtonHoverExit(pointer: Phaser.Input.Pointer, localX: number, localY: number, event: Phaser.Types.Input.EventData): void {
    this.tutorialButton.setTexture('help');
  }

  private goToTutorial(): void {
    this.cleanupDifficultyButtons();
    this.hideMasterMusicControlAndStartScene(sceneNames.tutorial);
  }

  private onStartGameButtonHoverEnter(pointer: Phaser.Input.Pointer, localX: number, localY: number, event: Phaser.Types.Input.EventData): void { }

  private onStartGameButtonHoverExit(pointer: Phaser.Input.Pointer, localX: number, localY: number, event: Phaser.Types.Input.EventData): void { }

  private startGame(): void {
    this.startGameButton.removeListener('pointerover', this.onStartGameButtonHoverEnter, this);
    this.startGameButton.removeListener('pointerout', this.onStartGameButtonHoverExit, this);
    this.startGameButton.removeListener('pointerdown', this.startGame, this);
    this.cleanupDifficultyButtons();
    // generate the seed data for the level 
    // set these randomly according to difficulty config
    // todo, create double converters, converters that accept converters, and/or n star : m gem converters
    const currencyValues: ConversionConfig = get_rand_conversion_values(this.activeGradeLevel);
    const mainGameData: MainGameConfig = {
      grade_level: this.activeGradeLevel,
      map_number: get_rand_map_number(),
      conversion_values: currencyValues,
    };
    this.startGameButton.destroy();
    this.startGameButton = null;
    // the next lines achieve the == of 'this.scene.start(sceneNames.mainGame, mainGameData);'
    // BUT keeps master music control running properly in the bg
    this.hideMasterMusicControlAndStartScene(sceneNames.mainGame, mainGameData);
  }

  private cleanupDifficultyButtons(): void {
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
  }

  private hideMasterMusicControlAndStartScene(key: string, sceneData?: object): void {
    this.scene.sendToBack(sceneNames.musicControl);
    this.scene.launch(key, sceneData);
    this.scene.stop(sceneNames.start);
  }
};