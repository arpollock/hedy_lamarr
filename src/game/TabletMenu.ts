import 'phaser';

export default class TabletMenu extends Phaser.GameObjects.Sprite {
	/**
	 * 
	 * @param {Phaser.Scene} scene 
	 * @param {number} x 
	 * @param {number} y 
   * @param {string} texture 
	 */

	constructor(scene, x, y, texture) {
		super(scene, x, y, texture);
		scene.add.existing(this);
    this.setOrigin(1,1);
	}
}