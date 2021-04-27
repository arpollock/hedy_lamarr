import 'phaser';
import eventsCenter from './EventsCenter';
import {
  sceneNames,
  assetBaseURL,
  width,
  height,
  textConfig,
  eventNames
} from '../Constants';

export class ObstacleFixMenu extends Phaser.Scene {

  private pauseKey: Phaser.Input.Keyboard.Key;
  private text;
  private textString: string;

  constructor() {
    super({
      key: sceneNames.obFixMenu
    });
  }

  public init(params): void {

  }

  public preload(): void {
    const closeMenuKeyCode: number = Phaser.Input.Keyboard.KeyCodes.E;
    this.pauseKey = this.input.keyboard.addKey(closeMenuKeyCode);
    this.load.setBaseURL(assetBaseURL);
    this.cameras.main.setBackgroundColor(); // set background of hud menu to transparent
  }

  public create(): void {
    console.log("In obstacle fix screen");
    this.textString = 'Obstacle Fixing Menu';
    const textX = width / 2; 
    const textY = height / 2;
    this.text = this.add.text(textX, textY, this.textString, {
      fontSize: textConfig.mainFontSize,
      fill: textConfig.mainFillColor,
    }).setOrigin(0.5); // set origin makes it so we can center the text easily
    this.text.setScrollFactor(0);
  }

  public update(time: number): void {
    if (Phaser.Input.Keyboard.JustDown(this.pauseKey)) {
      console.log('Exit button pushed (from Obstacle Fix menu).');
      // this.scene.switch(sceneNames.mainGame);
      eventsCenter.emit(eventNames.closeObFixMenu); // enable the user to move the player again
      this.scene.sleep(sceneNames.obFixMenu);
    }
  }
}