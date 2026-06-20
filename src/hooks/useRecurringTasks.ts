/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * useRecurringTasks — materialises recurring quest instances.
 *
 * Templates live in localStorage under `projectff_recurring_templates`.
 * On every new day (or when called after completion), new instances are
 * created from active templates and merged into the quest list.
 */

import { useMemo } from "react";
import type { Quest, Recurrence } from "../types";

const STORAGE_KEY = "projectff_recurring_templates";

/** Normalise to YYYY-MM-DD in local time */
function todayString(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/** Should a recurrence fire on dateStr? */
export function shouldMaterialise(
  recurrence: Recurrence,
  today: string,
  lastMaterialised?: string,
): boolean {
  if (recurrence.type === "none") return false;
  if (lastMaterialised === today) return false; // already materialised today

  const dt = new Date(today + "T00:00:00");

  switch (recurrence.type) {
    case "daily":
      return true;
    case "weekly":
      return dt.getDay() === recurrence.day;
    case "weekdays":
      return dt.getDay() >= 1 && dt.getDay() <= 5;
    case "interval": {
      if (!lastMaterialised) return true;
      const last = new Date(lastMaterialised + "T00:00:00");
      const diffDays = Math.floor((dt.getTime() - last.getTime()) / 86400000);
      return diffDays >= recurrence.everyDays;
    }
    default:
      return false;
  }
}

export interface RecurrenceTemplate {
  id: string;
  title: string;
  description: string;
  pillar: string;
  xpReward: number;
  recurrence: Recurrence;
  priority?: Quest["priority"];
  scheduledTime?: string;
  durationMin?: number;
  active: boolean;
  lastMaterialisedAt?: string; // YYYY-MM-DD last time an instance was created
}

/** Create a fresh quest instance from a template */
export function materialiseInstance(
  template: RecurrenceTemplate,
): Quest {
  const uid = `${template.id}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  return {
    id: uid,
    title: template.title,
    description: template.description,
    pillar: template.pillar,
    xpReward: template.xpReward,
    completed: false,
    type: "daily",
    recurrence: template.recurrence,
    recurrenceId: template.id,
    priority: template.priority,
    scheduledTime: template.scheduledTime,
    durationMin: template.durationMin,
  };
}

/** Read templates from localStorage */
export function loadRecurrenceTemplates(): RecurrenceTemplate[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/** Save templates to localStorage */
export function saveRecurrenceTemplates(templates: RecurrenceTemplate[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(templates));
}

/**
 * Hook: given existing quests, produce materialised recurring instances
 * that should be present today (but are not yet in the quest list).
 */
export function useRecurringTasks(existingQuests: Quest[]): {
  /** New instances that should be added to the quest list today */
  pendingInstances: Quest[];
  /** Templates (for UI rendering / editing) */
  templates: RecurrenceTemplate[];
} {
  const templates = useMemo(() => loadRecurrenceTemplates(), []);
  const today = todayString();

  const pendingInstances = useMemo(() => {
    const result: Quest[] = [];
    for (const tpl of templates) {
      if (!tpl.active) continue;
      if (tpl.recurrence.type === "none") continue;

      // Skip if an instance from this template already exists for today
      const alreadyExists = existingQuests.some(
        (q) => q.recurrenceId === tpl.id && !q.completed,
      );

      if (alreadyExists) continue;

      if (shouldMaterialise(tpl.recurrence, today, tpl.lastMaterialisedAt)) {
        result.push(materialiseInstance(tpl));
      }
    }
    return result;
  }, [templates, existingQuests, today]);

  return { pendingInstances, templates };
}

/**
 * Call this after materialising instances to update the template's timestamp.
 */
export function markMaterialised(templateId: string, dateStr: string) {
  const templates = loadRecurrenceTemplates();
  const idx = templates.findIndex((t) => t.id === templateId);
  if (idx === -1) return;
  templates[idx].lastMaterialisedAt = dateStr;
  saveRecurrenceTemplates(templates);
}

/** Create a new recurrence template */
export function createRecurrenceTemplate(
  partial: Pick<
    RecurrenceTemplate,
    "title" | "description" | "pillar" | "xpReward" | "recurrence"
  > &
    Partial<RecurrenceTemplate>,
): RecurrenceTemplate {
  const tpl: RecurrenceTemplate = {
    id: `rec_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    title: partial.title,
    description: partial.description,
    pillar: partial.pillar,
    xpReward: partial.xpReward,
    recurrence: partial.recurrence,
    priority: partial.priority,
    scheduledTime: partial.scheduledTime,
    durationMin: partial.durationMin,
    active: partial.active ?? true,
    lastMaterialisedAt: undefined,
  };
  const templates = loadRecurrenceTemplates();
  templates.push(tpl);
  saveRecurrenceTemplates(templates);
  return tpl;
}

/** Delete a recurrence template */
export function deleteRecurrenceTemplate(templateId: string) {
  const templates = loadRecurrenceTemplates().filter((t) => t.id !== templateId);
  saveRecurrenceTemplates(templates);
}
