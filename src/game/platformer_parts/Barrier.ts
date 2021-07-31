import 'phaser';

export default class Barrier extends Phaser.Physics.Arcade.Sprite {
	/**
	 * 
	 * @param {Phaser.Scene} scene 
	 * @param {number} x 
	 * @param {number} y 
	 * @param {string} texture 
	 */

  public isFixed: boolean;
  public obstacleNum: number;
  private isOn: boolean;

	constructor(scene, x: number, y: number, texture: string, defaultState: boolean) {
		super(scene, x, y, texture);
		scene.add.existing(this);

    this.isFixed = false;
    this.obstacleNum = -1;
    this.isOn = defaultState;
	}

  public turnOff(): void {
    this.isOn = false;
  }

  public turnOn(): void {
    this.isOn = true;
  }

  public getState(): boolean {
    return this.isOn
  }

}