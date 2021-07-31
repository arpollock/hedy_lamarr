import 'phaser';
import {
	ConversionConfig
} from './../../Constants';

export default class ObstacleOverlay extends Phaser.Physics.Arcade.Sprite {
	/**
	 * 
	 * @param {Phaser.Scene} scene 
	 * @param {number} x 
	 * @param {number} y 
	 * @param {string} texture 
	 */

	public obstacleNum: number;
	private coinsNeeded: number;
	private gemsNeeded: number;
	private starsNeeded: number;

	constructor(scene, x, y, texture, obstacleNum: number, coinsNeeded: number, gemsNeeded: number, starsNeeded: number) {
		super(scene, x, y, texture);
		scene.add.existing(this);
		this.coinsNeeded = coinsNeeded;
		this.gemsNeeded = gemsNeeded;
		this.starsNeeded = starsNeeded; 
    this.obstacleNum = obstacleNum;
	}

	public getCoinsNeeded(): number {
		return this.coinsNeeded;
	}

	public getGemsNeeded(): number {
		return this.gemsNeeded;
	}

	public getStarsNeeded(): number {
		return this.starsNeeded;
	}
}

