import 'phaser';
import { HomeScene } from './game/mainGame';
import { PauseScene } from './game/PauseScene';
import { HudMenu } from './game/HudMenu';

const gameConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  // backgroundColor: '#40739e',
  scene: [HomeScene, HudMenu, PauseScene],
  physics: {
      default: 'arcade',
      arcade: {
          gravity: { y: 500 }
      }
  },
  transparent: true,
  // scene: {
  //     preload: preload,
  //     create: create
  // }
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