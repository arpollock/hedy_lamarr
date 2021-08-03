import 'phaser';

import ObstacleButton from './game/platformer_parts/ObstacleButton';

const gameName: string = 'Ratio Rocket\nRescue';

const gravity: number = 500;

const width: number = 880; // 900; //800; // game window width

const height: number = 660; // 675; // 600; // game window height

const mapWidth: number = 2100; // map width: 30 tiles * 70 px/tile = 2100 px

const mapHeight: number = 1400; // map height: 20 tiles * 70 px/tile = 1400 px

const groundDrag: number = 500;

const zoomFactors: {
  mainPlay: number,
  viewWorld: number,
} = {
  mainPlay: 0.5,
  viewWorld: 0.3,
};

// const maxObstaclesAllowed: number = 4;

const backgroundColor: string = '#40739e';

const altBackgroundColor: string = '#fbc531';

const assetBaseURL: string = './src/assets/';

const assetObsUiURL: string = `${assetBaseURL}obstacle_ui/`;

const assetHudUiURL: string = `hud_ui/`;

const assetTabletUiURL: string = `tablet_ui/`;

const assetGameControlUiUrl: string = `game_control_ui/`;

const assetWinLevelUiURL: string = `win_level_ui/`;

const assetTutorialUiURL: string = `tutorial_ui/`;

const pauseKeyCode: number = Phaser.Input.Keyboard.KeyCodes.ESC.valueOf();

const hudMenuSpriteY: number = height - 40;
const hudMenuSpriteX: number = 75;
const hudMenuSpriteXOffset: number = 115;

interface ScoreUpdate {
  coins: number,
  gems: number,
  stars: number,
}

const initScore: ScoreUpdate = {
  coins: 0,
  gems: 0,
  stars: 0,
};

const numDifficulties: number = 3; // 3, 4, 5 grade

const numObstacleColors: number = 4;

const numTutorialScreens: number = 11;

enum TutorialTextPositions {
  top_right,
  bottom_left,
  top_left
}

enum TutorialTextBackgroundSizes {
  small,
  large
}

const tutorialTextObjects: { // todo wip
  screen: number,
  text: string,
  position: TutorialTextPositions,
  size: TutorialTextBackgroundSizes,
}[] = [
  {
    screen: 0,
    text: 'Hello! This is you.',
    position: 0,
    size: 1,
  },
  {
    screen: 0,
    text: 'These are Snufflebubs. They were stolen from your home planet and taken to this weird world. ):\nIt is up to you to save them!',
    position: 1,
    size: 1,
  },
  {
    screen: 1,
    text: 'Unfortunately, a number of obstacles are in between you and the Snufflebubs...',
    position: 0,
    size: 0,
  },
  {
    screen: 2,
    text: 'Thankfully there is a way to unlock these obstacles! You just need pay the needed amount. You will need to collect coins, gems, and stars throughout the world for this.',
    position: 2,
    size: 1,
  },
  {
    screen: 3,
    text: 'So, use your keyboard\'s arrow keys to navigate the world, collect currency, unlock obstacles, and save the Snufflebubs!',
    position: 0,
    size: 0,
  },
  {
    screen: 4,
    text: 'You will unlock obstacles by dragging your currency into each obstacle\'s input slot(s).',
    position: 0,
    size: 0,
  },
  {
    screen: 4,
    text: 'And don\'t worry if you don\'t have any gems or stars...',
    position: 1,
    size: 0,
  },
  {
    screen: 5,
    text: 'You can use converter modules to trade coins in! But watch out: the value of coins to gems and stars changes with each Snufflebub rescue.',
    position: 0,
    size: 0,
  },
  {
    screen: 6,
    text: 'There will be 3 types of obstacles: laser doors, moving platforms, and barriers.',
    position: 0,
    size: 0,
  },
  {
    screen: 7,
    text: 'Laser doors and moving platforms can be turned on by buttons once unlocked.',
    position: 0,
    size: 0,
  },
  {
    screen: 8,
    text: 'Barriers, on the otherhand, are controlled by switches.',
    position: 0,
    size: 0,
  },
  {
    screen: 9,
    text: 'Unlike buttons, switches can be turned off again once unlocked and activated.',
    position: 0,
    size: 0,
  },
  {
    screen: 10,
    text: 'So get out there and save those Snufflebubs! We\'re counting on you! And remember, as an alien you can jump twice before you need to touch the ground again!',
    position: 0,
    size: 0,
  },
];

// https://photonstorm.github.io/phaser3-docs/Phaser.Types.GameObjects.Text.html#.TextStyle
const textConfig: {
  mainFillColor: string,
  secondaryFillColor: string,
  mainFontSize: string,
  mainTitleFontSize: string,
  secondaryTitleFontSize: string,
  tertiaryTitleFontSize: string,
  fontFams: string,
} = {
  mainFillColor: '#ffffff',
  secondaryFillColor: '#2f3640',
  mainFontSize: '32px',
  mainTitleFontSize: '64px',
  secondaryTitleFontSize: '48px',
  tertiaryTitleFontSize: '24px',
  fontFams: '"KenvectorFuture", "Courier New", "Courier", "monospace"',
};

const musicKeyNames: {
  intro: string,
  collectSFX: string,
  obstacleUnlockSFX: string,
  winGameSFX: string,
  dropAccept: string,
  dropReject: string,
} = {
  intro: 'intro',
  collectSFX: 'collect',
  obstacleUnlockSFX: 'unlock',
  winGameSFX: 'win',
  dropAccept: 'accept',
  dropReject: 'reject',
};

const partNames: {
  laser: string,
  base_ground: string,
  base_ceiling: string,
  lever: string,
  creature: string,
  platform: string,
  barrier: string,
  door: string,
} = {
  laser: 'laser',
  base_ground: 'base',
  base_ceiling: 'base_down',
  lever: 'lever',
  creature: 'creature',
  platform: 'platform',
  barrier: 'barrier',
  door: 'door',
};

const tiledPropertyNames: {
  obstacleNum: string,
  platformMoveVertical: string,
  platformMoveHorizontal: string,
  part: string,
  player: string,
  opposite: string,
  possibleInputs: string,
  userTogglable: string,
  defaultState: string,
} = {
  obstacleNum: 'obstacleNum',
  platformMoveVertical: 'moveVertical',
  platformMoveHorizontal: 'moveHorizontal',
  part: 'part',
  player: 'player',
  opposite: 'opposite',
  possibleInputs: 'possibleInputs_',
  userTogglable: 'userTogglable',
  defaultState: 'defaultState',
};

const tiledLayerNames : {
  world: string,
  playerStart: string,
  coins: string,
  gems: string,
  stars: string,
  movingPlatforms: string,
  buttons: string,
  doors: string,
  goal: string,
  barriers: string,
} = {
  world: 'World',
  playerStart: 'PlayerStart',
  coins: 'Coins',
  gems: 'Gems',
  stars: 'Stars',
  movingPlatforms: 'Platforms',
  buttons: 'Buttons',
  doors: 'Doors',
  goal: 'Goal',
  barriers: 'Barriers',
};

const sceneNames: {
  mainGame: string,
  hudMenu: string,
  tabletMenu: string,
  pause: string,
  win: string,
  obFixMenu: string,
  start: string,
  musicControl: string,
  tutorial: string
} = {
  mainGame: 'HomeScene',
  hudMenu: 'HudMenu',
  tabletMenu: 'TabletMenu',
  pause: 'PauseScene',
  win: 'LevelWin',
  obFixMenu: 'ObstacleFixMenu',
  start: 'Start',
  musicControl: 'MasterMusicControl',
  tutorial: 'tutorial',
};

const eventNames: {
  updateScoreText: string,
  setConversionValues: string,
  closeObFixMenu: string,
  updateCurrency: string,
  pauseGame: string
  cameraFollowPlayer: string,
} = {
  updateScoreText: 'updateScoreText',
  setConversionValues: 'setConversionValues',
  closeObFixMenu: 'closeObsFixMenu',
  updateCurrency: 'updateCurrency',
  pauseGame: 'pause',
  cameraFollowPlayer: 'cameraFollowPlayer',
};

const possibleMapNumbers: number[] = [ 1, 2, 3, 4, 5, 6, 7, 8 ];

// describes the currency conversion values, in terms of how many coins they're worth
interface ConversionConfig { 
  valGems: number,
  valStars: number,  
};

interface MainGameConfig {
  grade_level: number,
  map_number: number,
  conversion_values: ConversionConfig;
}

interface WinGameConfig {
  previous_level_data: MainGameConfig,
  num_converters_used: number,
  num_coins_kept: number,
  num_gems_kept: number,
  num_stars_kept: number,
  num_obstacles_unlocked: number,
  tot_num_obstacles: number,
}

interface HudMenuConfig {
  containsStars: boolean,
  coins: number,
  gems: number,
  stars: number
}

interface CloseObstacleMenuConfig {
  success: boolean,
  num_coins_consumed?: number,
  num_gems_consumed?: number,
  num_stars_consumed?: number,
  num_converters?: number,
  buttonObj?: ObstacleButton
}

interface PlayerConfig {
  x: number,
  y: number,
  width: number,
  height: number,
  speed: number,
  numJumps: number,
  maxJumps: number,
  flipX: boolean,
  walkFrameRate: number,
};

interface ObFixConfig {
  numCoins: number,
  numGems: number,
  numStars: number,
  goalCoins: number,
  goalGems: number,
  goalStars: number,
  buttonObj: ObstacleButton,
  conversions: ConversionConfig,
  containsStars: boolean
};

interface numCurrencies {
  coins: number,
  gems: number,
  stars: number,
  converters?: number
};

enum currency_type {
  coin,
  gem,
  star,
}

// obstacle fix constants
const sprite_size: number = 70;
const screenEdgePadding: number = 10;
const dc_original_x: number = 110;
const dcm_original_x: number = dc_original_x + sprite_size;
const dc_target_x: number = width * 2 / 3 + sprite_size; // width / 2 + 20;//- 70;
const offset_y: number = 165;
const input_start_y: number = height / 4 + 30;

const offsetDraggable_y = 50;
const coinDraggable_original_y: number = 150;
const gemDraggable_original_y: number = coinDraggable_original_y + offsetDraggable_y;
const starDraggable_original_y: number = coinDraggable_original_y + (offsetDraggable_y * 2);

const module_shift_up: number = screenEdgePadding * 5;
const gemToCoinConverter_original_y: number = height - module_shift_up - (offsetDraggable_y * 3.33);// coinDraggable_original_y + (offsetDraggable_y * 4);
const starToCoinConverter_original_y: number = height - module_shift_up;// coinDraggable_original_y + (offsetDraggable_y * 6);

const userMaxScoreFeedback: string[] = ['Impressive!', 'That was out of this world!', '3 stars?! Your skills are off the charts.'];

const userImprovementTipIntros: string[] = ['Good Try!', 'Nice Job! Want to go for 3 stars?', 'Impressive! You\'re getting better at this.'];

const ImprovementCategories: {
  more_modules: string,
  more_obstacles: string,
  more_currency: string,
} = {
  more_modules: 'more_modules',
  more_obstacles: 'more_obstacles',
  more_currency: 'more_currency',
};

const userImprovementTips: {
  more_modules: string[],
  more_obstacles: string[],
  more_currency: string[],
} = {
  more_modules: ['Use more converters to boost your score!', 'Try exchaning more coins when you need to spend gems!'],
  more_obstacles: ['Try to bypass more obstacles next time!'],
  more_currency: ['Have more coins, gems, and stars saved at the end!', 'Collect more currencies to boost your score!'],
};

export {
  gameName,
  gravity,
  width,
  height,
  mapWidth,
  mapHeight,
  groundDrag,
  // maxObstaclesAllowed,
  backgroundColor,
  altBackgroundColor,
  assetBaseURL,
  assetObsUiURL,
  assetHudUiURL,
  assetTabletUiURL,
  assetGameControlUiUrl,
  assetWinLevelUiURL,
  assetTutorialUiURL,
  pauseKeyCode,
  hudMenuSpriteY,
  hudMenuSpriteX,
  hudMenuSpriteXOffset,
  ScoreUpdate,
  initScore,
  numDifficulties,
  numObstacleColors,
  numTutorialScreens,
  tutorialTextObjects,
  textConfig,
  musicKeyNames,
  partNames,
  tiledPropertyNames,
  tiledLayerNames,
  sceneNames,
  eventNames,
  possibleMapNumbers,
  MainGameConfig,
  WinGameConfig,
  ConversionConfig,
  HudMenuConfig,
  CloseObstacleMenuConfig,
  PlayerConfig,
  ObFixConfig,
  numCurrencies,
  currency_type,
  screenEdgePadding,
  dc_original_x,
  dc_target_x,
  dcm_original_x,
  offset_y,
  input_start_y,
  coinDraggable_original_y,
  gemDraggable_original_y,
  starDraggable_original_y,
  gemToCoinConverter_original_y,
  starToCoinConverter_original_y,
  zoomFactors,
  userMaxScoreFeedback,
  userImprovementTipIntros,
  ImprovementCategories,
  userImprovementTips
};