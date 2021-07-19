import 'phaser';
import { MusicControlScene } from './game/MasterMusicControl';
import {
  sceneNames,
  currency_type
} from './Constants';

function isMusicAllowed(scene: Phaser.Scenes.ScenePlugin): boolean {
  if ( (scene.get(sceneNames.musicControl) as MusicControlScene).isMusicOn() ) {
    return true;
  }
  return false;
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

export {
  isMusicAllowed,
  currency_type_to_str
};