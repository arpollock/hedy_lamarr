import 'phaser';
import {
  sceneNames,
  backgroundColor,
  width,
  height,
  textConfig
} from './../Constants';

export class LevelWin extends Phaser.Scene {

  private text;
  private textString: string;

  constructor() {
    super({
      key: sceneNames.win
    });
  }

  public init(params): void {
    
  }
  public preload(): void {
    
  }

  public create(): void {
    console.log('from win screen')
    this.cameras.main.setBackgroundColor(backgroundColor);
    // text to show pause menu text.
    this.textString = 'Woohoo! Level Complete';
    const textX = width / 2; 
    const textY = height / 3;
    this.text = this.add.text(textX, textY, this.textString, {
      fontSize: textConfig.mainFontSize,
      color: textConfig.mainFillColor,
      fontFamily: textConfig.fontFams
    }).setOrigin(0.5); // set origin makes it so we can center the text easily
    this.text.setScrollFactor(0);
  }

  public update(time: number): void {
    
  }

};