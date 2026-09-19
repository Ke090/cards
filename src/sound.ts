export type SoundCue =
  | "roll"
  | "omen"
  | "drop"
  | "ready"
  | "charge"
  | "open"
  | "rare-open"
  | "normal"
  | "rare";
export const soundStorageKey = "pocket-gacha.sound.v1";

export function readSoundPreference(value: string | null): boolean {
  return value !== "off";
}

/** Small, original Web Audio effects. No downloads, permission prompts or autoplay. */
export class SoundEffects {
  private context: AudioContext | undefined;
  private readonly voices = new Set<OscillatorNode>();
  enabled = true;
  available = true;

  constructor(
    private readonly createContext: () => AudioContext = () =>
      new AudioContext(),
    private readonly onUnavailable: () => void = () => {},
  ) {}

  setEnabled(enabled: boolean) {
    this.enabled = enabled;
    if (!enabled) this.stop();
  }

  // Must be called directly from a user gesture, never on page load.
  async unlock() {
    if (!this.enabled || !this.available) return;
    try {
      this.context ??= this.createContext();
      if (this.context.state === "suspended") await this.context.resume();
    } catch {
      this.available = false;
      this.stop();
      this.onUnavailable();
    }
  }

  stop() {
    for (const voice of this.voices) {
      voice.stop();
      voice.disconnect();
    }
    this.voices.clear();
  }

  play(cue: SoundCue) {
    if (!this.enabled || !this.available || this.context?.state !== "running")
      return;
    this.stop();
    try {
      if (cue === "roll") {
        for (let i = 0; i < 10; i++)
          this.note(160 + (i % 3) * 55, i * 0.135, 0.07, "triangle", 0.055);
      } else if (cue === "omen") {
        this.note(196, 0, 0.8, "sine", 0.065);
        this.note(293.66, 0.15, 0.8, "sine", 0.045);
        this.note(587.33, 0.35, 0.6, "sine", 0.04, 1174.66);
      } else if (cue === "charge") {
        this.note(220, 0, 0.4, "sine", 0.065, 660);
        this.note(440, 0.1, 0.3, "triangle", 0.025, 1320);
      } else if (cue === "rare-open") {
        [392, 523.25, 659.25, 784, 1046.5].forEach((frequency, i) =>
          this.note(frequency, i * 0.12, 0.6, "sine", 0.055),
        );
        this.note(130.81, 0, 0.85, "triangle", 0.055);
      } else if (cue === "drop") {
        this.note(160, 0, 0.16, "sine", 0.16, 65);
        this.note(390, 0.12, 0.12, "triangle", 0.07);
      } else if (cue === "ready") {
        this.note(784, 0, 0.16, "sine", 0.06);
        this.note(1046.5, 0.12, 0.2, "sine", 0.05);
      } else if (cue === "open") {
        this.note(240, 0, 0.18, "triangle", 0.1, 1200);
        this.note(1568, 0.13, 0.23, "sine", 0.045);
      } else {
        const notes =
          cue === "rare"
            ? [523.25, 659.25, 784, 1046.5, 1318.5, 1568, 2093]
            : [523.25, 659.25, 784, 1046.5];
        notes.forEach((frequency, i) =>
          this.note(frequency, i * 0.105, 0.36, "sine", 0.075),
        );
        if (cue === "rare") this.note(523.25, 0.35, 0.7, "triangle", 0.045);
      }
    } catch {
      // Unsupported audio must never block the draw or collection save.
      this.available = false;
      this.stop();
      this.onUnavailable();
    }
  }

  private note(
    frequency: number,
    delay: number,
    duration: number,
    type: OscillatorType,
    volume: number,
    endFrequency = frequency,
  ) {
    const context = this.context!;
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    const start = context.currentTime + delay;
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, start);
    oscillator.frequency.exponentialRampToValueAtTime(
      endFrequency,
      start + duration,
    );
    gain.gain.setValueAtTime(0, start);
    gain.gain.linearRampToValueAtTime(volume, start + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.001, start + duration);
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.onended = () => {
      oscillator.disconnect();
      gain.disconnect();
      this.voices.delete(oscillator);
    };
    oscillator.start(start);
    oscillator.stop(start + duration + 0.02);
    this.voices.add(oscillator);
  }
}
