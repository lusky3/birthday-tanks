export class Bullet extends Phaser.GameObjects.Image {
  constructor(scene, x, y, angle, owner, maxBounces) {
    // Create bullet texture once; reused for all bullets
    if (!scene.textures.exists('bullet')) {
      const g = scene.add.graphics();
      g.fillStyle(0xFFFF00);
      g.fillCircle(4, 4, 4);
      g.generateTexture('bullet', 8, 8);
      g.destroy();
    }
    super(scene, x, y, 'bullet');
    this.owner = owner;       // 'player' or 'enemy'
    this.angle_rad = angle;
    this.speed = 280;
    this.maxBounces = maxBounces;
    this.bounceCount = 0;
    this.isDead = false;
    this.vx = Math.cos(angle) * this.speed;
    this.vy = Math.sin(angle) * this.speed;
    scene.add.existing(this);
    scene.physics.add.existing(this);
    // setBounce(1,1) makes Phaser's physics solver flip velocity on wall collisions.
    // The collider callback only counts the bounce and destroys the bullet if exhausted.
    this.body.setBounce(1, 1);
    this.body.setVelocity(this.vx, this.vy);
    this.body.setCircle(4);
    this.body.setCollideWorldBounds(false);
  }

  update(time, delta) {
    if (this.isDead) return;
    // Destroy bullets that leave the playfield
    if (this.x < -20 || this.x > this.scene.sys.game.config.width + 20 ||
        this.y < -20 || this.y > this.scene.sys.game.config.height + 20) {
      this.destroy();
    }
  }

  // Called by collision system each time the bullet hits a wall.
  // Phaser's setBounce(1,1) already flipped the velocity; we just count and expire.
  bounce() {
    this.bounceCount++;
    if (this.bounceCount > this.maxBounces) {
      this.destroy();
    }
  }

  destroy() {
    if (this.isDead) return;
    this.isDead = true;
    super.destroy();
  }
}
