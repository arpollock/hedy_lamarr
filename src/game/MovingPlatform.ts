import 'phaser';

export default class MovingPlatform extends Phaser.Physics.Arcade.Sprite {
	/**
	 * 
	 * @param {Phaser.Scene} scene 
	 * @param {number} x 
	 * @param {number} y 
	 * @param {string} texture 
	 */

  public isFixed: boolean;
  public obstacleNum: number;
  public movesV: boolean;
  public movesH: boolean;

  private startY: number;
  private startX: number;
  private dur: number;
  private dist: number;

  private vx: number;
  private vy: number;
  private previousX: number;
  private previousY: number;

	constructor(scene, x, y, texture) {
		super(scene, x, y, texture);
		scene.add.existing(this);
    this.startY = y;
    this.startX = x;

    this.isFixed = false;
    this.obstacleNum = -1;
    this.movesH = false;
    this.movesV = false;

    this.previousX = x;
    this.previousY = y;
    this.vx = 0;
    this.vy = 0;
    this.dur = 3500;
    this.dist = 300;
	}

  public moveVertically(): void {
	  this.scene.tweens.addCounter({
      from: 0,
      to: this.dist,
      duration: this.dur,
      ease: Phaser.Math.Easing.Sine.InOut,
      repeat: -1,
      yoyo: true,
      onUpdate: (tween, target) => {
        const y = this.startY + target.value
        const dy = y - this.y
        this.y = y
        
        this.vy = y - this.previousY;
        this.previousY = y; 
      }
    })
  }

  public moveHorizontally(): void {
	  this.scene.tweens.addCounter({
      from: 0,
      to: this.dist,
      duration: this.dur,
      ease: Phaser.Math.Easing.Sine.InOut,
      repeat: -1,
      yoyo: true,
      onUpdate: (tween, target) => {
        const x = this.startX + target.value
        const dx = x - this.x
        this.x = x

        this.vx = x - this.previousX;
        this.previousX = x; 
      }
    })
  }

  public getVx(): number {
    return this.vx;
  }

  public getVy(): number {
    return this.vy;
  }

}