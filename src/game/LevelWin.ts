import 'phaser';
import {
  assetBaseURL,
  sceneNames,
  backgroundColor,
  width,
  height,
  textConfig,
  MainGameConfig
} from './../Constants';
import { HudMenu } from './HudMenu';
import { TabletMenu } from './TabletMenu';
import { HomeScene } from './mainGame';

export class LevelWin extends Phaser.Scene {

  private text;
  private textString: string;

  private mainMenuButton: Phaser.GameObjects.Sprite;
  private playNewLevelButton: Phaser.GameObjects.Sprite;

  private previousLevelSeedData: MainGameConfig;

  constructor() {
    super({
      key: sceneNames.win
    });
    this.mainMenuButton = null;
    this.playNewLevelButton = null;
  }

  public init(data: MainGameConfig): void {
    this.previousLevelSeedData = data;
  }
  public preload(): void {
    this.load.setBaseURL(assetBaseURL);
  }

  public create(): void {
    this.scene.remove(sceneNames.mainGame);
    this.scene.remove(sceneNames.hudMenu);
    this.scene.remove(sceneNames.tabletMenu);
    console.log('from win screen')
    this.cameras.main.setBackgroundColor(backgroundColor);
    // text to show pause menu text.
    this.textString = 'Woohoo! Level Complete';
    const centerX = width / 2; 
    const textY = height / 3;
    this.text = this.add.text(centerX, textY, this.textString, {
      fontSize: textConfig.mainFontSize,
      color: textConfig.mainFillColor,
      fontFamily: textConfig.fontFams
    }).setOrigin(0.5); // set origin makes it so we can center the text easily
    this.text.setScrollFactor(0);
    // main menu button click detection
    const buttonsY: number = height * 2 / 3;
    const buttonLeftX: number = width / 3;
    const buttonRightX: number = width * 2 / 3;
    this.mainMenuButton = this.add.sprite(buttonLeftX, buttonsY,'main_menu_button').setOrigin(0.5);
    this.mainMenuButton.setInteractive({
      useHandCursor: true
    });
    this.mainMenuButton.on('pointerover', this.onMainMenuButtonHoverEnter, this);
    this.mainMenuButton.on('pointerout', this.onMainMenuButtonHoverExit, this);
    this.mainMenuButton.on('pointerdown', this.goToMainMenu, this);

    // play again (new level) button click detection
    this.playNewLevelButton = this.add.sprite(buttonRightX, buttonsY,'play_new_level').setOrigin(0.5);
    this.playNewLevelButton.setInteractive({
      useHandCursor: true
    });
    this.playNewLevelButton.on('pointerover', this.onPlayNewLevelButtonHoverEnter, this);
    this.playNewLevelButton.on('pointerout', this.onPlayNewLevelButtonHoverExit, this);
    this.playNewLevelButton.on('pointerdown', this.playNewLevel, this);
  }

  public update(time: number): void {
    
  }

  private onMainMenuButtonHoverEnter(pointer: Phaser.Input.Pointer, localX: number, localY: number, event: Phaser.Types.Input.EventData): void { }

  private onMainMenuButtonHoverExit(pointer: Phaser.Input.Pointer, localX: number, localY: number, event: Phaser.Types.Input.EventData): void { }

  private goToMainMenu(): void {
    this.scene.start(sceneNames.start);
  }

  private onPlayNewLevelButtonHoverEnter(pointer: Phaser.Input.Pointer, localX: number, localY: number, event: Phaser.Types.Input.EventData): void { }

  private onPlayNewLevelButtonHoverExit(pointer: Phaser.Input.Pointer, localX: number, localY: number, event: Phaser.Types.Input.EventData): void { }

  // todo, currently startNewLevel and tryLevelAgain are not different
  private playNewLevel(): void {
    this.scene.add(sceneNames.hudMenu, HudMenu, false);
    this.scene.add(sceneNames.tabletMenu, TabletMenu, false);
    this.scene.add(sceneNames.mainGame, HomeScene, false);
    this.scene.start(sceneNames.mainGame, this.previousLevelSeedData);
  }

  // cannot as-is try again once won, todo medium priority
  // private tryLevelAgain(): void {
  //   this.scene.start(sceneNames.mainGame, this.previousLevelSeedData);
  // }

};