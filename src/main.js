import { Boot } from './scenes/Boot.js';
import { Splash } from './scenes/Splash.js';
import { Game } from './scenes/Game.js';
import { HUD } from './scenes/HUD.js';
import { LevelCard } from './scenes/LevelCard.js';
import { Victory } from './scenes/Victory.js';
import { GameOver } from './scenes/GameOver.js';

const config = {
  type: Phaser.AUTO,
  backgroundColor: '#000000',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 480,
    height: 854,
    parent: document.body,
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 0 },
      debug: false,
    }
  },
  scene: [Boot, Splash, Game, HUD, LevelCard, Victory, GameOver],
  dom: {
    createContainer: false
  }
};

const game = new Phaser.Game(config);

// Prevent iOS scroll bounce and double-tap zoom
document.addEventListener('touchstart', e => e.preventDefault(), { passive: false });
document.addEventListener('touchmove', e => e.preventDefault(), { passive: false });
document.addEventListener('touchend', e => e.preventDefault(), { passive: false });

// Apply touch-action: none to canvas
game.canvas.style.touchAction = 'none';
game.canvas.style.userSelect = 'none';

window.addEventListener('resize', () => game.scale.refresh());
