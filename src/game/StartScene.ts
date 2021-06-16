import 'phaser';
import {
  assetBaseURL,
  gameName,
  altBackgroundColor,
  sceneNames,
  width,
  height,
  textConfig,
  numDifficulties
} from './../Constants';

export class StartScene extends Phaser.Scene {

  private titleText: Phaser.GameObjects.Text;
  private titleTextString: string;
  private difficultyText: Phaser.GameObjects.Text;
  private difficultyTextString: string;
  private startGameButton: Phaser.GameObjects.Sprite;
  private difficultyLevelButtons: Phaser.GameObjects.Sprite[];
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
  }

  public create(): void {
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
    }).setOrigin(0.5); // set origin makes it so we can center the text easily
    this.titleText.setScrollFactor(0);
    // text to push the user to choose their grade level
    const difficultyTextY: number = titleTextY + padding;
    this.difficultyText = this.add.text(centerX, difficultyTextY, this.difficultyTextString, {
      fontSize: textConfig.secondaryTitleFontSize,
      color: textConfig.secondaryFillColor,
    }).setOrigin(0.5); // set origin makes it so we can center the text easily
    this.difficultyText.setScrollFactor(0);
    // buttons to select difficulty level, start w/ 4th grade active
    for(let i = 0; i < numDifficulties; i++) {
      const horizontalOffset: number = 200;
      const currGrade: number = i + 3;// i = 0 ==> grade 3
      const tempButtonSpr = this.add.sprite((centerX - horizontalOffset + (i * horizontalOffset)), 0,`difficulty${currGrade}`).setOrigin(0.5);
      tempButtonSpr.setScale(0.33);
      tempButtonSpr.setInteractive({
        useHandCursor: true
      });
      const difficultyButtonY: number = difficultyTextY + (tempButtonSpr.displayHeight / 2) + padding;
      tempButtonSpr.setY(difficultyButtonY)
      tempButtonSpr.on('pointerover', (pointer: Phaser.Input.Pointer, localX: number, localY: number, event: Phaser.Types.Input.EventData) => {
        tempButtonSpr.setTexture(`difficulty${currGrade}_hover`);
      }, tempButtonSpr);
      tempButtonSpr.on('pointerout', (pointer: Phaser.Input.Pointer, localX: number, localY: number, event: Phaser.Types.Input.EventData) => {
        tempButtonSpr.setTexture(`difficulty${currGrade}`);
      }, tempButtonSpr);
      tempButtonSpr.on('pointerdown', () => {
        this.activeGradeLevel = currGrade;
        this.difficultyLevelButtons.forEach( (btn) => {
          if (btn.texture.key.charAt(btn.texture.key.length - 1).toString() === 'r') { // todo, this is a lil janky
            btn.setTexture(`${btn.texture.key.substring(0, 11)}`);
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
  }

  public update(time: number): void {
    this.difficultyLevelButtons.forEach( (btn) => {
      if (btn.texture.key.charAt(btn.texture.key.length - 1).toString() === this.activeGradeLevel.toString()) { // todo, only works for single digit difficulty choices
        btn.setTexture(`${btn.texture.key}_hover`);
      }
    });
  }

  private onStartGameButtonHoverEnter(pointer: Phaser.Input.Pointer, localX: number, localY: number, event: Phaser.Types.Input.EventData): void {
    // this.back_button.setTexture('tablet_button_hover');
  }

  private onStartGameButtonHoverExit(pointer: Phaser.Input.Pointer, localX: number, localY: number, event: Phaser.Types.Input.EventData): void {
    // this.back_button.setTexture('tablet_button');
  }

  private startGame(): void {
    this.scene.start(sceneNames.mainGame);
  }

  private onDifficultyButtonHoverEnter(pointer: Phaser.Input.Pointer, localX: number, localY: number, event: Phaser.Types.Input.EventData): void {
    // this.back_button.setTexture('tablet_button_hover');
  }

  private onDifficultyButtonHoverExit(pointer: Phaser.Input.Pointer, localX: number, localY: number, event: Phaser.Types.Input.EventData): void {
    // this.back_button.setTexture('tablet_button');
  }

};