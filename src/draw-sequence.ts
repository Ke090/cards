export type DrawPhase =
  | "idle"
  | "rolling"
  | "omen"
  | "dropping"
  | "ready"
  | "cracking"
  | "opening"
  | "revealing"
  | "result";

export const drawTimings = {
  normal: {
    rolling: 1100,
    omen: 0,
    dropping: 1100,
    cracking: 450,
    opening: 950,
    revealing: 900,
  },
  rare: {
    rolling: 1400,
    omen: 1100,
    dropping: 1500,
    cracking: 850,
    opening: 1500,
    revealing: 1700,
  },
  reduced: {
    rolling: 0,
    omen: 0,
    dropping: 0,
    cracking: 0,
    opening: 0,
    revealing: 200,
  },
} as const;

/** Presentation only: drawing and saving an item happen once, outside this timer. */
export class DrawSequence {
  phase: DrawPhase = "idle";
  private timer: ReturnType<typeof setTimeout> | undefined;
  timings: { readonly [K in keyof typeof drawTimings.normal]: number } =
    drawTimings.normal;

  constructor(private readonly onPhase: (phase: DrawPhase) => void) {}

  start(reducedMotion = false, rare = false): boolean {
    if (this.phase !== "idle" && this.phase !== "result") return false;
    this.timings = reducedMotion
      ? drawTimings.reduced
      : rare
        ? drawTimings.rare
        : drawTimings.normal;
    this.enter("rolling");
    this.after(this.timings.rolling, () => {
      if (rare) {
        this.enter("omen");
        this.after(this.timings.omen, () => this.drop());
      } else this.drop();
    });
    return true;
  }

  open() {
    if (this.phase !== "ready") return;
    this.enter("cracking");
    this.after(this.timings.cracking, () => {
      this.enter("opening");
      this.after(this.timings.opening, () => {
        this.enter("revealing");
        this.after(this.timings.revealing, () => this.finish());
      });
    });
  }

  skip() {
    if (this.phase === "idle" || this.phase === "result") return;
    this.finish();
  }

  private after(duration: number, callback: () => void) {
    this.timer = setTimeout(callback, duration);
  }

  private drop() {
    this.enter("dropping");
    this.after(this.timings.dropping, () => this.enter("ready"));
  }

  private finish() {
    clearTimeout(this.timer);
    this.timer = undefined;
    this.enter("result");
  }

  private enter(phase: DrawPhase) {
    this.phase = phase;
    this.onPhase(phase);
  }
}
