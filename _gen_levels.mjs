// Generator script for src/data/levels.js
// Run: node _gen_levels.mjs > src/data/levels.js

// ─── Terrain helpers ───────────────────────────────────────────────────────
// Grid is 16 columns × 24 rows.  Index [row][col].
// Tile IDs: 0=open, 1=dirt(destructible), 2=stone(indestructible), 3=hole

const COLS = 16;
const ROWS = 24;

/** Return a fresh empty (all-0) grid */
function emptyGrid() {
  return Array.from({ length: ROWS }, () => new Array(COLS).fill(0));
}

/** Clone a grid */
function cloneGrid(g) {
  return g.map(r => [...r]);
}

/** Set a rectangular region to a tile type (0‑indexed, inclusive) */
function fillRect(grid, c0, r0, c1, r1, tile) {
  for (let r = r0; r <= r1; r++)
    for (let c = c0; c <= c1; c++)
      grid[r][c] = tile;
}

/** Draw a border of stone around the whole grid */
function borderStone(grid) {
  fillRect(grid, 0, 0, COLS - 1, 0, 2);          // top
  fillRect(grid, 0, ROWS - 1, COLS - 1, ROWS - 1, 2); // bottom
  fillRect(grid, 0, 0, 0, ROWS - 1, 2);           // left
  fillRect(grid, COLS - 1, 0, COLS - 1, ROWS - 1, 2); // right
}

/** Ensure a cell and a 1-cell radius around it are open (tile 0) */
function clearZone(grid, cx, cy, radius = 1) {
  for (let dr = -radius; dr <= radius; dr++)
    for (let dc = -radius; dc <= radius; dc++) {
      const r = cy + dr, c = cx + dc;
      if (r >= 0 && r < ROWS && c >= 0 && c < COLS)
        grid[r][c] = 0;
    }
}

/**
 * Build terrain from a recipe:
 *   recipe: array of { type: 'hwall'|'vwall'|'block'|'holes'|'dirtfield', ... }
 * Then apply border + clear zones for player/enemies.
 */
function buildTerrain(recipe, clearPoints) {
  const g = emptyGrid();

  for (const cmd of recipe) {
    if (cmd.type === 'hwall') {
      // horizontal stone wall segment
      fillRect(g, cmd.c0, cmd.row, cmd.c1, cmd.row, 2);
    } else if (cmd.type === 'vwall') {
      // vertical stone wall segment
      fillRect(g, cmd.col, cmd.r0, cmd.col, cmd.r1, 2);
    } else if (cmd.type === 'block') {
      // single stone block
      g[cmd.row][cmd.col] = 2;
    } else if (cmd.type === 'dirtrow') {
      fillRect(g, cmd.c0, cmd.row, cmd.c1, cmd.row, 1);
    } else if (cmd.type === 'dirtcol') {
      fillRect(g, cmd.col, cmd.r0, cmd.col, cmd.r1, 1);
    } else if (cmd.type === 'dirtblock') {
      g[cmd.row][cmd.col] = 1;
    } else if (cmd.type === 'hole') {
      g[cmd.row][cmd.col] = 3;
    } else if (cmd.type === 'holerow') {
      fillRect(g, cmd.c0, cmd.row, cmd.c1, cmd.row, 3);
    }
  }

  borderStone(g);

  // Clear spawn zones
  for (const pt of clearPoints) {
    clearZone(g, pt.x, pt.y, 1);
  }

  return g;
}

// ─── Level name lookup ────────────────────────────────────────────────────
const NAMES = {
  1956: "Year One",
  1957: "The Adventures Begin",
  1958: "Learning the Ropes",
  1959: "Finding My Way",
  1960: "The Big 4",
  1961: "Grade School Days",
  1962: "Making Friends",
  1963: "Young & Wild",
  1964: "Hockey Season",
  1965: "First Goals",
  1966: "Growing Up Fast",
  1967: "Teen Years",
  1968: "On the Ice",
  1969: "Man on the Moon",
  1970: "The Teenage Years",
  1971: "Open Road Ahead",
  1972: "Drive!",
  1973: "Good Times",
  1974: "The Cottage Calls",
  1975: "Lake Life",
  1976: "Out on the Water",
  1977: "Star Wars!",
  1978: "Riding Free",
  1979: "The Open Road",
  1980: "New Decade",
  1981: "First Harley?",
  1982: "Throttle Up",
  1983: "Return of the Jedi",
  1984: "Full Throttle",
  1985: "Making Moves",
  1986: "A New Chapter",
  1987: "Married Carrie \u2764\ufe0f",
  1988: "Amy Arrives \uD83C\uDF80",
  1989: "Family Man",
  1990: "The \u201990s Begin",
  1991: "Jenn Arrives \uD83C\uDF80",
  1992: "Full House",
  1993: "Cody Arrives \uD83C\uDF89",
  1994: "Four-Time Champion",
  1995: "The Crew Is Complete",
  1996: "Kelsey Arrives \uD83C\uDF80",
  1997: "Weekend Warrior",
  1998: "Cottage Country",
  1999: "Y2K? No Problem",
  2000: "New Millennium",
  2001: "Die Hard Fan",
  2002: "Back on the Ice",
  2003: "Weekend Rides",
  2004: "Open Water",
  2005: "Half Century",
  2006: "The Road Calls",
  2007: "Star Trek Lives",
  2008: "Wind in the Hair",
  2009: "Fairway Days",
  2010: "Master of the Grill",
  2011: "Hole in One?",
  2012: "Still Riding",
  2013: "Captain of the Boat",
  2014: "All Four Seasons",
  2015: "Road Trip",
  2016: "The Legend Era",
  2017: "Grandpa Goals",
  2018: "Still Got It",
  2019: "The Best Decade",
  2020: "Lock It Down",
  2021: "Back on the Water",
  2022: "Throttle Wide Open",
  2023: "Par for the Course",
  2024: "Legendary",
  2025: "Almost 70",
  2026: "THE LEGEND TURNS 70! \uD83C\uDF82",
};

// ─── World config ─────────────────────────────────────────────────────────
const WORLD_CONFIG = [
  // World 1 (1956-1965): candles only, 1-3 enemies, bounceCount:1, minesAllowed:1
  { worldNum: 1, startYear: 1956, enemyTypes: ['candle'], maxEnemies: 3, minEnemies: 1, bounceCount: 1, minesAllowed: 1 },
  // World 2 (1966-1975): candles + golfball, 2-4 enemies, bounceCount:1, minesAllowed:2
  { worldNum: 2, startYear: 1966, enemyTypes: ['candle', 'golfball'], maxEnemies: 4, minEnemies: 2, bounceCount: 1, minesAllowed: 2 },
  // World 3 (1976-1985): golfball + puck, 3-5 enemies, bounceCount:2, minesAllowed:2
  { worldNum: 3, startYear: 1976, enemyTypes: ['golfball', 'puck'], maxEnemies: 5, minEnemies: 3, bounceCount: 2, minesAllowed: 2 },
  // World 4 (1986-1995): puck + boat, 3-5 enemies, more holes, bounceCount:2, minesAllowed:3
  { worldNum: 4, startYear: 1986, enemyTypes: ['puck', 'boat'], maxEnemies: 5, minEnemies: 3, bounceCount: 2, minesAllowed: 3 },
  // World 5 (1996-2005): snowmobile + puck, 4-6 enemies, bounceCount:2, minesAllowed:3
  { worldNum: 5, startYear: 1996, enemyTypes: ['snowmobile', 'puck'], maxEnemies: 6, minEnemies: 4, bounceCount: 2, minesAllowed: 3 },
  // World 6 (2006-2015): biker + snowmobile, 4-6 enemies, bounceCount:3, minesAllowed:4
  { worldNum: 6, startYear: 2006, enemyTypes: ['biker', 'snowmobile'], maxEnemies: 6, minEnemies: 4, bounceCount: 3, minesAllowed: 4 },
  // World 7 (2016-2026): levels 1-9 cover 2016-2024, level 10 (boss) = 2026
  // Note: 2025 is skipped in sequential year assignment for level 10 (we override year for boss)
  { worldNum: 7, startYear: 2016, enemyTypes: ['candle', 'golfball', 'puck', 'boat', 'snowmobile', 'biker'], maxEnemies: 6, minEnemies: 4, bounceCount: 3, minesAllowed: 5 },
];

// ─── Terrain recipes per level within a world ─────────────────────────────
// Each level index (0-9) maps to a terrain recipe factory fn(hasHoles)
// All recipes keep a clear corridor from player start (bottom-left area)
// to allow navigating to enemies (top area).

function makeTerrains(worldNum) {
  const hasHoles = worldNum >= 4;

  // 10 different layout templates, parameterized by world
  return [
    // Level 1 — Simple: a few stone pillars scattered
    () => buildTerrain([
      { type: 'block', row: 5,  col: 4 },
      { type: 'block', row: 5,  col: 11 },
      { type: 'block', row: 10, col: 7 },
      { type: 'block', row: 15, col: 3 },
      { type: 'block', row: 15, col: 12 },
      { type: 'dirtrow', row: 8, c0: 3, c1: 6 },
      { type: 'dirtrow', row: 8, c0: 9, c1: 12 },
    ], [{ x: 2, y: 20 }, { x: 8, y: 3 }]),

    // Level 2 — Central wall with gaps
    () => buildTerrain([
      { type: 'hwall', row: 11, c0: 2, c1: 6 },
      { type: 'hwall', row: 11, c0: 9, c1: 13 },
      { type: 'dirtcol', col: 5, r0: 5, r1: 9 },
      { type: 'dirtcol', col: 10, r0: 5, r1: 9 },
      ...(hasHoles ? [{ type: 'hole', row: 6, col: 8 }, { type: 'hole', row: 7, col: 8 }] : []),
    ], [{ x: 2, y: 21 }, { x: 7, y: 3 }, { x: 12, y: 3 }]),

    // Level 3 — Two vertical stone walls creating corridors
    () => buildTerrain([
      { type: 'vwall', col: 5,  r0: 3, r1: 16 },
      { type: 'vwall', col: 10, r0: 7, r1: 20 },
      { type: 'dirtrow', row: 3, c0: 6, c1: 9 },
      { type: 'dirtrow', row: 20, c0: 6, c1: 9 },
      ...(hasHoles ? [{ type: 'holerow', row: 12, c0: 6, c1: 9 }] : []),
    ], [{ x: 2, y: 21 }, { x: 3, y: 8 }, { x: 12, y: 5 }, { x: 13, y: 14 }]),

    // Level 4 — Four stone rooms with open center
    () => buildTerrain([
      { type: 'hwall', row: 8,  c0: 1, c1: 6 },
      { type: 'hwall', row: 8,  c0: 9, c1: 14 },
      { type: 'hwall', row: 16, c0: 1, c1: 6 },
      { type: 'hwall', row: 16, c0: 9, c1: 14 },
      { type: 'vwall', col: 6,  r0: 1, r1: 8 },
      { type: 'vwall', col: 9,  r0: 1, r1: 8 },
      { type: 'vwall', col: 6,  r0: 16, r1: 22 },
      { type: 'vwall', col: 9,  r0: 16, r1: 22 },
      ...(hasHoles ? [
        { type: 'hole', row: 4,  col: 3 },
        { type: 'hole', row: 4,  col: 12 },
        { type: 'hole', row: 20, col: 3 },
      ] : []),
    ], [{ x: 2, y: 21 }, { x: 3, y: 4 }, { x: 12, y: 4 }, { x: 3, y: 20 }, { x: 12, y: 20 }]),

    // Level 5 — Scattered dirt blocks
    () => buildTerrain([
      { type: 'dirtblock', row: 4,  col: 4 },
      { type: 'dirtblock', row: 4,  col: 8 },
      { type: 'dirtblock', row: 4,  col: 12 },
      { type: 'dirtblock', row: 9,  col: 2 },
      { type: 'dirtblock', row: 9,  col: 6 },
      { type: 'dirtblock', row: 9,  col: 10 },
      { type: 'dirtblock', row: 9,  col: 14 },
      { type: 'dirtblock', row: 14, col: 4 },
      { type: 'dirtblock', row: 14, col: 8 },
      { type: 'dirtblock', row: 14, col: 12 },
      { type: 'dirtblock', row: 18, col: 3 },
      { type: 'dirtblock', row: 18, col: 7 },
      { type: 'dirtblock', row: 18, col: 11 },
      ...(hasHoles ? [
        { type: 'hole', row: 7,  col: 4 },
        { type: 'hole', row: 7,  col: 11 },
        { type: 'hole', row: 16, col: 7 },
      ] : []),
    ], [{ x: 2, y: 21 }, { x: 7, y: 3 }, { x: 13, y: 3 }, { x: 13, y: 12 }]),

    // Level 6 — L-shaped stone wall in center
    () => buildTerrain([
      { type: 'hwall', row: 10, c0: 3, c1: 10 },
      { type: 'vwall', col: 3,  r0: 6, r1: 10 },
      { type: 'hwall', row: 14, c0: 6, c1: 13 },
      { type: 'vwall', col: 13, r0: 14, r1: 18 },
      { type: 'dirtrow', row: 7, c0: 5, c1: 9 },
      ...(hasHoles ? [
        { type: 'holerow', row: 5,  c0: 5, c1: 8 },
        { type: 'holerow', row: 17, c0: 4, c1: 7 },
      ] : []),
    ], [{ x: 2, y: 21 }, { x: 4, y: 4 }, { x: 12, y: 4 }, { x: 14, y: 12 }, { x: 8, y: 18 }]),

    // Level 7 — Cross-shaped stone structure in center
    () => buildTerrain([
      { type: 'hwall', row: 11, c0: 4, c1: 11 },
      { type: 'vwall', col: 7,  r0: 7, r1: 15 },
      { type: 'vwall', col: 8,  r0: 7, r1: 15 },
      { type: 'dirtrow', row: 5, c0: 2, c1: 5 },
      { type: 'dirtrow', row: 5, c0: 10, c1: 13 },
      { type: 'dirtrow', row: 18, c0: 2, c1: 5 },
      { type: 'dirtrow', row: 18, c0: 10, c1: 13 },
      ...(hasHoles ? [
        { type: 'hole', row: 8, col: 3 },
        { type: 'hole', row: 8, col: 12 },
        { type: 'hole', row: 16, col: 3 },
        { type: 'hole', row: 16, col: 12 },
      ] : []),
    ], [{ x: 2, y: 21 }, { x: 3, y: 5 }, { x: 12, y: 5 }, { x: 5, y: 14 }, { x: 11, y: 14 }, { x: 7, y: 3 }]),

    // Level 8 — Maze-like dirt walls
    () => buildTerrain([
      { type: 'dirtrow', row: 6,  c0: 1, c1: 8 },
      { type: 'dirtrow', row: 12, c0: 7, c1: 14 },
      { type: 'dirtrow', row: 17, c0: 1, c1: 8 },
      { type: 'dirtcol', col: 8,  r0: 6, r1: 12 },
      { type: 'block',   row: 4,  col: 11 },
      { type: 'block',   row: 4,  col: 12 },
      { type: 'block',   row: 15, col: 3 },
      { type: 'block',   row: 15, col: 4 },
      ...(hasHoles ? [
        { type: 'hole', row: 9, col: 3 },
        { type: 'hole', row: 9, col: 4 },
        { type: 'hole', row: 14, col: 11 },
        { type: 'hole', row: 14, col: 12 },
      ] : []),
    ], [{ x: 2, y: 21 }, { x: 10, y: 4 }, { x: 13, y: 4 }, { x: 12, y: 15 }, { x: 5, y: 3 }]),

    // Level 9 — Outer ring of dirt with open center
    () => buildTerrain([
      { type: 'dirtrow', row: 4,  c0: 2, c1: 13 },
      { type: 'dirtrow', row: 20, c0: 2, c1: 13 },
      { type: 'dirtcol', col: 2,  r0: 4, r1: 20 },
      { type: 'dirtcol', col: 13, r0: 4, r1: 20 },
      { type: 'block', row: 11, col: 7 },
      { type: 'block', row: 11, col: 8 },
      { type: 'block', row: 12, col: 7 },
      { type: 'block', row: 12, col: 8 },
      ...(hasHoles ? [
        { type: 'hole', row: 7, col: 5 },
        { type: 'hole', row: 7, col: 10 },
        { type: 'hole', row: 17, col: 5 },
        { type: 'hole', row: 17, col: 10 },
        { type: 'hole', row: 12, col: 5 },
      ] : []),
    ], [{ x: 8, y: 22 }, { x: 3, y: 3 }, { x: 12, y: 3 }, { x: 3, y: 15 }, { x: 12, y: 15 }, { x: 8, y: 8 }]),

    // Level 10 — Hard: Zigzag stone walls + holes
    () => buildTerrain([
      { type: 'hwall', row: 6,  c0: 1,  c1: 8 },
      { type: 'hwall', row: 11, c0: 7,  c1: 14 },
      { type: 'hwall', row: 16, c0: 1,  c1: 8 },
      { type: 'vwall', col: 4,  r0: 6,  r1: 11 },
      { type: 'vwall', col: 11, r0: 11, r1: 16 },
      ...(hasHoles ? [
        { type: 'hole', row: 4,  col: 4 },
        { type: 'hole', row: 4,  col: 5 },
        { type: 'hole', row: 4,  col: 10 },
        { type: 'hole', row: 4,  col: 11 },
        { type: 'hole', row: 19, col: 9 },
        { type: 'hole', row: 19, col: 10 },
      ] : [
        { type: 'dirtrow', row: 4,  c0: 4, c1: 11 },
        { type: 'dirtrow', row: 19, c0: 4, c1: 11 },
      ]),
    ], [{ x: 2, y: 21 }, { x: 2, y: 4 }, { x: 12, y: 4 }, { x: 6, y: 8 }, { x: 13, y: 14 }, { x: 9, y: 19 }]),
  ];
}

// ─── Boss level (level 70, world 7 level 10) ───────────────────────────────
function makeBossLevel() {
  const g = emptyGrid();
  borderStone(g);
  // Open arena — just the border walls
  return g;
}

// ─── Enemy placement helpers ──────────────────────────────────────────────
// Returns an array of enemy objects spread across the top half of the grid.
// Avoids player start (bottom area) and known wall positions.
function placeEnemies(count, types, levelIdx) {
  const enemies = [];
  // Predefined safe positions spread across the top half (rows 2-10)
  // 6 columns × 3 rows = 18 candidate spots, more than enough
  const candidates = [
    { x: 2,  y: 2  }, { x: 5,  y: 2  }, { x: 8,  y: 2  }, { x: 11, y: 2  }, { x: 14, y: 2  },
    { x: 2,  y: 5  }, { x: 5,  y: 5  }, { x: 8,  y: 5  }, { x: 11, y: 5  }, { x: 14, y: 5  },
    { x: 2,  y: 8  }, { x: 5,  y: 8  }, { x: 8,  y: 8  }, { x: 11, y: 8  }, { x: 14, y: 8  },
    { x: 4,  y: 11 }, { x: 8,  y: 11 }, { x: 12, y: 11 },
  ];

  // Rotate which candidates are used based on levelIdx to get variety
  const offset = (levelIdx * 3) % candidates.length;
  for (let i = 0; i < count; i++) {
    const pos = candidates[(offset + i) % candidates.length];
    const type = types[i % types.length];
    enemies.push({ type, x: pos.x, y: pos.y });
  }
  return enemies;
}

// ─── Generate all 70 levels ───────────────────────────────────────────────
const levels = [];

let globalLevelIdx = 0;

for (const wc of WORLD_CONFIG) {
  const terrainFactories = makeTerrains(wc.worldNum);

  for (let li = 0; li < 10; li++) {
    const isLastWorld7 = wc.worldNum === 7 && li === 9; // level 70 = boss

    // World 7 level 10 is the birthday year 2026 (sequential 2016+9=2025 would be wrong)
    const year = isLastWorld7 ? 2026 : (wc.startYear + li);

    let terrain;
    let enemies;
    let playerStart;
    let bounceCount = wc.bounceCount;
    let minesAllowed = wc.minesAllowed;

    if (isLastWorld7) {
      // Boss level
      terrain = makeBossLevel();
      enemies = [{ type: 'boss70', x: 8, y: 3 }];
      playerStart = { x: 8, y: 21 };
    } else {
      // Ramp enemy count: start at minEnemies, reach maxEnemies by level 8-9
      const enemyCount = Math.min(
        wc.maxEnemies,
        wc.minEnemies + Math.floor(li * (wc.maxEnemies - wc.minEnemies) / 9)
      );

      terrain = terrainFactories[li]();
      enemies = placeEnemies(enemyCount, wc.enemyTypes, li);
      playerStart = { x: 2, y: 20 };
    }

    levels.push({
      world: wc.worldNum,
      level: li + 1,
      year,
      name: NAMES[year],
      terrain,
      enemies,
      playerStart,
      bounceCount,
      minesAllowed,
    });

    globalLevelIdx++;
  }
}

// ─── Output ───────────────────────────────────────────────────────────────
const out = `// src/data/levels.js
// Auto-generated — do not edit by hand.
// All 70 levels of Birthday Tanks! (one per year of Allan's life, 1956-2026)
// Terrain grid: 16 columns × 24 rows
// Tile IDs: 0=open  1=dirt(destructible)  2=stone(indestructible)  3=hole

export const LEVELS = ${JSON.stringify(levels, null, 2)};
`;

process.stdout.write(out);
