import 'phaser';
import eventsCenter from './EventsCenter';
import {
  sceneNames,
  width,
  height,
  initScoreStr,
  textConfig,
  assetBaseURL
} from './../Constants';

export class HudMenu extends Phaser.Scene {

  private text; //: Phaser.GameObjects.Text;
  private scoreString: string;

  private tablet_button: Phaser.GameObjects.Sprite;
  private tablet_menu_open: boolean;

  constructor() {
    super({
      key: sceneNames.hudMenu
    });
    this.scoreString = initScoreStr;
    this.tablet_menu_open = false;
  }

  public init(params): void {

  }

  public preload(): void {
    this.load.setBaseURL(assetBaseURL);
    this.load.image('tablet_button', 'tablet.png');
    this.load.image('tablet_button_hover', 'tablet_hover.png');
    this.cameras.main.setBackgroundColor();
    eventsCenter.on('updateScoreText', this.updateScoreText, this);
    // text to show score
    const textX = 10;
    const textY = height - 35;
    this.text = this.add.text(textX, textY, this.scoreString, {
      fontSize: textConfig.mainFontSize,
      fill: textConfig.mainFillColor
    });
    this.text.setScrollFactor(0);
  }

  public create(): void {
    this.tablet_button = this.add.sprite(width-70, height-70,'tablet_button');
    this.tablet_button.setInteractive({
      useHandCursor: true
  });
    this.tablet_button.on('pointerover', this.onTabletButtonHoverEnter, this);
    this.tablet_button.on('pointerout', this.onTabletButtonHoverExit, this);
    this.tablet_button.on('pointerdown', this.toggleTabletMenu, this);
    this.input.on('pointerdown', this.anyClickDetected, this); // detect a click outside of the buttons
  }

  public update(time: number): void {
    if (Phaser.Input.Keyboard.JustDown(this.input.keyboard.addKey('P'))) {
      console.log("score text debug");
      console.log(this.scoreString);
    }
  }

  private updateScoreText(scoreText: string): void {
    // console.log('update from ui scene!');
    // console.log(scoreText);
    this.scoreString = scoreText;
    this.text.setText(this.scoreString);
  }

  private anyClickDetected(pointer: Phaser.Input.Pointer, localX: number, localY: number, event: Phaser.Types.Input.EventData) {
    if (this.tablet_menu_open) {
      this.tablet_menu_open = false;
    }
  }

  private toggleTabletMenu(pointer: Phaser.Input.Pointer, localX: number, localY: number, event: Phaser.Types.Input.EventData) {
    this.tablet_menu_open = !(this.tablet_menu_open);
    console.log(`toggling tablet menu to: ${this.tablet_menu_open}`);
    event.stopPropagation(); // stop it from detecting a click elsewhere, which is used to close the menu
  }

  private onTabletButtonHoverEnter(pointer: Phaser.Input.Pointer, localX: number, localY: number, event: Phaser.Types.Input.EventData) {
    this.tablet_button.setTexture('tablet_button_hover');
  }

  private onTabletButtonHoverExit(pointer: Phaser.Input.Pointer, localX: number, localY: number, event: Phaser.Types.Input.EventData) {
    this.tablet_button.setTexture('tablet_button');
  }
}