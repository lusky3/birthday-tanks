export class AudioManager {
  constructor() {
    this._ctx = null;
    this._unlocked = false;
  }

  unlock() {
    if (this._unlocked) return;
    try {
      this._ctx = new (window.AudioContext || window.webkitAudioContext)();
      if (this._ctx.state === 'suspended') {
        this._ctx.resume();
      }
      this._unlocked = true;
    } catch (e) {
      console.warn('Web Audio not available:', e);
    }
  }

  play(type) {
    if (!this._unlocked || !this._ctx) return;
    try {
      switch (type) {
        case 'shoot':      this._tone(880, 0.1, 'square', 0.15); break;
        case 'explosion':  this._noise(0.4, 0.4); break;
        case 'mineDrop':   this._tone(220, 0.2, 'sine', 0.3); break;
        case 'victory':    this._victory(); break;
        case 'levelStart': this._tone(440, 0.1, 'sine', 0.5); break;
        case 'move':       this._engineRev(); break;
      }
    } catch (e) {
      // Audio errors are non-fatal — swallow silently
    }
  }

  _tone(freq, vol, type, duration) {
    const osc = this._ctx.createOscillator();
    const gain = this._ctx.createGain();
    osc.connect(gain);
    gain.connect(this._ctx.destination);
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(vol, this._ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this._ctx.currentTime + duration);
    osc.start();
    osc.stop(this._ctx.currentTime + duration);
  }

  _noise(vol, duration) {
    const bufSize = this._ctx.sampleRate * duration;
    const buf = this._ctx.createBuffer(1, bufSize, this._ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < bufSize; i++) data[i] = Math.random() * 2 - 1;
    const src = this._ctx.createBufferSource();
    const gain = this._ctx.createGain();
    src.buffer = buf;
    src.connect(gain);
    gain.connect(this._ctx.destination);
    gain.gain.setValueAtTime(vol, this._ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this._ctx.currentTime + duration);
    src.start();
  }

  _engineRev() {
    const osc = this._ctx.createOscillator();
    const gain = this._ctx.createGain();
    osc.connect(gain);
    gain.connect(this._ctx.destination);
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(80, this._ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(120, this._ctx.currentTime + 0.1);
    gain.gain.setValueAtTime(0.05, this._ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this._ctx.currentTime + 0.12);
    osc.start();
    osc.stop(this._ctx.currentTime + 0.12);
  }

  _victory() {
    const notes = [523, 659, 784, 1047];
    notes.forEach((freq, i) => {
      setTimeout(() => this._tone(freq, 0.3, 'sine', 0.4), i * 200);
    });
  }
}
