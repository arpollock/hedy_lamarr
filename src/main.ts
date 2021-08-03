import 'phaser';
import { StartScene } from './game/StartScene';
import { HomeScene } from './game/mainGame';
import { PauseScene } from './game/PauseScene';
import { HudMenu } from './game/HudMenu';
import { TabletMenu } from './game/TabletMenu';
import { LevelWin } from './game/LevelWin';
import { gravity, width, height } from './Constants'
import { MusicControlScene } from './game/MasterMusicControl';
import { TutorialScene } from './game/TutorialScene';
import { ObstacleFixMenu } from './game/ObstacleFixMenu';

const gameConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: width,
  height: height,
  parent: 'game-container',
  scene: [StartScene, MusicControlScene, TutorialScene, PauseScene, HomeScene, HudMenu, TabletMenu, ObstacleFixMenu, LevelWin],
  physics: {
      default: 'arcade',
      arcade: {
          gravity: { y: gravity }
      }
  },
  transparent: true,
};

export class MyGame extends Phaser.Game {
  constructor(config: Phaser.Types.Core.GameConfig) {
    super(config);
  }
}

window.onload = () => {
  var game: Phaser.Game = new MyGame(gameConfig);
};

function preload () {
  
}

function create () {
  // todo make game fullscreen:
  // https://phaser.io/examples/v3/view/scalemanager/full-screen-game#
}