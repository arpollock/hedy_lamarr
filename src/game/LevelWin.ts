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
  WinGameConfig,
  userMaxScoreFeedback,
  userImprovementTipIntros,
  userImprovementTips,
  ImprovementCategories,
  screenEdgePadding,
  ConversionConfig
} from './../Constants';


import {
  get_rand_map_number,
  get_rand_conversion_values
} from './../Utilities';

export class LevelWin extends Phaser.Scene {

  private text: Phaser.GameObjects.Text;
  private textString: string;

  private mainMenuButton: Phaser.GameObjects.Sprite;
  private playNewLevelButton: Phaser.GameObjects.Sprite;
  private playSameLevelButton: Phaser.GameObjects.Sprite;

  private previousLevelSeedData: MainGameConfig;
  private score: number;
  private maxScore: number;

  private scoreStar1: Phaser.GameObjects.Sprite;
  private scoreStar2: Phaser.GameObjects.Sprite;
  private scoreStar3: Phaser.GameObjects.Sprite;

  private feedbackText: Phaser.GameObjects.Text;
  private feedbackTextString: string;
  private scoreCategory: string;
  
  constructor() {
    super({
      key: sceneNames.win
    });
    this.mainMenuButton = null;
    this.playNewLevelButton = null;
    this.playSameLevelButton = null;
    this.score = 0;
    this.maxScore = 0;
    this.scoreStar1 = null;
    this.scoreStar2 = null;
    this.scoreStar3 = null;
    this.scoreCategory = ImprovementCategories.more_modules; // default
  }

  public init(data: WinGameConfig): void {
    
  }
  public preload(): void {
    this.load.setBaseURL(assetBaseURL);
    this.load.image('star_success', `${assetWinLevelUiURL}star_success.png`);
    this.load.image('star_fail', `${assetWinLevelUiURL}star_fail.png`);
  }

  public create(data: WinGameConfig): void {
    this.scene.stop(sceneNames.mainGame);
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
    if (data.num_obstacles_unlocked < (data.tot_num_obstacles / 2)) {
      this.scoreCategory = ImprovementCategories.more_obstacles;
    } else if ( ((data.num_coins_kept + data.num_gems_kept + data.num_stars_kept) < 5) && (data.num_converters_used > 2) ) {
      this.scoreCategory = ImprovementCategories.more_currency;
    }
    
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
    let maxScoreAchieved: boolean = false;
    if (percentage >= 1.00) {
      scoreStar1Str = 'star_success';
      scoreStar2Str = 'star_success';
      scoreStar3Str = 'star_success';
      maxScoreAchieved = true;
    } else if (percentage >= 0.75) {
      scoreStar1Str = 'star_success';
      scoreStar2Str = 'star_success';
    } else if (percentage >= 0.50) {
      scoreStar1Str = 'star_success';
    }
    this.scoreStar1 = this.add.sprite(scoreStarCenterX - horizontalOffset, scoreStarY, scoreStar1Str);
    this.scoreStar2 = this.add.sprite(scoreStarCenterX, scoreStarY, scoreStar2Str);
    this.scoreStar3 = this.add.sprite(scoreStarCenterX + horizontalOffset, scoreStarY, scoreStar3Str);

    // feedback text (score dependent)
    if (maxScoreAchieved) {
      this.feedbackTextString = userMaxScoreFeedback[Math.floor(Math.random() * userMaxScoreFeedback.length)];
    } else {
      // find out why they got the low score
      this.feedbackTextString = `${userImprovementTipIntros[Math.floor(Math.random() * userImprovementTipIntros.length)]} ${userImprovementTips[this.scoreCategory][Math.floor(Math.random() * userImprovementTips[this.scoreCategory].length)]}`;
    }
    const feedbackTextY = height * 2 / 3;
    this.text = this.add.text(centerX, feedbackTextY, this.feedbackTextString, {
      fontSize: textConfig.tertiaryTitleFontSize,
      color: textConfig.mainFillColor,
      fontFamily: textConfig.fontFams,
      align: 'center',
      wordWrap: { width: (width - screenEdgePadding * 6), }
    }).setOrigin(0.5); // set origin makes it so we can center the text easily
    this.text.setScrollFactor(0);

    // main menu button click detection
    const buttonsY: number = height * 5 / 6;
    
    const buttonCenterX: number = width / 2;
    // play again (new level) button click detection
    this.playNewLevelButton = this.add.sprite(buttonCenterX, buttonsY,'play_new_level').setOrigin(0.5);
    this.playNewLevelButton.setInteractive({
      useHandCursor: true
    });
    this.playNewLevelButton.on('pointerover', this.onPlayNewLevelButtonHoverEnter, this);
    this.playNewLevelButton.on('pointerout', this.onPlayNewLevelButtonHoverExit, this);
    this.playNewLevelButton.on('pointerdown', this.playNewLevel, this);

    const buttonLeftX: number = width / 2 - screenEdgePadding - this.playNewLevelButton.displayWidth; 
    this.mainMenuButton = this.add.sprite(buttonLeftX, buttonsY,'back_start_button').setOrigin(0.5);
    this.mainMenuButton.setInteractive({
      useHandCursor: true
    });
    this.mainMenuButton.on('pointerover', this.onMainMenuButtonHoverEnter, this);
    this.mainMenuButton.on('pointerout', this.onMainMenuButtonHoverExit, this);
    this.mainMenuButton.on('pointerdown', this.goToMainMenu, this);

    const buttonRightX: number = width / 2 + screenEdgePadding + this.playNewLevelButton.displayWidth; 
    // play again (same level) button click detection
    this.playSameLevelButton = this.add.sprite(buttonRightX, buttonsY,'play_same_level').setOrigin(0.5);
    this.playSameLevelButton.setInteractive({
      useHandCursor: true
    });
    this.playSameLevelButton.on('pointerover', this.onPlaySameLevelButtonHoverEnter, this);
    this.playSameLevelButton.on('pointerout', this.onPlaySameLevelButtonHoverExit, this);
    this.playSameLevelButton.on('pointerdown', this.playSameLevel, this);
  }

  public update(time: number): void {
    
  }

  private onMainMenuButtonHoverEnter(pointer: Phaser.Input.Pointer, localX: number, localY: number, event: Phaser.Types.Input.EventData): void { }

  private onMainMenuButtonHoverExit(pointer: Phaser.Input.Pointer, localX: number, localY: number, event: Phaser.Types.Input.EventData): void { }

  private goToMainMenu(): void {
    this.scene.launch(sceneNames.start);
    this.scene.stop(sceneNames.win);
  }

  private onPlayNewLevelButtonHoverEnter(pointer: Phaser.Input.Pointer, localX: number, localY: number, event: Phaser.Types.Input.EventData): void { }

  private onPlayNewLevelButtonHoverExit(pointer: Phaser.Input.Pointer, localX: number, localY: number, event: Phaser.Types.Input.EventData): void { }

  private getNewMapNumber(): number {
    let retVal: number = this.previousLevelSeedData.map_number;
    while(retVal === this.previousLevelSeedData.map_number) {
      retVal = get_rand_map_number();
    }
    return retVal;
  }

  private getNewConversionValues(): ConversionConfig {
    let retVal: ConversionConfig = this.previousLevelSeedData.conversion_values;
    while(retVal.valGems === this.previousLevelSeedData.conversion_values.valGems && retVal.valStars === this.previousLevelSeedData.conversion_values.valStars) {
      retVal = get_rand_conversion_values(this.previousLevelSeedData.grade_level);
    }
    return retVal;
  }

  // todo, currently startNewLevel and tryLevelAgain are not different
  private playNewLevel(): void {
    const map_number: number = this.getNewMapNumber();
    const conversion_values: ConversionConfig = this.getNewConversionValues();
    const newLevelSeedData: MainGameConfig = {
      grade_level: this.previousLevelSeedData.grade_level,
      map_number,
      conversion_values,
    };
    this.scene.launch(sceneNames.mainGame, newLevelSeedData);
    this.scene.stop(sceneNames.win);
  }

  private onPlaySameLevelButtonHoverEnter(pointer: Phaser.Input.Pointer, localX: number, localY: number, event: Phaser.Types.Input.EventData): void { }

  private onPlaySameLevelButtonHoverExit(pointer: Phaser.Input.Pointer, localX: number, localY: number, event: Phaser.Types.Input.EventData): void { }

  private playSameLevel(): void {
    this.scene.launch(sceneNames.mainGame, this.previousLevelSeedData);
    this.scene.stop(sceneNames.win);
  }

};