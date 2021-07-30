import 'phaser';

export default class Goal extends Phaser.Physics.Arcade.Sprite {
	/**
	 * 
	 * @param {Phaser.Scene} scene 
	 * @param {number} x 
	 * @param {number} y 
	 * @param {string | number} texture 
	 */

  public part: string;

	constructor(scene, x, y, texture, frame) {
		super(scene, x, y, texture, frame);
		scene.add.existing(this);
    this.part = '';
	}
}