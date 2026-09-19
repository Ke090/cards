import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DrawSequence, type DrawPhase } from "../src/draw-sequence";

describe("draw presentation", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("waits for opening the capsule, then reveals exactly once despite repeated clicks", () => {
    const phases: DrawPhase[] = [];
    const sequence = new DrawSequence((phase) => phases.push(phase));
    expect(sequence.start()).toBe(true);
    expect(sequence.start()).toBe(false);
    sequence.open();
    expect(sequence.phase).toBe("rolling");
    vi.advanceTimersByTime(1500);
    expect(sequence.phase).toBe("dropping");
    vi.runAllTimers();
    expect(sequence.phase).toBe("ready");
    vi.advanceTimersByTime(10000);
    expect(sequence.phase).toBe("ready");
    sequence.open();
    sequence.open();
    vi.runAllTimers();
    sequence.skip();
    expect(phases).toEqual([
      "rolling",
      "dropping",
      "ready",
      "opening",
      "result",
    ]);
  });

  it.each([0, 1600, 2000, 2200])(
    "skips safely at %sms without a late timer reopening the capsule",
    (elapsed) => {
      const onPhase = vi.fn();
      const sequence = new DrawSequence(onPhase);
      sequence.start();
      vi.advanceTimersByTime(elapsed);
      if (elapsed === 2200) sequence.open();
      sequence.skip();
      sequence.skip();
      vi.runAllTimers();
      expect(sequence.phase).toBe("result");
      expect(
        onPhase.mock.calls.filter(([phase]) => phase === "result"),
      ).toHaveLength(1);
      expect(vi.getTimerCount()).toBe(0);
      expect(sequence.start()).toBe(true);
      expect(sequence.phase).toBe("rolling");
      vi.runAllTimers();
      expect(sequence.phase).toBe("ready");
    },
  );

  it("shortens reduced-motion playback but still lets the user open the capsule", () => {
    const sequence = new DrawSequence(() => {});
    sequence.start(true);
    vi.runAllTimers();
    expect(sequence.phase).toBe("ready");
    sequence.open();
    vi.runAllTimers();
    expect(sequence.phase).toBe("result");
  });
});
