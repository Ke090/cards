import { describe, expect, it, vi } from "vitest";
import { SoundEffects, readSoundPreference, type SoundCue } from "../src/sound";

function audioMock() {
  const parameter = () => ({
    setValueAtTime: vi.fn(),
    linearRampToValueAtTime: vi.fn(),
    exponentialRampToValueAtTime: vi.fn(),
  });
  const context = {
    state: "running",
    currentTime: 10,
    destination: {},
    resume: vi.fn(async () => {}),
    createOscillator: vi.fn(() => ({
      type: "sine",
      frequency: parameter(),
      connect: vi.fn(),
      disconnect: vi.fn(),
      start: vi.fn(),
      stop: vi.fn(),
      onended: null,
    })),
    createGain: vi.fn(() => ({
      gain: parameter(),
      connect: vi.fn(),
      disconnect: vi.fn(),
    })),
  };
  const factory = vi.fn(() => context as unknown as AudioContext);
  return { context, factory };
}

describe("sound effects", () => {
  it("does not create audio until a user gesture unlocks it", async () => {
    const { context, factory } = audioMock();
    const sound = new SoundEffects(factory);
    sound.play("roll");
    expect(factory).not.toHaveBeenCalled();
    await sound.unlock();
    sound.play("roll");
    expect(context.createOscillator).toHaveBeenCalled();
  });
  it("muting stops scheduled sounds immediately and prevents new ones", async () => {
    const { context, factory } = audioMock();
    const sound = new SoundEffects(factory);
    await sound.unlock();
    sound.play("rare");
    const voices = context.createOscillator.mock.results.map(
      (result) => result.value,
    );
    for (const voice of voices) voice.stop.mockClear();
    sound.setEnabled(false);
    for (const voice of voices) {
      expect(voice.stop).toHaveBeenCalledWith();
      expect(voice.disconnect).toHaveBeenCalled();
    }
    context.createOscillator.mockClear();
    sound.play("normal");
    await sound.unlock();
    expect(context.createOscillator).not.toHaveBeenCalled();
    expect(factory).toHaveBeenCalledTimes(1);
  });
  it.each<SoundCue>(["roll", "drop", "ready", "open", "normal", "rare"])(
    "schedules %s with bounded, finite tone timing",
    async (cue) => {
      const { context, factory } = audioMock();
      const sound = new SoundEffects(factory);
      await sound.unlock();
      sound.play(cue);
      expect(context.createOscillator.mock.results.length).toBeGreaterThan(0);
      for (const { value: voice } of context.createOscillator.mock.results) {
        const start = voice.start.mock.calls[0][0];
        const stop = voice.stop.mock.calls[0][0];
        expect(start).toBeGreaterThanOrEqual(10);
        expect(stop).toBeGreaterThan(start);
        expect(stop).toBeLessThan(12);
      }
    },
  );
  it("tolerates unavailable or rejected browser audio without interrupting the game", async () => {
    const unavailable = vi.fn();
    const sound = new SoundEffects(() => {
      throw new Error("unsupported");
    }, unavailable);
    await expect(sound.unlock()).resolves.toBeUndefined();
    expect(() => sound.play("normal")).not.toThrow();
    expect(sound.available).toBe(false);
    expect(unavailable).toHaveBeenCalledTimes(1);
    const { context, factory } = audioMock();
    context.state = "suspended";
    context.resume.mockRejectedValue(new Error("denied"));
    const suspended = new SoundEffects(factory);
    await expect(suspended.unlock()).resolves.toBeUndefined();
    expect(suspended.available).toBe(false);
  });
  it("restores an explicit muted preference while defaulting to enabled", () => {
    expect(readSoundPreference("off")).toBe(false);
    expect(readSoundPreference("on")).toBe(true);
    expect(readSoundPreference(null)).toBe(true);
  });
});
