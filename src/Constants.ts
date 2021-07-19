import 'phaser';

import ObstacleButton from './game/ObstacleButton';

const gameName: string = 'Ratio Rocket\nRescue';

const gravity: number = 500;

const width: number = 800; // game window width

const height: number = 600; // game window height

const mapWidth: number = 2100; // map width: 30 tiles * 70 px/tile = 2100 px

const mapHeight: number = 1400; // map height: 20 tiles * 70 px/tile = 1400 px

const groundDrag: number = 500;

const backgroundColor: string = '#40739e';

const altBackgroundColor: string = '#fbc531';

const assetBaseURL: string = './src/assets/';

const assetObsUiURL: string = `${assetBaseURL}obstacle_ui/`;

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
  creature: string
} = {
  laser: 'laser',
  base_ground: 'base',
  base_ceiling: 'base_down',
  lever: 'lever',
  creature: 'creature'
};

const tiledPropertyNames: {
  obstacleNum: string,
  platformMoveVertical: string,
  platformMoveHorizontal: string,
  part: string,
  player: string,
  opposite: string,
  possibleInputs: string,
} = {
  obstacleNum: 'obstacleNum',
  platformMoveVertical: 'moveVertical',
  platformMoveHorizontal: 'moveHorizontal',
  part: 'part',
  player: 'player',
  opposite: 'opposite',
  possibleInputs: 'possibleInputs_',
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
} = {
  mainGame: 'HomeScene',
  hudMenu: 'HudMenu',
  tabletMenu: 'TabletMenu',
  pause: 'PauseScene',
  win: 'LevelWin',
  obFixMenu: 'ObstacleFixMenu',
  start: 'Start',
  musicControl: 'MasterMusicControl',
};

const eventNames: {
  updateScoreText: string,
  setConversionValues: string,
  closeObFixMenu: string,
  updateCurrency: string,
  pauseGame: string
} = {
  updateScoreText: 'updateScoreText',
  setConversionValues: 'setConversionValues',
  closeObFixMenu: 'closeObsFixMenu',
  updateCurrency: 'updateCurrency',
  pauseGame: 'pause'
};

const possibleMapNumbers: number[] = [ 1, 2 ];

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
const screenEdgePadding: number = 10;
const dc_original_x: number = 70;
const dcm_original_x: number = dc_original_x + 120;
const dc_target_x: number = width * 2 / 3 + 70; // width / 2 + 20;//- 70;
const offset_y: number = 165;
const input_start_y: number = height / 4 + 20;

const offsetDraggable_y = 50;
const coinDraggable_original_y: number = 120;
const gemDraggable_original_y: number = coinDraggable_original_y + offsetDraggable_y;
const starDraggable_original_y: number = coinDraggable_original_y + (offsetDraggable_y * 2);

const gemToCoinConverter_original_y: number = height - (screenEdgePadding * 1.5) - (offsetDraggable_y * 3.33);// coinDraggable_original_y + (offsetDraggable_y * 4);
const starToCoinConverter_original_y: number = height - (screenEdgePadding * 1.5);// coinDraggable_original_y + (offsetDraggable_y * 6);

export {
  gameName,
  gravity,
  width,
  height,
  mapWidth,
  mapHeight,
  groundDrag,
  backgroundColor,
  altBackgroundColor,
  assetBaseURL,
  assetObsUiURL,
  pauseKeyCode,
  hudMenuSpriteY,
  hudMenuSpriteX,
  hudMenuSpriteXOffset,
  ScoreUpdate,
  initScore,
  numDifficulties,
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
  starToCoinConverter_original_y
};