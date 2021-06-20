import 'phaser';
import {
  backgroundColor,
  sceneNames,
  pauseKeyCode,
  width,
  height,
  textConfig,
  assetBaseURL
} from './../Constants';

export class PauseScene extends Phaser.Scene {

  private pauseKey: Phaser.Input.Keyboard.Key;
  private text;
  private textString: string;

  private resumeGameButton: Phaser.GameObjects.Sprite;

  constructor() {
    super({
      key: sceneNames.pause
    });
    this.resumeGameButton = null;
  }

  public init(params): void {
    
  }
  public preload(): void {
    this.load.setBaseURL(assetBaseURL);
    this.load.image('resume_game_button', 'resume.png');
  }

  public create(): void {
    this.cameras.main.setBackgroundColor(backgroundColor);
    this.pauseKey = this.input.keyboard.addKey(pauseKeyCode);
    // text to show pause menu text.
    this.textString = 'Game Paused';
    const textX = width / 2; 
    const textY = height / 3;
    console.log(`w: ${width} h: ${height} x: ${textX} y: ${textY}`);
    this.text = this.add.text(textX, textY, this.textString, {
      fontSize: textConfig.mainFontSize,
      color: textConfig.mainFillColor,
      fontFamily: textConfig.fontFams
    }).setOrigin(0.5); // set origin makes it so we can center the text easily
    this.text.setScrollFactor(0);

    // button to go back to the game
    const resumeGameButtonY: number = height * 2 / 3;
    this.resumeGameButton = this.add.sprite(textX, resumeGameButtonY,'resume_game_button').setOrigin(0.5);
    this.resumeGameButton.setInteractive({
      useHandCursor: true
    });
    this.resumeGameButton.on('pointerover', this.onResumeGameButtonHoverEnter, this);
    this.resumeGameButton.on('pointerout', this.onResumeGameButtonHoverExit, this);
    this.resumeGameButton.on('pointerdown', this.resumeGame, this);
  }

  public update(time: number): void {
    if (Phaser.Input.Keyboard.JustDown(this.pauseKey)) {
      console.log('Pause button pushed (from pause menu)!');
      this.resumeGame();
    }
  }

  private onResumeGameButtonHoverEnter(pointer: Phaser.Input.Pointer, localX: number, localY: number, event: Phaser.Types.Input.EventData): void { }

  private onResumeGameButtonHoverExit(pointer: Phaser.Input.Pointer, localX: number, localY: number, event: Phaser.Types.Input.EventData): void { } 

  public resumeGame(): void {
    this.scene.switch(sceneNames.mainGame);
  }

};