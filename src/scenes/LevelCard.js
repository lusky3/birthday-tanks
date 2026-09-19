export class LevelCard extends Phaser.Scene {
  constructor() { super({ key: 'LevelCard', active: false }); }

  init(data) {
    this.level = data.level;
  }

  create() {
    const W = this.sys.game.config.width;
    const H = this.sys.game.config.height;

    if (!this.level) { this.scene.stop(); return; }

    // Dim the game scene behind the card
    const overlay = this.add.graphics();
    overlay.fillStyle(0x000000, 0.75);
    overlay.fillRect(0, 0, W, H);

    // Card background with gold border
    const card = this.add.graphics();
    card.fillStyle(0x1a1a3e, 1);
    card.lineStyle(3, 0xFFD700);
    card.fillRoundedRect(W/2 - 180, H/2 - 100, 360, 200, 16);
    card.strokeRoundedRect(W/2 - 180, H/2 - 100, 360, 200, 16);

    // World · Level subtitle
    this.add.text(W/2, H/2 - 70, `World ${this.level.world} · Level ${this.level.level}`, {
      fontSize: '15px', color: '#AAAAAA', fontFamily: 'Arial'
    }).setOrigin(0.5);

    // Year — big and prominent
    this.add.text(W/2, H/2 - 35, `${this.level.year}`, {
      fontSize: '48px', color: '#FFD700', fontFamily: 'Arial', fontStyle: 'bold'
    }).setOrigin(0.5);

    // Level name
    this.add.text(W/2, H/2 + 25, this.level.name, {
      fontSize: '20px', color: '#FFFFFF', fontFamily: 'Arial',
      wordWrap: { width: 320 }, align: 'center'
    }).setOrigin(0.5);

    // Auto-dismiss after 2.5 seconds
    this.time.delayedCall(2500, () => {
      if (this.scene.isActive()) this.scene.stop();
    });

    // Tap to dismiss early
    this.input.once('pointerdown', () => {
      if (this.scene.isActive()) this.scene.stop();
    });
  }
}
