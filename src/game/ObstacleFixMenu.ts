import 'phaser';
import eventsCenter from './EventsCenter';
import {
  sceneNames,
  assetObsUiURL,
  width,
  height,
  textConfig,
  eventNames
} from '../Constants';

export class ObstacleFixMenu extends Phaser.Scene {

  private pauseKey: Phaser.Input.Keyboard.Key;
  private text;
  private textString: string;

  private back_button: Phaser.GameObjects.Sprite;

  private backgroundPanel_left: Phaser.GameObjects.Sprite;

  constructor() {
    super({
      key: sceneNames.obFixMenu
    });
    this.backgroundPanel_left = null;
    this.back_button = null;
  }

  public init(params): void {

  }

  public preload(): void {
    this.load.setBaseURL(assetObsUiURL);
    this.load.image('back_button', 'back.png');
    this.load.image('bgPanelLeft', 'bgPanelLeft.png');

    const closeMenuKeyCode: number = Phaser.Input.Keyboard.KeyCodes.E;
    this.pauseKey = this.input.keyboard.addKey(closeMenuKeyCode);
    this.cameras.main.setBackgroundColor(); // set background of hud menu to transparent
  }

  public create(): void {
    console.log("In obstacle fix screen");
    this.textString = 'Obstacle Fixing Menu';
    const textX = width / 2; 
    const textY = height / 3;
    this.text = this.add.text(textX, textY, this.textString, {
      fontSize: textConfig.mainFontSize,
      fill: textConfig.mainFillColor,
    }).setOrigin(0.5); // set origin makes it so we can center the text easily
    this.text.setScrollFactor(0);
    // back button click detection
    this.back_button = this.add.sprite(70, height-70,'back_button').setOrigin(0,0);
    this.back_button.setInteractive({
      useHandCursor: true
    });
    this.back_button.on('pointerover', this.onBackButtonHoverEnter, this);
    this.back_button.on('pointerout', this.onBackButtonHoverExit, this);
    this.back_button.on('pointerdown', this.goBackToLevel, this);
    // left panel - showing the user how much currency they have
    this.backgroundPanel_left = this.add.sprite(0, (height/2), 'bgPanelLeft'); // new Phaser.GameObjects.Sprite(this, width-70, height-80, 'tablet_menu_background');
  }

  public update(time: number): void {
    
  }

  private onBackButtonHoverEnter(pointer: Phaser.Input.Pointer, localX: number, localY: number, event: Phaser.Types.Input.EventData) {
    // this.back_button.setTexture('tablet_button_hover');
  }

  private onBackButtonHoverExit(pointer: Phaser.Input.Pointer, localX: number, localY: number, event: Phaser.Types.Input.EventData) {
    // this.back_button.setTexture('tablet_button');
  }

  private goBackToLevel() {
    console.log('Back button pushed (from Obstacle Fix menu).');
    eventsCenter.emit(eventNames.closeObFixMenu); // enable the user to move the player again
    this.scene.sleep(sceneNames.obFixMenu);
  }
}