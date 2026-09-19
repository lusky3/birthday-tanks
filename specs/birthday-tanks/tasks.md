# Birthday Tanks! — Task Breakdown

Phases are sequential. Within each phase, tasks marked **(parallel)** can be delegated simultaneously.

---

## Phase 1 — Core Game Engine

Goal: A playable game with placeholder art. One world, 3 levels, win/lose working.

### Group 1A — Foundation (all parallel)

- [x] **T01** — `index.html` + Phaser 3 CDN setup, scene registry, responsive scale config
- [x] **T02** — `src/data/levels.js` — all 70 level definitions (terrain grids, enemy placements, player starts)
- [x] **T03** — `src/data/milestones.js` — year → event name mapping for all 70 levels

### Group 1B — Core entities (all parallel, after T01)

- [ ] **T04** — `PlayerTank.js` — movement, turret rotation, firing, mine placement
- [ ] **T05** — `Bullet.js` — arcade physics, ricochet off walls, self-destruct after N bounces
- [ ] **T06** — `Mine.js` — placement, arming delay, explosion radius, chain reaction
- [ ] **T07** — `TerrainBuilder.js` — parse level grid, create tilemap, destructible vs indestructible blocks

### Group 1C — AI + Game Loop (after 1B)

- [ ] **T08** — `EnemyAI.js` — state machines for all 7 enemy types (idle, patrol, aim, fire, evade)
- [ ] **T09** — `Game.js` scene — spawn entities from level data, win condition (all enemies dead), lose condition (lives = 0)
- [ ] **T10** — `TouchControls.js` — virtual left joystick + right-side fire/mine buttons

### Group 1D — Scenes (after 1C)

- [ ] **T11** — `HUD.js` — overlay scene: lives (motorcycle icons), level counter "L34/70", mine count
- [ ] **T12** — `LevelCard.js` — 2-second interstitial between levels showing world/level/year/name
- [ ] **T13** — `GameOver.js` — screen with Allan-specific message + restart button

**Phase 1 checkpoint:** Play through worlds 1–2 on desktop. Touch controls usable on phone. Win and lose states work.

---

## Phase 2 — Birthday Theming

Goal: Visually personalized. Splash screen, themed sprites, victory screen.

### Group 2A (all parallel, after Phase 1)

- [ ] **T14** — `Splash.js` — animated birthday splash: "Happy 70th, Allan!" + family names + TAP TO PLAY
- [ ] **T15** — `Victory.js` — confetti animation, personalized message, replay button
- [ ] **T16** — `Draw.js` — motorcycle player sprite, enemy sprites per type (candle, golf ball, puck, boat, snowmobile, biker, The 70 boss)
- [ ] **T17** — `AudioManager.js` — engine rev on move, gunshot on fire, explosion on kill, victory jingle (all Web Audio API, no files)

### Group 2B (after 2A)

- [ ] **T18** — Wire up all sprites into Game scene, replace placeholder rectangles
- [ ] **T19** — World terrain color themes (7 distinct palette swaps per world)
- [ ] **T20** — Final boss level (level 70, world 7) — "The 70" enemy with enhanced AI and bigger explosion

**Phase 2 checkpoint:** Play through splash → level 1 → level 70 → victory. All sprites visible. Audio works on mobile.

---

## Phase 3 — Polish + Deploy

### Group 3A (all parallel, after Phase 2)

- [ ] **T21** — Mobile touch feel audit: joystick dead zone, button hit targets ≥44px, no scroll-bleed
- [ ] **T22** — iOS Safari fixes: audio unlock on first tap, viewport meta, prevent double-tap zoom
- [ ] **T23** — GitHub Pages deploy: repo init, `gh-pages` branch or root, public URL confirmed

### Group 3B (after 3A)

- [ ] **T24** — End-to-end playtest on real phone: complete level 1, die and respawn, reach victory screen
- [ ] **T25** — `README.md` — one paragraph, how to play, how to host locally

**Phase 3 checkpoint:** URL opens on a phone, game plays start to finish. Share URL with family.

---

## Risk Register

| Risk | Likelihood | Mitigation |
|---|---|---|
| 70 levels of unique terrain takes too long | High | Generate terrain procedurally for worlds 3–6; hand-craft worlds 1, 2, 7 |
| iOS audio blocked until user gesture | Certain | Unlock audio context on splash screen tap |
| Phaser CDN unavailable | Low | Bundle Phaser locally as fallback |
| Touch controls feel bad | Medium | Phaser's built-in `VirtualJoystick` plugin available; fall back to it |
| Time runs out | Medium | Cut worlds 3–6 to 5 levels each (40 total still hits the "70" theme via messaging) |
