export class Boot extends Phaser.Scene {
  constructor() { super('Boot'); }
  preload() {
    // No external assets — everything is drawn programmatically
    // Just show a loading screen
    const W = this.sys.game.config.width;
    const H = this.sys.game.config.height;
    this.add.text(W/2, H/2, 'Loading...', {
      fontSize: '28px', color: '#fff', fontFamily: 'Arial'
    }).setOrigin(0.5);
  }
  create() {
    this.scene.start('Splash');
  }
}
