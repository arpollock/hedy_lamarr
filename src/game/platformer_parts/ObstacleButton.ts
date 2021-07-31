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
  public isOn: boolean;
  public obstacleNum: number;
	public userTogglable: boolean; // if the button can be turned back off once on by the user

	constructor(scene, x: number, y: number, texture: string, userTogglable: boolean) {
		super(scene, x, y, texture);
		scene.add.existing(this);

    this.isOn = false;
		this.isEnabled = false;
    this.obstacleNum = -1;
		this.userTogglable = userTogglable;
	}
}