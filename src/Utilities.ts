import 'phaser';
import { MusicControlScene } from './game/MasterMusicControl';
import {
  sceneNames,
  currency_type,
  possibleMapNumbers,
  ConversionConfig
} from './Constants';

function isSfxAllowed(scene: Phaser.Scenes.ScenePlugin): boolean {
  if ( (scene.get(sceneNames.musicControl) as MusicControlScene).isSfxOn() ) {
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

function get_rand_map_number(): number {
  return possibleMapNumbers[Math.floor(Math.random() * possibleMapNumbers.length)];
}

function get_rand_conversion_values(activeGradeLevel: number): ConversionConfig {
  const possibleGemValues: number[] = [];
    const possibleStarValues: number[] = [];
    switch(activeGradeLevel) {
      // 4th and 5th grade worry about coins, gems, and stars
      // 5th does everything 4th and 3rd can do, 4th can do anything 3rd, etc. 
      // might change ^ if teachers feel is appropriate,
      // probs would have to change w/ ML update to how game updates as you play

      // currently have the graphics to support min conversions for:
      // Gems : Coins ==> 2, 3
      // Gems : Stars ==> 3, 4
      // => Valid combos: (gemValue, starValue):
      //  - 3rd Grade: (2, 0), (3, 0)
      //  - 4th/5th Grade: (2, 3), (2, 4), (3, 4)  
      case 5:
        possibleStarValues.push(4);
      case 4: 
        possibleStarValues.push(3);
      case 3: // 3rd grade only worries about coins and gems
        possibleGemValues.push(2);
        possibleGemValues.push(3);
        break;
      default:
          break;
    }
    if (possibleStarValues.length === 0) {
      possibleStarValues.push(0); // == 0 used to hide star sprites, etc. throughout misc. scenes
    }

    let valGems = possibleGemValues[Math.floor(Math.random() * possibleGemValues.length)];
    let valStars = possibleStarValues[Math.floor(Math.random() * possibleStarValues.length)];
    while ( valGems >= valStars && valStars != 0) { // don't let stars be equal or less than gems, but also remember that star value is 0 for 3rd grade
      valGems = possibleGemValues[Math.floor(Math.random() * possibleGemValues.length)];
      valStars = possibleStarValues[Math.floor(Math.random() * possibleStarValues.length)];
    }
    return { valGems, valStars };
}

function map_num_to_key(mapNum: number): string {
  return `map_${mapNum}}`;
}

export {
  isSfxAllowed,
  currency_type_to_str,
  get_rand_map_number,
  get_rand_conversion_values,
  map_num_to_key
};