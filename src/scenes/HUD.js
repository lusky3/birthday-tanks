import { LEVELS } from '../data/levels.js';

export class HUD extends Phaser.Scene {
  constructor() { super('HUD'); }

  init(data) {
    this.levelIndex = data.levelIndex || 0;
    this.lives = data.lives || 3;
    this.minesAllowed = data.minesAllowed || 1;
  }

  create() {
    const W = this.sys.game.config.width;
    const level = LEVELS[this.levelIndex];

    // Semi-transparent HUD bar at top
    const bg = this.add.graphics();
    bg.fillStyle(0x000000, 0.85);
    bg.fillRect(0, 0, W, 78);

    // Lives displayed as motorcycle emoji icons
    this._livesGroup = this.add.group();
    this._updateLivesDisplay();

    // Level number — centred
    this._levelText = this.add.text(W/2, 20, `Level ${this.levelIndex + 1}/70`, {
      fontSize: '15px', color: '#FFD700', fontFamily: 'Arial', fontStyle: 'bold'
    }).setOrigin(0.5);

    // Level name / year — centred, smaller
    this._nameText = this.add.text(W/2, 42, level ? `${level.year} — ${level.name}` : '', {
      fontSize: '12px', color: '#FFFFFF', fontFamily: 'Arial'
    }).setOrigin(0.5);

    // Mine count — right-aligned
    this._mineText = this.add.text(W - 10, 20, `💣×${this.minesAllowed}`, {
      fontSize: '16px', color: '#AAAAAA', fontFamily: 'Arial'
    }).setOrigin(1, 0.5);

    // Enemy counter — right side, below mines
    this._enemyText = this.add.text(W - 10, 45, '', {
      fontSize: '13px', color: '#FF8888', fontFamily: 'Arial'
    }).setOrigin(1, 0.5);

    // Listen for update events emitted by Game scene
    this.events.on('updateLives', (lives) => {
      this.lives = lives;
      this._updateLivesDisplay();
    });
    this.events.on('updateMines', (count) => {
      this._mineText.setText(`💣×${count}`);
    });
    this.events.on('updateEnemies', (count) => {
      this._enemyText.setText(count > 0 ? `🎯 ${count}` : '');
    });
  }

  _updateLivesDisplay() {
    // Destroy old icons first
    this._livesGroup.clear(true, true);
    for (let i = 0; i < this.lives; i++) {
      const icon = this.add.text(10 + i * 28, 20, '🏍️', {
        fontSize: '20px'
      }).setOrigin(0, 0.5);
      this._livesGroup.add(icon);
    }
  }
}
