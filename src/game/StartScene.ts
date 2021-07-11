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
  possibleMapNumbers,
} from './../Constants';
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
    this.load.image('music_turn_off', 'music_turnOff.png');
    this.load.image('music_turn_on', 'music_turnOn.png');
    this.load.image('start_game', 'start_game.png');
    this.load.image('difficulty3', 'difficulty3.png');
    this.load.image('difficulty4', 'difficulty4.png');
    this.load.image('difficulty5', 'difficulty5.png');
    this.load.image('difficulty3_hover', 'difficulty3_hover.png');
    this.load.image('difficulty4_hover', 'difficulty4_hover.png');
    this.load.image('difficulty5_hover', 'difficulty5_hover.png');
    this.load.image('difficulty3_active', 'difficulty3_active.png');
    this.load.image('difficulty4_active', 'difficulty4_active.png');
    this.load.image('difficulty5_active', 'difficulty5_active.png');
    // these are technically shared across the hud and tablet menu, but they
    // need to be preloaded here since the other scenes are added dynamically
    this.load.image('coinHud', 'coin.png');
    this.load.image('gemHud', 'gem.png');
    this.load.image('starHud', 'star.png');
    // these are for the pause AND win screens
    this.load.image('main_menu_button', 'main_menu.png');
    this.load.image('play_new_level', 'play_new_level.png');
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
    const difficultyTextY: number = titleTextY + padding * 1.75;
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
    const possibleGemValues: number[] = [];
    const possibleStarValues: number[] = [];
    switch(this.activeGradeLevel) {
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

    let valGems = possibleGemValues[Math.floor(Math.random() * possibleGemValues.length)];
    let valStars = possibleStarValues[Math.floor(Math.random() * possibleStarValues.length)];
    while ( valGems >= valStars && valStars != 0) { // don't let stars be equal or less than gems, but also remember that star value is 0 for 3rd grade
      valGems = possibleGemValues[Math.floor(Math.random() * possibleGemValues.length)];
      valStars = possibleStarValues[Math.floor(Math.random() * possibleStarValues.length)];
    }
    const mainGameData: MainGameConfig = {
      grade_level: this.activeGradeLevel,
      map_number: possibleMapNumbers[Math.floor(Math.random() * possibleMapNumbers.length)],
      conversion_values: {
        valGems: valGems,
        valStars: valStars,
      },
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