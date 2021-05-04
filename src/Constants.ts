import 'phaser';

import ObstacleButton from './game/ObstacleButton';

const gravity: number = 500;

const width: number = 800; // game window width

const height: number = 600; // game window height

const mapWidth: number = 2100; // map width: 30 tiles * 70 px/tile = 2100 px

const mapHeight: number = 1400; // map height: 20 tiles * 70 px/tile = 1400 px

const groundDrag: number = 500;

const backgroundColor: string = '#40739e';

const assetBaseURL: string = './../tutorial/source/assets/';

const assetObsUiURL: string = `${assetBaseURL}obstacle_ui/`;

const pauseKeyCode: number = Phaser.Input.Keyboard.KeyCodes.ESC.valueOf();

const initScoreStr: string = `\t\t:0  \t\t:0  \t\t:0`;// `Coins: 0 Gems: 0 Stars: 0`;

// https://photonstorm.github.io/phaser3-docs/Phaser.Types.GameObjects.Text.html#.TextStyle
const textConfig: {
  mainFillColor: string,
  secondaryFillColor: string,
  mainFontSize: string,
  fontFams: string,
} = {
  mainFillColor: '#ffffff',
  secondaryFillColor: '#2f3640',
  mainFontSize: '32px',
  fontFams: '"Courier New", "Courier", "monospace"',
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

const sceneNames: {
  mainGame: string,
  hudMenu: string,
  tabletMenu: string,
  pause: string,
  win: string,
  obFixMenu: string
} = {
  mainGame: 'HomeScene',
  hudMenu: 'HudMenu',
  tabletMenu: 'TabletMenu',
  pause: 'PauseScene',
  win: 'LevelWin',
  obFixMenu: 'ObstacleFixMenu'
};

const eventNames: {
  updateScoreText: string,
  setConversionValues: string,
  closeObFixMenu: string,
  updateCurrency: string
} = {
  updateScoreText: 'updateScoreText',
  setConversionValues: 'setConversionValues',
  closeObFixMenu: 'closeObsFixMenu',
  updateCurrency: 'updateCurrency',
};

// describes the currency conversion values, in terms of how many coins they're worth
interface conversionConfig { 
  valGems: number,
  valStars: number,  
};

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
  conversions: conversionConfig
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
const dc_original_x: number = 70;
const dc_target_x: number = width - 70;
const gem_original_y: number = height / 2;
const offset_y = 100;
const coin_original_y: number = gem_original_y - offset_y;
const star_original_y: number = gem_original_y + offset_y;

const gemDraggable_original_y: number = height / 2;
const offsetDraggable_y = 100;
const coinDraggable_original_y: number = gem_original_y - offsetDraggable_y;
const starDraggable_original_y: number = gem_original_y + offsetDraggable_y;

const gemToCoinConverter_original_y: number = gem_original_y - (offsetDraggable_y * 3);
const starToCoinConverter_original_y: number = gem_original_y - (offsetDraggable_y * 4);

export {
  gravity,
  width,
  height,
  mapWidth,
  mapHeight,
  groundDrag,
  backgroundColor,
  assetBaseURL,
  assetObsUiURL,
  pauseKeyCode,
  initScoreStr,
  textConfig,
  partNames,
  sceneNames,
  eventNames,
  conversionConfig,
  PlayerConfig,
  ObFixConfig,
  numCurrencies,
  currency_type,
  currency_type_to_str,
  dc_original_x,
  dc_target_x,
  coin_original_y,
  gem_original_y,
  star_original_y,
  coinDraggable_original_y,
  gemDraggable_original_y,
  starDraggable_original_y,
  gemToCoinConverter_original_y,
  starToCoinConverter_original_y
 };