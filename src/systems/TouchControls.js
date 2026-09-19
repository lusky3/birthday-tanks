export class TouchControls {
  constructor(scene) {
    this.scene = scene;
    this.input = {
      dx: 0, dy: 0,
      aimX: undefined, aimY: undefined,
      fire: false,
      mine: false,
    };
    this._joystickPointer = null;
    this._joystickStart = null;
    this._aimPointer = null;
    // fire: level-triggered (true while finger holds fire button; PlayerTank throttles rate)
    // mine: edge-triggered (one-shot; drop one mine per tap)
    this._fireHeld = false;
    this._firePointer = null;
    this._minePending = false;
    this._setupUI();
    this._setupListeners();
  }

  _setupUI() {
    const W = this.scene.sys.game.config.width;
    const H = this.scene.sys.game.config.height;
    const g = this.scene.add.graphics();
    g.setDepth(100);

    // Left joystick zone indicator
    g.lineStyle(2, 0xFFFFFF, 0.3);
    g.strokeCircle(W * 0.22, H * 0.82, 50);
    this._joyBase = { x: W * 0.22, y: H * 0.82, radius: 50 };

    // Joystick knob
    this._joyKnob = this.scene.add.graphics();
    this._joyKnob.setDepth(101);
    this._joyKnob.fillStyle(0xFFFFFF, 0.5);
    this._joyKnob.fillCircle(0, 0, 22);
    this._joyKnob.setPosition(this._joyBase.x, this._joyBase.y);

    // Fire button (right side)
    const fireBtnX = W * 0.82;
    const fireBtnY = H * 0.75;
    g.fillStyle(0xFF4444, 0.6);
    g.fillCircle(fireBtnX, fireBtnY, 35);
    this.scene.add.text(fireBtnX, fireBtnY, '🔥', { fontSize: '24px' }).setOrigin(0.5).setDepth(102);
    this._fireBtnPos = { x: fireBtnX, y: fireBtnY, r: 35 };

    // Mine button
    const mineBtnX = W * 0.82;
    const mineBtnY = H * 0.88;
    g.fillStyle(0x888888, 0.6);
    g.fillCircle(mineBtnX, mineBtnY, 28);
    this.scene.add.text(mineBtnX, mineBtnY, '💣', { fontSize: '20px' }).setOrigin(0.5).setDepth(102);
    this._mineBtnPos = { x: mineBtnX, y: mineBtnY, r: 28 };
  }

  _setupListeners() {
    this.scene.input.on('pointerdown', (ptr) => this._onDown(ptr));
    this.scene.input.on('pointermove', (ptr) => this._onMove(ptr));
    this.scene.input.on('pointerup', (ptr) => this._onUp(ptr));
  }

  _dist(a, b) {
    return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
  }

  _onDown(ptr) {
    const W = this.scene.sys.game.config.width;

    // Fire button — level-triggered: held state tracks the pointer
    if (this._dist(ptr, this._fireBtnPos) < this._fireBtnPos.r) {
      this._fireHeld = true;
      this._firePointer = ptr.id;
      return;
    }
    // Mine button — edge-triggered: one mine per tap
    if (this._dist(ptr, this._mineBtnPos) < this._mineBtnPos.r) {
      this._minePending = true;
      return;
    }

    // Left side = joystick
    if (ptr.x < W * 0.5) {
      this._joystickPointer = ptr.id;
      this._joystickStart = { x: ptr.x, y: ptr.y };
      this._joyBase.x = ptr.x;
      this._joyBase.y = ptr.y;
    } else {
      // Right side = aim
      this._aimPointer = ptr.id;
      this.input.aimX = ptr.x;
      this.input.aimY = ptr.y;
    }
  }

  _onMove(ptr) {
    if (ptr.id === this._joystickPointer && this._joystickStart) {
      const dx = ptr.x - this._joystickStart.x;
      const dy = ptr.y - this._joystickStart.y;
      const len = Math.sqrt(dx * dx + dy * dy);
      const maxRadius = 50;
      const clampedLen = Math.min(len, maxRadius);
      const angle = Math.atan2(dy, dx);
      if (len > 8) { // dead zone
        this.input.dx = Math.cos(angle) * (clampedLen / maxRadius);
        this.input.dy = Math.sin(angle) * (clampedLen / maxRadius);
      } else {
        this.input.dx = 0;
        this.input.dy = 0;
      }
      // Update knob visual
      this._joyKnob.setPosition(
        this._joystickStart.x + Math.cos(angle) * clampedLen,
        this._joystickStart.y + Math.sin(angle) * clampedLen
      );
    }
    if (ptr.id === this._aimPointer) {
      this.input.aimX = ptr.x;
      this.input.aimY = ptr.y;
    }
  }

  _onUp(ptr) {
    if (ptr.id === this._joystickPointer) {
      this._joystickPointer = null;
      this._joystickStart = null;
      this.input.dx = 0;
      this.input.dy = 0;
      this._joyKnob.setPosition(this._joyBase.x, this._joyBase.y);
    }
    if (ptr.id === this._aimPointer) {
      this._aimPointer = null;
    }
    // Clear fire held state when the finger lifts off the fire button
    if (ptr.id === this._firePointer) {
      this._fireHeld = false;
      this._firePointer = null;
    }
  }

  getInput() {
    // fire: level-triggered — returns true every frame while held (PlayerTank's fireRate throttles)
    this.input.fire = this._fireHeld;
    // mine: edge-triggered — one-shot pulse, consumed once then cleared
    this.input.mine = this._minePending;
    this._minePending = false;
    return this.input;
  }

  destroy() {
    this.scene.input.off('pointerdown');
    this.scene.input.off('pointermove');
    this.scene.input.off('pointerup');
  }
}
