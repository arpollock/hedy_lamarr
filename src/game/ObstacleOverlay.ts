import 'phaser';

export default class ObstacleOverlay extends Phaser.Physics.Arcade.Sprite {
	/**
	 * 
	 * @param {Phaser.Scene} scene 
	 * @param {number} x 
	 * @param {number} y 
	 * @param {string} texture 
	 */

	public objectNum: number;

	constructor(scene, x, y, texture) {
		super(scene, x, y, texture);
		scene.add.existing(this);

    this.objectNum = -1;
	}
}