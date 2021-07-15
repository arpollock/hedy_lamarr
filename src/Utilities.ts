import 'phaser';
import { MusicControlScene } from './game/MasterMusicControl';
import { sceneNames } from './Constants';

function isMusicAllowed(scene: Phaser.Scenes.ScenePlugin): boolean {
  if ( (scene.get(sceneNames.musicControl) as MusicControlScene).isMusicOn() ) {
    return true;
  }
  return false;
}

export {
  isMusicAllowed
};