export type DrawPhase =
  "idle" | "rolling" | "dropping" | "ready" | "opening" | "result";

/** Presentation only: drawing and saving an item happen once, outside this timer. */
export class DrawSequence {
  phase: DrawPhase = "idle";
  private timer: ReturnType<typeof setTimeout> | undefined;
  private reducedMotion = false;

  constructor(private readonly onPhase: (phase: DrawPhase) => void) {}

  start(reducedMotion = false): boolean {
    if (this.phase !== "idle" && this.phase !== "result") return false;
    this.reducedMotion = reducedMotion;
    this.enter("rolling");
    this.after(1500, () => {
      this.enter("dropping");
      this.after(450, () => this.enter("ready"));
    });
    return true;
  }

  open() {
    if (this.phase !== "ready") return;
    this.enter("opening");
    this.after(700, () => this.finish());
  }

  skip() {
    if (this.phase === "idle" || this.phase === "result") return;
    this.finish();
  }

  private after(duration: number, callback: () => void) {
    this.timer = setTimeout(callback, this.reducedMotion ? 0 : duration);
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
