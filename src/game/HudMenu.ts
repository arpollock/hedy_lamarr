import 'phaser';
import eventsCenter from './EventsCenter';
import {
  sceneNames,
  width,
  height,
  textConfig,
  assetBaseURL,
  assetHudUiURL,
  eventNames,
  HudMenuConfig,
  hudMenuSpriteY,
  hudMenuSpriteX,
  hudMenuSpriteXOffset,
  ScoreUpdate,
  initScore,
  screenEdgePadding
} from './../Constants';

export class HudMenu extends Phaser.Scene {

  private initCoins: number;
  private initGems: number;
  private initStars: number;

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
    this.initCoins = initScore.coins;
    this.initGems = initScore.gems;
    this.initStars = initScore.stars;
    this.coinsText = null;
    this.gemsText = null;
    this.starsText = null;
  }

  public init(data: HudMenuConfig): void {
    
  }

  public preload(): void {
    this.load.setBaseURL(assetBaseURL);
    this.load.image('tablet_button', `${assetHudUiURL}tablet.png`);
    this.load.image('tablet_button_hover', `${assetHudUiURL}tablet_hover.png`);
    this.load.image('hud_menu_background', `${assetHudUiURL}currency_background.png`);
    this.load.image('pause_button', `${assetHudUiURL}pause.png`);
    this.load.image('pause_button_hover', `${assetHudUiURL}pause_hover.png`);
    this.cameras.main.setBackgroundColor(); // set background of hud menu to transparent
  }

  public create(data: HudMenuConfig): void {
    this.containsStars = data.containsStars;
    this.initCoins = data.coins;
    this.initGems = data.gems;
    this.initStars = data.stars;

    this.events.on('destroy', this.onDestroy, this);
    this.events.on('shutdown', this.onShutdown, this);

    eventsCenter.on(eventNames.updateScoreText, this.updateScoreText, this);

    this.openTabletMenu(); // start with the tablet menu open to show conversion values
    const hudPanelX: number = 10;
    const offsetY: number = 60;
    const hudPanelY: number = height - offsetY;
    const hudPanelBG: Phaser.GameObjects.Sprite = this.add.sprite(hudPanelX, hudPanelY, 'hud_menu_background');
    const hudPanelIconY: number = hudPanelY + offsetY / 2 + 5;
    const hudPanelIconX: number = hudPanelX + offsetY / 2 + 10;
    const hudPelIconXOffset: number = 115;
    const coinSprite: Phaser.GameObjects.Sprite = this.add.sprite(hudPanelIconX, hudPanelIconY, 'coinHud');
    // text to show coin score
    this.coinsText = this.add.text(hudMenuSpriteX, hudMenuSpriteY, `: ${this.initCoins}`, {
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
    const gemSprite: Phaser.GameObjects.Sprite = this.add.sprite(hudPanelIconX + hudPelIconXOffset, hudPanelIconY, 'gemHud');
    // text to show gem score
    this.gemsText = this.add.text(hudMenuSpriteX + hudMenuSpriteXOffset, hudMenuSpriteY, `: ${this.initGems}`, {
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
    if (this.containsStars) {
      const starSprite: Phaser.GameObjects.Sprite = this.add.sprite(hudPanelIconX + hudPelIconXOffset*2, hudPanelIconY, 'starHud');
      // text to show star score
      this.starsText = this.add.text(hudMenuSpriteX + hudMenuSpriteXOffset * 2, hudMenuSpriteY, `: ${this.initStars}`, {
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
    }
    hudPanelBG.setOrigin(0,0);

    this.tablet_button = this.add.sprite(width - screenEdgePadding, height - screenEdgePadding,'tablet_button').setOrigin(1);
    this.tablet_button.setInteractive({
      useHandCursor: true
    });
    this.tablet_button.on('pointerover', this.onTabletButtonHoverEnter, this);
    this.tablet_button.on('pointerout', this.onTabletButtonHoverExit, this);
    this.tablet_button.on('pointerdown', this.toggleTabletMenu, this);
    this.input.on('pointerdown', this.anyClickDetected, this); // detect a click outside of the buttons
    this.pause_button = this.add.sprite(screenEdgePadding, screenEdgePadding,'pause_button').setOrigin(0,1);
    this.pause_button.setY(screenEdgePadding+this.pause_button.displayHeight);
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
    // console.log('Updating score text with:');
    // console.log(scoreUpdate);
    if (this.coinsText) {
      this.coinsText.setText(`: ${scoreUpdate.coins}`);
    } 
    if (this.gemsText) {
      this.gemsText.setText(`: ${scoreUpdate.gems}`);
    }
    if (this.starsText) {
      this.starsText.setText(`: ${scoreUpdate.stars}`);
    }
  }

  private anyClickDetected(pointer: Phaser.Input.Pointer, localX: number, localY: number, event: Phaser.Types.Input.EventData) {
    if (this.tablet_menu_open) {
      this.closeTabletMenu();
    }
  }

  private openTabletMenu(): void {
    this.tablet_menu_open = true;
    this.scene.wake(sceneNames.tabletMenu);
    this.scene.bringToTop(sceneNames.tabletMenu);
  }

  private toggleTabletMenu(pointer: Phaser.Input.Pointer, localX: number, localY: number, event: Phaser.Types.Input.EventData) {
    event.stopPropagation(); // stop it from detecting a click elsewhere, which is used to close the menu
    if(!this.tablet_menu_open) {
      this.openTabletMenu();
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

  private onPauseButtonHoverEnter(pointer: Phaser.Input.Pointer, localX: number, localY: number, event: Phaser.Types.Input.EventData) {
    this.pause_button.setTexture('pause_button_hover');
  }

  private onPauseButtonHoverExit(pointer: Phaser.Input.Pointer, localX: number, localY: number, event: Phaser.Types.Input.EventData) {
    this.pause_button.setTexture('pause_button');
  }

  private pauseGame() {
    eventsCenter.emit(eventNames.pauseGame);
  }

  private onShutdown(): void {
    eventsCenter.off(eventNames.updateScoreText);
  }

  private onDestroy(): void {
    eventsCenter.off(eventNames.updateScoreText);
  }
}