import 'phaser';

import {
  assetBaseURL,
  sceneNames,
  width,
  height,
  textConfig,
  ConversionConfig,
  screenEdgePadding,
  zoomFactors,
  eventNames,
  // eventNames
} from './../Constants';
import eventsCenter from './EventsCenter';
export class TabletMenu extends Phaser.Scene {

  private backgroundPanel: Phaser.GameObjects.Sprite;
  private conversionText: Phaser.GameObjects.Text;
  private conversionString: string;
  private conversionValues: ConversionConfig;
  private containsStars: boolean;

  private currencySprites: Phaser.GameObjects.Sprite[];

  private toggleCameraButton: Phaser.GameObjects.Sprite;
  private cameraFollowPlayer: boolean;

   constructor() {
    super({
      key: sceneNames.tabletMenu
    });
    this.backgroundPanel = null;
    this.conversionText = null;
    this.conversionString = `Notes:\nX coins = X gems\nX coins = X stars\nX gems = X stars`;
    this.currencySprites = [];
    this.containsStars = true;
    this.toggleCameraButton = null;
    this.cameraFollowPlayer = true;
  }

  public init(params: ConversionConfig): void {
    this.conversionValues = params;
  }

  public preload(): void {
    this.load.setBaseURL(assetBaseURL);
    this.load.image('tablet_menu_background', 'tablet_ui/menuPanel_tab.png');
    this.load.image('world_map_mode', 'tablet_ui/world_map_mode.png');
    this.load.image('follow_player_mode', 'tablet_ui/follow_player_mode.png');
  }

  public create(): void {

    if (this.conversionValues.valStars <= 0) {
      this.containsStars = false;
    }
    this.backgroundPanel = this.add.sprite(width-70, height-80, 'tablet_menu_background'); // new Phaser.GameObjects.Sprite(this, width-70, height-80, 'tablet_menu_background');
    this.backgroundPanel.setOrigin(1,1);
    this.backgroundPanel.setDepth(0);
    // text to show score
    const textX: number = this.backgroundPanel.x - this.backgroundPanel.displayWidth + screenEdgePadding * 2.5;
    const textY: number = this.backgroundPanel.y - this.backgroundPanel.displayHeight + screenEdgePadding * 1.5;
    this.conversionText = this.add.text(textX, textY, this.conversionString, {
      fontSize: textConfig.mainFontSize,
      color: textConfig.secondaryFillColor,
      fontFamily: textConfig.fontFams,
    });
    this.conversionText.setDepth(1);

    // create cute images for them to see the conversion values
    const firstColX: number = textX + 45;
    const secondColX: number = firstColX + 115;
    const vertOffset: number = 68;
    const starOffset: number = -4; // yeah I know this is janky

    const firstRowY: number = textY + 50;
    let currencySprite: Phaser.GameObjects.Sprite = this.add.sprite(firstColX, firstRowY, 'coinHud');
    this.currencySprites.push(currencySprite);
    currencySprite = this.add.sprite(secondColX, firstRowY, 'gemHud');
    this.currencySprites.push(currencySprite);

    if (this.containsStars) {
      const secondRowY: number = firstRowY + vertOffset;
      currencySprite = this.add.sprite(firstColX, secondRowY, 'coinHud');
      this.currencySprites.push(currencySprite);
      currencySprite = this.add.sprite(secondColX, secondRowY+starOffset, 'starHud');
      this.currencySprites.push(currencySprite);

      const thirdRowY: number = secondRowY + vertOffset;
      currencySprite = this.add.sprite(firstColX, thirdRowY, 'gemHud');
      this.currencySprites.push(currencySprite);
      currencySprite = this.add.sprite(secondColX, thirdRowY+starOffset, 'starHud');
      this.currencySprites.push(currencySprite);
    }
    // set the text to correspond to the pretty images above, about the conversion values
    this.setConversionText();
    const viewWorldMapButtonX: number = this.backgroundPanel.x - screenEdgePadding * 2.5;
    const viewWorldMapButtonY: number = this.backgroundPanel.y - screenEdgePadding * 6.75;// + (this.backgroundPanel.displayHeight / 2);
    this.toggleCameraButton = this.add.sprite(viewWorldMapButtonX, viewWorldMapButtonY,'world_map_mode').setOrigin(1);
    this.toggleCameraButton.setInteractive({
      useHandCursor: true
    });
    this.toggleCameraButton.on('pointerover', this.onToggleCameraButtonHoverEnter, this);
    this.toggleCameraButton.on('pointerout', this.onToggleCameraButtonHoverExit, this);
    this.toggleCameraButton.on('pointerdown', this.toggleCamera, this);
  }

  public update(time: number): void {
    if (Phaser.Input.Keyboard.JustDown(this.input.keyboard.addKey('P'))) {
      console.log("tablet menu debug!");
    }
  }

  private onToggleCameraButtonHoverEnter(pointer: Phaser.Input.Pointer, localX: number, localY: number, event: Phaser.Types.Input.EventData): void { }

  private onToggleCameraButtonHoverExit(pointer: Phaser.Input.Pointer, localX: number, localY: number, event: Phaser.Types.Input.EventData): void { }

  private toggleCamera(): void {
    if (this.cameraFollowPlayer) {
      this.scene.get(sceneNames.mainGame).cameras.main.setZoom(zoomFactors.viewWorld);
      this.cameraFollowPlayer = false;
      this.toggleCameraButton.setTexture('follow_player_mode');
    } else {
      eventsCenter.emit(eventNames.cameraFollowPlayer);
      this.cameraFollowPlayer = true;
      this.toggleCameraButton.setTexture('world_map_mode');
    }
    
  }

  private findLCM(a: number, b: number): number { // assume a is greater than b
    let lcm = a;
    let i = 2;
    while(lcm % b != 0) { // try to find number which is multiple of b
       lcm = a * i;
       i++;
    }
    return lcm;
 }

 private findConversionValue(currentCoinValue: number, lcm: number): number {
   return Math.floor(lcm / currentCoinValue);
 }

  public setConversionText(): void {
    console.log('Setting that conversion text!');
    console.log(this.conversionValues);
    const spriteSpaces: string = "       "; // 6 spaces
    const cToS: string = this.containsStars ? `${this.conversionValues.valStars.toString()}${spriteSpaces}= ` : '';
    const sToC: string = this.containsStars? '1' : '';
    const cToG: string = `${this.conversionValues.valGems.toString()}${spriteSpaces}= `;
    const gToC: string = '1';
    const gToS: string = this.containsStars ? `${this.findConversionValue(this.conversionValues.valGems, this.findLCM(this.conversionValues.valGems, this.conversionValues.valStars))}${spriteSpaces}= ` : '';
    const sToG: string = this.containsStars ? `${this.findConversionValue(this.conversionValues.valStars, this.findLCM(this.conversionValues.valStars, this.conversionValues.valGems))}` : '';
    this.conversionString = `Notes:\n${cToG}${gToC}\n\n${cToS}${sToC}\n\n${gToS}${sToG}`;
    this.conversionText.setText(this.conversionString);
  }
}