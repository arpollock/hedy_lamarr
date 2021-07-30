import 'phaser';
import {
  backgroundColor,
  sceneNames,
  pauseKeyCode,
  width,
  height,
  textConfig,
  assetBaseURL,
  assetGameControlUiUrl
} from './../Constants';

export class PauseScene extends Phaser.Scene {

  private pauseKey: Phaser.Input.Keyboard.Key;
  private text;
  private textString: string;

  private resumeGameButton: Phaser.GameObjects.Sprite;
  private mainMenuButton: Phaser.GameObjects.Sprite;

  constructor() {
    super({
      key: sceneNames.pause
    });
    this.resumeGameButton = null;
    this.mainMenuButton = null;
  }

  public init(params): void {
    
  }
  public preload(): void {
    this.load.setBaseURL(assetBaseURL);
    this.load.image('resume_game_button', `${assetGameControlUiUrl}resume.png`);
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
      fontSize: textConfig.secondaryTitleFontSize,
      color: textConfig.mainFillColor,
      fontFamily: textConfig.fontFams
    }).setOrigin(0.5); // set origin makes it so we can center the text easily
    this.text.setScrollFactor(0);

    const buttonY: number = height * 2 / 3;
    const buttonLeftX: number = width / 3 - 50;
    const buttonRightX: number = width * 2 / 3 + 50;
    // button to go back to the main menu
    this.mainMenuButton = this.add.sprite(buttonLeftX, buttonY,'main_menu_button').setOrigin(0.5);
    this.mainMenuButton.setInteractive({
      useHandCursor: true
    });
    this.mainMenuButton.on('pointerover', this.onMainMenuButtonHoverEnter, this);
    this.mainMenuButton.on('pointerout', this.onMainMenuButtonHoverExit, this);
    this.mainMenuButton.on('pointerdown', this.goToMainMenu, this);
    // button to go back to the game
    this.resumeGameButton = this.add.sprite(buttonRightX, buttonY,'resume_game_button').setOrigin(0.5);
    this.resumeGameButton.setInteractive({
      useHandCursor: true
    });
    this.resumeGameButton.on('pointerover', this.onResumeGameButtonHoverEnter, this);
    this.resumeGameButton.on('pointerout', this.onResumeGameButtonHoverExit, this);
    this.resumeGameButton.on('pointerdown', this.resumeGame, this);
    // handle showing master music control after being put to sleep
    this.bringUpMasterMusicControl();
    this.events.on('wake', this.bringUpMasterMusicControl, this);
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
    this.scene.sendToBack(sceneNames.musicControl); // hide master music control
    this.scene.switch(sceneNames.mainGame);
  }

  private onMainMenuButtonHoverEnter(pointer: Phaser.Input.Pointer, localX: number, localY: number, event: Phaser.Types.Input.EventData): void { }

  private onMainMenuButtonHoverExit(pointer: Phaser.Input.Pointer, localX: number, localY: number, event: Phaser.Types.Input.EventData): void { } 

  public goToMainMenu(): void {
    // clean up the old level
    this.scene.remove(sceneNames.mainGame);
    this.scene.remove(sceneNames.hudMenu);
    this.scene.remove(sceneNames.tabletMenu);
    // go back to the main menu
    this.scene.switch(sceneNames.start);
  }

  private bringUpMasterMusicControl(): void {
    this.scene.bringToTop(sceneNames.musicControl);
  }

};