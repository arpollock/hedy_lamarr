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

// todo, break these up into individual currencies and coordinates for hud menu
// const initScoreStr: string = `\t\t\t\t\t:0  \t\t\t\t\t\t\t\t:0  \t\t\t\t\t\t\t\t\t:0`;// `Coins: 0 Gems: 0 Stars: 0`;

// const initScoreStr_noStars: string = `\t\t\t\t\t:0  \t\t\t\t\t\t\t\t:0`;// `Coins: 0 Gems: 0`;

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
  fontFams: string,
} = {
  mainFillColor: '#ffffff',
  secondaryFillColor: '#2f3640',
  mainFontSize: '32px',
  mainTitleFontSize: '64px',
  secondaryTitleFontSize: '24px',
  fontFams: '"KenvectorFuture", "Courier New", "Courier", "monospace"',
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
} = {
  obstacleNum: 'obstacleNum',
  platformMoveVertical: 'moveVertical',
  platformMoveHorizontal: 'moveHorizontal',
  part: 'part',
  player: 'player',
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
  start: string
} = {
  mainGame: 'HomeScene',
  hudMenu: 'HudMenu',
  tabletMenu: 'TabletMenu',
  pause: 'PauseScene',
  win: 'LevelWin',
  obFixMenu: 'ObstacleFixMenu',
  start: 'Start'
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

// describes the currency conversion values, in terms of how many coins they're worth
interface MainGameConfig {
  grade_level: number
}

interface ConversionConfig { 
  valGems: number,
  valStars: number,  
};

interface HudMenuConfig {
  containsStars: boolean,
  coins: number,
  gems: number,
  stars: number
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
  stars: number
};

enum currency_type {
  coin,
  gem,
  star,
}

function currency_type_to_str(ct: currency_type): string {
  switch(ct) {
    case currency_type.coin:
      return 'coin';
    case currency_type.gem:
      return 'gem';
    case currency_type.star:
      return 'star';
  }
}

// obstacle fix constants
const screenEdgePadding: number = 10;
const dc_original_x: number = 70;
const dcm_original_x: number = dc_original_x + 50;
const dc_target_x: number = width / 2 + 20;//- 70;
const offset_y = 70 * 3;
const gem_original_y: number = height / 2 + 6;
const coin_original_y: number = gem_original_y - offset_y;
const star_original_y: number = gem_original_y + offset_y;

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
  // initScoreStr,
  // initScoreStr_noStars,
  numDifficulties,
  textConfig,
  partNames,
  tiledPropertyNames,
  tiledLayerNames,
  sceneNames,
  eventNames,
  MainGameConfig,
  ConversionConfig,
  HudMenuConfig,
  PlayerConfig,
  ObFixConfig,
  numCurrencies,
  currency_type,
  currency_type_to_str,
  screenEdgePadding,
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
  starToCoinConverter_original_y
};