import 'phaser';
import {
	ConversionConfig
} from './../Constants';

export default class ObstacleOverlay extends Phaser.Physics.Arcade.Sprite {
	/**
	 * 
	 * @param {Phaser.Scene} scene 
	 * @param {number} x 
	 * @param {number} y 
	 * @param {string} texture 
	 */

	public obstacleNum: number;

	public minCoinValue: number;
  public maxCoinValue: number;

	private coinsNeeded: number;
	private gemsNeeded: number;
	private starsNeeded: number;

	constructor(scene, x, y, texture, containsStars: boolean, gradeLevel: number, minCoinValue:number, maxCoinValue:number, conversionValues: ConversionConfig, canAcceptCoins: boolean) {
		super(scene, x, y, texture);
		scene.add.existing(this);

		// these 2 values have defaults that will be overriden by Tiled Map propertiess
		this.minCoinValue = minCoinValue;
		this.maxCoinValue = maxCoinValue;

		this.coinsNeeded = 0;
		this.gemsNeeded = 0;
		this.starsNeeded = 0;

    this.obstacleNum = -1;

		const possibleNumCoins: number[] = [];
		const possibleNumGems: number[] = [];
		const possibleNumStars: number[] = [];

		// todo, this needs to be fixed.
		// is v bad, can actually have a 0 requirment obstacle
		// probs also need min/max data from map data in addition to difficulty data
		// set the stars
		possibleNumStars.push(0); // 3rd grade does not use stars
		if (containsStars) { 
			if (gradeLevel === 5) {
				possibleNumStars.push(2);
			}
			possibleNumStars.push(1);
			possibleNumStars.push(1);
		}
		// set the coins and gems, which everyone has
		// have non-zero # of gems and stars occur w/ a higher probability
		// have 0 coins occur with a higher probability, especially as the grade level increases
		switch(gradeLevel) {
			case 5:
				possibleNumGems.push(2);
				possibleNumGems.push(2);
				possibleNumGems.push(2);
				possibleNumGems.push(2);

				possibleNumCoins.push(0);
				possibleNumCoins.push(0);
				possibleNumCoins.push(0);
				possibleNumCoins.push(0);
				possibleNumCoins.push(0);
				possibleNumCoins.push(3);

			case 4:
				possibleNumCoins.push(0);
				possibleNumCoins.push(0);
				possibleNumCoins.push(0); 
				possibleNumCoins.push(0);
				possibleNumCoins.push(0);
				possibleNumCoins.push(0);
				possibleNumCoins.push(0);
				possibleNumCoins.push(0);
				possibleNumCoins.push(0); 
				possibleNumCoins.push(0);
				possibleNumCoins.push(0);
				possibleNumCoins.push(0);

				possibleNumGems.push(1);
				possibleNumGems.push(1);
				possibleNumGems.push(1);
				possibleNumGems.push(1);
				possibleNumGems.push(1);
				possibleNumGems.push(2);
			case 3:
				possibleNumCoins.push(2);
				possibleNumCoins.push(1);
				possibleNumCoins.push(1);
				possibleNumCoins.push(0);
				possibleNumCoins.push(0);
				possibleNumCoins.push(0);
				possibleNumCoins.push(0);
				possibleNumCoins.push(0);
				possibleNumCoins.push(0);
				possibleNumCoins.push(0);
				possibleNumCoins.push(0);
				possibleNumCoins.push(0);
				possibleNumCoins.push(0);
				possibleNumCoins.push(0);
				possibleNumCoins.push(0);

				possibleNumGems.push(1);
				possibleNumGems.push(1);
				possibleNumGems.push(1); 
				possibleNumGems.push(0);
				break;
			default:
				break;
		}
		if (!canAcceptCoins) {
			this.coinsNeeded = 0;
		}
		let adjustedSum: number = (this.coinsNeeded + (this.gemsNeeded * conversionValues.valGems) + (this.starsNeeded * conversionValues.valStars));
		let counter: number = 0;
		do {
			if (canAcceptCoins) {
				this.coinsNeeded = possibleNumCoins[Math.floor(Math.random() * possibleNumCoins.length)];
			}
			this.gemsNeeded = possibleNumGems[Math.floor(Math.random() * possibleNumGems.length)];
			this.starsNeeded = possibleNumStars[Math.floor(Math.random() * possibleNumStars.length)];
			adjustedSum = (this.coinsNeeded + (this.gemsNeeded * conversionValues.valGems) + (this.starsNeeded * conversionValues.valStars));
			console.log(`Loop iteration ${counter} w/ values: ${adjustedSum} -> (${this.coinsNeeded}) (${this.gemsNeeded}) (${this.starsNeeded})`);
			counter += 1;
		} while( (Math.floor(adjustedSum) < this.minCoinValue) || (Math.ceil(adjustedSum) > this.maxCoinValue) );
		console.log(`Solution found: ${this.coinsNeeded}, ${this.gemsNeeded}, ${this.starsNeeded} == ${adjustedSum}`);
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

