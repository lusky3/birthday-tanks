export class GameOver extends Phaser.Scene {
  constructor() { super('GameOver'); }

  init(data) {
    this.levelIndex = data.levelIndex || 0;
  }

  create() {
    const W = this.sys.game.config.width;
    const H = this.sys.game.config.height;

    const bg = this.add.graphics();
    bg.fillGradientStyle(0x1a0000, 0x1a0000, 0x000000, 0x000000, 1);
    bg.fillRect(0, 0, W, H);

    // Dramatic crash icon
    this.add.text(W/2, H * 0.3, '🏍️💥', { fontSize: '64px' }).setOrigin(0.5);

    // Friendly humorous message — references Allan
    this.add.text(W/2, H * 0.45, "Allan's tank needs\na pit stop!", {
      fontSize: '26px', color: '#FF6666', fontFamily: 'Arial',
      fontStyle: 'bold', align: 'center', lineSpacing: 10
    }).setOrigin(0.5);

    // How far the player got
    this.add.text(W/2, H * 0.58, `You reached level ${this.levelIndex + 1}/70`, {
      fontSize: '18px', color: '#AAAAAA', fontFamily: 'Arial'
    }).setOrigin(0.5);

    // Try Again — restarts from level 1 with 3 lives
    const tryAgainBtn = this.add.text(W/2, H * 0.72, '🔄 Try Again', {
      fontSize: '24px', color: '#FFFFFF', fontFamily: 'Arial',
      backgroundColor: '#AA2200', padding: { x: 24, y: 14 }
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    tryAgainBtn.on('pointerover', () => tryAgainBtn.setStyle({ color: '#FFD700' }));
    tryAgainBtn.on('pointerout',  () => tryAgainBtn.setStyle({ color: '#FFFFFF' }));
    tryAgainBtn.on('pointerdown', () => {
      this.scene.start('Game', { levelIndex: 0 });
    });

    // Back to splash — shows birthday screen again
    const splashBtn = this.add.text(W/2, H * 0.84, 'Back to Start', {
      fontSize: '16px', color: '#AAAAAA', fontFamily: 'Arial'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    splashBtn.on('pointerover', () => splashBtn.setStyle({ color: '#FFFFFF' }));
    splashBtn.on('pointerout',  () => splashBtn.setStyle({ color: '#AAAAAA' }));
    splashBtn.on('pointerdown', () => {
      this.scene.start('Splash');
    });
  }
}
