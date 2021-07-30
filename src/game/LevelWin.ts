import 'phaser';
import {
  assetBaseURL,
  assetWinLevelUiURL,
  sceneNames,
  backgroundColor,
  width,
  height,
  textConfig,
  MainGameConfig,
  WinGameConfig
} from './../Constants';
import { HudMenu } from './HudMenu';
import { TabletMenu } from './TabletMenu';
import { HomeScene } from './MainGame';

export class LevelWin extends Phaser.Scene {

  private text;
  private textString: string;

  private mainMenuButton: Phaser.GameObjects.Sprite;
  private playNewLevelButton: Phaser.GameObjects.Sprite;

  private previousLevelSeedData: MainGameConfig;
  private score: number;
  private maxScore: number;

  private scoreStar1: Phaser.GameObjects.Sprite;
  private scoreStar2: Phaser.GameObjects.Sprite;
  private scoreStar3: Phaser.GameObjects.Sprite;
  
  constructor() {
    super({
      key: sceneNames.win
    });
    this.mainMenuButton = null;
    this.playNewLevelButton = null;
    this.score = 0;
    this.maxScore = 0;
    this.scoreStar1 = null;
    this.scoreStar2 = null;
    this.scoreStar3 = null;
  }

  public init(data: WinGameConfig): void {
    this.previousLevelSeedData = data.previous_level_data;
    // todo calc score (0, 1, 2, or 3 stars) based on:
    // base score is: num_obstacles_unlocked / tot_num_obstacles
    // then the following values add on bonus points:
    // num_converters_used
    // num_coins_kept
    // num_gems_kept
    // num_stars_kept
    console.log("Level win!!!! Here's the data: ");
    console.log(data);
    const multiplier: number = 10;
    this.maxScore = data.tot_num_obstacles * multiplier + multiplier; // meaning they need to use some converters, etc. to get 3 stars
    this.score = data.num_obstacles_unlocked * multiplier;
    this.score += data.num_coins_kept;
    this.score += (data.num_gems_kept * data.previous_level_data.conversion_values.valGems);
    this.score += (data.num_stars_kept * data.previous_level_data.conversion_values.valStars);
    this.score += data.num_converters_used * (multiplier / 2);
  }
  public preload(): void {
    this.load.setBaseURL(assetBaseURL);
    this.load.image('star_success', `${assetWinLevelUiURL}star_success.png`);
    this.load.image('star_fail', `${assetWinLevelUiURL}star_fail.png`);
  }

  public create(): void {
    this.scene.remove(sceneNames.mainGame);
    this.scene.remove(sceneNames.hudMenu);
    this.scene.remove(sceneNames.tabletMenu);
    console.log('from win screen')
    this.cameras.main.setBackgroundColor(backgroundColor);
    // text to show pause menu text.
    this.textString = 'Rescue Complete. Mission Success.\nWoohoo!';
    const centerX = width / 2; 
    const textY = height / 6;
    this.text = this.add.text(centerX, textY, this.textString, {
      fontSize: textConfig.mainFontSize,
      color: textConfig.mainFillColor,
      fontFamily: textConfig.fontFams,
      align: 'center',
    }).setOrigin(0.5); // set origin makes it so we can center the text easily
    this.text.setScrollFactor(0);

    // calculate the user score and show them the # of stars they got
    const percentage: number = this.score / this.maxScore;
    const horizontalOffset: number = 210;
    const scoreStarY: number = height / 2 - 40;
    const scoreStarCenterX: number = width / 2;
    let scoreStar1Str: string = 'star_fail';
    let scoreStar2Str: string = 'star_fail';
    let scoreStar3Str: string = 'star_fail';
    if (percentage >= 1.00) {
      scoreStar1Str = 'star_success';
      scoreStar2Str = 'star_success';
      scoreStar3Str = 'star_success';
    } else if (percentage >= 0.75) {
      scoreStar1Str = 'star_success';
      scoreStar2Str = 'star_success';
    } else if (percentage >= 0.50) {
      scoreStar1Str = 'star_success';
    }
    this.scoreStar1 = this.add.sprite(scoreStarCenterX - horizontalOffset, scoreStarY, scoreStar1Str);
    this.scoreStar2 = this.add.sprite(scoreStarCenterX, scoreStarY, scoreStar2Str);
    this.scoreStar3 = this.add.sprite(scoreStarCenterX + horizontalOffset, scoreStarY, scoreStar3Str);

    // main menu button click detection
    const buttonsY: number = height * 5 / 6;
    const buttonLeftX: number = width / 3;
    const buttonRightX: number = width * 2 / 3;
    this.mainMenuButton = this.add.sprite(buttonLeftX, buttonsY,'main_menu_button').setOrigin(0.5);
    this.mainMenuButton.setInteractive({
      useHandCursor: true
    });
    this.mainMenuButton.on('pointerover', this.onMainMenuButtonHoverEnter, this);
    this.mainMenuButton.on('pointerout', this.onMainMenuButtonHoverExit, this);
    this.mainMenuButton.on('pointerdown', this.goToMainMenu, this);

    // play again (new level) button click detection
    this.playNewLevelButton = this.add.sprite(buttonRightX, buttonsY,'play_new_level').setOrigin(0.5);
    this.playNewLevelButton.setInteractive({
      useHandCursor: true
    });
    this.playNewLevelButton.on('pointerover', this.onPlayNewLevelButtonHoverEnter, this);
    this.playNewLevelButton.on('pointerout', this.onPlayNewLevelButtonHoverExit, this);
    this.playNewLevelButton.on('pointerdown', this.playNewLevel, this);
  }

  public update(time: number): void {
    
  }

  private onMainMenuButtonHoverEnter(pointer: Phaser.Input.Pointer, localX: number, localY: number, event: Phaser.Types.Input.EventData): void { }

  private onMainMenuButtonHoverExit(pointer: Phaser.Input.Pointer, localX: number, localY: number, event: Phaser.Types.Input.EventData): void { }

  private goToMainMenu(): void {
    this.scene.start(sceneNames.start);
  }

  private onPlayNewLevelButtonHoverEnter(pointer: Phaser.Input.Pointer, localX: number, localY: number, event: Phaser.Types.Input.EventData): void { }

  private onPlayNewLevelButtonHoverExit(pointer: Phaser.Input.Pointer, localX: number, localY: number, event: Phaser.Types.Input.EventData): void { }

  // todo, currently startNewLevel and tryLevelAgain are not different
  private playNewLevel(): void {
    this.scene.add(sceneNames.hudMenu, HudMenu, false);
    this.scene.add(sceneNames.tabletMenu, TabletMenu, false);
    this.scene.add(sceneNames.mainGame, HomeScene, false);
    this.scene.start(sceneNames.mainGame, this.previousLevelSeedData);
  }

  // cannot as-is try again once won, todo medium priority
  // private tryLevelAgain(): void {
  //   this.scene.start(sceneNames.mainGame, this.previousLevelSeedData);
  // }

};