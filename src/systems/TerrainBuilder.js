// Tile IDs: 0=open, 1=dirt(destructible), 2=stone(indestructible), 3=hole
export class TerrainBuilder {
  static TILE_SIZE = 30; // px per tile  (480 / 16 = 30)
  static COLS = 16;      // tiles wide (480px / 30px)
  static ROWS = 24;      // tiles tall (720px playfield / 30px) — bottom of HUD-offset area

  constructor(scene) {
    this.scene = scene;
    this.dirtBlocks = scene.physics.add.staticGroup();
    this.stoneBlocks = scene.physics.add.staticGroup();
    this.holeZones = scene.add.group();
    this.wallGraphics = scene.add.graphics();
  }

  build(levelData) {
    const { terrain } = levelData;
    this.dirtBlocks.clear(true, true);
    this.stoneBlocks.clear(true, true);
    this.holeZones.clear(true, true);
    this.wallGraphics.clear();

    const T = TerrainBuilder.TILE_SIZE;
    // World-specific colors
    const worldColors = [
      0xF4D03F, // World 1 - sunny yellow
      0x58D68D, // World 2 - green fields
      0x5DADE2, // World 3 - lake blue
      0xE67E22, // World 4 - warm orange
      0x27AE60, // World 5 - forest green
      0x7F8C8D, // World 6 - road gray
      0x1A1A2E, // World 7 - space black
    ];
    const world = levelData.world - 1;
    const bgColor = worldColors[world] || 0x4A4A4A;

    // Draw background
    this.scene.cameras.main.setBackgroundColor(bgColor);

    // Draw border (always stone)
    this._drawBorder();

    for (let row = 0; row < TerrainBuilder.ROWS; row++) {
      for (let col = 0; col < TerrainBuilder.COLS; col++) {
        // Support both 2D arrays (terrain[row][col]) and flat arrays (terrain[row*COLS+col])
        const tile = Array.isArray(terrain[row])
          ? (terrain[row][col] || 0)
          : (terrain[row * TerrainBuilder.COLS + col] || 0);
        const px = col * T + T / 2;
        const py = row * T + T / 2 + 80; // +80 for HUD at top

        if (tile === 1) {
          // Dirt block — destructible
          const block = this._makeBlock(px, py, T - 2, 0xA0522D, 0x8B4513);
          this.dirtBlocks.add(block, true);
        } else if (tile === 2) {
          // Stone — indestructible
          const block = this._makeBlock(px, py, T - 2, 0x808080, 0x606060);
          this.stoneBlocks.add(block, true);
        } else if (tile === 3) {
          // Hole — death zone
          this.wallGraphics.fillStyle(0x0a0a0a);
          this.wallGraphics.fillRect(px - T / 2, py - T / 2, T, T);
          const zone = this.scene.add.zone(px, py, T, T);
          this.scene.physics.add.existing(zone, true);
          this.holeZones.add(zone);
        }
      }
    }
  }

  _makeBlock(x, y, size, fillColor, strokeColor) {
    const g = this.scene.add.graphics();
    g.fillStyle(fillColor);
    g.fillRect(-size / 2, -size / 2, size, size);
    g.lineStyle(1, strokeColor);
    g.strokeRect(-size / 2, -size / 2, size, size);
    const key = `block_${fillColor}`;
    if (!this.scene.textures.exists(key)) {
      g.generateTexture(key, size, size);
    }
    g.destroy();
    const img = this.scene.add.image(x, y, key);
    return img;
  }

  _drawBorder() {
    const T = TerrainBuilder.TILE_SIZE;
    const W = this.scene.sys.game.config.width;
    const gameH = TerrainBuilder.ROWS * T;
    this.wallGraphics.fillStyle(0x606060);
    this.wallGraphics.fillRect(0, 80, W, T);              // top
    this.wallGraphics.fillRect(0, 80 + gameH - T, W, T);  // bottom
    this.wallGraphics.fillRect(0, 80, T, gameH);           // left
    this.wallGraphics.fillRect(W - T, 80, T, gameH);       // right
  }

  destroyDirtAt(x, y) {
    const T = TerrainBuilder.TILE_SIZE;
    this.dirtBlocks.getChildren().forEach(block => {
      if (Math.abs(block.x - x) < T && Math.abs(block.y - y) < T) {
        block.destroy();
      }
    });
  }
}
