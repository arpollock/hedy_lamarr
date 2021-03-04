import 'phaser';
import { HomeScene } from './game/mainGame';
import { PauseScene } from './game/PauseScene';

const gameConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#40739e',
  scene: [HomeScene, PauseScene],
  physics: {
      default: 'arcade',
      arcade: {
          gravity: { y: 500 }
      }
  },
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
  var game = new MyGame(gameConfig);
};

function preload () {
  
}

function create () {
  
}