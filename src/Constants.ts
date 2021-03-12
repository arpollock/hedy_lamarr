import 'phaser';

const gravity: number = 500;

const width: number = 800; // game window width

const height: number = 600; // game window height

const mapWidth: number = 2100; // map width: 30 tiles * 70 px/tile = 2100 px

const mapHeight: number = 1400; // map height: 20 tiles * 70 px/tile = 1400 px

const groundDrag: number = 500;

const backgroundColor: string = '#40739e';

const pauseKeyCode: number = Phaser.Input.Keyboard.KeyCodes.ESC.valueOf();

const initScoreStr: string = `Coins: 0 Gems: 0 Stars: 0`;

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
  pause: string,
  win: string
} = {
  mainGame: 'HomeScene',
  hudMenu: 'HudMenu',
  pause: 'PauseScene',
  win: 'LevelWin'
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
}

export {
  gravity,
  width,
  height,
  mapWidth,
  mapHeight,
  groundDrag,
  backgroundColor,
  pauseKeyCode,
  initScoreStr,
  partNames,
  sceneNames,
  PlayerConfig,
 };