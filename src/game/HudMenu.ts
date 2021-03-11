import 'phaser';
import eventsCenter from './EventsCenter';
import { sceneNames } from './../Constants';

export class HudMenu extends Phaser.Scene {
  constructor() {
    super({
      key: sceneNames.hudMenu
    });
  }

  public init(params): void {

  }

  public preload(): void {

  }

  public create(): void {
    this.cameras.main.setBackgroundColor();
    eventsCenter.on('updateScoreText', this.updateScoreText)
  }

  public update(time: number): void {

  }

  private updateScoreText(scoreText: string): void {
    console.log('update from ui scene!');
    console.log(scoreText);
  }
}