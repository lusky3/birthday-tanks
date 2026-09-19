# Birthday Tanks! — Game Spec

**For:** Allan Lusk's 70th Birthday (September 22, 2026)  
**Built by:** Cody  
**Target completion:** September 19, 2026  

---

## 1. Overview

A love letter disguised as a browser game. Birthday Tanks! is a single-page HTML5 game inspired by the Tanks! minigame from Wii Play. Allan fights through 7 themed worlds × 10 levels (70 total — one per year of his life), each named after a real milestone or decade. His tank is a motorcycle. Enemies are birthday candles, golf balls, pucks, and eventually a final boss: the number 70.

Primary target: **mobile browser** (iOS Safari, Android Chrome). Desktop works too.

---

## 2. Technical Stack

| Concern | Choice | Reason |
|---|---|---|
| Game engine | **Phaser 3.87.0** | Touch input, Canvas/WebGL, tweens, physics — batteries included |
| Language | **Vanilla JS (ES modules)** | No build step, works as static files |
| Hosting | **GitHub Pages** (primary) | Free, instant, shareable URL; VM as fallback |
| Assets | Canvas-drawn sprites (no external images required) | Zero asset pipeline, works offline |
| Audio | Web Audio API tones | No audio files needed; fallback to silence |

No npm, no bundler, no build step. `index.html` + a handful of `.js` files. Open in browser and play.

---

## 3. Game Design

### 3.1 Core Mechanics (faithful to Wii Play Tanks!)

- Player controls **one tank** per level
- Movement: virtual joystick (left thumb) for driving, tap/drag (right thumb) to aim and fire
- Tank rotates to face movement direction; turret rotates independently toward aim
- **Bullets ricochet** off walls (up to 1 bounce by default, increases in later levels)
- **Mine placement** available (limited per level, increases with progression)
- Destroy all enemy tanks to advance
- Player has 3 lives total (no per-level refill — runs out and it's game over)
- Falling into a hole = instant death

### 3.2 Terrain

- Levels use a top-down grid-based map
- Destructible dirt blocks (brown) — bullets and mines destroy them
- Indestructible stone walls (gray)
- Holes/water (dark) — instant death on contact
- Open terrain varies by world theme

### 3.3 Enemy Types (progressive introduction)

| Enemy | Intro World | Behavior |
|---|---|---|
| Candle (stationary) | 1 | Fires 1 bullet on a timer, doesn't move |
| Golf Ball Tank | 2 | Slow mover, bounced shots |
| Puck Tank | 3 | Fast, slides, hard to predict |
| Boat Tank | 4 | Moves on water tiles only |
| Snowmobile | 5 | Fast, random direction changes |
| Biker Tank | 6 | Charges directly at player |
| The 70 (boss) | 7 | Final boss — big, fires 3 shots, places mines |

### 3.4 Worlds & Level Naming

Each world = a decade of Allan's life. Level names are pulled from a data file.

| World | Decade | Theme | Terrain color |
|---|---|---|---|
| 1 | 1956–1965 | The Early Years | Sunny yellow |
| 2 | 1966–1975 | The Growing Up Years | Green fields |
| 3 | 1976–1985 | The Adventure Years | Blue lake / cottage |
| 4 | 1986–1995 | The Family Years | Warm orange |
| 5 | 1996–2005 | The Cottage Years | Forest green |
| 6 | 2006–2015 | The Open Road | Road gray |
| 7 | 2016–2026 | The Legend Years | Space black |

Each level within a world has a name like:
- "1956 — Year One" 
- "1987 — Married Carrie ❤️"
- "1991 — Cody Arrives"
- "2006 — First Harley?"

(Full list in `src/data/levels.js`)

### 3.5 Player Tank: The Motorcycle

- Drawn as a side-profile motorcycle silhouette using Canvas API
- Turret = headlight / front fork aiming direction
- Engine rev SFX on movement (Web Audio API)

### 3.6 Birthday Personalization

**Splash screen:**
- "Happy 70th Birthday, Allan!" with animated candles
- Subtitle: "From Cody, Amy, Jenn & Kelsey — and Carrie"
- "TAP TO PLAY" button

**Level start card (2s):**
- World name + level name
- Year shown prominently

**Victory screen (clear all 70 levels):**
- Full-screen confetti
- Photo placeholder (if user drops a jpg it gets used; otherwise drawn birthday cake)
- Message: "70 levels. 70 years. Still going strong. Happy Birthday, Dad. ❤️"
- Replay button

**Game over screen:**
- "Allan's tank needs a pit stop... Try again?"

**HUD:**
- Lives shown as motorcycle icons
- Current level: "Level 34/70 — [Name]"
- Mine count shown as grenade icons

---

## 4. Controls

### Mobile (primary)
- **Left virtual joystick** — tank movement
- **Right side tap/hold** — aim turret toward tap position
- **Fire button** (right, above joystick) — shoot
- **Mine button** (right, below joystick) — drop mine

### Desktop (secondary)
- WASD / arrow keys — movement
- Mouse — aim turret
- Space / left click — fire
- X / right click — mine

---

## 5. File Structure

```
birthday-tanks/
├── index.html              # Entry point — loads Phaser from CDN, boots game
├── src/
│   ├── main.js             # Phaser game config, scene registry
│   ├── scenes/
│   │   ├── Boot.js         # Preload + CDN asset check
│   │   ├── Splash.js       # Birthday splash screen
│   │   ├── Game.js         # Main game scene
│   │   ├── HUD.js          # Overlay scene (lives, level name, mines)
│   │   ├── LevelCard.js    # "World X — Level Y — [Name]" interstitial
│   │   ├── Victory.js      # Win screen
│   │   └── GameOver.js     # Game over screen
│   ├── entities/
│   │   ├── PlayerTank.js
│   │   ├── EnemyTank.js
│   │   ├── Bullet.js
│   │   └── Mine.js
│   ├── systems/
│   │   ├── TerrainBuilder.js   # Builds tilemaps from level data
│   │   ├── EnemyAI.js          # Per-enemy-type AI state machines
│   │   ├── TouchControls.js    # Virtual joystick + buttons
│   │   └── AudioManager.js     # Web Audio API wrapper
│   ├── data/
│   │   ├── levels.js           # All 70 level definitions
│   │   └── milestones.js       # Allan's life events by year
│   └── utils/
│       ├── Draw.js             # Canvas drawing helpers for sprites
│       └── Scale.js            # Responsive scaling utilities
└── README.md
```

---

## 6. Phaser Config

```js
{
  type: Phaser.AUTO,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 480,
    height: 854,   // 9:16 portrait — phones
  },
  physics: {
    default: 'arcade',
    arcade: { debug: false }
  },
  scene: [Boot, Splash, Game, HUD, LevelCard, Victory, GameOver]
}
```

Portrait orientation. 480×854 logical resolution scales to fill any phone screen.

---

## 7. Level Data Format

```js
// src/data/levels.js
export const LEVELS = [
  {
    world: 1,
    level: 1,
    year: 1956,
    name: "Year One",
    terrain: [ /* grid array */ ],
    enemies: [ { type: 'candle', x: 5, y: 3 } ],
    playerStart: { x: 2, y: 8 },
    bounceCount: 1,
    minesAllowed: 1,
  },
  // ... 69 more
];
```

---

## 8. Milestones (for level names)

Key years to name levels after:

| Year | Event |
|---|---|
| 1956 | Allan born |
| 1987 | Married Carrie ❤️ (Oct) |
| 1988 | Amy born (May 16) |
| 1991 | Jenn born (June 27) |
| 1993 | Cody born (May 6) |
| 1996 | Kelsey born (April 23) |
| Various | First motorcycle, first cottage, hockey memories |

Remaining years filled with decade-appropriate flavor text (hockey wins, road trips, etc.).

---

## 9. Non-Functional Requirements

- Works on iOS Safari 16+ and Android Chrome 110+
- First load under 3 seconds on 4G (Phaser CDN ~1MB, rest is <50KB)
- No server-side code — pure static files
- Works offline after first load (service worker optional, not required for v1)
- No analytics, no tracking, no external calls beyond Phaser CDN

---

## 10. Out of Scope (v1)

- Multiplayer (4-device) — architecture allows it but not built
- High score persistence (localStorage could be added trivially)
- Sound effects beyond Web Audio tones
- Real photographs (placeholder drawn cake on victory screen)
- Level editor

---

## 11. Acceptance Criteria

- [ ] All 70 levels completable without crashes
- [ ] Mobile touch controls feel responsive (no input lag >100ms)
- [ ] Bullet ricochet works correctly off all wall types
- [ ] Mines detonate on tank contact
- [ ] Victory screen displays personalized message
- [ ] Game over screen allows restart
- [ ] Lives persist across levels (not reset per level)
- [ ] Level names display correctly for all 70 levels
- [ ] Hosted at a public URL and accessible from a phone
