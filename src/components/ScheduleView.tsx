/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * ScheduleView — time-blocking planner.
 *  - Full 24-hour timeline (00:00–23:00), auto-scrolled to the current hour.
 *  - Date navigator: plan any day (← Today →, tappable Mon→Sun week strip).
 *  - Drag tasks from the Unscheduled tray onto an hour; drag back / × to clear.
 *  - Recurring habits (no scheduledDate) show every day; dated blocks only on
 *    their day. Completion is tracked for today only; future days are plan-only.
 */

import { useEffect, useMemo, useRef, useState } from "react";
import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import {
  Calendar,
  Check,
  X,
  Clock,
  GripVertical,
  ChevronLeft,
  ChevronRight,
  CalendarClock,
} from "lucide-react";
import { UserProfile, DailyLog, Quest } from "../types";
import { getPillarDef, PRIORITY_META } from "../data";

interface ScheduleViewProps {
  profile: UserProfile;
  todayLog: DailyLog;
  quests: Quest[];
  onToggleQuest: (id: string) => void;
  onSchedule: (id: string, time: string | null, date?: string | null) => void;
  initialDate?: string; // deep-link target (e.g. "Plan Tomorrow")
  onConsumeInitialDate?: () => void;
}

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const toMondayFirst = (jsDay: number) => (jsDay + 6) % 7;
const HOURS = Array.from({ length: 24 }, (_, i) =>
  `${String(i).padStart(2, "0")}:00`,
);
const TODAY = new Date().toISOString().slice(0, 10);

function addDays(date: string, n: number): string {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

function dateLabel(date: string): string {
  if (date === TODAY) return "Today";
  if (date === addDays(TODAY, 1)) return "Tomorrow";
  if (date === addDays(TODAY, -1)) return "Yesterday";
  return new Date(`${date}T00:00:00`).toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

/* ---- Draggable chip (tray) ---- */
interface TrayChipProps {
  quest: Quest;
  done: boolean;
}
function TrayChip({ quest, done }: TrayChipProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({ id: quest.id });
  const style = transform
    ? { transform: CSS.Translate.toString(transform), zIndex: 50 }
    : undefined;
  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`flex cursor-grab items-center gap-2 rounded-xl bg-[#2C2C2E] px-3 py-2 text-[13px] text-white active:cursor-grabbing active:bg-[#3A3A3C] ${
        isDragging ? "opacity-30" : ""
      } ${done ? "opacity-50" : ""}`}
    >
      <GripVertical className="h-4 w-4 shrink-0 text-white/25" />
      {quest.priority && (
        <span className={`h-2 w-2 shrink-0 rounded-full ${PRIORITY_META[quest.priority].dot}`} />
      )}
      <span className="truncate">{quest.title}</span>
      {quest.durationMin ? (
        <span className="shrink-0 text-white/30 text-[12px]">{quest.durationMin}m</span>
      ) : null}
    </div>
  );
}

/* ---- Scheduled block ---- */
interface ScheduledBlockProps {
  quest: Quest;
  done: boolean;
  canComplete: boolean;
  onToggle: (id: string) => void;
  onUnschedule: (id: string) => void;
}
function ScheduledBlock({
  quest,
  done,
  canComplete,
  onToggle,
  onUnschedule,
}: ScheduledBlockProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({ id: quest.id });
  const style = transform
    ? { transform: CSS.Translate.toString(transform), zIndex: 50 }
    : undefined;
  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-2 rounded-xl px-3 py-2 bg-[#2C2C2E] ${
        quest.priority ? PRIORITY_META[quest.priority].border : "border-l-2 border-l-ios-blue"
      } ${isDragging ? "opacity-30" : ""}`}
    >
      <button
        onClick={() => canComplete && onToggle(quest.id)}
        disabled={!canComplete}
        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
          done
            ? "bg-[#30D158] text-white"
            : "bg-[#3A3A3C] text-transparent"
        } ${!canComplete ? "opacity-50" : ""}`}
        title={canComplete ? "Complete" : "Planned for a future day"}
      >
        <Check className="h-3 w-3" />
      </button>
      <div
        {...listeners}
        {...attributes}
        className="min-w-0 flex-1 cursor-grab active:cursor-grabbing"
      >
        <p className={`truncate text-[13px] ${done ? "text-white/30 line-through" : "text-white"}`}>
          <span className="text-ios-blue">{quest.scheduledTime}</span>{" "}
          {quest.title}
        </p>
      </div>
      <button
        onClick={() => onUnschedule(quest.id)}
        className="shrink-0 text-white/30 active:text-[#FF453A]"
        title="Unschedule"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

/* ---- Hour slot (droppable) ---- */
interface HourSlotProps {
  hour: string;
  blocks: Quest[];
  isNow: boolean;
  canComplete: boolean;
  isDone: (q: Quest) => boolean;
  onToggle: (id: string) => void;
  onUnschedule: (id: string) => void;
  nowRef?: (el: HTMLDivElement | null) => void;
}
function HourSlot({
  hour,
  blocks,
  isNow,
  canComplete,
  isDone,
  onToggle,
  onUnschedule,
  nowRef,
}: HourSlotProps) {
  const { setNodeRef, isOver } = useDroppable({ id: `hour-${hour}` });
  return (
    <div className="flex gap-2" ref={nowRef}>
      <span
        className={`w-11 shrink-0 pt-1.5 text-right text-[11px] ${
          isNow ? "font-semibold text-ios-blue" : "text-white/30"
        }`}
      >
        {hour}
      </span>
      <div
        ref={setNodeRef}
        className={`min-h-[36px] flex-1 space-y-1 rounded-xl p-1 transition-colors ${
          isOver
            ? "bg-ios-blue/10 ring-1 ring-ios-blue/30"
            : isNow
              ? "bg-[#2C2C2E]"
              : "bg-[#1C1C1E]"
        }`}
      >
        {blocks.map((q) => (
          <div key={q.id}>
            <ScheduledBlock
              quest={q}
              done={isDone(q)}
              canComplete={canComplete}
              onToggle={onToggle}
              onUnschedule={onUnschedule}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---- Unscheduled tray (droppable, inside DndContext) ---- */
interface TrayProps {
  unscheduled: Quest[];
  scheduledCount: number;
  isDone: (q: Quest) => boolean;
}
function Tray({ unscheduled, scheduledCount, isDone }: TrayProps) {
  const { setNodeRef, isOver } = useDroppable({ id: "tray" });
  return (
    <div className="ios-card p-5">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2 text-[11px] font-hud font-semibold uppercase tracking-wider text-white/30">
          <Clock className="h-3.5 w-3.5 text-ios-blue" />
          QUEUED PROTOCOLS
        </div>
        <span className="text-[11px] text-white/30">
          {scheduledCount} blocked · drag onto a time →
        </span>
      </div>
      <div
        ref={setNodeRef}
        className={`flex min-h-[44px] flex-wrap gap-2 rounded-xl p-2 transition-colors ${
          isOver ? "bg-ios-blue/10 ring-1 ring-ios-blue/30" : "bg-[#1C1C1E]"
        }`}
      >
        {unscheduled.length === 0 ? (
          <span className="px-1 py-1 text-xs text-white/45">
            Everything's scheduled. 🎯
          </span>
        ) : (
          unscheduled.map((q) => (
            <div key={q.id}>
              <TrayChip quest={q} done={isDone(q)} />
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default function ScheduleView({
  todayLog,
  quests,
  onToggleQuest,
  onSchedule,
  initialDate,
  onConsumeInitialDate,
}: ScheduleViewProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  );
  const [viewDate, setViewDate] = useState(initialDate || TODAY);
  const isToday = viewDate === TODAY;
  const nowHour = `${String(new Date().getHours()).padStart(2, "0")}:00`;
  const nowRowRef = useRef<HTMLDivElement | null>(null);
  const timelineRef = useRef<HTMLDivElement | null>(null);

  // On first mount: consume any deep-link date, and scroll the TIMELINE
  // container (not the window) to the current hour.
  useEffect(() => {
    if (initialDate) onConsumeInitialDate?.();
    const c = timelineRef.current;
    const r = nowRowRef.current;
    if (isToday && c && r) {
      c.scrollTop +=
        r.getBoundingClientRect().top - c.getBoundingClientRect().top - 40;
    }
    // run once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isDone = (q: Quest) =>
    isToday ? (todayLog.completedTasks[q.id] ?? q.completed) : false;

  const weekDates = useMemo(() => {
    const base = new Date(`${viewDate}T00:00:00Z`);
    const monday = new Date(base);
    monday.setUTCDate(base.getUTCDate() - toMondayFirst(base.getUTCDay()));
    return Array.from({ length: 7 }, (_, i) => addDays(monday.toISOString().slice(0, 10), i));
  }, [viewDate]);

  const unscheduled = useMemo(
    () =>
      quests.filter(
        (q) => !q.scheduledTime && (q.type === "daily" || q.isCoreHabit),
      ),
    [quests],
  );

  const blocksForHour = (hour: string) =>
    quests
      .filter((q) => {
        if (!q.scheduledTime || q.scheduledTime.slice(0, 2) !== hour.slice(0, 2))
          return false;
        return q.scheduledDate ? q.scheduledDate === viewDate : true; // recurring shows every day
      })
      .sort((a, b) => (a.scheduledTime! < b.scheduledTime! ? -1 : 1));

  const scheduledCount = quests.filter((q) =>
    q.scheduledTime && (q.scheduledDate ? q.scheduledDate === viewDate : true),
  ).length;

  const handleDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over) return;
    const id = String(active.id);
    const overId = String(over.id);
    if (overId.startsWith("hour-")) {
      const time = overId.replace("hour-", "");
      // Today → recurring block (no date). Future/past → dated one-off.
      onSchedule(id, time, isToday ? null : viewDate);
    } else if (overId === "tray") {
      onSchedule(id, null, null);
    }
  };

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div className="space-y-5">
        {/* Date navigator */}
        <div className="ios-card p-4">
          <div className="mb-3 flex items-center justify-between">
            <button
              onClick={() => setViewDate(addDays(viewDate, -1))}
              className="flex h-9 w-9 items-center justify-center rounded-full active:bg-white/10 text-white/40"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-2">
              <CalendarClock className="h-4 w-4 text-ios-blue" />
              <span className="text-[15px] font-semibold text-white">
                {dateLabel(viewDate)}
              </span>
              {!isToday && (
                <button
                  onClick={() => setViewDate(TODAY)}
                  className="ml-1 rounded-full bg-ios-blue/15 px-2.5 py-0.5 text-[11px] font-medium text-ios-blue active:bg-ios-blue/25"
                >
                  Today
                </button>
              )}
            </div>
            <button
              onClick={() => setViewDate(addDays(viewDate, 1))}
              className="flex h-9 w-9 items-center justify-center rounded-full active:bg-white/10 text-white/40"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
          <div className="flex justify-between">
            {weekDates.map((d, i) => {
              const selected = d === viewDate;
              const isDayToday = d === TODAY;
              return (
                <button
                  key={d}
                  onClick={() => setViewDate(d)}
                  className={`flex h-12 w-10 flex-col items-center justify-center rounded-xl text-[11px] transition-colors ${
                    selected
                      ? "bg-ios-blue text-white font-semibold"
                      : isDayToday
                        ? "text-ios-blue font-medium"
                        : "text-white/40 active:bg-white/[0.06]"
                  }`}
                >
                  <span>{DAYS[i]}</span>
                  <span className="mt-0.5 text-[15px] font-semibold">
                    {parseInt(d.slice(8, 10))}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Unscheduled tray */}
        <Tray
          unscheduled={unscheduled}
          scheduledCount={scheduledCount}
          isDone={isDone}
        />

        {/* 24-hour timeline */}
        <div className="system-card rounded-2xl p-5">
          <div className="mb-4 flex items-center gap-2 text-xs font-hud font-semibold uppercase tracking-widest text-white/40">
            <Calendar className="h-3.5 w-3.5 text-brand-neon" />
            {isToday ? "BATTLE SCHEDULE" : `${dateLabel(viewDate)} — Plan`}
          </div>
          <div
            ref={timelineRef}
            className="max-h-[60vh] space-y-1.5 overflow-y-auto pr-1"
          >
            {HOURS.map((hour) => {
              const now = isToday && hour === nowHour;
              return (
                <div key={hour}>
                  <HourSlot
                    hour={hour}
                    blocks={blocksForHour(hour)}
                    isNow={now}
                    canComplete={isToday}
                    isDone={isDone}
                    onToggle={onToggleQuest}
                    onUnschedule={(id) => onSchedule(id, null, null)}
                    nowRef={
                      now
                        ? (el) => {
                            nowRowRef.current = el;
                          }
                        : undefined
                    }
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </DndContext>
  );
}
