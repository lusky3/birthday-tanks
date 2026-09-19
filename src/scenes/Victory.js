export class Victory extends Phaser.Scene {
  constructor() { super('Victory'); }

  create() {
    const W = this.sys.game.config.width;
    const H = this.sys.game.config.height;

    // Clear saved progress — player has beaten the game
    localStorage.removeItem('birthdayTanks_progress');

    // Deep celebratory gradient
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x001a00, 0x001a3e, 0x1a0028, 0x000000, 1);
    bg.fillRect(0, 0, W, H);

    // Confetti — 50 coloured squares falling with variation
    this._confettiGraphics = [];
    const confettiColors = [0xFF6B6B, 0xFFD700, 0x6BCB77, 0x4D9FEC, 0xFF8C42, 0xC77DFF];
    for (let i = 0; i < 50; i++) {
      const c = this.add.graphics();
      c.fillStyle(confettiColors[Math.floor(Math.random() * confettiColors.length)]);
      c.fillRect(-4, -4, 8, 8);
      c.setPosition(Phaser.Math.Between(0, W), -20);
      c.setRotation(Math.random() * Math.PI * 2);
      this._confettiGraphics.push(c);
      this.tweens.add({
        targets: c,
        y: H + 20,
        x: c.x + Phaser.Math.Between(-80, 80),
        rotation: c.rotation + Phaser.Math.FloatBetween(-3, 3),
        duration: Phaser.Math.Between(3000, 6000),
        delay: Phaser.Math.Between(0, 2000),
        repeat: -1
      });
    }

    // Emoji header
    this.add.text(W/2, H * 0.12, '🎂🎉🎂', { fontSize: '48px' }).setOrigin(0.5);

    // Big WIN text
    this.add.text(W/2, H * 0.24, 'YOU WIN!', {
      fontSize: '52px', color: '#FFD700', fontFamily: 'Arial',
      fontStyle: 'bold', stroke: '#000', strokeThickness: 6
    }).setOrigin(0.5);

    // Heartfelt message
    this.add.text(W/2, H * 0.36, '70 levels.\n70 years.\nStill going strong.', {
      fontSize: '22px', color: '#FFFFFF', fontFamily: 'Arial',
      align: 'center', lineSpacing: 10
    }).setOrigin(0.5);

    // Personal birthday dedication
    this.add.text(W/2, H * 0.54, 'Happy Birthday, Dad! ❤️', {
      fontSize: '26px', color: '#FF6B6B', fontFamily: 'Arial',
      fontStyle: 'bold', stroke: '#000', strokeThickness: 3
    }).setOrigin(0.5);

    // From the family
    this.add.text(W/2, H * 0.63, 'Love, Cody, Amy, Jenn,\nKelsey & Carrie 💕', {
      fontSize: '18px', color: '#AADDFF', fontFamily: 'Arial',
      align: 'center', lineSpacing: 8
    }).setOrigin(0.5);

    // Giant 70 — the achievement
    this.add.text(W/2, H * 0.75, '7️⃣0️⃣', { fontSize: '64px' }).setOrigin(0.5);

    // Play again button
    const btn = this.add.text(W/2, H * 0.89, '🔄 Play Again', {
      fontSize: '20px', color: '#FFFFFF', fontFamily: 'Arial',
      backgroundColor: '#224400', padding: { x: 20, y: 12 }
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    btn.on('pointerover', () => btn.setStyle({ color: '#FFD700' }));
    btn.on('pointerout',  () => btn.setStyle({ color: '#FFFFFF' }));
    btn.on('pointerdown', () => this.scene.start('Game', { levelIndex: 0 }));

    // Play victory jingle
    const audio = this.registry.get('audio');
    if (audio) {
      audio.stopAll();
      audio.play('victory');
    }
  }
}
