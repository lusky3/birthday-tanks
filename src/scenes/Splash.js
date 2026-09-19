import { AudioManager } from '../systems/AudioManager.js';

export class Splash extends Phaser.Scene {
  constructor() { super('Splash'); }

  create() {
    const W = this.sys.game.config.width;
    const H = this.sys.game.config.height;

    // Audio manager — stored in registry for global access
    const audio = new AudioManager();
    this.registry.set('audio', audio);

    // Background gradient
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x1a1a3e, 0x1a1a3e, 0x0d0d2e, 0x0d0d2e, 1);
    bg.fillRect(0, 0, W, H);

    // Animated candles
    this._candles = [];
    for (let i = 0; i < 7; i++) {
      const x = (W / 8) * (i + 1);
      const candle = this.add.graphics();
      this._drawCandle(candle, 0, 0);
      candle.setPosition(x, H * 0.15);
      this._candles.push(candle);
      // Flicker tween
      this.tweens.add({
        targets: candle,
        scaleY: 0.95,
        scaleX: 1.05,
        duration: 150 + i * 30,
        yoyo: true,
        repeat: -1
      });
    }

    // Birthday text
    this.add.text(W/2, H * 0.32, '🎂', { fontSize: '64px' }).setOrigin(0.5);

    this.add.text(W/2, H * 0.42, 'Happy 70th Birthday', {
      fontSize: '26px',
      color: '#FFD700',
      fontFamily: 'Arial',
      fontStyle: 'bold',
      stroke: '#000',
      strokeThickness: 3,
      align: 'center',
      wordWrap: { width: W - 40 }
    }).setOrigin(0.5);

    this.add.text(W/2, H * 0.50, 'Allan Lusk!', {
      fontSize: '38px',
      color: '#FF6B6B',
      fontFamily: 'Arial',
      fontStyle: 'bold',
      stroke: '#000',
      strokeThickness: 4,
    }).setOrigin(0.5);

    this.add.text(W/2, H * 0.59, 'From Cody, Amy, Jenn\n& Kelsey — and Carrie 💕', {
      fontSize: '18px',
      color: '#AADDFF',
      fontFamily: 'Arial',
      align: 'center',
      lineSpacing: 8,
    }).setOrigin(0.5);

    // Game title
    this.add.text(W/2, H * 0.70, '🏍️ BIRTHDAY TANKS! 🏍️', {
      fontSize: '22px',
      color: '#FFFFFF',
      fontFamily: 'Arial',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    this.add.text(W/2, H * 0.76, '70 Levels · 70 Years', {
      fontSize: '16px',
      color: '#AAAAAA',
      fontFamily: 'Arial',
    }).setOrigin(0.5);

    // Pulsing tap button
    const tapBtn = this.add.text(W/2, H * 0.87, '👆 TAP TO PLAY 👆', {
      fontSize: '22px',
      color: '#FFFFFF',
      fontFamily: 'Arial',
      fontStyle: 'bold',
      backgroundColor: '#FF4444',
      padding: { x: 20, y: 12 },
    }).setOrigin(0.5);
    this.tweens.add({ targets: tapBtn, alpha: 0.4, duration: 700, yoyo: true, repeat: -1 });

    // Start on tap
    this.input.once('pointerdown', () => {
      const audio = this.registry.get('audio');
      audio.unlock();
      audio.play('levelStart');
      this.scene.start('Game', { levelIndex: 0 });
    });
  }

  _drawCandle(g, x, y) {
    g.clear();
    g.fillStyle(0xFFF8DC); g.fillRect(x - 8, y - 15, 16, 30);
    g.fillStyle(0xFFD700); g.fillCircle(x, y - 17, 4);
    g.fillStyle(0xFF8C00); g.fillTriangle(x-3, y-17, x+3, y-17, x, y-24);
  }
}
