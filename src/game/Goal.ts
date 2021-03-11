import 'phaser';

export default class Goal extends Phaser.Physics.Arcade.Sprite {
	/**
	 * 
	 * @param {Phaser.Scene} scene 
	 * @param {number} x 
	 * @param {number} y 
	 * @param {string} texture 
	 */

  public part: string;

	constructor(scene, x, y, texture, frameNum=0) {
		super(scene, x, y, texture, frameNum);
		scene.add.existing(this);
    this.part = '';
	}
}