import 'phaser';
import eventsCenter from './EventsCenter';
import {
  sceneNames,
  assetObsUiURL,
  width,
  height,
  textConfig,
  eventNames,
  currency_type
} from '../Constants';

class DraggableCurrency extends Phaser.GameObjects.Sprite {
  private ct: currency_type;

  constructor(scene: Phaser.Scene, x: number, y: number, texture: string, ct: currency_type) {
		super(scene, x, y, texture);
		scene.add.existing(this);
    this.ct = ct;
    this.setInteractive({
      useHandCursor: true
    });
	}

  public get_currency_type(): currency_type {
    return this.ct;
  }
}

export class ObstacleFixMenu extends Phaser.Scene {

  private pauseKey: Phaser.Input.Keyboard.Key;
  private filler_text: Phaser.GameObjects.Text;
  private filler_text_string: string;

  private back_button: Phaser.GameObjects.Sprite;
  private submit_button: Phaser.GameObjects.Sprite;

  private backgroundPanel_left: Phaser.GameObjects.Sprite;
  private backgroundPanel_right: Phaser.GameObjects.Sprite;
  private button_state_sprite: Phaser.GameObjects.Sprite;

  private draggable_currencies: DraggableCurrency[];

  constructor() {
    super({
      key: sceneNames.obFixMenu
    });
    this.backgroundPanel_left = null;
    this.backgroundPanel_right = null;
    this.back_button = null;
    this.submit_button = null;
    this.draggable_currencies = [];
  }

  public init(params): void {

  }

  public preload(): void {
    this.load.setBaseURL(assetObsUiURL);
    this.load.image('back_button', 'back.png');
    this.load.image('submit_button', 'submit.png');
    this.load.image('bgPanelLeft', 'bgPanelLeft.png');
    this.load.image('bgPanelRight', 'bgPanelRight.png');
    this.load.image('buttonReject', 'buttonOff.png');
    this.load.image('buttonAccept', 'buttonOn.png');
    this.load.image('coinUi', 'coinUi.png');
    this.load.image('gemUi', 'gemUi.png');
    this.load.image('starUi', 'starUi.png');

    
    const closeMenuKeyCode: number = Phaser.Input.Keyboard.KeyCodes.E;
    this.pauseKey = this.input.keyboard.addKey(closeMenuKeyCode);
    this.cameras.main.setBackgroundColor(); // set background of hud menu to transparent
  }

  public create(): void {
    console.log("In obstacle fix screen");
    this.filler_text_string = 'Obstacle Fixing Menu';
    const textX = width / 2; 
    const textY = height / 3;
    this.filler_text = this.add.text(textX, textY, this.filler_text_string, {
      fontSize: textConfig.mainFontSize,
      fill: textConfig.mainFillColor,
    }).setOrigin(0.5); // set origin makes it so we can center the text easily
    this.filler_text.setScrollFactor(0);
    // back button click detection
    this.back_button = this.add.sprite(50, height-70,'back_button').setOrigin(0,0);
    this.back_button.setInteractive({
      useHandCursor: true
    });
    this.back_button.on('pointerover', this.onBackButtonHoverEnter, this);
    this.back_button.on('pointerout', this.onBackButtonHoverExit, this);
    this.back_button.on('pointerdown', this.goBackToLevel, this);
    // submit button click detection
    this.submit_button = this.add.sprite(100, height-70,'submit_button').setOrigin(0,0);
    this.submit_button.setInteractive({
      useHandCursor: true
    });
    this.submit_button.on('pointerover', this.onSubmitButtonHoverEnter, this);
    this.submit_button.on('pointerout', this.onSubmitButtonHoverExit, this);
    this.submit_button.on('pointerdown', this.completeObstacle, this);
    // left panel - showing the user how much currency they have
    this.backgroundPanel_left = this.add.sprite(0, (height/2), 'bgPanelLeft'); // new Phaser.GameObjects.Sprite(this, width-70, height-80, 'tablet_menu_background');
    // right panel - showing the user how much currency they have to pay
    this.backgroundPanel_right = this.add.sprite(width, (height/2), 'bgPanelRight');
    // button to show the state of if they've paid enough
    this.button_state_sprite = this.add.sprite(width, height, 'buttonReject');
    this.button_state_sprite.setPosition(width - this.button_state_sprite.width / 2 - 10, height - this.button_state_sprite.height / 6);
    // draggable currencies in order to pay
    const dc_start_x: number = 70;
    const coinUi_start_x: number = 70;
    const temp_coinUi_sprite = new DraggableCurrency(this, dc_start_x, coinUi_start_x, 'coinUi', currency_type.coin);
    this.draggable_currencies.push(temp_coinUi_sprite);
    const gemUi_start_x: number = 140;
    const temp_gemUi_sprite = new DraggableCurrency(this, dc_start_x, gemUi_start_x, 'gemUi', currency_type.gem);
    this.draggable_currencies.push(temp_gemUi_sprite);
    const starUi_start_x: number = 210;
    const temp_starUi_sprite = new DraggableCurrency(this, dc_start_x, starUi_start_x, 'starUi', currency_type.star);
    this.draggable_currencies.push(temp_starUi_sprite);
    
    this.input.setDraggable(this.draggable_currencies);
    this.input.on('drag', this.doDrag, this);
    // https://photonstorm.github.io/phaser3-docs/Phaser.Input.Events.html#event:GAMEOBJECT_DRAG_START
    // this.draggable_currencies.forEach(dc => {
    //   // this.back_button.on('dragstart', this.startDrag, this);
    //   this.back_button.on('drag', this.doDrag, this);
    //   // this.back_button.on('dragend', this.stopDrag, this);
    // });
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
    // todo, add a param to indicate success or not
    eventsCenter.emit(eventNames.closeObFixMenu); // enable the user to move the player again
    this.scene.sleep(sceneNames.obFixMenu);
  }

  private onSubmitButtonHoverEnter(pointer: Phaser.Input.Pointer, localX: number, localY: number, event: Phaser.Types.Input.EventData) {
    // this.back_button.setTexture('tablet_button_hover');
  }

  private onSubmitButtonHoverExit(pointer: Phaser.Input.Pointer, localX: number, localY: number, event: Phaser.Types.Input.EventData) {
    // this.back_button.setTexture('tablet_button');
  }

  private completeObstacle() {
    console.log('Submit button pushed (from Obstacle Fix menu).');
    // todo, add a param to indicate success or not
    eventsCenter.emit(eventNames.closeObFixMenu); // enable the user to move the player again
    this.scene.sleep(sceneNames.obFixMenu);
  }

  // private startDrag(pointer: Phaser.Input.Pointer, dragX: number, dragY: number) {
  //   this.input.off('pointerdown', this.startDrag, this);
  //   // this.dragObj = event.
  //   // this.input.on('pointerdown', this.startDrag, this);
  //   console.log("Drag Start");
  //   // pointer.
  // }

  private doDrag(pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.Sprite, dragX: number, dragY: number) {
    console.log("dragging");
    gameObject.x = dragX;
    gameObject.y = dragY;
  }

  // private stopDrag(pointer: Phaser.Input.Pointer, localX: number, localY: number, event: Phaser.Types.Input.EventData) {
  //   console.log("Drag Stop");
  //   // this.input.off('pointerdown', this.startDrag, this);
  // }
}
