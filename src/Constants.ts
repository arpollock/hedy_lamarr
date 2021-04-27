import 'phaser';

const gravity: number = 500;

const width: number = 800; // game window width

const height: number = 600; // game window height

const mapWidth: number = 2100; // map width: 30 tiles * 70 px/tile = 2100 px

const mapHeight: number = 1400; // map height: 20 tiles * 70 px/tile = 1400 px

const groundDrag: number = 500;

const backgroundColor: string = '#40739e';

const assetBaseURL: string = './../tutorial/source/assets/';

const pauseKeyCode: number = Phaser.Input.Keyboard.KeyCodes.ESC.valueOf();

const initScoreStr: string = `\t\t:0  \t\t:0  \t\t:0`;// `Coins: 0 Gems: 0 Stars: 0`;

const textConfig: {
  mainFillColor: string,
  secondaryFillColor: string,
  mainFontSize: string,
} = {
  mainFillColor: '#ffffff',
  secondaryFillColor: '#2f3640',
  mainFontSize: '32px',
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
  win: string
} = {
  mainGame: 'HomeScene',
  hudMenu: 'HudMenu',
  tabletMenu: 'TabletMenu',
  pause: 'PauseScene',
  win: 'LevelWin'
};

const eventNames: {
  updateScoreText: string,
  setConversionValues: string
} = {
  updateScoreText: 'updateScoreText',
  setConversionValues: 'setConversionValues'
};

// describes the currency conversion values, in terms of how many coins they're worth
interface conversionConfig { 
  valStars: number,
  valGems: number
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

export {
  gravity,
  width,
  height,
  mapWidth,
  mapHeight,
  groundDrag,
  backgroundColor,
  assetBaseURL,
  pauseKeyCode,
  initScoreStr,
  textConfig,
  partNames,
  sceneNames,
  eventNames,
  conversionConfig,
  PlayerConfig,
 };