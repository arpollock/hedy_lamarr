import 'phaser';

export default class MovingPlatform extends Phaser.Physics.Arcade.Image {
	/**
	 * 
	 * @param {Phaser.Scene} scene 
	 * @param {number} x 
	 * @param {number} y 
	 * @param {string} texture 
	 */
  private startY;
  private startX;
	constructor(scene, x, y, texture) {
		super(scene, x, y, texture);
		scene.add.existing(this);
    this.startY = y;
    this.startX = x;
	}
  public moveVertically(): void {
	  this.scene.tweens.addCounter({
      from: 0,
      to: 300,
      duration: 2500,
      ease: Phaser.Math.Easing.Sine.InOut,
      repeat: -1,
      yoyo: true,
      onUpdate: (tween, target) => {
        const y = this.startY + target.value
        const dy = y - this.y
        this.y = y
      }
    })
  }

  public moveHorizontally(): void {
	  this.scene.tweens.addCounter({
      from: 0,
      to: 300,
      duration: 2500,
      ease: Phaser.Math.Easing.Sine.InOut,
      repeat: -1,
      yoyo: true,
      onUpdate: (tween, target) => {
        const x = this.startX + target.value
        const dx = x - this.x
        this.x = x
      }
    })
  }
}