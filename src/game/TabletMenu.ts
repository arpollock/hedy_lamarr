import 'phaser';

import {
  assetBaseURL,
  sceneNames,
  width,
  height,
  textConfig,
  ConversionConfig,
  eventNames
} from './../Constants';
import eventsCenter from './EventsCenter';

export class TabletMenu extends Phaser.Scene { // Phaser.GameObjects.Sprite {

  private backgroundPanel: Phaser.GameObjects.Sprite;
  private conversionText: Phaser.GameObjects.Text;
  private conversionString: string;
  private conversionValues: ConversionConfig;

   constructor() {
    super({
      key: sceneNames.tabletMenu
    });
    this.backgroundPanel = null;
    this.conversionText = null;
    this.conversionString = `Conversion Notes:\nX coins = X gems\nX coins = X stars\nX gems = X stars`;
  }

  public init(params: ConversionConfig): void {
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

  private findLCM(a: number, b: number): number {    //assume a is greater than b
    let lcm = a;
    let i = 2;
    while(lcm % b != 0) {    //try to find number which is multiple of b
       lcm = a * i;
       i++;
    }
    return lcm;    //the lcm of a and b
 }

 private findConversionValue(currentCoinValue: number, lcm: number): number {
   return Math.floor(lcm / currentCoinValue);
 }

  public setConversionText(): void {
    console.log('Setting that conversion text!');
    console.log(this.conversionValues);
    const cToS: string = this.conversionValues.valStars > 0 ? `${this.conversionValues.valStars.toString()} coins = ` : '';
    const sToC: string = this.conversionValues.valStars > 0 ? '1 star' : '';
    const cToG: string = `${this.conversionValues.valGems.toString()} coins = `;
    const gToC: string = '1 gem';
    const gToS: string = this.conversionValues.valStars > 0 ? `${this.findConversionValue(this.conversionValues.valGems, this.findLCM(this.conversionValues.valGems, this.conversionValues.valStars))} gems = ` : '';
    const sToG: string = this.conversionValues.valStars > 0 ? `${this.findConversionValue(this.conversionValues.valStars, this.findLCM(this.conversionValues.valStars, this.conversionValues.valGems))} stars` : '';
    this.conversionString = `Conversion Notes:\n${cToG}${gToC}\n${cToS}${sToC}\n${gToS}${sToG}`;
    if (sToG === '1') {
      this.conversionString = this.conversionString.substring(0, this.conversionString.length - 1);
    }
    this.conversionText.setText(this.conversionString);
  }
}