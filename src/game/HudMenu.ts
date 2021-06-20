import 'phaser';
import eventsCenter from './EventsCenter';
import {
  sceneNames,
  width,
  height,
  textConfig,
  assetBaseURL,
  eventNames,
  HudMenuConfig,
  hudMenuSpriteY,
  hudMenuSpriteX,
  hudMenuSpriteXOffset,
  ScoreUpdate,
  initScore
} from './../Constants';

export class HudMenu extends Phaser.Scene {

  private coinsText: Phaser.GameObjects.Text;
  private gemsText: Phaser.GameObjects.Text;
  private starsText: Phaser.GameObjects.Text;

  private tablet_button: Phaser.GameObjects.Sprite;
  private tablet_menu_open: boolean;

  private pause_button: Phaser.GameObjects.Sprite;

  private containsStars: boolean;

  constructor() {
    super({
      key: sceneNames.hudMenu
    });
    this.tablet_menu_open = false;
  }

  public init(data: HudMenuConfig): void {
    eventsCenter.on(eventNames.updateScoreText, this.updateScoreText, this);
    this.containsStars = data.containsStars;
  }

  public preload(): void {
    
    this.load.setBaseURL(assetBaseURL);
    this.load.image('tablet_button', 'tablet.png');
    this.load.image('tablet_button_hover', 'tablet_hover.png');
    this.load.image('hud_menu_background', 'menuPanel_tab.png');
    this.load.image('pause_button', 'pause.png');
    this.load.image('coinHud', 'coin.png');
    this.load.image('gemHud', 'gem.png');
    this.load.image('starHud', 'star.png');
    this.cameras.main.setBackgroundColor(); // set background of hud menu to transparent
  }

  public create(): void {
    this.events.on('sleep', this.onSleep, this);
    const hudPanelX: number = 10;
    const offsetY: number = 60;
    const hudPanelY: number = height - offsetY;
    const hudPanelBG: Phaser.GameObjects.Sprite = this.add.sprite(hudPanelX, hudPanelY, 'hud_menu_background');
    const hudPanelIconY: number = hudPanelY + offsetY / 2 + 5;
    const hudPanelIconX: number = hudPanelX + offsetY / 2 + 10;
    const hudPelIconXOffset: number = 115;
    const coinSprite: Phaser.GameObjects.Sprite = this.add.sprite(hudPanelIconX, hudPanelIconY, 'coinHud');
    const gemSprite: Phaser.GameObjects.Sprite = this.add.sprite(hudPanelIconX + hudPelIconXOffset, hudPanelIconY, 'gemHud');
    if (this.containsStars) {
      const starSprite: Phaser.GameObjects.Sprite = this.add.sprite(hudPanelIconX + hudPelIconXOffset*2, hudPanelIconY, 'starHud');
    }
    hudPanelBG.setOrigin(0,0);
    // text to show scores
    this.coinsText = this.add.text(hudMenuSpriteX, hudMenuSpriteY, `: ${initScore.coins}`, {
      fontSize: textConfig.mainFontSize,
      color: textConfig.secondaryFillColor,
      fontFamily: textConfig.fontFams,
      padding: {
        x: 0,
        y:0,
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
      },
    });
    this.coinsText.setScrollFactor(0);
    this.gemsText = this.add.text(hudMenuSpriteX + hudMenuSpriteXOffset, hudMenuSpriteY, `: ${initScore.gems}`, {
      fontSize: textConfig.mainFontSize,
      color: textConfig.secondaryFillColor,
      fontFamily: textConfig.fontFams,
      padding: {
        x: 0,
        y:0,
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
      },
    });
    this.gemsText.setScrollFactor(0);
    this.starsText = this.add.text(hudMenuSpriteX + hudMenuSpriteXOffset * 2, hudMenuSpriteY, `: ${initScore.stars}`, {
      fontSize: textConfig.mainFontSize,
      color: textConfig.secondaryFillColor,
      fontFamily: textConfig.fontFams,
      padding: {
        x: 0,
        y:0,
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
      },
    });
    this.starsText.setScrollFactor(0);

    this.tablet_button = this.add.sprite(width-70, height-70,'tablet_button');
    this.tablet_button.setInteractive({
      useHandCursor: true
    });
    this.tablet_button.on('pointerover', this.onTabletButtonHoverEnter, this);
    this.tablet_button.on('pointerout', this.onTabletButtonHoverExit, this);
    this.tablet_button.on('pointerdown', this.toggleTabletMenu, this);
    this.input.on('pointerdown', this.anyClickDetected, this); // detect a click outside of the buttons
    this.pause_button = this.add.sprite(10, 10,'pause_button').setOrigin(0);
    this.pause_button.setInteractive({
      useHandCursor: true
    });
    this.pause_button.on('pointerover', this.onPauseButtonHoverEnter, this);
    this.pause_button.on('pointerout', this.onPauseButtonHoverExit, this);
    this.pause_button.on('pointerdown', this.pauseGame, this);
  }

  public update(time: number): void {
    if (Phaser.Input.Keyboard.JustDown(this.input.keyboard.addKey('P'))) {
      console.log("score text debug");
    }
  }

  private updateScoreText(scoreUpdate: ScoreUpdate): void {
    this.coinsText.setText(`: ${scoreUpdate.coins}`);
    this.gemsText.setText(`: ${scoreUpdate.gems}`);
    this.starsText.setText(`: ${scoreUpdate.stars}`);
  }

  private anyClickDetected(pointer: Phaser.Input.Pointer, localX: number, localY: number, event: Phaser.Types.Input.EventData) {
    if (this.tablet_menu_open) {
      this.closeTabletMenu();
    }
    // console.log(`click at: ${pointer.x}, ${pointer.y}`);
  }

  private toggleTabletMenu(pointer: Phaser.Input.Pointer, localX: number, localY: number, event: Phaser.Types.Input.EventData) {
    this.tablet_menu_open = !(this.tablet_menu_open);
    // console.log(`toggling tablet menu to: ${this.tablet_menu_open}`);
    event.stopPropagation(); // stop it from detecting a click elsewhere, which is used to close the menu
    if(this.tablet_menu_open) {
      this.scene.launch(sceneNames.tabletMenu);
      this.scene.bringToTop(sceneNames.tabletMenu);
    } else {
      this.closeTabletMenu();
    }
  }

  private onTabletButtonHoverEnter(pointer: Phaser.Input.Pointer, localX: number, localY: number, event: Phaser.Types.Input.EventData) {
    this.tablet_button.setTexture('tablet_button_hover');
  }

  private onTabletButtonHoverExit(pointer: Phaser.Input.Pointer, localX: number, localY: number, event: Phaser.Types.Input.EventData) {
    this.tablet_button.setTexture('tablet_button');
  }

  private closeTabletMenu() {
    this.tablet_menu_open = false;
    this.scene.sleep(sceneNames.tabletMenu);
  }

  private onPauseButtonHoverEnter(pointer: Phaser.Input.Pointer, localX: number, localY: number, event: Phaser.Types.Input.EventData) { }

  private onPauseButtonHoverExit(pointer: Phaser.Input.Pointer, localX: number, localY: number, event: Phaser.Types.Input.EventData) { }

  private pauseGame() {
    eventsCenter.emit(eventNames.pauseGame);
  }

  private onSleep(): void {
    this.closeTabletMenu();
  }
}