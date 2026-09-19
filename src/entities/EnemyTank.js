// All enemy types in one file.
// Each type has different AI behavior defined by the `type` string passed to constructor.
export class EnemyTank extends Phaser.GameObjects.Container {
  constructor(scene, x, y, type) {
    super(scene, x, y);
    this.type = type; // 'candle','golfball','puck','boat','snowmobile','biker','boss70'
    this.isDead = false;
    this.bullets = [];
    this.speed = this._speedForType();
    this.fireRate = this._fireRateForType();
    this.lastFired = 0;
    this.bounceCount = 1;
    this.state = 'idle'; // idle | patrol | aim | fire | charge
    this.stateTimer = 0;
    this.patrolDir = { x: 0, y: 0 };
    this.health = type === 'boss70' ? 3 : 1;
    // Add to scene FIRST, then create sprites (sprites need scene context)
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.body.setCircle(14, -14, -14);
    // candle doesn't move
    if (type === 'candle') {
      this.body.setImmovable(true);
    }
    this._createSprite();
  }

  _speedForType() {
    const speeds = { candle: 0, golfball: 50, puck: 110, boat: 60, snowmobile: 130, biker: 100, boss70: 40 };
    return speeds[this.type] || 60;
  }

  _fireRateForType() {
    const rates = { candle: 2500, golfball: 2000, puck: 1500, boat: 2200, snowmobile: 1800, biker: 3000, boss70: 800 };
    return rates[this.type] || 2000;
  }

  _createSprite() {
    const colors = {
      candle: 0xFFD700, golfball: 0xFFFFFF, puck: 0x222222,
      boat: 0x4444FF, snowmobile: 0xCCEEFF, biker: 0xCC3300, boss70: 0xFF0000
    };
    const color = colors[this.type] || 0xFF6600;
    const g = this.scene.add.graphics();
    if (this.type === 'candle') {
      g.fillStyle(0xFFF8DC); g.fillRect(-8, -18, 16, 36);
      g.fillStyle(0xFFD700); g.fillCircle(0, -22, 5);
      g.fillStyle(0xFF8C00); g.fillTriangle(-4, -24, 4, -24, 0, -32);
    } else if (this.type === 'boss70') {
      g.fillStyle(color); g.fillRect(-24, -20, 48, 40);
      // Draw 7 and 0
      g.fillStyle(0xFFFFFF);
      // 7
      g.fillRect(-22, -16, 14, 4); g.fillRect(-10, -16, 4, 32); g.fillRect(-14, 0, 8, 4);
      // 0
      g.strokeRoundedRect(0, -16, 18, 32, 4);
    } else {
      g.fillStyle(color);
      if (this.type === 'puck') {
        g.fillEllipse(0, 0, 36, 20);
      } else {
        g.fillRect(-16, -12, 32, 24);
      }
      // turret
      g.fillStyle(0x333333); g.fillRect(0, -3, 18, 6); g.fillCircle(0, 0, 7);
    }
    const key = `enemy_${this.type}`;
    if (!this.scene.textures.exists(key)) {
      g.generateTexture(key, 56, 56);
    }
    g.destroy();
    this.bodySprite = this.scene.add.image(0, 0, key);
    this.add(this.bodySprite);
  }

  update(time, delta) {
    if (this.isDead) return;
    this.stateTimer -= delta;

    // AI state machine — delegate to per-type handler
    switch (this.type) {
      case 'candle':      this._aiCandle(time);          break;
      case 'golfball':    this._aiGolfball(time, delta);  break;
      case 'puck':        this._aiPuck(time, delta);      break;
      case 'boat':        this._aiBoat(time, delta);      break;
      case 'snowmobile':  this._aiSnowmobile(time, delta); break;
      case 'biker':       this._aiBiker(time, delta);     break;
      case 'boss70':      this._aiBoss(time, delta);      break;
    }
  }

  _aiCandle(time) {
    // Stationary; fires directly at player on a timer
    if (time > this.lastFired + this.fireRate) {
      this.lastFired = time;
      const player = this.scene.player;
      if (player && !player.isDead) {
        const angle = Phaser.Math.Angle.Between(this.x, this.y, player.x, player.y);
        this._fire(angle);
      }
    }
  }

  _aiGolfball(time, delta) {
    const player = this.scene.player;
    if (!player || player.isDead) return;
    // Slow patrol in random directions; fires at player
    if (this.stateTimer <= 0) {
      this.stateTimer = Phaser.Math.Between(1500, 3000);
      const angle = Phaser.Math.Between(0, 360);
      this.scene.physics.velocityFromAngle(angle, this.speed, this.body.velocity);
      this.bodySprite.setAngle(angle);
    }
    if (time > this.lastFired + this.fireRate) {
      this.lastFired = time;
      const angle = Phaser.Math.Angle.Between(this.x, this.y, player.x, player.y);
      this._fire(angle);
    }
  }

  _aiPuck(time, delta) {
    const player = this.scene.player;
    if (!player || player.isDead) return;
    // Fast slides toward player with slight random variation
    if (this.stateTimer <= 0) {
      this.stateTimer = Phaser.Math.Between(500, 1500);
      const angle = Phaser.Math.Angle.Between(this.x, this.y, player.x, player.y)
        + Phaser.Math.FloatBetween(-0.5, 0.5);
      this.scene.physics.velocityFromRotation(angle, this.speed, this.body.velocity);
    }
    if (time > this.lastFired + this.fireRate) {
      this.lastFired = time;
      const angle = Phaser.Math.Angle.Between(this.x, this.y, player.x, player.y);
      this._fire(angle);
    }
  }

  _aiBoat(time, delta) {
    // Similar patrol to golfball; would preferably move near water tiles (handled by terrain system)
    this._aiGolfball(time, delta);
  }

  _aiSnowmobile(time, delta) {
    const player = this.scene.player;
    if (!player || player.isDead) return;
    // Fast, erratic direction changes
    if (this.stateTimer <= 0) {
      this.stateTimer = Phaser.Math.Between(300, 800);
      const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
      this.scene.physics.velocityFromRotation(angle, this.speed, this.body.velocity);
      this.bodySprite.setRotation(angle);
    }
    if (time > this.lastFired + this.fireRate) {
      this.lastFired = time;
      const angle = Phaser.Math.Angle.Between(this.x, this.y, player.x, player.y);
      this._fire(angle);
    }
  }

  _aiBiker(time, delta) {
    const player = this.scene.player;
    if (!player || player.isDead) return;
    // Always charging directly at player
    const angle = Phaser.Math.Angle.Between(this.x, this.y, player.x, player.y);
    this.scene.physics.velocityFromRotation(angle, this.speed, this.body.velocity);
    this.bodySprite.setRotation(angle);
    if (time > this.lastFired + this.fireRate) {
      this.lastFired = time;
      this._fire(angle);
    }
  }

  _aiBoss(time, delta) {
    const player = this.scene.player;
    if (!player || player.isDead) return;
    // Slow movement toward player; fires 3-shot spread burst
    if (this.stateTimer <= 0) {
      this.stateTimer = 2000;
      const angle = Phaser.Math.Angle.Between(this.x, this.y, player.x, player.y);
      this.scene.physics.velocityFromRotation(angle, this.speed, this.body.velocity);
      this.bodySprite.setRotation(angle);
    }
    if (time > this.lastFired + this.fireRate) {
      this.lastFired = time;
      const angle = Phaser.Math.Angle.Between(this.x, this.y, player.x, player.y);
      this._fire(angle - 0.2);
      this._fire(angle);
      this._fire(angle + 0.2);
    }
  }

  _fire(angle) {
    const { Bullet } = this.scene.registry.get('entityClasses');
    const b = new Bullet(this.scene, this.x, this.y, angle, 'enemy', this.bounceCount);
    this.bullets.push(b);
    this.scene.activeBullets.add(b);
  }

  hit() {
    this.health--;
    if (this.health <= 0) {
      this.die();
    } else {
      // Flash to signal damage
      this.scene.tweens.add({ targets: this, alpha: 0, duration: 100, yoyo: true, repeat: 2 });
    }
  }

  die() {
    if (this.isDead) return;
    this.isDead = true;
    this.scene.events.emit('audioPlay', 'explosion');
    // Particle burst using an already-loaded texture as stand-in
    const particles = this.scene.add.particles(this.x, this.y, 'enemy_golfball', {
      speed: { min: 50, max: 150 },
      scale: { start: 0.3, end: 0 },
      lifespan: 500,
      quantity: 8,
      emitting: false
    });
    particles.explode(8);
    this.scene.time.delayedCall(600, () => particles.destroy());
    this.destroy();
    this.scene.events.emit('enemyKilled');
  }
}
