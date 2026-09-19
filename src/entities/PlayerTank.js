// Motorcycle tank — player controlled
// Extends Phaser.GameObjects.Container
// Contains: body sprite (motorcycle shape drawn on canvas texture), turret sprite
export class PlayerTank extends Phaser.GameObjects.Container {
  constructor(scene, x, y) {
    super(scene, x, y);
    this.speed = 120;
    this.turnSpeed = 3;
    this.lives = 3;
    this.minesRemaining = 0; // set per level
    this.bullets = []; // active bullets
    this.mines = [];   // active mines
    this.bodyAngle = 0;   // degrees, direction of travel
    this.turretAngle = 0; // degrees, aim direction
    this.fireRate = 600;  // ms between shots
    this.lastFired = 0;
    this.isDead = false;
    // Add to scene FIRST, then create sprites (sprites need scene context)
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.body.setCircle(14, -14, -14);
    // Create graphics textures and attach sprites to container
    this._createSprites();
  }

  _createSprites() {
    // Generate textures only once — reused across respawns and multiple instances
    if (!this.scene.textures.exists('player_tank')) {
      const g = this.scene.add.graphics();
      // Body (olive/tan)
      g.fillStyle(0x8B7355);
      g.fillRect(-18, -8, 36, 16);
      // Front wheel
      g.fillStyle(0x333333);
      g.fillCircle(16, 0, 7);
      // Rear wheel
      g.fillCircle(-14, 0, 8);
      // Engine block
      g.fillStyle(0x666666);
      g.fillRect(-6, -6, 14, 12);
      // Handlebars
      g.fillStyle(0x888888);
      g.fillRect(10, -12, 4, 10);
      g.generateTexture('player_tank', 40, 40);
      g.destroy();
    }

    this.bodySprite = this.scene.add.image(0, 0, 'player_tank');

    if (!this.scene.textures.exists('player_turret')) {
      // Turret (gun barrel)
      const tg = this.scene.add.graphics();
      tg.fillStyle(0x4a4a4a);
      tg.fillRect(0, -3, 22, 6); // barrel pointing right
      tg.fillStyle(0x333333);
      tg.fillCircle(0, 0, 7); // base
      tg.generateTexture('player_turret', 30, 20);
      tg.destroy();
    }

    this.turretSprite = this.scene.add.image(0, 0, 'player_turret');
    this.turretSprite.setOrigin(0.2, 0.5);

    this.add([this.bodySprite, this.turretSprite]);
  }

  update(time, delta, input) {
    if (this.isDead) return;

    const { dx, dy, aimX, aimY, fire, mine } = input;

    // Movement
    if (dx !== 0 || dy !== 0) {
      const angle = Math.atan2(dy, dx);
      this.bodyAngle = Phaser.Math.RadToDeg(angle);
      this.bodySprite.setRotation(angle);
      this.scene.physics.velocityFromRotation(angle, this.speed, this.body.velocity);
      // Engine hum — speed normalised 0–1
      const audio = this.scene.registry.get('audio');
      if (audio) {
        const speedNorm = Math.sqrt(dx*dx + dy*dy); // 0–1 from joystick magnitude
        audio.startEngine(speedNorm);
      }
    } else {
      this.body.setVelocity(0, 0);
      const audio = this.scene.registry.get('audio');
      if (audio) audio.stopEngine();
    }

    // Turret aim
    if (aimX !== undefined && aimY !== undefined) {
      const tx = aimX - this.x;
      const ty = aimY - this.y;
      this.turretAngle = Math.atan2(ty, tx);
      this.turretSprite.setRotation(this.turretAngle);
    }

    // Fire
    if (fire && time > this.lastFired + this.fireRate) {
      this.lastFired = time;
      this._fireBullet();
    }

    // Mine
    if (mine && this.minesRemaining > 0) {
      this.minesRemaining--;
      this._dropMine();
      // Notify HUD to update mine counter
      this.scene.scene.get('HUD')?.events.emit('updateMines', this.minesRemaining);
    }
  }

  _fireBullet() {
    const { Bullet } = this.scene.registry.get('entityClasses');
    const b = new Bullet(this.scene, this.x, this.y, this.turretAngle, 'player', this.scene.currentLevel?.bounceCount || 1);
    this.bullets.push(b);
    this.scene.activeBullets.add(b);
    this.scene.events.emit('audioPlay', 'shoot');
  }

  _dropMine() {
    const { Mine } = this.scene.registry.get('entityClasses');
    const m = new Mine(this.scene, this.x, this.y);
    this.mines.push(m);
    this.scene.activeMines.add(m);
    this.scene.events.emit('audioPlay', 'mineDrop');
  }

  loseLife() {
    this.lives--;
    this.isDead = true;
    this.setVisible(false);
    this.body.setVelocity(0, 0);
    // Red explosion ring at death position
    const g = this.scene.add.graphics();
    g.lineStyle(4, 0xFF0000);
    g.strokeCircle(this.x, this.y, 10);
    this.scene.tweens.add({
      targets: g, scaleX: 5, scaleY: 5, alpha: 0,
      duration: 600,
      onComplete: () => g.destroy()
    });
    this.scene.events.emit('audioPlay', 'explosion');
    this.scene.events.emit('playerDied', this.lives);
  }

  respawn(x, y) {
    this.x = x;
    this.y = y;
    this.isDead = false;
    this.setVisible(true);
    this.body.setVelocity(0, 0);
  }
}
