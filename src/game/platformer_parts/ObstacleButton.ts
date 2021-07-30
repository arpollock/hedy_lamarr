import 'phaser';

export default class ObstacleButton extends Phaser.Physics.Arcade.Sprite {
	/**
	 * 
	 * @param {Phaser.Scene} scene 
	 * @param {number} x 
	 * @param {number} y 
	 * @param {string} texture 
	 */

	public isEnabled: boolean;
  public isFixed: boolean;
  public obstacleNum: number;

	constructor(scene, x, y, texture) {
		super(scene, x, y, texture);
		scene.add.existing(this);

    this.isFixed = false;
		this.isEnabled = false;
    this.obstacleNum = -1;
	}
}