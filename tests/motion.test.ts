import { describe, expect, it } from "vitest";
import { parseMotionPreference, shouldReduceMotion } from "../src/motion";

describe("motion preference", () => {
  it("uses OS preference in auto mode, but honors an explicit selection", () => {
    expect(shouldReduceMotion("auto", true)).toBe(true);
    expect(shouldReduceMotion("auto", false)).toBe(false);
    expect(shouldReduceMotion("full", true)).toBe(false);
    expect(shouldReduceMotion("full", false)).toBe(false);
    expect(shouldReduceMotion("reduced", false)).toBe(true);
    expect(shouldReduceMotion("reduced", true)).toBe(true);
  });
  it.each([null, "", "unknown", "auto"])(
    "defaults invalid or unset storage %s to auto",
    (value) => {
      expect(parseMotionPreference(value)).toBe("auto");
    },
  );
  it.each(["full", "reduced"] as const)("restores %s", (value) => {
    expect(parseMotionPreference(value)).toBe(value);
  });
});
