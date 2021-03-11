import 'phaser';
import {
  backgroundColor,
  sceneNames
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

  init(params): void {
    
  }
  preload(): void {
    
  }

  create(): void {
    this.cameras.main.setBackgroundColor(backgroundColor);
    this.pauseKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC.valueOf());
    // text to show pause menu text.
    this.textString = 'Game Paused'
    const textX = (this.game.config.width.valueOf() as number) / 2; 
    const textY = (this.game.config.height.valueOf() as number) / 2;
    console.log(`text location: ${textX}, ${textY}`);
    this.text = this.add.text(textX, textY, this.textString, {
      fontSize: '32px',
      fill: '#ffffff',
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