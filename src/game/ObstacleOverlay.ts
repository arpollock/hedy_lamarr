import 'phaser';

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

	constructor(scene, x, y, texture, containsStars: boolean, gradeLevel: number) {
		super(scene, x, y, texture);
		scene.add.existing(this);

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
		}
		// set the coins and gems, which everyone has
		switch(gradeLevel) {
			case 5:
				possibleNumCoins.push(4);
				possibleNumGems.push(2);
			case 4:
				possibleNumCoins.push(3);
			case 3:
				possibleNumCoins.push(2);
				possibleNumCoins.push(1);
				possibleNumCoins.push(0);
				possibleNumGems.push(1);
				possibleNumGems.push(0);
				break;
			default:
				break;
		}
		this.coinsNeeded = possibleNumCoins[Math.floor(Math.random() * possibleNumCoins.length)];
		this.gemsNeeded = possibleNumGems[Math.floor(Math.random() * possibleNumGems.length)];
		this.starsNeeded = possibleNumStars[Math.floor(Math.random() * possibleNumStars.length)];
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

