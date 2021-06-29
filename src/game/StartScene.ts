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
  MainGameConfig
} from './../Constants';
import { HomeScene } from './mainGame';
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
  }

  public create(): void {
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
      fontSize: textConfig.secondaryTitleFontSize,
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
    const mainGameData: MainGameConfig = {
      grade_level: this.activeGradeLevel,
    };
    this.startGameButton.destroy();
    this.startGameButton = null;
    this.scene.add(sceneNames.hudMenu, HudMenu, false);
    this.scene.add(sceneNames.tabletMenu, TabletMenu, false);
    this.scene.start(sceneNames.mainGame, mainGameData);
  }
};