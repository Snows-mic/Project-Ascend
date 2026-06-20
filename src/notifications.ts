/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * notifications — push notification plumbing for Project Ascend.
 *
 * - Requests permission (must be triggered by a user gesture)
 * - Schedules local reminders via setTimeout (PWA doesn't have a native scheduler)
 * - Character-voiced messages ("Your Future Self is one quest from Lv.12")
 */

type NotificationPayload = {
  title: string;
  body: string;
  tag?: string;
  data?: Record<string, string>;
};

const STORAGE_KEY = "projectff_notif_permission";
const SW_REG_KEY = "projectff_sw_registered";

let swRegistration: ServiceWorkerRegistration | null = null;

/** Store the SW registration for later push-subscription use */
export function setSWRegistration(reg: ServiceWorkerRegistration) {
  swRegistration = reg;
  localStorage.setItem(SW_REG_KEY, "true");
}

/** Request notification permission (must be called from a user gesture) */
export async function requestNotificationPermission(): Promise<boolean> {
  if (!("Notification" in window)) return false;

  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === "granted" && Notification.permission === "granted") {
    return true;
  }

  try {
    const permission = await Notification.requestPermission();
    const granted = permission === "granted";
    localStorage.setItem(STORAGE_KEY, permission);
    return granted;
  } catch {
    return false;
  }
}

/** Check if notifications are already permitted */
export function hasNotificationPermission(): boolean {
  return "Notification" in window && Notification.permission === "granted";
}

/** Show a local notification (fallback when SW push isn't available) */
export function showLocalNotification(payload: NotificationPayload) {
  if (!hasNotificationPermission()) return;

  if (swRegistration) {
    swRegistration.showNotification(payload.title, {
      body: payload.body,
      icon: "/icon.svg",
      badge: "/icon.svg",
      tag: payload.tag ?? "ascend-reminder",
      data: payload.data,
      requireInteraction: true,
      // `vibrate` is valid at runtime for SW notifications but missing from
      // the DOM lib's NotificationOptions type, so widen the options object.
      vibrate: [200, 100, 200],
    } as NotificationOptions & { vibrate?: number[] });
  } else {
    // Fallback: use the Notification API directly
    new Notification(payload.title, {
      body: payload.body,
      icon: "/icon.svg",
      tag: payload.tag ?? "ascend-reminder",
    });
  }
}

/** Schedule a reminder after a delay (ms). Returns a cancel function. */
export function scheduleReminder(
  payload: NotificationPayload,
  delayMs: number,
): () => void {
  const id = setTimeout(() => {
    showLocalNotification(payload);
  }, delayMs);
  return () => clearTimeout(id);
}

/** Character-voiced reminder templates */
export const NotifVoice = {
  questNearLevel: (level: number) => ({
    title: "⚔️ One quest away",
    body: `Your Future Self is one quest from Level ${level}.`,
    tag: "level-near",
  }),
  streakAtRisk: (pillar: string) => ({
    title: "🔥 Streak at risk",
    body: `${pillar} streak expires today. A single tap saves it.`,
    tag: "streak-risk",
  }),
  eveningReflection: () => ({
    title: "🌙 Evening reflection",
    body: "How did today shape you? Two minutes of journaling seals the day.",
    tag: "evening-reflect",
  }),
  morningPlan: () => ({
    title: "☀️ Morning plan",
    body: "Pick your Top 3 for today. Your Future Self is waiting.",
    tag: "morning-plan",
  }),
  comeback: () => ({
    title: "🪡 Kintsugi awaits",
    body: "A break isn't failure — it's a gold seam in the making. Come back.",
    tag: "comeback",
  }),
};
