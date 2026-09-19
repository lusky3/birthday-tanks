/**
 * AudioManager — all sound via Web Audio API, zero external files.
 *
 * Features:
 *   1. Background music   — looping chiptune melody (startBGM / stopBGM)
 *   2. Engine hum         — continuous sawtooth drone while tank moves (startEngine / stopEngine)
 *   3. Level fanfare      — short ascending jingle between levels (play 'fanfare')
 *   4. Mine beep          — accelerating beep tied to mine arm state (startMineBeep / stopMineBeep)
 *   5. Boss theme         — tense looping theme for boss levels (startBossTheme / stopBossTheme)
 *
 * One-shot SFX via play(type): 'shoot' | 'explosion' | 'mineDrop' | 'victory' | 'fanfare'
 */
export class AudioManager {
  constructor() {
    this._ctx = null;
    this._unlocked = false;

    // Persistent nodes (started/stopped explicitly)
    this._engineOsc = null;
    this._engineGain = null;
    this._bgmNodes = [];      // array of oscillator+gain pairs
    this._bgmInterval = null; // setInterval handle
    this._bossNodes = [];
    this._bossInterval = null;
    this._mineInterval = null;
    this._mineBeepOn = false;
    this._mineBeepRate = 600; // ms between beeps — decreases as armed
  }

  // ─── Init ────────────────────────────────────────────────────────────────────

  unlock() {
    if (this._unlocked) return;
    try {
      this._ctx = new (window.AudioContext || window.webkitAudioContext)();
      if (this._ctx.state === 'suspended') this._ctx.resume();
      this._unlocked = true;
    } catch (e) {
      console.warn('Web Audio not available:', e);
    }
  }

  get ready() { return this._unlocked && !!this._ctx; }

  // ─── One-shot SFX ────────────────────────────────────────────────────────────

  play(type) {
    if (!this.ready) return;
    try {
      switch (type) {
        case 'shoot':     this._shoot();     break;
        case 'explosion': this._explosion(); break;
        case 'mineDrop':  this._mineDrop();  break;
        case 'victory':   this._victory();   break;
        case 'fanfare':   this._fanfare();   break;
        case 'levelStart': this._fanfare();  break; // alias
        case 'bossHit':   this._bossHit();   break;
      }
    } catch (e) { /* audio errors are non-fatal */ }
  }

  // ─── 1. Background Music ─────────────────────────────────────────────────────
  // Simple 8-note looping melody in C major pentatonic, arpeggiated with square wave.
  // Melody: C4 E4 G4 A4 C5 A4 G4 E4 (repeating)

  startBGM() {
    if (!this.ready || this._bgmInterval) return;
    const melody = [261, 329, 392, 440, 523, 440, 392, 329]; // Hz
    let step = 0;
    const playNote = () => {
      if (!this.ready) return;
      try {
        const osc = this._ctx.createOscillator();
        const gain = this._ctx.createGain();
        // Add slight low-pass filter for warmth
        const filter = this._ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 1200;
        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this._ctx.destination);
        osc.type = 'square';
        osc.frequency.value = melody[step % melody.length];
        gain.gain.setValueAtTime(0.04, this._ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this._ctx.currentTime + 0.18);
        osc.start();
        osc.stop(this._ctx.currentTime + 0.2);
        step++;
      } catch (e) {}
    };
    playNote();
    this._bgmInterval = setInterval(playNote, 220);
  }

  stopBGM() {
    if (this._bgmInterval) {
      clearInterval(this._bgmInterval);
      this._bgmInterval = null;
    }
  }

  // ─── 2. Engine Hum ───────────────────────────────────────────────────────────
  // Continuous sawtooth drone. Call startEngine(speed) when moving,
  // stopEngine() when stationary. Pitch scales 80–160 Hz with speed.

  startEngine(speed = 1.0) {
    if (!this.ready) return;
    if (this._engineOsc) {
      // Already running — just update pitch
      const freq = 80 + speed * 80;
      this._engineOsc.frequency.setTargetAtTime(freq, this._ctx.currentTime, 0.05);
      return;
    }
    try {
      this._engineOsc = this._ctx.createOscillator();
      this._engineGain = this._ctx.createGain();
      // Slight distortion for growl
      const distortion = this._ctx.createWaveShaper();
      distortion.curve = this._makeDistortionCurve(20);
      this._engineOsc.connect(distortion);
      distortion.connect(this._engineGain);
      this._engineGain.connect(this._ctx.destination);
      this._engineOsc.type = 'sawtooth';
      this._engineOsc.frequency.value = 80 + speed * 80;
      this._engineGain.gain.setValueAtTime(0, this._ctx.currentTime);
      this._engineGain.gain.linearRampToValueAtTime(0.04, this._ctx.currentTime + 0.1);
      this._engineOsc.start();
    } catch (e) {}
  }

  stopEngine() {
    if (!this._engineOsc || !this._engineGain) return;
    try {
      this._engineGain.gain.setTargetAtTime(0, this._ctx.currentTime, 0.05);
      const osc = this._engineOsc;
      const gain = this._engineGain;
      setTimeout(() => { try { osc.stop(); osc.disconnect(); gain.disconnect(); } catch(e){} }, 300);
      this._engineOsc = null;
      this._engineGain = null;
    } catch (e) {}
  }

  updateEngineSpeed(speed) {
    if (!this._engineOsc) return;
    const freq = 80 + speed * 80;
    this._engineOsc.frequency.setTargetAtTime(freq, this._ctx.currentTime, 0.05);
  }

  _makeDistortionCurve(amount) {
    const samples = 256;
    const curve = new Float32Array(samples);
    for (let i = 0; i < samples; i++) {
      const x = (i * 2) / samples - 1;
      curve[i] = ((Math.PI + amount) * x) / (Math.PI + amount * Math.abs(x));
    }
    return curve;
  }

  // ─── 3. Level Fanfare ────────────────────────────────────────────────────────
  // Ascending 4-note jingle with harmony. Plays once on level complete.

  _fanfare() {
    // Two-voice fanfare: melody + lower harmony
    const melody  = [523, 659, 784, 1047]; // C5 E5 G5 C6
    const harmony = [392, 494, 587, 784];  // G4 B4 D5 G5
    melody.forEach((freq, i) => {
      const t = i * 0.18;
      this._schedTone(freq,    0.25, 'sine',   0.22, t);
      this._schedTone(harmony[i], 0.12, 'triangle', 0.22, t);
    });
    // Final triumphant chord
    setTimeout(() => {
      [523, 659, 784].forEach(f => this._tone(f, 0.12, 'sine', 0.5));
    }, melody.length * 180 + 50);
  }

  // ─── 4. Mine Beep ────────────────────────────────────────────────────────────
  // Call startMineBeep() when a mine is armed. beepRate decreases over time (urgency).
  // Call stopMineBeep() when mine explodes or is destroyed.

  startMineBeep() {
    if (!this.ready || this._mineInterval) return;
    this._mineBeepRate = 600;
    const beep = () => {
      if (!this.ready) return;
      try {
        this._tone(1200, 0.06, 'square', 0.05);
      } catch(e) {}
      // Speed up — min 120ms
      this._mineBeepRate = Math.max(120, this._mineBeepRate - 30);
      clearInterval(this._mineInterval);
      this._mineInterval = setInterval(beep, this._mineBeepRate);
    };
    this._mineInterval = setInterval(beep, this._mineBeepRate);
    this._mineBeepOn = true;
  }

  stopMineBeep() {
    if (this._mineInterval) {
      clearInterval(this._mineInterval);
      this._mineInterval = null;
    }
    this._mineBeepOn = false;
    this._mineBeepRate = 600;
  }

  // ─── 5. Boss Theme ───────────────────────────────────────────────────────────
  // Tense minor-key loop: alternating tritone + bass pulse.
  // Heavier than BGM — uses sawtooth + detuned oscillator.

  startBossTheme() {
    if (!this.ready || this._bossInterval) return;
    this.stopBGM(); // Boss theme replaces BGM
    // Bass pulse: alternating A2 / E♭3 (tritone — maximum tension)
    const bassNotes = [110, 156, 110, 131, 110, 156, 123, 131]; // Hz
    // High tension lead line
    const leadNotes = [440, 0, 466, 0, 392, 0, 415, 0]; // 0 = rest
    let step = 0;
    const tick = () => {
      if (!this.ready) return;
      try {
        // Bass
        const bn = bassNotes[step % bassNotes.length];
        this._schedTone(bn, 0.1, 'sawtooth', 0.14, 0);
        // Lead (if not rest)
        const ln = leadNotes[step % leadNotes.length];
        if (ln > 0) this._schedTone(ln, 0.05, 'square', 0.1, 0);
        step++;
      } catch(e) {}
    };
    tick();
    this._bossInterval = setInterval(tick, 160);
  }

  stopBossTheme() {
    if (this._bossInterval) {
      clearInterval(this._bossInterval);
      this._bossInterval = null;
    }
  }

  // ─── Private SFX helpers ─────────────────────────────────────────────────────

  _shoot() {
    // Short square buzz, quick pitch drop
    const osc = this._ctx.createOscillator();
    const gain = this._ctx.createGain();
    osc.connect(gain); gain.connect(this._ctx.destination);
    osc.type = 'square';
    osc.frequency.setValueAtTime(880, this._ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(220, this._ctx.currentTime + 0.1);
    gain.gain.setValueAtTime(0.12, this._ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this._ctx.currentTime + 0.12);
    osc.start(); osc.stop(this._ctx.currentTime + 0.12);
  }

  _explosion() {
    // White noise burst with low-pass filter sweep down
    const bufSize = Math.floor(this._ctx.sampleRate * 0.6);
    const buf = this._ctx.createBuffer(1, bufSize, this._ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < bufSize; i++) data[i] = Math.random() * 2 - 1;
    const src = this._ctx.createBufferSource();
    const filter = this._ctx.createBiquadFilter();
    const gain = this._ctx.createGain();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(2000, this._ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(100, this._ctx.currentTime + 0.5);
    src.buffer = buf;
    src.connect(filter); filter.connect(gain); gain.connect(this._ctx.destination);
    gain.gain.setValueAtTime(0.5, this._ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this._ctx.currentTime + 0.6);
    src.start();
  }

  _mineDrop() {
    // Two descending tones — "clunk"
    this._tone(440, 0.15, 'sine', 0.12);
    setTimeout(() => this._tone(220, 0.2, 'sine', 0.2), 80);
  }

  _bossHit() {
    // Heavy thud
    this._tone(80, 0.3, 'sawtooth', 0.15);
    setTimeout(() => this._noise(0.2, 0.15), 30);
  }

  _victory() {
    // Full victory fanfare — 8 notes with drums
    const notes  = [523, 523, 523, 392, 523, 659, 784, 1047];
    const delays = [0, 150, 300, 450, 600, 750, 900, 1050];
    notes.forEach((freq, i) => {
      setTimeout(() => {
        if (!this.ready) return;
        this._tone(freq, 0.25, 'sine', 0.35);
        if (i % 2 === 0) this._noise(0.1, 0.08); // snare on beat
      }, delays[i]);
    });
    // Final big chord
    setTimeout(() => {
      if (!this.ready) return;
      [523, 659, 784, 1047].forEach(f => this._tone(f, 0.15, 'sine', 0.8));
    }, 1200);
  }

  // ─── Low-level helpers ───────────────────────────────────────────────────────

  _tone(freq, vol, type, duration) {
    if (!this.ready) return;
    const osc = this._ctx.createOscillator();
    const gain = this._ctx.createGain();
    osc.connect(gain); gain.connect(this._ctx.destination);
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(vol, this._ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this._ctx.currentTime + duration);
    osc.start(); osc.stop(this._ctx.currentTime + duration);
  }

  // Scheduled tone: starts `delaySec` seconds from now
  _schedTone(freq, vol, type, duration, delaySec) {
    if (!this.ready) return;
    const t = this._ctx.currentTime + delaySec;
    const osc = this._ctx.createOscillator();
    const gain = this._ctx.createGain();
    osc.connect(gain); gain.connect(this._ctx.destination);
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(vol, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + duration);
    osc.start(t); osc.stop(t + duration);
  }

  _noise(vol, duration) {
    if (!this.ready) return;
    const bufSize = Math.floor(this._ctx.sampleRate * duration);
    const buf = this._ctx.createBuffer(1, bufSize, this._ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < bufSize; i++) data[i] = Math.random() * 2 - 1;
    const src = this._ctx.createBufferSource();
    const gain = this._ctx.createGain();
    src.buffer = buf; src.connect(gain); gain.connect(this._ctx.destination);
    gain.gain.setValueAtTime(vol, this._ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this._ctx.currentTime + duration);
    src.start();
  }

  // ─── Cleanup ─────────────────────────────────────────────────────────────────

  stopAll() {
    this.stopBGM();
    this.stopEngine();
    this.stopBossTheme();
    this.stopMineBeep();
  }
}
