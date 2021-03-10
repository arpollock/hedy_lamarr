import 'phaser';

export default class LaserDoor extends Phaser.Physics.Arcade.Sprite {
	/**
	 * 
	 * @param {Phaser.Scene} scene 
	 * @param {number} x 
	 * @param {number} y 
	 * @param {string} texture 
	 */

  public isFixed: boolean;
  public objectNum: number;
  public part: string;

	constructor(scene, x, y, texture, frameNum=0) {
		super(scene, x, y, texture, frameNum);
		scene.add.existing(this);

    this.isFixed = false;
    this.objectNum = -1;
    this.part = '';
	}
}