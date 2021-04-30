import 'phaser';
import eventsCenter from './EventsCenter';
import {
  sceneNames,
  assetObsUiURL,
  width,
  height,
  textConfig,
  ObFixConfig,
  eventNames,
  currency_type,
  currency_type_to_str,
  dc_original_x,
  dc_target_x,
  coin_original_y,
  gem_original_y,
  star_original_y
} from '../Constants';

class DraggableCurrencyTarget extends Phaser.GameObjects.Sprite {
  private ct: currency_type;
  private filled: boolean;

  constructor(scene: Phaser.Scene, x: number, y: number, texture: string, ct: currency_type) {
		super(scene, x, y, texture);
    this.ct = ct;
    this.filled = false;
    this.setInteractive({
      useHandCursor: false
    }, this.dropped_on, true);
    scene.add.existing(this);
	}

  public get_currency_type(): currency_type {
    return this.ct;
  }

  public dropped_on(): void { return; }

  public isFilled(): boolean {
    return this.filled;
  }

  public setFilled(): void {
    this.setTexture(`${currency_type_to_str(this.ct)}Ui_accept`);
    this.filled = true;
  }

  public dump(): void {
    if (this.filled) {
      this.setTexture(`${currency_type_to_str(this.ct)}Ui_empty`);
      this.filled = false;
    }
  }
}

class DraggableCurrency extends Phaser.GameObjects.Sprite {
  public updated_flag: boolean;
  private ct: currency_type;
  private count: number;

  constructor(scene: Phaser.Scene, x: number, y: number, texture: string, ct: currency_type, c: number) {
		super(scene, x, y, texture);
    this.ct = ct;
    this.count = c;
    this.updated_flag = false;
    this.setInteractive({
      useHandCursor: true
    });
    scene.add.existing(this);
    if (!(this.count > 0)) {
      this.setVisible(false);
    }
    
	}

  public get_currency_type(): currency_type {
    return this.ct;
  }

  public startDrag(pointer: Phaser.Input.Pointer, dragX: number, dragY: number): void {
    // console.log('start drag');
  }

  public doDrag(pointer: Phaser.Input.Pointer, dragX: number, dragY: number): void {
    this.x = dragX;
    this.y = dragY;
  }

  public stopDrag(pointer: Phaser.Input.Pointer, dragX: number, dragY: number): void {
    // console.log('stop drag');
    this.x = dc_original_x;
    switch(this.get_currency_type()) {
      case currency_type.coin:
        this.y = coin_original_y;
        break;
      case currency_type.gem:
        this.y = gem_original_y;
        break;
      case currency_type.star:
        this.y = star_original_y;
        break;
    };
  }

  public dragDrop(pointer: Phaser.Input.Pointer, target: Phaser.GameObjects.GameObject): void {
    if (target != null && target instanceof DraggableCurrencyTarget) {
      if (target.get_currency_type() === this.ct && !(target.isFilled())) { // dropped on a correct, empty slot
        // pointer.event.stopImmediatePropagation();
        target.setFilled();
        this.decrement_count();
        // const cc = (target.get_currency_type() == 0) ? -1 : 0;
        // const cg = (target.get_currency_type() == 1) ? -1 : 0;
        // const cs = (target.get_currency_type() == 2) ? -1 : 0;
        // eventsCenter.emit(eventNames.updateCurrency, {
        //   change_coins: cc,
        //   change_gems: cg,
        //   change_stars: cs
        // });
      } // wrong currency or is already filled => ignore
    }
  }

  public increment_count(): void {
    this.count++;
    this.updated_flag = true;
    if (this.count > 0) {
      this.setVisible(true);
    }
  }

  public decrement_count(): void {
    this.count--;
    this.updated_flag = true;
    if (this.count <= 0) {
      this.setVisible(false);
    }
  }

  public get_count(): number {
    return this.count;
  }
}

export class ObstacleFixMenu extends Phaser.Scene {

  private pauseKey: Phaser.Input.Keyboard.Key;
  private filler_text: Phaser.GameObjects.Text;
  private filler_text_string: string;

  private back_button: Phaser.GameObjects.Sprite;
  private submit_button: Phaser.GameObjects.Sprite;
  private clear_button: Phaser.GameObjects.Sprite;

  private backgroundPanel_left: Phaser.GameObjects.Sprite;
  private backgroundPanel_right: Phaser.GameObjects.Sprite;
  private button_state_sprite: Phaser.GameObjects.Sprite;

  private draggable_currencies: DraggableCurrency[];
  private draggable_currency_targets: DraggableCurrencyTarget[];

  private num_coins_needed: number;
  private num_gems_needed: number;
  private num_stars_needed: number;

  private num_coins: number;
  private num_coins_str: string;
  private num_coins_text: Phaser.GameObjects.Text;
  private num_gems: number;
  private num_gems_str: string;
  private num_gems_text: Phaser.GameObjects.Text;
  private num_stars: number;
  private num_stars_str: string;
  private num_stars_text: Phaser.GameObjects.Text;

  constructor() {
    super({
      key: sceneNames.obFixMenu
    });
  }

  public init(data: ObFixConfig): void {
    console.log('init fix obs, data is:');
    console.log(data);
    this.backgroundPanel_left = null;
    this.backgroundPanel_right = null;
    this.back_button = null;
    this.submit_button = null;
    this.draggable_currencies = [];
    this.draggable_currency_targets = [];
    this.clear_button = null;

    this.num_coins_needed = 0;
    this.num_gems_needed = 0;
    this.num_stars_needed = 0;
    this.num_coins = 0;
    this.num_gems = 0;
    this.num_stars = 0;
    
    this.num_coins_text = null;
    this.num_gems_text = null;
    this.num_stars_text = null;
    this.num_coins_needed = data.goalCoins;
    this.num_gems_needed = data.goalGems;
    this.num_stars_needed = data.goalStars;
    this.num_coins = data.numCoins;
    this.num_gems = data.numGems;
    this.num_stars = data.numStars;
  }

  public preload(): void {
    this.load.setBaseURL(assetObsUiURL);
    this.load.image('back_button', 'back.png');
    this.load.image('submit_button', 'submit.png');
    this.load.image('clear_button', 'clear.png');
    this.load.image('bgPanelLeft', 'bgPanelLeft.png');
    this.load.image('bgPanelRight', 'bgPanelRight.png');
    this.load.image('buttonReject', 'buttonOff.png');
    this.load.image('buttonAccept', 'buttonOn.png');
    this.load.image('coinUi', 'coinUi.png');
    this.load.image('gemUi', 'gemUi.png');
    this.load.image('starUi', 'starUi.png');
    this.load.image('coinUi_empty', 'coinUi_empty.png');
    this.load.image('gemUi_empty', 'gemUi_empty.png');
    this.load.image('starUi_empty', 'starUi_empty.png');
    this.load.image('coinUi_accept', 'coinUi_accept.png');
    this.load.image('gemUi_accept', 'gemUi_accept.png');
    this.load.image('starUi_accept', 'starUi_accept.png');
    this.load.image('coinUi_zero', 'coinUi_zero.png');
    this.load.image('gemUi_zero', 'gemUi_zero.png');
    this.load.image('starUi_zero', 'starUi_zero.png');
  }

  public create(): void {
    const closeMenuKeyCode: number = Phaser.Input.Keyboard.KeyCodes.E;
    this.pauseKey = this.input.keyboard.addKey(closeMenuKeyCode);
    this.cameras.main.setBackgroundColor(); // set background of hud menu to transparent
    // eventsCenter.on(eventNames.updateCurrency, this.updateCurrencyWrapper, this);
    console.log("In obstacle fix screen");
    this.filler_text_string = 'Obstacle Fixing Menu';
    const textX = width / 2; 
    const textY = height / 3;
    this.filler_text = this.add.text(textX, textY, this.filler_text_string, {
      fontSize: textConfig.mainFontSize,
      color: textConfig.mainFillColor,
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
    // clear button click detection
    this.clear_button = this.add.sprite(100, height-150,'clear_button').setOrigin(0,0);
    this.clear_button.setInteractive({
      useHandCursor: true
    });
    this.clear_button.on('pointerover', this.onClearButtonHoverEnter, this);
    this.clear_button.on('pointerout', this.onClearButtonHoverExit, this);
    this.clear_button.on('pointerdown', this.clearButton, this);
    // left panel - showing the user how much currency they have
    this.backgroundPanel_left = this.add.sprite(0, (height/2), 'bgPanelLeft'); // new Phaser.GameObjects.Sprite(this, width-70, height-80, 'tablet_menu_background');
    // right panel - showing the user how much currency they have to pay
    this.backgroundPanel_right = this.add.sprite(width, (height/2), 'bgPanelRight');
    // button to show the state of if they've paid enough
    this.button_state_sprite = this.add.sprite(width, height, 'buttonReject');
    this.button_state_sprite.setPosition(width - this.button_state_sprite.width / 2 - 10, height - this.button_state_sprite.height / 6);
    // draggable currecny targets in order to accept payment
    // todo calc offset horiz for each type dept on tot #
    for(let i = 0; i < this.num_coins_needed; i++) {
      const temp_coinUiTarget_sprite = new DraggableCurrencyTarget(this, dc_target_x, coin_original_y, 'coinUi_empty', currency_type.coin);
      this.draggable_currency_targets.push(temp_coinUiTarget_sprite);
    }
    for(let i = 0; i < this.num_coins_needed; i++) {
      const temp_gemUiTarget_sprite = new DraggableCurrencyTarget(this, dc_target_x, gem_original_y, 'gemUi_empty', currency_type.gem);
      this.draggable_currency_targets.push(temp_gemUiTarget_sprite);
    }
    for(let i = 0; i < this.num_coins_needed; i++) {
      const temp_starUiTarget_sprite = new DraggableCurrencyTarget(this, dc_target_x, star_original_y, 'starUi_empty', currency_type.star);
      this.draggable_currency_targets.push(temp_starUiTarget_sprite);
    }
    // draggable currencies in order to pay
    const coinUi_zero_sprite = this.add.sprite(dc_original_x, coin_original_y, 'coinUi_zero');
    const temp_coinUi_sprite = new DraggableCurrency(this, dc_original_x, coin_original_y, 'coinUi', currency_type.coin, this.num_coins);
    this.draggable_currencies.push(temp_coinUi_sprite);
    const gemUi_zero_sprite = this.add.sprite(dc_original_x, gem_original_y, 'gemUi_zero');
    const temp_gemUi_sprite = new DraggableCurrency(this, dc_original_x, gem_original_y, 'gemUi', currency_type.gem, this.num_gems);
    this.draggable_currencies.push(temp_gemUi_sprite);
    const starUi_zero_sprite = this.add.sprite(dc_original_x, star_original_y, 'starUi_zero');
    const temp_starUi_sprite = new DraggableCurrency(this, dc_original_x, star_original_y, 'starUi', currency_type.star, this.num_stars);
    this.draggable_currencies.push(temp_starUi_sprite);
    // set the draggability of the user's currencies
    // https://photonstorm.github.io/phaser3-docs/Phaser.Input.Events.html#
    this.input.setDraggable(this.draggable_currencies);
    this.draggable_currencies.forEach((dc) => {
      // if (dc != null) {
        // this.input.setDraggable(dc);
        dc.on('dragstart', dc.startDrag, dc);
        dc.on('dragend', dc.stopDrag, dc);
        dc.on('drag', dc.doDrag, dc);
        dc.on('drop', dc.dragDrop, dc);
      // }
    }, this);

    // text for showing the user how much they have of each currency
    this.num_coins_str = `${this.num_coins}`;
    this.num_gems_str = `${this.num_gems}`;
    this.num_stars_str = `${this.num_stars}`;
    const currency_text_x = dc_original_x - 35;
    this.num_coins_text = this.add.text(currency_text_x, coin_original_y, this.num_coins_str, {
      fontSize: textConfig.mainFontSize,
      color: textConfig.mainFillColor,
      align: 'right',
    }).setOrigin(0.5); // set origin makes it so we can center the text easily
    this.num_coins_text.setScrollFactor(0);
    this.num_gems_text = this.add.text(currency_text_x, gem_original_y, this.num_gems_str, {
      fontSize: textConfig.mainFontSize,
      color: textConfig.mainFillColor,
      align: 'right',
    }).setOrigin(0.5); // set origin makes it so we can center the text easily
    this.num_gems_text.setScrollFactor(0);
    this.num_stars_text = this.add.text(currency_text_x, star_original_y, this.num_gems_str, {
      fontSize: textConfig.mainFontSize,
      color: textConfig.mainFillColor,
      align: 'right',
    }).setOrigin(0.5); // set origin makes it so we can center the text easily
    this.num_stars_text.setScrollFactor(0);
    console.log('end create');
    console.log(this.scene);
    this.updateCurrency();
  }

  public update(time: number): void {
    // this.updateCurrency();
    if (this.draggable_currencies.filter((dc) => {
      if(dc.updated_flag) {
        return true;
      }
      return false;
    }).length > 0 ) {
      this.updateCurrencyChangesFromDraggables();
    }
  }

  private onBackButtonHoverEnter(pointer: Phaser.Input.Pointer, localX: number, localY: number, event: Phaser.Types.Input.EventData): void {
    // this.back_button.setTexture('tablet_button_hover');
  }

  private onBackButtonHoverExit(pointer: Phaser.Input.Pointer, localX: number, localY: number, event: Phaser.Types.Input.EventData): void {
    // this.back_button.setTexture('tablet_button');
  }

  private goBackToLevel(): void {
    console.log('Back button pushed (from Obstacle Fix menu).');
    // todo, add a param to indicate success or not
    eventsCenter.emit(eventNames.closeObFixMenu); // enable the user to move the player again
  }

  private onSubmitButtonHoverEnter(pointer: Phaser.Input.Pointer, localX: number, localY: number, event: Phaser.Types.Input.EventData): void {
    // this.back_button.setTexture('tablet_button_hover');
  }

  private onSubmitButtonHoverExit(pointer: Phaser.Input.Pointer, localX: number, localY: number, event: Phaser.Types.Input.EventData): void {
    // this.back_button.setTexture('tablet_button');
  }

  private completeObstacle(): void {
    console.log('Submit button pushed (from Obstacle Fix menu).');
    // todo, add a param to indicate success or not'
    eventsCenter.emit(eventNames.closeObFixMenu); // enable the user to move the player again
  }

  private onClearButtonHoverEnter(pointer: Phaser.Input.Pointer, localX: number, localY: number, event: Phaser.Types.Input.EventData): void {
    // this.back_button.setTexture('tablet_button_hover');
  }

  private onClearButtonHoverExit(pointer: Phaser.Input.Pointer, localX: number, localY: number, event: Phaser.Types.Input.EventData): void {
    // this.back_button.setTexture('tablet_button');
  }

  private clearButton(): void {
    console.log('Clear button pushed.');
    // there's probs a better way to do this...
    let coins_cleared = 0;
    let gems_cleared = 0;
    let stars_cleared = 0;
    this.draggable_currency_targets.forEach((dct) => {
      if (dct.isFilled()) {
        dct.dump();
        switch(dct.get_currency_type()) {
          case currency_type.coin:
            coins_cleared++;
            break;
          case currency_type.gem:
            gems_cleared++;
            break; 
          case currency_type.star:
            stars_cleared++;
            break;
        }
      }
    });
    console.log(`${coins_cleared}; ${gems_cleared}; ${stars_cleared};`)
    // todo update the #s next to the currencies once created
    this.updateCurrencyChanges(coins_cleared, gems_cleared, stars_cleared);
  }

  private updateCurrencyChanges(change_coins: number, change_gems: number, change_stars: number):void {
    console.log('updateCurrency!')
    console.log(`${change_coins}; ${change_gems}; ${change_stars};`)
    this.num_coins += change_coins;
    this.num_coins_needed -= change_coins;
    this.num_gems += change_gems;
    this.num_gems_needed -= change_stars;
    this.num_stars += change_stars;
    this.num_stars_needed -= change_stars;
    this.draggable_currencies.forEach((dc) => {
      switch(dc.get_currency_type()) {
        case currency_type.coin:
          if (change_coins > 0) {
            for(let i = 0; i < change_coins; i++) {
              dc.increment_count();
            }
          } else {
            console.log("is negative???");
          }
          break;
        case currency_type.gem:
          if (change_gems > 0) {
            for(let i = 0; i < change_gems; i++) {
              dc.increment_count();
            }
          } else {
            console.log("is negative???");
          }
          break; 
        case currency_type.star:
          if (change_stars > 0) {
            for(let i = 0; i < change_stars; i++) {
              dc.increment_count();
            }
          } else {
            console.log("is negative???");
          }
          break;
      }
    });
    
    this.updateCurrency();
  }

  private updateCurrencyChangesFromDraggables(): void {
    this.draggable_currencies.forEach((dc) => {
      switch (dc.get_currency_type()) {
        case currency_type.coin:
          this.num_coins_needed -= (this.num_coins - dc.get_count());
          this.num_coins = dc.get_count();
          break;
        case currency_type.gem:
          this.num_gems_needed -= (this.num_gems - dc.get_count());
          this.num_gems = dc.get_count();
          break;
        case currency_type.star:
          this.num_stars_needed -= (this.num_stars - dc.get_count());
          this.num_stars = dc.get_count();
          break;
      }
    }, this);
    this.updateCurrency();
  }

  private updateCurrency():void {
    this.num_coins_str = `${this.num_coins}`;
    this.num_gems_str = `${this.num_gems}`;
    this.num_stars_str = `${this.num_stars}`;
    if (this.num_coins_text != null && this.num_gems_text != null && this.num_stars_text != null) {
      console.log('in here lolz');
      console.log(this);
      this.num_coins_text.setText(this.num_coins_str);
      this.num_gems_text.setText(this.num_gems_str);
      this.num_stars_text.setText(this.num_stars_str);
    }
  }

  private updateCurrencyWrapper(params: any): void {
    this.updateCurrencyChanges(params.change_coins, params.change_gems, params.change_stars);
  }

}
