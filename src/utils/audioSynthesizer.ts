/**
 * Web Audio API Acoustic Synthesizer for CREWW Mobile Detailing Cinematic Intro.
 * 100% self-contained synthesized sound design:
 * - High-pressure hydro water rinse stream (filtered white noise & bandpass resonance)
 * - Snow foam lather and bubbling effervescence
 * - Ceramic buffing harmonic pad
 * - Brand reveal crystal chime
 * Fully adheres to browser autoplay policies with explicit audio unlocking.
 */

class IntroAudioEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private isUnlocked: boolean = false;

  constructor() {
    try {
      const storedMute = localStorage.getItem('creww_intro_sound_muted');
      if (storedMute === 'true') {
        this.isMuted = true;
      }
    } catch {
      this.isMuted = false;
    }
  }

  private initContext(): AudioContext | null {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    return this.ctx;
  }

  public async unlock(): Promise<boolean> {
    const ctx = this.initContext();
    if (!ctx) return false;

    if (ctx.state === 'suspended') {
      try {
        await ctx.resume();
        this.isUnlocked = true;
        return true;
      } catch {
        return false;
      }
    }
    this.isUnlocked = true;
    return true;
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    try {
      localStorage.setItem('creww_intro_sound_muted', String(this.isMuted));
    } catch {
      // storage unavailable
    }
    if (!this.isMuted) {
      this.unlock();
    }
    return this.isMuted;
  }

  /**
   * Stage 1: High Pressure Hydro Water Rinse
   * White noise passed through a sweeping resonant bandpass filter simulating pressure spray.
   */
  public playWaterSpray(durationMs: number = 700) {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx || ctx.state !== 'running') return;

    try {
      const bufferSize = ctx.sampleRate * (durationMs / 1000);
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);

      // Pinkish/white noise
      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        data[i] = (lastOut + 0.02 * white) / 1.02;
        lastOut = data[i];
        data[i] *= 3.5;
      }

      const noiseNode = ctx.createBufferSource();
      noiseNode.buffer = buffer;

      const bandpass = ctx.createBiquadFilter();
      bandpass.type = 'bandpass';
      bandpass.frequency.setValueAtTime(800, ctx.currentTime);
      bandpass.frequency.exponentialRampToValueAtTime(3200, ctx.currentTime + durationMs / 2000);
      bandpass.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + durationMs / 1000);
      bandpass.Q.setValueAtTime(3.0, ctx.currentTime);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.01, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.18, ctx.currentTime + 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + durationMs / 1000);

      noiseNode.connect(bandpass);
      bandpass.connect(gain);
      gain.connect(ctx.destination);

      noiseNode.start();
      noiseNode.stop(ctx.currentTime + durationMs / 1000);
    } catch {
      // audio error handled silently
    }
  }

  /**
   * Stage 2: Active Snow Foam Effervescence & Bubbles
   * Random short bursts of frequency-modulated micro-clicks.
   */
  public playFoamBubbles(count: number = 8) {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx || ctx.state !== 'running') return;

    for (let i = 0; i < count; i++) {
      const delay = Math.random() * 0.5;
      setTimeout(() => {
        if (!ctx || ctx.state !== 'running' || this.isMuted) return;
        try {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          const freq = 1200 + Math.random() * 1800;

          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, ctx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(freq * 0.4, ctx.currentTime + 0.08);

          gain.gain.setValueAtTime(0.04, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start();
          osc.stop(ctx.currentTime + 0.08);
        } catch {
          // silent
        }
      }, delay * 1000);
    }
  }

  /**
   * Stage 3: Ceramic Polish & Buffer Resonance
   * Harmonic resonant sweep representing machine buffing gloss.
   */
  public playPolishSweep() {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx || ctx.state !== 'running') return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(140, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.5);
      osc.frequency.exponentialRampToValueAtTime(220, ctx.currentTime + 0.8);

      gain.gain.setValueAtTime(0.01, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.08, ctx.currentTime + 0.2);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.8);
    } catch {
      // silent
    }
  }

  /**
   * Stage 4: Brand Finale Reveal Chime
   * Sophisticated automotive corporate sonic mark.
   */
  public playBrandChime() {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx || ctx.state !== 'running') return;

    try {
      const frequencies = [587.33, 880.0, 1174.66, 1760.0]; // D5, A5, D6, A6 luxury chord
      frequencies.forEach((f, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, ctx.currentTime + idx * 0.04);

        gain.gain.setValueAtTime(0.001, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.06, ctx.currentTime + 0.06 + idx * 0.04);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.2);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(ctx.currentTime + idx * 0.04);
        osc.stop(ctx.currentTime + 1.2);
      });
    } catch {
      // silent
    }
  }
}

export const introAudio = new IntroAudioEngine();
