import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  DrawSequence,
  drawTimings,
  type DrawPhase,
} from "../src/draw-sequence";

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
    vi.advanceTimersByTime(drawTimings.normal.rolling);
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
      "cracking",
      "opening",
      "revealing",
      "result",
    ]);
  });

  it.each([
    "rolling",
    "omen",
    "dropping",
    "ready",
    "cracking",
    "opening",
    "revealing",
  ] as const)(
    "skips safely during %s without a late timer reopening the capsule",
    (target) => {
      const onPhase = vi.fn();
      const sequence = new DrawSequence(onPhase);
      sequence.start(false, true);
      while (sequence.phase !== target) {
        if (sequence.phase === "ready") sequence.open();
        else vi.advanceTimersToNextTimer();
      }
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

  it("gives rare draws an omen and longer opening before the prize appears", () => {
    const phases: DrawPhase[] = [];
    const sequence = new DrawSequence((phase) => phases.push(phase));
    sequence.start(false, true);
    vi.advanceTimersByTime(drawTimings.rare.rolling);
    expect(sequence.phase).toBe("omen");
    vi.advanceTimersByTime(drawTimings.rare.omen);
    expect(sequence.phase).toBe("dropping");
    vi.advanceTimersByTime(drawTimings.rare.dropping);
    sequence.open();
    vi.advanceTimersByTime(drawTimings.rare.cracking);
    expect(sequence.phase).toBe("opening");
    vi.advanceTimersByTime(drawTimings.rare.opening);
    expect(sequence.phase).toBe("revealing");
    vi.advanceTimersByTime(drawTimings.rare.revealing);
    expect(sequence.phase).toBe("result");
    expect(phases).toEqual([
      "rolling",
      "omen",
      "dropping",
      "ready",
      "cracking",
      "opening",
      "revealing",
      "result",
    ]);
    expect(drawTimings.rare.opening).toBeGreaterThan(
      drawTimings.normal.opening,
    );
  });

  it.each([false, true])(
    "shortens reduced-motion playback (rare=%s) but still lets the user open the capsule",
    (rare) => {
      const sequence = new DrawSequence(() => {});
      sequence.start(true, rare);
      vi.runAllTimers();
      expect(sequence.phase).toBe("ready");
      sequence.open();
      vi.runAllTimers();
      expect(sequence.phase).toBe("result");
    },
  );
});
