export class Mine extends Phaser.GameObjects.Image {
  constructor(scene, x, y) {
    // Create mine texture once; reused for all mines
    if (!scene.textures.exists('mine')) {
      const g = scene.add.graphics();
      g.fillStyle(0x333333); g.fillCircle(8, 8, 8);
      g.fillStyle(0xFF0000); g.fillCircle(8, 8, 3);
      // spikes radiating outward
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2;
        g.fillRect(8 + Math.cos(a) * 8 - 1, 8 + Math.sin(a) * 8 - 1, 3, 3);
      }
      g.generateTexture('mine', 16, 16);
      g.destroy();
    }
    super(scene, x, y, 'mine');
    this.armed = false;
    this.isDead = false;
    this.radius = 60; // explosion radius in pixels
    scene.add.existing(this);
    scene.physics.add.existing(this, true); // static physics body — doesn't move
    // Arm after 1.5 seconds so the player can drop and drive away
    scene.time.delayedCall(1500, () => {
      if (!this.isDead) {
        this.armed = true;
        this.setTint(0xFF4400);
        // Start accelerating beep
        const audio = scene.registry.get('audio');
        if (audio) audio.startMineBeep();
      }
    });
    // Blink once armed to warn nearby tanks
    scene.tweens.add({ targets: this, alpha: 0.5, duration: 500, yoyo: true, repeat: -1, delay: 1500 });
  }

  explode() {
    if (this.isDead) return;
    this.isDead = true;
    const scene = this.scene;
    // Stop beeping
    const audio = scene.registry.get('audio');
    if (audio) audio.stopMineBeep();
    scene.events.emit('audioPlay', 'explosion');
    // Visual flash circle at explosion site
    const expl = scene.add.graphics();
    expl.fillStyle(0xFF6600, 0.8);
    expl.fillCircle(this.x, this.y, this.radius);
    scene.time.delayedCall(300, () => expl.destroy());
    // Notify game scene so it can damage anything within radius
    const ex = this.x;
    const ey = this.y;
    const er = this.radius;
    this.destroy();
    scene.events.emit('mineExploded', ex, ey, er);
  }
}
