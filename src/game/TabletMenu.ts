import 'phaser';

import {
  assetBaseURL,
  sceneNames,
  width,
  height,
  textConfig,
  conversionConfig,
  eventNames
} from './../Constants';
import eventsCenter from './EventsCenter';

export class TabletMenu extends Phaser.Scene { // Phaser.GameObjects.Sprite {

  private backgroundPanel: Phaser.GameObjects.Sprite;
  private conversionText: Phaser.GameObjects.Text;
  private conversionString: string;
  private conversionValues: conversionConfig;

   constructor() {
    super({
      key: sceneNames.tabletMenu
    });
    this.backgroundPanel = null;
    this.conversionText = null;
    this.conversionString = `Conversion Notes:\nX coins = X stars\nX coins = X gems\nX stars = X gems`;
  }

  public init(params: conversionConfig): void {
    this.conversionValues = params;
  }

  public preload(): void {
    this.load.setBaseURL(assetBaseURL);
    this.load.image('tablet_menu_background', 'menuPanel_tab.png');
  }

  public create(): void {
    // eventsCenter.on(eventNames.setConversionValues, this.setConversionText, this);
    // text to show score
    const textX = width * 0.40;
    const textY = height * 0.25;
    this.conversionText = this.add.text(textX, textY, this.conversionString, {
      fontSize: textConfig.mainFontSize,
      color: textConfig.secondaryFillColor
    });
    this.conversionText.setDepth(1);
    // this.conversionText.setScrollFactor(0);
    this.backgroundPanel = this.add.sprite(width-70, height-80, 'tablet_menu_background'); // new Phaser.GameObjects.Sprite(this, width-70, height-80, 'tablet_menu_background');
    this.backgroundPanel.setOrigin(1,1);
    this.backgroundPanel.setDepth(0);
    this.setConversionText();
  }

  public update(time: number): void {
    if (Phaser.Input.Keyboard.JustDown(this.input.keyboard.addKey('P'))) {
      console.log("tablet menu debug!");
    }
  }

  public setConversionText(): void {
    console.log('Setting that conversion text!');
    console.log(this.conversionValues);
    const cToS: string = this.conversionValues.valStars.toString();
    const sToC: string = '1';
    const cToG: string = this.conversionValues.valGems.toString();
    const gToC: string = '1';
    // todo make this so sToG is a whole number for easier levels
    const sToG: string = (this.conversionValues.valStars / this.conversionValues.valGems).toFixed(2).toString();
    const gToS: string = '1'; // (conversionValues.valGems / conversionValues.valStars).toFixed(2).toString();
    this.conversionString = `Conversion Notes:\n${cToS} coins = ${sToC} star\n${cToG} coins = ${gToC} gem\n${sToG} stars = ${gToS} gem`;
    this.conversionText.setText(this.conversionString);
  }
}