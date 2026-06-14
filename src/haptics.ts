/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Haptic feedback — tiny, distinct vibration patterns per reward event.
 * Uses navigator.vibrate (Android/Chrome); silently no-ops where unsupported
 * (iOS Safari). Never throws.
 */

type HapticKind = "tap" | "success" | "streak" | "levelup";

const PATTERNS: Record<HapticKind, number | number[]> = {
  tap: 8, // light tick — selection, pin, capture
  success: [12, 40, 18], // quest complete
  streak: [10, 30, 10, 30, 24], // streak extend / save
  levelup: [16, 50, 16, 50, 16, 50, 40], // level up / bounty
};

export function haptic(kind: HapticKind = "tap"): void {
  try {
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate(PATTERNS[kind]);
    }
  } catch {
    /* never interrupt the UI for feedback */
  }
}
