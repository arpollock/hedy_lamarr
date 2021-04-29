import 'phaser';
import {
  backgroundColor,
  sceneNames,
  pauseKeyCode,
  width,
  height,
  textConfig
} from './../Constants';

export class PauseScene extends Phaser.Scene {

  private pauseKey: Phaser.Input.Keyboard.Key;
  private text;
  private textString: string;

  constructor() {
    super({
      key: sceneNames.pause
    });
  }

  public init(params): void {
    
  }
  public preload(): void {
    
  }

  public create(): void {
    this.cameras.main.setBackgroundColor(backgroundColor);
    this.pauseKey = this.input.keyboard.addKey(pauseKeyCode);
    // text to show pause menu text.
    this.textString = 'Game Paused';
    const textX = width / 2; 
    const textY = height / 2;
    console.log(`w: ${width} h: ${height} x: ${textX} y: ${textY}`);
    this.text = this.add.text(textX, textY, this.textString, {
      fontSize: textConfig.mainFontSize,
      fill: textConfig.mainFillColor,
    }).setOrigin(0.5); // set origin makes it so we can center the text easily
    this.text.setScrollFactor(0);
  }

  public update(time: number): void {
    if (Phaser.Input.Keyboard.JustDown(this.pauseKey)) {
      console.log('Pause button pushed (from pause menu)!');
      this.scene.switch(sceneNames.mainGame);
    }
  }

};