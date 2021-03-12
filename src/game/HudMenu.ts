import 'phaser';
import eventsCenter from './EventsCenter';
import {
  sceneNames,
  height,
  initScoreStr,
  textConfig
} from './../Constants';

export class HudMenu extends Phaser.Scene {
  constructor() {
    super({
      key: sceneNames.hudMenu
    });
    this.scoreString = initScoreStr;
  }

  private text; //: Phaser.GameObjects.Text;
  private scoreString: string;

  public init(params): void {

  }

  public preload(): void {
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
}