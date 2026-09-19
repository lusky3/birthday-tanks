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

// Prevent scrolling on mobile
document.body.addEventListener('touchmove', e => e.preventDefault(), { passive: false });
window.addEventListener('resize', () => game.scale.refresh());
