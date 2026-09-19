export type MotionPreference = "auto" | "full" | "reduced";
export const motionStorageKey = "pocket-gacha.motion.v1";

export function parseMotionPreference(value: string | null): MotionPreference {
  return value === "full" || value === "reduced" ? value : "auto";
}

export function shouldReduceMotion(
  preference: MotionPreference,
  systemReduced: boolean,
) {
  return preference === "reduced" || (preference === "auto" && systemReduced);
}
