import 'phaser';
import { HomeScene } from './game/mainGame';
import { PauseScene } from './game/PauseScene';
import { HudMenu } from './game/HudMenu';
import { ObstacleFixMenu } from './game/ObstacleFixMenu';
import { TabletMenu } from './game/TabletMenu';
import { LevelWin } from './game/LevelWin';
import { gravity, width, height } from './Constants'

const gameConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: width,
  height: height,
  parent: 'game-container',
  scene: [HomeScene, HudMenu, TabletMenu, ObstacleFixMenu, PauseScene, LevelWin],
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
  
}