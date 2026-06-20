/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * useNonNegotiables — daily auto-regenerating non-negotiable quests.
 *
 * - On mount: reconciles quests — removes stale NN quests, generates today's
 *   fresh instances from templates.
 * - Persists templates in localStorage so they survive refresh.
 * - Provides CRUD for templates + quick-toggle for the daily instances.
 */

import { useEffect, useCallback } from "react";
import { Quest, NonNegotiableTemplate } from "../types";
import {
  reconcileDailyNonNegotiables,
  createNonNegotiableTemplate,
} from "../data";

interface UseNonNegotiablesInput {
  quests: Quest[];
  nonNegotiableTemplates: NonNegotiableTemplate[];
  todayString: string;
  setQuests: React.Dispatch<React.SetStateAction<Quest[]>>;
  setNonNegotiableTemplates: (t: NonNegotiableTemplate[]) => void;
  onToggleQuest: (questId: string) => void;
}

export function useNonNegotiables({
  quests,
  nonNegotiableTemplates,
  todayString,
  setQuests,
  setNonNegotiableTemplates,
  onToggleQuest,
}: UseNonNegotiablesInput) {
  // ── Auto-regenerate non-negotiables on mount / date change ──
  useEffect(() => {
    if (nonNegotiableTemplates.length === 0) return;
    const todaySuffix = todayString.replace(/-/g, "");
    const nnPrefix = `nn_`;

    // Check if today's NN quests already exist
    const hasTodayNN = quests.some(
      (q) =>
        (q.isNonNegotiable || q.id.startsWith(nnPrefix)) &&
        q.id.endsWith(todaySuffix),
    );

    if (!hasTodayNN) {
      const reconciled = reconcileDailyNonNegotiables(
        quests,
        nonNegotiableTemplates,
        todayString,
      );
      setQuests(reconciled);
      localStorage.setItem("projectff_quests", JSON.stringify(reconciled));
    }
  }, [todayString]); // re-run when date flips

  // persist templates to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(
      "projectff_nntemplates",
      JSON.stringify(nonNegotiableTemplates),
    );
  }, [nonNegotiableTemplates]);

  // ── Add a new non-negotiable template → also inserts today's quest ──
  const addNonNegotiable = useCallback(
    (overrides: Partial<NonNegotiableTemplate> & { title: string; pillar: string }) => {
      const template = createNonNegotiableTemplate(overrides);
      const updated = [...nonNegotiableTemplates, template];
      setNonNegotiableTemplates(updated);

      // Also immediately insert today's quest instance
      const todaySuffix = todayString.replace(/-/g, "");
      const newQuest: Quest = {
        id: `nn_${template.id}_${todaySuffix}`,
        title: template.title,
        description: template.description,
        pillar: template.pillar,
        xpReward: template.xpReward,
        completed: false,
        type: "daily",
        isNonNegotiable: true,
        priority: template.priority,
        scheduledTime: template.scheduledTime,
        durationMin: template.durationMin,
      };
      // Use functional updater to avoid stale state when called after onDeleteQuest
      setQuests((prev: Quest[]) => {
        const next = [...prev, newQuest];
        localStorage.setItem("projectff_quests", JSON.stringify(next));
        return next;
      });
    },
    [quests, nonNegotiableTemplates, todayString, setQuests, setNonNegotiableTemplates],
  );

  // ── Edit a non-negotiable template ──
  const editNonNegotiable = useCallback(
    (templateId: string, updates: Partial<NonNegotiableTemplate>) => {
      const updated = nonNegotiableTemplates.map((t) =>
        t.id === templateId
          ? { ...t, ...updates, updatedAt: new Date().toISOString() }
          : t,
      );
      setNonNegotiableTemplates(updated);

      // Also update today's quest instance title/description/pillar/xp
      const todaySuffix = todayString.replace(/-/g, "");
      const questId = `nn_${templateId}_${todaySuffix}`;
      const updatedQuests = quests.map((q) => {
        if (q.id === questId) {
          return {
            ...q,
            title: updates.title ?? q.title,
            description: updates.description ?? q.description,
            pillar: updates.pillar ?? q.pillar,
            xpReward: updates.xpReward ?? q.xpReward,
            priority: updates.priority ?? q.priority,
            scheduledTime: updates.scheduledTime ?? q.scheduledTime,
            durationMin: updates.durationMin ?? q.durationMin,
          };
        }
        return q;
      });
      setQuests(updatedQuests);
      localStorage.setItem("projectff_quests", JSON.stringify(updatedQuests));
    },
    [quests, nonNegotiableTemplates, todayString, setQuests, setNonNegotiableTemplates],
  );

  // ── Remove a non-negotiable template + its today quest ──
  const removeNonNegotiable = useCallback(
    (templateId: string) => {
      const updated = nonNegotiableTemplates.filter((t) => t.id !== templateId);
      setNonNegotiableTemplates(updated);

      const todaySuffix = todayString.replace(/-/g, "");
      const questId = `nn_${templateId}_${todaySuffix}`;
      const updatedQuests = quests.filter((q) => q.id !== questId);
      setQuests(updatedQuests);
      localStorage.setItem("projectff_quests", JSON.stringify(updatedQuests));
    },
    [quests, nonNegotiableTemplates, todayString, setQuests, setNonNegotiableTemplates],
  );

  // ── Prompt today's non-negotiable quests ──
  const todayNonNegotiables = quests.filter(
    (q) => q.isNonNegotiable || q.id.startsWith("nn_"),
  );

  // ── Count of non-negotiables completed today ──
  const nnCompletedToday = todayNonNegotiables.filter((q) => q.completed).length;
  const nnTotalToday = todayNonNegotiables.length;

  return {
    addNonNegotiable,
    editNonNegotiable,
    removeNonNegotiable,
    todayNonNegotiables,
    nnCompletedToday,
    nnTotalToday,
  };
}
