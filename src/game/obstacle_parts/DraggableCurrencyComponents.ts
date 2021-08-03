import {
  sceneNames,
  currency_type,
  dc_original_x,
  dcm_original_x,
  coinDraggable_original_y,
  gemDraggable_original_y,
  starDraggable_original_y,
  gemToCoinConverter_original_y,
  starToCoinConverter_original_y,
  eventNames,
} from '../../Constants';

import {
  currency_type_to_str
} from './../../Utilities';

import eventsCenter from './../EventsCenter';


export class DraggableCurrencyTarget extends Phaser.GameObjects.Sprite {
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
    // this.removeDragDropTarget();
    this.setTexture(converter.texture.key);
    this.filled = true;
    this.converter = converter;
    // this.makeDragDropTarget();
    // console.log(converter);
  }

  public fillConverter(): void {
    const oldTextureStr: string = this.texture.key;
    const zeroIdx: number = oldTextureStr.indexOf('0')
    const newTextureStr: string = oldTextureStr.substring(0, zeroIdx) + '1' + oldTextureStr.substring(zeroIdx + 1);
    console.log(`${oldTextureStr} --> ${newTextureStr}`);
    this.setTexture(newTextureStr);
    // this.input.hitArea.setSize(this.displayWidth, this.displayHeight); // update the size of the drag drop hit area target
    // this.filled = true;
  }

  public dump(): void {
    if (this.filled) {
      this.removeDragDropTarget();
      this.setTexture(`${currency_type_to_str(this.ct)}Ui_empty`);
      this.filled = false;
      this.converter = null;
      this.makeDragDropTarget();
      // this.input.hitArea.setSize(this.displayWidth, this.displayHeight); // update the size of the drag drop hit area target
    }
  }

  private makeDragDropTarget(): void {
    this.setInteractive({
      useHandCursor: false,
      dropZone: true,
      customHitArea: true,
      hitArea: this.getBounds(),
    }, this.dropped_on, true);
    // console.log('Set drop target w:');
    // console.log(this.getBounds());
  }

  private removeDragDropTarget(): void {
    this.disableInteractive();
  }
}

export class DraggableCurrency extends Phaser.GameObjects.Sprite {
  public updated_flag: boolean;
  private ct: currency_type;
  private count: number;
  private sp: Phaser.Scenes.ScenePlugin;

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
    this.sp = scene.scene;
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
        eventsCenter.emit(eventNames.playDragDropSfx, { success: true} );
        // (this.sp.get(sceneNames.obFixMenu) as ObstacleFixMenu).playDragDropAcceptSFX();
      } else if ( target.isFilled() && target.hasConverter() ) {
        // target has a converter
        if (target.getConverter().getOutCt() === this.ct) {
          // dropped on a correct conversion slot
          if (target.texture.key.indexOf('0') > -1) {
            // there is an empty slot in the converter
            target.fillConverter();
            target.input.hitArea.setSize(target.displayWidth, target.displayHeight); // update the size of the drag drop hit area target
            this.decrement_count();
            eventsCenter.emit(eventNames.playDragDropSfx, { success: true} );
            // (this.sp.get(sceneNames.obFixMenu) as ObstacleFixMenu).playDragDropAcceptSFX();
          } else {
            eventsCenter.emit(eventNames.playDragDropSfx, { success: false} );
            // (this.sp.get(sceneNames.obFixMenu) as ObstacleFixMenu).playDragDropRejectSFX();
          }
        } else {
          eventsCenter.emit(eventNames.playDragDropSfx, { success: false} );
          // (this.sp.get(sceneNames.obFixMenu) as ObstacleFixMenu).playDragDropRejectSFX();
        }
      } else {
        eventsCenter.emit(eventNames.playDragDropSfx, { success: false} );
        // (this.sp.get(sceneNames.obFixMenu) as ObstacleFixMenu).playDragDropRejectSFX();
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

export class DraggableCurrencyConverter extends Phaser.GameObjects.Sprite {
  private in_ct: currency_type;
  private out_ct: currency_type;
  private sp: Phaser.Scenes.ScenePlugin;

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
    this.setInteractive({
      useHandCursor: true
    });
    this.setOrigin(0.5, 1); // bottom middle origin
    scene.add.existing(this);
    this.sp = scene.scene;
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
        eventsCenter.emit(eventNames.playDragDropSfx, { success: true} );
        // (this.sp.get(sceneNames.obFixMenu) as ObstacleFixMenu).playDragDropAcceptSFX();
      } else {
        eventsCenter.emit(eventNames.playDragDropSfx, { success: false} );
        // (this.sp.get(sceneNames.obFixMenu) as ObstacleFixMenu).playDragDropRejectSFX();
      }
    }
  }
}