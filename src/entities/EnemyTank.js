// All enemy types in one file.
// Each type has different AI behavior defined by the `type` string passed to constructor.
//
// Regular types:  candle | golfball | puck | boat | snowmobile | biker | boss70
// Mini-boss types (every 10th level):
//   mini_hockey  (L10)  — fast zigzag, fires ricochets
//   mini_trek    (L20)  — cloaks (fades), fires phasers in bursts
//   mini_wars    (L30)  — X-wing: flies in figure-8, fires 2-shot
//   mini_carrie  (L40)  — heart tank: orbits player, fires spread
//   mini_cn      (L50)  — railcar: charges in straight lines, drops mines
//   mini_harley  (L60)  — biker boss: fast charge + 3-shot spread
//   boss70       (L70)  — The 70: 5 HP, 3-shot spread + mine, slow but relentless

export class EnemyTank extends Phaser.GameObjects.Container {
  constructor(scene, x, y, type) {
    super(scene, x, y);
    this.type = type;
    this.isDead = false;
    this.bullets = [];
    this.speed = this._speedForType();
    this.fireRate = this._fireRateForType();
    this.lastFired = 0;
    this.bounceCount = 1;
    this.state = 'idle';
    this.stateTimer = 0;
    this.patrolDir = { x: 0, y: 0 };
    this.orbitAngle = 0; // used by mini_carrie
    this.chargeDir = 0;  // used by mini_cn
    const bossWith3HP = ['mini_hockey','mini_trek','mini_wars','mini_carrie','mini_cn','mini_harley'];
    this.health = type === 'boss70' ? 5 : bossWith3HP.includes(type) ? 3 : 1;
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
    const speeds = {
      candle: 0, golfball: 50, puck: 110, boat: 60, snowmobile: 130, biker: 100, boss70: 40,
      mini_hockey: 140, mini_trek: 60, mini_wars: 110, mini_carrie: 80,
      mini_cn: 180, mini_harley: 150,
    };
    return speeds[this.type] || 60;
  }

  _fireRateForType() {
    const rates = {
      candle: 2500, golfball: 2000, puck: 1500, boat: 2200, snowmobile: 1800, biker: 3000, boss70: 700,
      mini_hockey: 1000, mini_trek: 1800, mini_wars: 1200, mini_carrie: 1400,
      mini_cn: 2500, mini_harley: 900,
    };
    return rates[this.type] || 2000;
  }

  _createSprite() {
    const key = `enemy_${this.type}`;
    if (!this.scene.textures.exists(key)) {
      const g = this.scene.add.graphics();
      this._drawSprite(g);
      g.generateTexture(key, 64, 64);
      g.destroy();
    }
    this.bodySprite = this.scene.add.image(0, 0, key);
    this.add(this.bodySprite);
  }

  _drawSprite(g) {
    switch (this.type) {
      case 'candle':
        g.fillStyle(0xFFF8DC); g.fillRect(-8, -18, 16, 36);
        g.fillStyle(0xFFD700); g.fillCircle(0, -22, 5);
        g.fillStyle(0xFF8C00); g.fillTriangle(-4, -24, 4, -24, 0, -32);
        break;

      case 'boss70':
        g.fillStyle(0xFF0000); g.fillRect(-28, -22, 56, 44);
        g.fillStyle(0xFFFFFF);
        // "7" digit
        g.fillRect(-24, -16, 14, 4); g.fillRect(-12, -16, 4, 32); g.fillRect(-16, 0, 8, 4);
        // "0" digit
        g.lineStyle(4, 0xFFFFFF); g.strokeRoundedRect(2, -16, 20, 32, 5);
        // Spikes top/bottom
        g.fillStyle(0xFF6600);
        for (let i = -3; i <= 3; i++) g.fillTriangle(i*8-4, -26, i*8+4, -26, i*8, -34);
        for (let i = -3; i <= 3; i++) g.fillTriangle(i*8-4, 26, i*8+4, 26, i*8, 34);
        break;

      case 'mini_hockey': {
        // Hockey puck with stick — blue + white
        g.fillStyle(0x001133); g.fillEllipse(0, 0, 52, 30);
        g.fillStyle(0xFFFFFF);
        // Puck lines
        g.lineStyle(2, 0xFFFFFF); g.strokeEllipse(0, 0, 52, 30);
        g.lineStyle(1, 0xFFFFFF); g.lineBetween(-20, 0, 20, 0);
        // Stick
        g.fillStyle(0x8B4513); g.fillRect(14, -24, 4, 28);
        g.fillStyle(0xCCCCCC); g.fillRect(14, 4, 14, 6);
        // Number "10"
        g.fillStyle(0xFFD700);
        g.fillRect(-18, -10, 4, 20); // "1"
        g.strokeRoundedRect(-12, -10, 12, 20, 3); // "0"
        break;
      }

      case 'mini_trek': {
        // Star Trek shuttle — grey saucer shape
        g.fillStyle(0x888899); g.fillEllipse(0, 0, 56, 28);
        g.fillStyle(0x4444AA); g.fillEllipse(0, -4, 30, 16); // dome
        g.fillStyle(0x00FFFF); g.fillCircle(-24, 6, 5); g.fillCircle(24, 6, 5); // nacelles
        g.lineStyle(2, 0x00FFFF); g.lineBetween(-20, 6, 20, 6);
        // Starfleet delta
        g.fillStyle(0xFFD700);
        g.fillTriangle(-5, -8, 5, -8, 0, 4);
        break;
      }

      case 'mini_wars': {
        // X-Wing silhouette — white cross shape
        g.fillStyle(0xDDDDDD);
        g.fillRect(-24, -5, 48, 10); // fuselage
        g.fillRect(-5, -24, 10, 48); // vertical
        // 4 wing tips
        g.fillStyle(0xAA2200);
        g.fillRect(-28, -28, 8, 8); g.fillRect(20, -28, 8, 8);
        g.fillRect(-28, 20, 8, 8); g.fillRect(20, 20, 8, 8);
        // R2 dome
        g.fillStyle(0x4466FF); g.fillCircle(8, 0, 5);
        break;
      }

      case 'mini_carrie': {
        // Heart-shaped tank — pink + red
        g.fillStyle(0xFF69B4);
        // Two circles for top of heart
        g.fillCircle(-10, -8, 14); g.fillCircle(10, -8, 14);
        // Triangle for bottom of heart
        g.fillTriangle(-22, 0, 22, 0, 0, 22);
        g.fillStyle(0xFF1493); g.lineStyle(2, 0xFF1493);
        // Inner detail
        g.fillCircle(-8, -8, 6); g.fillCircle(8, -8, 6);
        // Turret
        g.fillStyle(0xAA0044); g.fillCircle(0, 0, 7);
        g.fillRect(0, -3, 18, 6);
        break;
      }

      case 'mini_cn': {
        // CN Rail locomotive — red + black
        g.fillStyle(0xCC0000); g.fillRect(-28, -12, 56, 24);
        g.fillStyle(0x111111); g.fillRect(-24, -16, 48, 8);
        // Wheels
        g.fillStyle(0x333333);
        [-16,-4,8,20].forEach(x => g.fillCircle(x, 16, 7));
        // CN logo area
        g.fillStyle(0xFFFFFF); g.fillRect(-10, -8, 20, 12);
        g.fillStyle(0xCC0000);
        g.fillText?.('CN', -6, 2); // may not render but attempt
        // Cab
        g.fillStyle(0x880000); g.fillRect(16, -20, 12, 16);
        break;
      }

      case 'mini_harley': {
        // Harley chopper — orange + chrome
        g.fillStyle(0xFF6600); g.fillRect(-24, -8, 48, 16); // body
        // Front fork (extended chopper style)
        g.fillStyle(0xAAAAAA); g.fillRect(18, -20, 4, 24);
        // Wheels
        g.fillStyle(0x222222); g.fillCircle(-16, 10, 10); g.fillCircle(20, 12, 8);
        // Chrome bits
        g.fillStyle(0xDDDDDD); g.fillRect(-8, -12, 16, 6);
        // Flame detail
        g.fillStyle(0xFFDD00);
        g.fillTriangle(-24, -4, -18, -14, -14, -4);
        g.fillTriangle(-18, -4, -12, -18, -6, -4);
        break;
      }

      default: {
        // Generic tank
        const colors = { golfball: 0xFFFFFF, puck: 0x222222, boat: 0x4444FF, snowmobile: 0xCCEEFF, biker: 0xCC3300 };
        const color = colors[this.type] || 0xFF6600;
        g.fillStyle(color);
        if (this.type === 'puck') {
          g.fillEllipse(0, 0, 36, 20);
        } else {
          g.fillRect(-16, -12, 32, 24);
        }
        g.fillStyle(0x333333); g.fillRect(0, -3, 18, 6); g.fillCircle(0, 0, 7);
        break;
      }
    }
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
      // Mini-bosses
      case 'mini_hockey': this._aiMiniHockey(time, delta); break;
      case 'mini_trek':   this._aiMiniTrek(time, delta);   break;
      case 'mini_wars':   this._aiMiniWars(time, delta);   break;
      case 'mini_carrie': this._aiMiniCarrie(time, delta); break;
      case 'mini_cn':     this._aiMiniCN(time, delta);     break;
      case 'mini_harley': this._aiMiniHarley(time, delta); break;
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

  // ── Mini-boss AI ─────────────────────────────────────────────────────────────

  // L10: Hockey puck — zigzag fast, fires ricochets (high bounceCount)
  _aiMiniHockey(time, delta) {
    const player = this.scene.player;
    if (!player || player.isDead) return;
    if (this.stateTimer <= 0) {
      this.stateTimer = Phaser.Math.Between(400, 900);
      // Zigzag: alternate toward player and perpendicular
      const base = Phaser.Math.Angle.Between(this.x, this.y, player.x, player.y);
      const zigzag = this.state === 'left' ? 0.8 : -0.8;
      this.state = this.state === 'left' ? 'right' : 'left';
      const angle = base + zigzag;
      this.scene.physics.velocityFromRotation(angle, this.speed, this.body.velocity);
      this.bodySprite.setRotation(angle);
    }
    if (time > this.lastFired + this.fireRate) {
      this.lastFired = time;
      const angle = Phaser.Math.Angle.Between(this.x, this.y, player.x, player.y);
      // High-bounce ricochet shot
      this._fireBouncy(angle, 3);
    }
  }

  // L20: Star Trek — cloaks (alpha pulse), bursts 3 shots at once
  _aiMiniTrek(time, delta) {
    const player = this.scene.player;
    if (!player || player.isDead) return;
    // Cloak cycle
    if (this.stateTimer <= 0) {
      this.stateTimer = Phaser.Math.Between(2000, 4000);
      const cloaked = this.alpha < 0.5;
      this.scene.tweens.add({
        targets: this, alpha: cloaked ? 0.9 : 0.15,
        duration: 600, ease: 'Sine.easeInOut'
      });
      // Move while cloaked
      const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
      this.scene.physics.velocityFromRotation(angle, this.speed, this.body.velocity);
      this.bodySprite.setRotation(angle);
    }
    if (time > this.lastFired + this.fireRate) {
      this.lastFired = time;
      // Decloak briefly to fire
      this.scene.tweens.add({ targets: this, alpha: 1, duration: 200, yoyo: true, hold: 300 });
      const base = Phaser.Math.Angle.Between(this.x, this.y, player.x, player.y);
      // 3-shot spread (phaser burst)
      [-0.25, 0, 0.25].forEach(offset => this._fire(base + offset));
    }
  }

  // L30: Star Wars X-Wing — figure-8 orbit around center, 2-shot burst
  _aiMiniWars(time, delta) {
    const player = this.scene.player;
    if (!player || player.isDead) return;
    // Figure-8 using Lissajous
    this.orbitAngle = (this.orbitAngle || 0) + delta * 0.001;
    const cx = this.scene.sys.game.config.width / 2;
    const cy = this.scene.sys.game.config.height / 2;
    const tx = cx + Math.sin(this.orbitAngle) * 140;
    const ty = cy + Math.sin(this.orbitAngle * 2) * 80;
    const angle = Phaser.Math.Angle.Between(this.x, this.y, tx, ty);
    this.scene.physics.velocityFromRotation(angle, this.speed, this.body.velocity);
    this.bodySprite.setRotation(angle);
    if (time > this.lastFired + this.fireRate) {
      this.lastFired = time;
      const aimAngle = Phaser.Math.Angle.Between(this.x, this.y, player.x, player.y);
      this._fire(aimAngle - 0.1);
      this._fire(aimAngle + 0.1);
    }
  }

  // L40: Carrie heart tank — orbits player, fires radial spread
  _aiMiniCarrie(time, delta) {
    const player = this.scene.player;
    if (!player || player.isDead) return;
    // Orbit at fixed radius
    this.orbitAngle = (this.orbitAngle || 0) + delta * 0.0012;
    const orbitRadius = 160;
    const tx = player.x + Math.cos(this.orbitAngle) * orbitRadius;
    const ty = player.y + Math.sin(this.orbitAngle) * orbitRadius;
    const angle = Phaser.Math.Angle.Between(this.x, this.y, tx, ty);
    this.scene.physics.velocityFromRotation(angle, this.speed, this.body.velocity);
    this.bodySprite.setRotation(angle);
    if (time > this.lastFired + this.fireRate) {
      this.lastFired = time;
      // 4-shot cardinal spread
      [0, Math.PI/2, Math.PI, 3*Math.PI/2].forEach(a => this._fire(a));
    }
  }

  // L50: CN Rail locomotive — charges in straight lines, drops mines on path
  _aiMiniCN(time, delta) {
    const player = this.scene.player;
    if (!player || player.isDead) return;
    if (this.stateTimer <= 0) {
      this.stateTimer = 1200;
      // Pick cardinal direction toward player (snap to nearest 90°)
      const rawAngle = Phaser.Math.Angle.Between(this.x, this.y, player.x, player.y);
      this.chargeDir = Math.round(rawAngle / (Math.PI/2)) * (Math.PI/2);
      this.scene.physics.velocityFromRotation(this.chargeDir, this.speed, this.body.velocity);
      this.bodySprite.setRotation(this.chargeDir);
      // Drop a mine mid-charge
      if (this.scene.registry.get('entityClasses')) {
        const { Mine } = this.scene.registry.get('entityClasses');
        const m = new Mine(this.scene, this.x, this.y);
        this.scene.activeMines.add(m);
      }
    }
    // Fires ahead along charge direction
    if (time > this.lastFired + this.fireRate) {
      this.lastFired = time;
      this._fire(this.chargeDir);
    }
  }

  // L60: Harley boss — fast charge + 3-shot spread + drops mine on low health
  _aiMiniHarley(time, delta) {
    const player = this.scene.player;
    if (!player || player.isDead) return;
    const angle = Phaser.Math.Angle.Between(this.x, this.y, player.x, player.y);
    if (this.stateTimer <= 0) {
      this.stateTimer = Phaser.Math.Between(600, 1200);
      this.scene.physics.velocityFromRotation(angle, this.speed, this.body.velocity);
      this.bodySprite.setRotation(angle);
    }
    if (time > this.lastFired + this.fireRate) {
      this.lastFired = time;
      [-0.3, 0, 0.3].forEach(offset => this._fire(angle + offset));
      // Drop mine when hurt
      if (this.health <= 1 && this.scene.registry.get('entityClasses')) {
        const { Mine } = this.scene.registry.get('entityClasses');
        const m = new Mine(this.scene, this.x, this.y);
        this.scene.activeMines.add(m);
      }
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────

  _fireBouncy(angle, extraBounces) {
    const { Bullet } = this.scene.registry.get('entityClasses');
    const b = new Bullet(this.scene, this.x, this.y, angle, 'enemy', extraBounces);
    this.bullets.push(b);
    this.scene.activeBullets.add(b);
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
    // Capture scene reference BEFORE destroy() — Phaser nulls this.scene after destroy
    const scene = this.scene;
    scene.events.emit('audioPlay', 'explosion');
    // Simple explosion rings — no texture dependency
    const g = scene.add.graphics();
    g.lineStyle(3, 0xFF6600);
    g.strokeCircle(this.x, this.y, 10);
    scene.tweens.add({
      targets: g,
      scaleX: 4, scaleY: 4,
      alpha: 0,
      duration: 400,
      onComplete: () => g.destroy()
    });
    // Second ring
    const g2 = scene.add.graphics();
    g2.lineStyle(2, 0xFFFF00);
    g2.strokeCircle(this.x, this.y, 5);
    scene.tweens.add({
      targets: g2,
      scaleX: 3, scaleY: 3,
      alpha: 0,
      duration: 250,
      onComplete: () => g2.destroy()
    });
    this.destroy();
    scene.events.emit('enemyKilled');
  }
}
