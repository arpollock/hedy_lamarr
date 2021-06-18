import 'phaser';
import eventsCenter from './EventsCenter';
import ObstacleButton from './ObstacleButton';
import {
  sceneNames,
  assetObsUiURL,
  width,
  height,
  textConfig,
  ConversionConfig,
  ObFixConfig,
  eventNames,
  numCurrencies,
  currency_type,
  currency_type_to_str,
  dc_original_x,
  dc_target_x,
  dcm_original_x,
  coin_original_y,
  gem_original_y,
  star_original_y,
  coinDraggable_original_y,
  gemDraggable_original_y,
  starDraggable_original_y,
  gemToCoinConverter_original_y,
  starToCoinConverter_original_y,
  screenEdgePadding
} from '../Constants';

class DraggableCurrencyTarget extends Phaser.GameObjects.Sprite {
  private ct: currency_type;
  private filled: boolean;
  private converter: DraggableCurrencyConverter;

  constructor(scene: Phaser.Scene, x: number, y: number, texture: string, ct: currency_type) {
		super(scene, x, y, texture);
    this.ct = ct;
    this.filled = false;
    this.converter = null;
    this.setOrigin(0.5, 1); // bottom middle origin
    this.makeDragDropTarget();
    scene.add.existing(this);
	}

  public get_currency_type(): currency_type {
    return this.ct;
  }

  public dropped_on(): void { return; }

  public isFilled(): boolean {
    return this.filled;
  }

  public isConverterFull(): boolean {
    if (this.hasConverter()) {
      if (this.texture.key.indexOf('0') == -1) {
        return true;
      }
    }
    return false;
  }

  public hasConverter(): boolean {
    if (this.converter == null) {
      return false;
    }
    return true;
  }

  public getConverter(): DraggableCurrencyConverter {
    return this.converter;
  }

  public setFilled(): void {
    this.setTexture(`${currency_type_to_str(this.ct)}Ui_accept`);
    this.filled = true;
  }

  public setConverterFilled(converter: DraggableCurrencyConverter): void {
    this.removeDragDropTarget();
    this.setTexture(converter.texture.key);
    this.filled = true;
    this.converter = converter;
    this.makeDragDropTarget();
    // console.log(converter);
  }

  public fillConverter(): void {
    const oldTextureStr: string = this.texture.key;
    const zeroIdx: number = oldTextureStr.indexOf('0')
    const newTextureStr: string = oldTextureStr.substring(0, zeroIdx) + '1' + oldTextureStr.substring(zeroIdx + 1);
    console.log(`${oldTextureStr} --> ${newTextureStr}`);
    this.setTexture(newTextureStr);
    // this.filled = true;
  }

  public dump(): void {
    if (this.filled) {
      this.removeDragDropTarget();
      this.setTexture(`${currency_type_to_str(this.ct)}Ui_empty`);
      this.filled = false;
      this.converter = null;
      this.makeDragDropTarget();
    }
  }

  private makeDragDropTarget(): void {
    this.setInteractive({
      useHandCursor: false,
      dropZone: true,
      customHitArea: true,
      hitArea: this.getBounds(),
    }, this.dropped_on, true);
    console.log('Set drop target w:');
    console.log(this.getBounds());
  }

  private removeDragDropTarget(): void {
    this.disableInteractive();
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
        this.y = coinDraggable_original_y;
        break;
      case currency_type.gem:
        this.y = gemDraggable_original_y;
        break;
      case currency_type.star:
        this.y = starDraggable_original_y;
        break;
    };
  }

  public dragDrop(pointer: Phaser.Input.Pointer, target: Phaser.GameObjects.GameObject): void {
    console.log('currency dropped on: ');
    console.log(target);
    if (target != null && target instanceof DraggableCurrencyTarget) {
      if (target.get_currency_type() === this.ct && !(target.isFilled()) ) {
        // target does not have a converter
        // dropped on a correct, empty slot
        target.setFilled();
        this.decrement_count();
      } else if ( target.isFilled() && target.hasConverter() ) {
        // target has a converter
        if (target.getConverter().getOutCt() === this.ct) {
          // dropped on a correct conversion slot
          if (target.texture.key.indexOf('0') > -1) {
            // there is an empty slot in the converter
            target.fillConverter();
            this.decrement_count();
          }
        }
      } // dropped on a wrong currency type/converter -> ignore
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

class DraggableCurrencyConverter extends Phaser.GameObjects.Sprite {
  private in_ct: currency_type;
  private out_ct: currency_type;
  private needed: number;

  constructor(scene: Phaser.Scene, x: number, y: number, ict: currency_type, oct: currency_type, num_oct: number) {
    // const coversionVal: number = (currency_type_to_str(ict) === 'gem') ? ;
    let numZeros: string = '';
    for(let i = 0; i < num_oct; i++) {
      numZeros += '0';
    }
    const texture: string = `${currency_type_to_str(ict)}_${num_oct}${currency_type_to_str(oct)}_${numZeros}`;
		super(scene, x, y, texture);
    this.in_ct = ict;
    this.out_ct = oct;
    // this.needed = 
    this.setInteractive({
      useHandCursor: true
    });
    this.setOrigin(0.5, 1); // bottom middle origin
    scene.add.existing(this);
	}

  public getOutCt(): currency_type {
    return this.out_ct;
  }

  public startDrag(pointer: Phaser.Input.Pointer, dragX: number, dragY: number): void {
    // console.log('start converter drag');
  }

  public doDrag(pointer: Phaser.Input.Pointer, dragX: number, dragY: number): void {
    this.x = dragX;
    this.y = dragY;
  }

  public stopDrag(pointer: Phaser.Input.Pointer, dragX: number, dragY: number): void {
    // console.log('stop converter drag');
    this.x = dcm_original_x;
    switch(this.in_ct) {
      case currency_type.gem:
        this.y = gemToCoinConverter_original_y;
        break;
      case currency_type.star:
        this.y = starToCoinConverter_original_y;
        break;
    };
  }

  public dragDrop(pointer: Phaser.Input.Pointer, target: Phaser.GameObjects.GameObject): void {
    console.log('drop converter drag');
    if (target != null && target instanceof DraggableCurrencyTarget) {
      if (target.get_currency_type() === this.in_ct && !(target.isFilled())) { // dropped the converter on the right target
        // target.setFilled();
        target.setConverterFilled(this);
      }
    }
  }
}

export class ObstacleFixMenu extends Phaser.Scene {

  private pauseKey: Phaser.Input.Keyboard.Key;
  // private filler_text: Phaser.GameObjects.Text;
  // private filler_text_string: string;

  private back_button: Phaser.GameObjects.Sprite;
  private submit_button: Phaser.GameObjects.Sprite;
  private clear_button: Phaser.GameObjects.Sprite;

  private backgroundPanel_left: Phaser.GameObjects.Sprite;
  private backgroundPanel_right: Phaser.GameObjects.Sprite;
  private button_state_sprite: Phaser.GameObjects.Sprite;

  private conversion_values: ConversionConfig;

  private draggable_currencies: DraggableCurrency[];
  private draggable_currency_converters: DraggableCurrencyConverter[];
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

  private containsStars: boolean;

  private ob: ObstacleButton;

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
    this.draggable_currency_converters = [];
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

    this.ob = data.buttonObj;

    this.conversion_values = data.conversions;

    this.containsStars = data.containsStars;
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
    // converter module assets
    // 1 gem = 2 coin
    this.load.image('gem_2coin_00', 'gem_2coin_00.png');
    this.load.image('gem_2coin_10', 'gem_2coin_10.png');
    this.load.image('gem_2coin_11', 'gem_2coin_11.png');
    // 1 gem = 3 coin
    this.load.image('gem_3coin_000', 'gem_3coin_000.png');
    this.load.image('gem_3coin_100', 'gem_3coin_100.png');
    this.load.image('gem_3coin_110', 'gem_3coin_110.png');
    this.load.image('gem_3coin_111', 'gem_3coin_111.png');
    // 1 star = 3 coin
    this.load.image('star_3coin_000', 'star_3coin_000.png');
    this.load.image('star_3coin_100', 'star_3coin_100.png');
    this.load.image('star_3coin_110', 'star_3coin_110.png');
    this.load.image('star_3coin_111', 'star_3coin_111.png');
    // 1 star = 4 coin
    this.load.image('star_4coin_0000', 'star_4coin_0000.png');
    this.load.image('star_4coin_1000', 'star_4coin_1000.png');
    this.load.image('star_4coin_1100', 'star_4coin_1100.png');
    this.load.image('star_4coin_1110', 'star_4coin_1110.png');
    this.load.image('star_4coin_1111', 'star_4coin_1111.png');
  }

  public create(): void {
    const closeMenuKeyCode: number = Phaser.Input.Keyboard.KeyCodes.E;
    this.pauseKey = this.input.keyboard.addKey(closeMenuKeyCode);
    this.cameras.main.setBackgroundColor('rgba(0,0,0,0.5)'); // set background to be dark but transparent
    // left panel - showing the user how much currency they have
    this.backgroundPanel_left = this.add.sprite(0, (height/2) + 35, 'bgPanelLeft'); // new Phaser.GameObjects.Sprite(this, width-70, height-80, 'tablet_menu_background');
    // right panel - showing the user how much currency they have to pay
    this.backgroundPanel_right = this.add.sprite(width, (height/2), 'bgPanelRight');
    this.backgroundPanel_right.setX(width - (this.backgroundPanel_right.width / 3));
    // back button click detection
    this.back_button = this.add.sprite(screenEdgePadding, screenEdgePadding / 2,'back_button').setOrigin(0,0);
    this.back_button.setInteractive({
      useHandCursor: true
    });
    this.back_button.on('pointerover', this.onBackButtonHoverEnter, this);
    this.back_button.on('pointerout', this.onBackButtonHoverExit, this);
    this.back_button.on('pointerdown', this.goBackToLevel, this);
    // button to show the state of if they've paid enough
    this.button_state_sprite = this.add.sprite(width, height, 'buttonReject');
    this.button_state_sprite.setPosition(width - this.button_state_sprite.width / 2 - screenEdgePadding, height - this.button_state_sprite.height / 6);
    this.button_state_sprite.setDepth(80);
    // submit button click detection
    this.submit_button = this.add.sprite(width - this.button_state_sprite.width - (screenEdgePadding * 2), height - screenEdgePadding,'submit_button').setOrigin(1);
    this.submit_button.setInteractive({
      useHandCursor: true
    });
    this.submit_button.on('pointerover', this.onSubmitButtonHoverEnter, this);
    this.submit_button.on('pointerout', this.onSubmitButtonHoverExit, this);
    this.submit_button.on('pointerdown', this.completeObstacle, this);
    // hide the submit button until the criteria is met
    this.disableSubmit();
    // clear button click detection
    this.clear_button = this.add.sprite(width - screenEdgePadding, screenEdgePadding,'clear_button').setOrigin(1,0);
    this.clear_button.setInteractive({
      useHandCursor: true
    });
    this.clear_button.on('pointerover', this.onClearButtonHoverEnter, this);
    this.clear_button.on('pointerout', this.onClearButtonHoverExit, this);
    this.clear_button.on('pointerdown', this.clearButton, this);
    // draggable currency targets in order to accept payment
    // calc offset horiz for each type dept on tot #
    for(let i = 0; i < this.num_coins_needed; i++) {
      const temp_coinUiTarget_sprite = new DraggableCurrencyTarget(this, dc_target_x, coin_original_y, 'coinUi_empty', currency_type.coin);
      const offset_step = temp_coinUiTarget_sprite.width + 10;
      temp_coinUiTarget_sprite.setX(dc_target_x + offset_step * i);
      this.draggable_currency_targets.push(temp_coinUiTarget_sprite);
    }
    for(let i = 0; i < this.num_gems_needed; i++) {
      const temp_gemUiTarget_sprite = new DraggableCurrencyTarget(this, dc_target_x, gem_original_y, 'gemUi_empty', currency_type.gem);
      const offset_step = temp_gemUiTarget_sprite.width + 10;
      temp_gemUiTarget_sprite.setX(dc_target_x + offset_step * i);
      this.draggable_currency_targets.push(temp_gemUiTarget_sprite);
    }
    if (this.containsStars) {
      for(let i = 0; i < this.num_stars_needed; i++) {
        const temp_starUiTarget_sprite = new DraggableCurrencyTarget(this, dc_target_x, star_original_y, 'starUi_empty', currency_type.star);
        const offset_step = temp_starUiTarget_sprite.width + 10;
        temp_starUiTarget_sprite.setX(dc_target_x + offset_step * i);
        this.draggable_currency_targets.push(temp_starUiTarget_sprite);
      }
    }
    // draggable currencies in order to pay
    const coinUi_zero_sprite = this.add.sprite(dc_original_x, coinDraggable_original_y, 'coinUi_zero');
    const temp_coinUi_sprite = new DraggableCurrency(this, dc_original_x, coinDraggable_original_y, 'coinUi', currency_type.coin, this.num_coins);
    this.draggable_currencies.push(temp_coinUi_sprite);
    const gemUi_zero_sprite = this.add.sprite(dc_original_x, gemDraggable_original_y, 'gemUi_zero');
    const temp_gemUi_sprite = new DraggableCurrency(this, dc_original_x, gemDraggable_original_y, 'gemUi', currency_type.gem, this.num_gems);
    this.draggable_currencies.push(temp_gemUi_sprite);
    if (this.containsStars) {
      const starUi_zero_sprite = this.add.sprite(dc_original_x, starDraggable_original_y, 'starUi_zero');
      const temp_starUi_sprite = new DraggableCurrency(this, dc_original_x, starDraggable_original_y, 'starUi', currency_type.star, this.num_stars);
      this.draggable_currencies.push(temp_starUi_sprite);
    }
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
    this.num_stars_str = this.containsStars ? `${this.num_stars}` : '';
    const currency_text_x = dc_original_x - 45;
    this.num_coins_text = this.add.text(currency_text_x, coinDraggable_original_y, this.num_coins_str, {
      fontSize: textConfig.mainFontSize,
      color: textConfig.mainFillColor,
      align: 'right',
    }).setOrigin(0.5); // set origin makes it so we can center the text easily
    this.num_coins_text.setScrollFactor(0);
    this.num_gems_text = this.add.text(currency_text_x, gemDraggable_original_y, this.num_gems_str, {
      fontSize: textConfig.mainFontSize,
      color: textConfig.mainFillColor,
      align: 'right',
    }).setOrigin(0.5); // set origin makes it so we can center the text easily
    this.num_gems_text.setScrollFactor(0);
    this.num_stars_text = this.add.text(currency_text_x, starDraggable_original_y, this.num_stars_str, {
      fontSize: textConfig.mainFontSize,
      color: textConfig.mainFillColor,
      align: 'right',
    }).setOrigin(0.5); // set origin makes it so we can center the text easily
    this.num_stars_text.setScrollFactor(0);
    console.log('end create');
    console.log(this.scene);
    this.updateCurrency();

    // currency conversion modules -- so they can actually use and learn fractions
    const temp_gem_to_coin = new DraggableCurrencyConverter(this, dcm_original_x, gemToCoinConverter_original_y, currency_type.gem, currency_type.coin, this.conversion_values.valGems);
    this.draggable_currency_converters.push(temp_gem_to_coin);
    if (this.containsStars) {
      const temp_star_to_coin = new DraggableCurrencyConverter(this, dcm_original_x, starToCoinConverter_original_y, currency_type.star, currency_type.coin, this.conversion_values.valStars);
      this.draggable_currency_converters.push(temp_star_to_coin);
    }
    // set the draggability of the user's currencies
    // https://photonstorm.github.io/phaser3-docs/Phaser.Input.Events.html#
    this.input.setDraggable(this.draggable_currency_converters);
    this.draggable_currency_converters.forEach((dcc) => {
        dcc.on('dragstart', dcc.startDrag, dcc);
        dcc.on('dragend', dcc.stopDrag, dcc);
        dcc.on('drag', dcc.doDrag, dcc);
        dcc.on('drop', dcc.dragDrop, dcc);
    }, this);
    this.submit_button.setDepth(100); // bring to front
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
    eventsCenter.emit(eventNames.closeObFixMenu, { success: false, }); // enable the user to move the player again
  }

  // todo, set hover outlines for buttons, low priority
  private onSubmitButtonHoverEnter(pointer: Phaser.Input.Pointer, localX: number, localY: number, event: Phaser.Types.Input.EventData): void {
    // this.back_button.setTexture('tablet_button_hover');
  }

  private onSubmitButtonHoverExit(pointer: Phaser.Input.Pointer, localX: number, localY: number, event: Phaser.Types.Input.EventData): void {
    // this.back_button.setTexture('tablet_button');
  }

  private completeObstacle(): void {
    console.log('Submit button pushed (from Obstacle Fix menu).');
    const ncs: numCurrencies = this.countCurrencySpent();
    eventsCenter.emit(eventNames.closeObFixMenu, {
      success: true,
      num_coins_consumed: ncs.coins,
      num_gems_consumed: ncs.gems,
      num_stars_consumed: ncs.stars,
      buttonObj: this.ob,
    }); // enable the user to move the player again
  }

  private onClearButtonHoverEnter(pointer: Phaser.Input.Pointer, localX: number, localY: number, event: Phaser.Types.Input.EventData): void {
    // this.back_button.setTexture('tablet_button_hover');
  }

  private onClearButtonHoverExit(pointer: Phaser.Input.Pointer, localX: number, localY: number, event: Phaser.Types.Input.EventData): void {
    // this.back_button.setTexture('tablet_button');
  }

  private countCurrencySpent(): numCurrencies {
    let retVal: numCurrencies = {
      coins: 0,
      gems: 0,
      stars: 0
    };
    let coins_cleared = 0;
    let gems_cleared = 0;
    let stars_cleared = 0;
    this.draggable_currency_targets.forEach((dct) => {
      if ( dct.isFilled() ) {
        if ( !(dct.hasConverter()) ) {
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
        } else { // used a converter
          const currCt: currency_type = dct.getConverter().getOutCt();
          let numOnes: number = 0;
          for(let c of dct.texture.key) {
            if (c == '1') {
              numOnes++;
            }
          }
          switch(currCt) {
            case currency_type.coin:
              coins_cleared += numOnes;
              break;
            case currency_type.gem:
              coins_cleared += numOnes;
              break; 
            case currency_type.star:
              coins_cleared += numOnes;
              break;
          }
        }
        dct.dump();
      }
    });
    console.log(`${coins_cleared}; ${gems_cleared}; ${stars_cleared};`)
    retVal.coins = coins_cleared;
    retVal.gems = gems_cleared;
    retVal.stars = stars_cleared;
    return retVal;
  }

  private clearButton(): void {
    console.log('Clear button pushed.');
    // there's probs a better way to do this...
    const ncs: numCurrencies = this.countCurrencySpent();
    // update the #s next to the currencies once created
    this.updateCurrencyChanges(ncs.coins, ncs.gems, ncs.stars);
  }

  private getNeededCurrenciesFromTargets(): void {
    let new_num_coins: number = 0;
    let new_num_gems: number = 0;
    let new_num_stars: number = 0;
    this.draggable_currency_targets.forEach((dct) => {
      if (!(dct.isFilled())) {
        switch(dct.get_currency_type()) {
          case currency_type.coin:
            new_num_coins += 1;
            break;
          case currency_type.gem:
            new_num_gems += 1;
            break; 
          case currency_type.star:
            new_num_stars += 1;
            break;
        }
      } else if ( dct.isFilled() && dct.hasConverter() && !(dct.isConverterFull()) ) {
        switch(dct.get_currency_type()) {
          case currency_type.coin:
            new_num_coins += 1;
            break;
          case currency_type.gem:
            new_num_gems += 1;
            break; 
          case currency_type.star:
            new_num_stars += 1;
            break;
        }
      }
    });
    this.num_coins_needed = new_num_coins;
    this.num_gems_needed = new_num_gems;
    this.num_stars_needed = new_num_stars;
  }

  private updateCurrencyChanges(change_coins: number, change_gems: number, change_stars: number):void {
    // console.log('updateCurrency!')
    // console.log(`${change_coins}; ${change_gems}; ${change_stars};`)
    this.num_coins += change_coins;
    // this.num_coins_needed += change_coins;
    this.num_gems += change_gems;
    // this.num_gems_needed += change_gems;
    this.num_stars += change_stars;
    // this.num_stars_needed += change_stars;
    this.draggable_currencies.forEach((dc) => {
      switch(dc.get_currency_type()) {
        case currency_type.coin:
          if (change_coins > 0) {
            for(let i = 0; i < change_coins; i++) {
              dc.increment_count();
            }
          }
          break;
        case currency_type.gem:
          if (change_gems > 0) {
            for(let i = 0; i < change_gems; i++) {
              dc.increment_count();
            }
          }
          break; 
        case currency_type.star:
          if (change_stars > 0) {
            for(let i = 0; i < change_stars; i++) {
              dc.increment_count();
            }
          }
          break;
      }
    });
    this.getNeededCurrenciesFromTargets();
    this.updateCurrency();
  }

  private updateCurrencyChangesFromDraggables(): void {
    // console.log(`Before needed: ${this.num_coins_needed}; ${this.num_gems_needed}; ${this.num_stars_needed}`);
    // todo, need to fix this to understand when a currency is being used in a conversion
    this.draggable_currencies.forEach((dc) => {
      dc.updated_flag = false;
      switch (dc.get_currency_type()) {
        case currency_type.coin:
          // this.num_coins_needed -= (this.num_coins - dc.get_count());
          this.num_coins = dc.get_count();
          break;
        case currency_type.gem:
          // this.num_gems_needed -= (this.num_gems - dc.get_count());
          this.num_gems = dc.get_count();
          break;
        case currency_type.star:
          // this.num_stars_needed -= (this.num_stars - dc.get_count());
          this.num_stars = dc.get_count();
          break;
      }
    }, this);
    this.getNeededCurrenciesFromTargets();
    console.log(`After needs: ${this.num_coins_needed}; ${this.num_gems_needed}; ${this.num_stars_needed}`);
    this.updateCurrency();
  }

  private areAllZero(conds: number[]): boolean {
    for(const cond of conds ) {
      if (cond != 0) {
        return false;
      }
    }
    return true;
  }

  private disableSubmit(): void {
    this.submit_button.setVisible(false);
    this.submit_button.disableInteractive();
    this.button_state_sprite.setTexture('buttonReject');
  }

  private enableSubmit(): void {
    this.submit_button.setVisible(true);
    this.submit_button.setInteractive();
    this.button_state_sprite.setTexture('buttonAccept');
  }

  private updateCurrency(): void {
    if (this.areAllZero([this.num_coins_needed, this.num_gems_needed, this.num_stars_needed])) {
      this.enableSubmit();
    } else {
      this.disableSubmit();
    }
    this.num_coins_str = `${this.num_coins}`;
    this.num_gems_str = `${this.num_gems}`;
    this.num_stars_str = this.containsStars ? `${this.num_stars}` : '';
    if (this.num_coins_text != null && this.num_gems_text != null && this.num_stars_text != null) {
      this.num_coins_text.setText(this.num_coins_str);
      this.num_gems_text.setText(this.num_gems_str);
      this.num_stars_text.setText(this.num_stars_str);
    }
  }
}
