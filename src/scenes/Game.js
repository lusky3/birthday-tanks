import { LEVELS } from '../data/levels.js';
import { PlayerTank } from '../entities/PlayerTank.js';
import { EnemyTank } from '../entities/EnemyTank.js';
import { Bullet } from '../entities/Bullet.js';
import { Mine } from '../entities/Mine.js';
import { TerrainBuilder } from '../systems/TerrainBuilder.js';
import { TouchControls } from '../systems/TouchControls.js';

export class Game extends Phaser.Scene {
  constructor() { super('Game'); }

  init(data) {
    this.levelIndex = data.levelIndex || 0;
    this.lives = data.lives !== undefined ? data.lives : 3;
  }

  create() {
    const W = this.sys.game.config.width;
    const H = this.sys.game.config.height;

    this.currentLevel = LEVELS[this.levelIndex];
    if (!this.currentLevel) {
      // All levels complete!
      this.scene.start('Victory');
      return;
    }

    // Register entity classes for use by entities
    this.registry.set('entityClasses', { Bullet, Mine });

    // Active groups — must be physics groups so collider/overlap callbacks fire
    this.activeBullets = this.physics.add.group();
    this.activeMines = this.physics.add.group();
    this.enemies = [];
    this._enemiesRemaining = 0;

    // Build terrain
    this.terrainBuilder = new TerrainBuilder(this);
    this.terrainBuilder.build(this.currentLevel);

    // Spawn player
    const ps = this.currentLevel.playerStart;
    const T = TerrainBuilder.TILE_SIZE;
    const playerX = ps.x * T + T/2;
    const playerY = ps.y * T + T/2 + 80;
    this.player = new PlayerTank(this, playerX, playerY);
    this.player.lives = this.lives;
    this.player.minesRemaining = this.currentLevel.minesAllowed;

    // Spawn enemies
    this.currentLevel.enemies.forEach(e => {
      const ex = e.x * T + T/2;
      const ey = e.y * T + T/2 + 80;
      const enemy = new EnemyTank(this, ex, ey, e.type);
      enemy.bounceCount = this.currentLevel.bounceCount;
      this.enemies.push(enemy);
      this._enemiesRemaining++;
    });
    // Group used for overlap/collider registration (avoids re-registering on respawn)
    this.enemyGroup = this.physics.add.group(this.enemies);

    // Touch controls
    this.controls = new TouchControls(this);

    // Keyboard controls (desktop)
    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = this.input.keyboard.addKeys('W,A,S,D,SPACE,X');

    // Start HUD scene on top
    this.scene.launch('HUD', { levelIndex: this.levelIndex, lives: this.lives, minesAllowed: this.currentLevel.minesAllowed });
    this.scene.launch('LevelCard', { level: this.currentLevel });

    // Events
    this.events.on('enemyKilled', this._onEnemyKilled, this);
    this.events.on('playerDied', this._onPlayerDied, this);
    this.events.on('mineExploded', this._onMineExploded, this);
    this.events.on('audioPlay', (type) => {
      const audio = this.registry.get('audio');
      if (audio) audio.play(type);
    });

    // Collisions
    this._setupCollisions();
  }

  _setupCollisions() {
    const { stoneBlocks, dirtBlocks, holeZones } = this.terrainBuilder;

    // Player vs walls
    this.physics.add.collider(this.player, stoneBlocks);
    this.physics.add.collider(this.player, dirtBlocks);

    // Enemies vs walls — bounce direction on impact
    this.enemies.forEach(e => {
      this.physics.add.collider(e, stoneBlocks, () => {
        e.body.velocity.x *= -1;
        e.body.velocity.y *= -1;
      });
      this.physics.add.collider(e, dirtBlocks, () => {
        e.body.velocity.x *= -1;
        e.body.velocity.y *= -1;
      });
    });

    // Bullet vs stone — ricochet: Phaser's setBounce(1,1) flips velocity, we just count
    this.physics.add.collider(this.activeBullets, stoneBlocks, (bullet) => {
      if (bullet && !bullet.isDead && bullet.bounce) bullet.bounce();
    });

    // Bullet vs dirt — destroy block, ricochet
    this.physics.add.collider(this.activeBullets, dirtBlocks, (bullet, block) => {
      block.destroy();
      if (bullet && !bullet.isDead && bullet.bounce) bullet.bounce();
    });

    // Player bullets vs enemies — group overlap avoids per-enemy registration
    this.physics.add.overlap(this.activeBullets, this.enemyGroup, (bullet, enemy) => {
      if (bullet.owner === 'player' && !bullet.isDead && !enemy.isDead) {
        bullet.isDead = true;
        bullet.destroy();
        enemy.hit();
      }
    });

    // Enemy bullets vs player
    this.physics.add.overlap(this.activeBullets, this.player, (bullet, player) => {
      if (bullet.owner === 'enemy' && !bullet.isDead && !player.isDead) {
        bullet.isDead = true; // mark dead before destroy() to prevent double-hit
        bullet.destroy();
        player.loseLife();
      }
    });

    // Player in hole = instant death
    if (holeZones) {
      this.physics.add.overlap(this.player, holeZones, () => {
        if (!this.player.isDead) this.player.loseLife();
      });
    }

    // Armed mine contacts with tanks
    this.physics.add.overlap(this.player, this.activeMines, (player, mine) => {
      if (mine.armed && !mine.isDead) mine.explode();
    });
    this.physics.add.overlap(this.enemyGroup, this.activeMines, (enemy, mine) => {
      if (mine.armed && !mine.isDead) mine.explode();
    });
  }

  _onEnemyKilled() {
    this._enemiesRemaining--;
    this.scene.get('HUD')?.events.emit('updateEnemies', this._enemiesRemaining);
    if (this._enemiesRemaining <= 0) {
      this.time.delayedCall(800, () => {
        const audio = this.registry.get('audio');
        if (audio) audio.play('levelStart');
        // Save progress before advancing so player can continue from this point
        localStorage.setItem('birthdayTanks_progress', JSON.stringify({
          levelIndex: this.levelIndex + 1,
          lives: this.player.lives
        }));
        this.scene.stop('HUD');
        this.scene.stop('LevelCard');
        this.scene.start('Game', {
          levelIndex: this.levelIndex + 1,
          lives: this.player.lives
        });
      });
    }
  }

  _onPlayerDied(livesLeft) {
    this.scene.get('HUD')?.events.emit('updateLives', livesLeft);
    if (livesLeft <= 0) {
      this.time.delayedCall(1000, () => {
        this.scene.stop('HUD');
        this.scene.stop('LevelCard');
        this.scene.start('GameOver', { levelIndex: this.levelIndex });
      });
    } else {
      // Respawn at start position after short delay
      this.time.delayedCall(1500, () => {
        const ps = this.currentLevel.playerStart;
        const T = TerrainBuilder.TILE_SIZE;
        this.player.respawn(ps.x * T + T/2, ps.y * T + T/2 + 80);
      });
    }
  }

  _onMineExploded(x, y, radius) {
    // Damage enemies in blast radius
    this.enemies.forEach(e => {
      if (!e.isDead) {
        const dist = Phaser.Math.Distance.Between(x, y, e.x, e.y);
        if (dist < radius) e.hit();
      }
    });
    // Friendly fire — player caught in their own blast
    if (this.player && !this.player.isDead) {
      const dist = Phaser.Math.Distance.Between(x, y, this.player.x, this.player.y);
      if (dist < radius) this.player.loseLife();
    }
    // Destroy nearby dirt blocks
    this.terrainBuilder.destroyDirtAt(x, y);
  }

  update(time, delta) {
    if (!this.player || !this.currentLevel) return;

    // Gather touch input
    const touchInput = this.controls.getInput();
    let dx = touchInput.dx;
    let dy = touchInput.dy;
    let aimX = touchInput.aimX;
    let aimY = touchInput.aimY;
    let fire = touchInput.fire;
    let mine = touchInput.mine;

    // Keyboard overrides (desktop)
    if (this.cursors.left.isDown || this.wasd.A.isDown) dx = -1;
    else if (this.cursors.right.isDown || this.wasd.D.isDown) dx = 1;
    if (this.cursors.up.isDown || this.wasd.W.isDown) dy = -1;
    else if (this.cursors.down.isDown || this.wasd.S.isDown) dy = 1;
    if (this.input.activePointer.isDown && !touchInput.fire) {
      aimX = this.input.activePointer.x;
      aimY = this.input.activePointer.y;
    }
    if (this.wasd.SPACE.isDown) fire = true;
    if (this.wasd.X.isDown) mine = true;

    this.player.update(time, delta, { dx, dy, aimX, aimY, fire, mine });

    // Update each enemy's AI
    this.enemies.forEach(e => e.update(time, delta));

    // Update bullet positions / out-of-bounds checks
    this.activeBullets.getChildren().forEach(b => b.update?.(time, delta));
  }
}
