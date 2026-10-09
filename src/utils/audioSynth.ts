/**
 * Procedural Web Audio API soundscape generator for "Garis Wallace: Mereka yang Bertahan"
 * Generates natural forest ambiance, dawn birds, geothermal steam, industrial machinery rumbles, and acoustic ambient chords.
 */

class SoundscapeEngine {
  private ctx: AudioContext | null = null;
  private isPlaying: boolean = false;
  private currentType: string = 'forest';
  private masterGain: GainNode | null = null;
  private activeNodes: { stop?: () => void; disconnect?: () => void }[] = [];
  private birdTimer: number | null = null;
  private volume: number = 0.5;

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(this.volume, this.ctx.currentTime, 0.05);
    }
  }

  public start(type: string = 'forest') {
    this.initContext();
    if (!this.ctx || !this.masterGain) return;
    this.isPlaying = true;
    this.currentType = type;
    this.stopNodes();
    this.buildSoundscape(type);
  }

  public setType(type: string) {
    if (!this.isPlaying) return;
    if (this.currentType === type) return;
    this.currentType = type;
    this.stopNodes();
    this.buildSoundscape(type);
  }

  public stop() {
    this.isPlaying = false;
    this.stopNodes();
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }

  public getCurrentType(): string {
    return this.currentType;
  }

  private stopNodes() {
    if (this.birdTimer) {
      window.clearTimeout(this.birdTimer);
      this.birdTimer = null;
    }
    this.activeNodes.forEach(node => {
      try {
        if (node.stop) node.stop();
        if (node.disconnect) node.disconnect();
      } catch {
        // ignore cleanup error
      }
    });
    this.activeNodes = [];
  }

  private buildSoundscape(type: string) {
    if (!this.ctx || !this.masterGain) return;

    switch (type) {
      case 'forest':
      case 'dawn':
        this.createForestAtmosphere();
        break;
      case 'geothermal':
      case 'ocean':
        this.createOceanGeothermalAtmosphere();
        break;
      case 'industrial':
        this.createIndustrialHeavyMachineryAtmosphere();
        break;
      case 'hopeful':
        this.createHopefulAmbientChord();
        break;
      case 'silence':
      default:
        // very low whisper hum
        this.createSubtlePad(110, 0.04);
        break;
    }
  }

  // --- FOREST & JUNGLE AMBIANCE ---
  private createForestAtmosphere() {
    if (!this.ctx || !this.masterGain) return;

    // 1. Wind & canopy rustle noise
    const bufferSize = this.ctx.sampleRate * 2;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(450, this.ctx.currentTime);
    filter.Q.setValueAtTime(1.5, this.ctx.currentTime);

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.06, this.ctx.currentTime);

    whiteNoise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(this.masterGain);

    whiteNoise.start();
    this.activeNodes.push(whiteNoise, filter, noiseGain);

    // 2. High-pitch cricket shimmer
    const cricketOsc = this.ctx.createOscillator();
    cricketOsc.type = 'sine';
    cricketOsc.frequency.setValueAtTime(4800, this.ctx.currentTime);

    const cricketLfo = this.ctx.createOscillator();
    cricketLfo.type = 'triangle';
    cricketLfo.frequency.setValueAtTime(14, this.ctx.currentTime);

    const cricketLfoGain = this.ctx.createGain();
    cricketLfoGain.gain.setValueAtTime(0.015, this.ctx.currentTime);

    const cricketMasterGain = this.ctx.createGain();
    cricketMasterGain.gain.setValueAtTime(0.02, this.ctx.currentTime);

    cricketLfo.connect(cricketMasterGain.gain);
    cricketOsc.connect(cricketMasterGain);
    cricketMasterGain.connect(this.masterGain);

    cricketOsc.start();
    cricketLfo.start();
    this.activeNodes.push(cricketOsc, cricketLfo, cricketLfoGain, cricketMasterGain);

    // 3. Gentle harmonic resonant chord (dawn)
    this.createSubtlePad(146.83, 0.05); // D3

    // 4. Random procedural bird whistles
    this.scheduleBirdChirps();
  }

  private scheduleBirdChirps() {
    if (!this.isPlaying || !this.ctx || !this.masterGain) return;
    if (this.currentType !== 'forest' && this.currentType !== 'dawn') return;

    const delay = Math.random() * 3000 + 1500;
    this.birdTimer = window.setTimeout(() => {
      this.playBirdChirp();
      this.scheduleBirdChirps();
    }, delay);
  }

  private playBirdChirp() {
    if (!this.ctx || !this.masterGain || !this.isPlaying) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const baseFreq = 2200 + Math.random() * 800;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(baseFreq, now);
      osc.frequency.exponentialRampToValueAtTime(baseFreq + 600, now + 0.1);
      osc.frequency.exponentialRampToValueAtTime(baseFreq - 200, now + 0.25);

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.04, now + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.28);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.3);
    } catch {
      // ignore
    }
  }

  // --- INDUSTRIAL MINING & HEAVY MACHINERY ---
  private createIndustrialHeavyMachineryAtmosphere() {
    if (!this.ctx || !this.masterGain) return;

    const now = this.ctx.currentTime;

    // 1. Heavy low engine rumble (sawtooth low freq)
    const engineOsc = this.ctx.createOscillator();
    engineOsc.type = 'sawtooth';
    engineOsc.frequency.setValueAtTime(58, now); // Low diesel rumble

    const engineFilter = this.ctx.createBiquadFilter();
    engineFilter.type = 'lowpass';
    engineFilter.frequency.setValueAtTime(140, now);

    const engineGain = this.ctx.createGain();
    engineGain.gain.setValueAtTime(0.12, now);

    // LFO to create mechanical pulsing revs
    const engineLfo = this.ctx.createOscillator();
    engineLfo.type = 'sine';
    engineLfo.frequency.setValueAtTime(3.2, now);
    const engineLfoGain = this.ctx.createGain();
    engineLfoGain.gain.setValueAtTime(0.04, now);

    engineLfo.connect(engineGain.gain);
    engineOsc.connect(engineFilter);
    engineFilter.connect(engineGain);
    engineGain.connect(this.masterGain);

    engineOsc.start();
    engineLfo.start();
    this.activeNodes.push(engineOsc, engineFilter, engineGain, engineLfo, engineLfoGain);

    // 2. High metallic industrial drone
    const metalOsc = this.ctx.createOscillator();
    metalOsc.type = 'square';
    metalOsc.frequency.setValueAtTime(185, now);

    const metalFilter = this.ctx.createBiquadFilter();
    metalFilter.type = 'bandpass';
    metalFilter.frequency.setValueAtTime(320, now);
    metalFilter.Q.setValueAtTime(4.0, now);

    const metalGain = this.ctx.createGain();
    metalGain.gain.setValueAtTime(0.02, now);

    metalOsc.connect(metalFilter);
    metalFilter.connect(metalGain);
    metalGain.connect(this.masterGain);

    metalOsc.start();
    this.activeNodes.push(metalOsc, metalFilter, metalGain);
  }

  // --- OCEAN & GEOTHERMAL STEAM ---
  private createOceanGeothermalAtmosphere() {
    if (!this.ctx || !this.masterGain) return;

    const now = this.ctx.currentTime;
    const bufferSize = this.ctx.sampleRate * 2;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    // Ocean swell
    const swellNoise = this.ctx.createBufferSource();
    swellNoise.buffer = noiseBuffer;
    swellNoise.loop = true;

    const swellFilter = this.ctx.createBiquadFilter();
    swellFilter.type = 'lowpass';
    swellFilter.frequency.setValueAtTime(260, now);

    const swellGain = this.ctx.createGain();
    swellGain.gain.setValueAtTime(0.08, now);

    const swellLfo = this.ctx.createOscillator();
    swellLfo.type = 'sine';
    swellLfo.frequency.setValueAtTime(0.18, now); // ~5s cycle wave swell

    const swellLfoGain = this.ctx.createGain();
    swellLfoGain.gain.setValueAtTime(0.05, now);

    swellLfo.connect(swellGain.gain);
    swellNoise.connect(swellFilter);
    swellFilter.connect(swellGain);
    swellGain.connect(this.masterGain);

    swellNoise.start();
    swellLfo.start();
    this.activeNodes.push(swellNoise, swellFilter, swellGain, swellLfo, swellLfoGain);

    // Geothermal high-hiss steam
    const steamNoise = this.ctx.createBufferSource();
    steamNoise.buffer = noiseBuffer;
    steamNoise.loop = true;

    const steamFilter = this.ctx.createBiquadFilter();
    steamFilter.type = 'bandpass';
    steamFilter.frequency.setValueAtTime(3200, now);
    steamFilter.Q.setValueAtTime(2.0, now);

    const steamGain = this.ctx.createGain();
    steamGain.gain.setValueAtTime(0.015, now);

    steamNoise.connect(steamFilter);
    steamFilter.connect(steamGain);
    steamGain.connect(this.masterGain);

    steamNoise.start();
    this.activeNodes.push(steamNoise, steamFilter, steamGain);
  }

  // --- HOPEFUL AMBIENT CHORD PROGRESSION ---
  private createHopefulAmbientChord() {
    if (!this.ctx || !this.masterGain) return;
    this.createSubtlePad(220, 0.04); // A3
    this.createSubtlePad(277.18, 0.03); // C#4
    this.createSubtlePad(329.63, 0.03); // E4
    this.createSubtlePad(440, 0.02); // A4
  }

  private createSubtlePad(freq: number, targetVol: number) {
    if (!this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(targetVol, now + 1.2);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start();
    this.activeNodes.push(osc, gain);
  }
}

export const soundscape = new SoundscapeEngine();
