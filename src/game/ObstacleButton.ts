import 'phaser';

export default class ObstacleButton extends Phaser.Physics.Arcade.Sprite {
	/**
	 * 
	 * @param {Phaser.Scene} scene 
	 * @param {number} x 
	 * @param {number} y 
	 * @param {string} texture 
	 */

  public isFixed: boolean;
  public objectNum: number;

	constructor(scene, x, y, texture) {
		super(scene, x, y, texture);
		scene.add.existing(this);

    this.isFixed = false;
    this.objectNum = -1;
	}
}