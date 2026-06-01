import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  MoveRight,
} from "lucide-react";
import clsx from "clsx";
import {
  PRIORITY_COLORS,
  PRIORITY_SHORT,
  type Task,
} from "../redux/tasks/types";
import type { User } from "../types/user";
import { Badge } from "./UI/Badge";
import { useAppSelector } from "../redux/hooks";
import { selectAllUsers } from "../redux/users/selectors";

// ─── Types ──────────────────────────────────────────────────────────────────

type ViewMode = "daily" | "weekly" | "monthly";

/** Whether the bar came from a date-range, a due-date inside the interval,
 *  or a due-date that overflows past the right edge. */
type BarKind = "range" | "due-within" | "due-overflow";

interface BarGeom {
  left: number; // % from left edge
  width: number; // % of total grid width
  kind: BarKind;
}

interface FlatTask {
  task: Task;
  depth: number;
}

export interface TimelineProps {
  tasks: Task[];
  currentUser: User;
}

// ─── Date helpers ────────────────────────────────────────────────────────────

const sod = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

const addDays = (d: Date, n: number) => {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
};

const addMonths = (d: Date, n: number) =>
  new Date(d.getFullYear(), d.getMonth() + n, 1);

const startOfWeek = (d: Date) => {
  const day = d.getDay();
  return sod(addDays(d, day === 0 ? -6 : 1 - day));
};

const endOfPeriod = (start: Date, mode: "weekly" | "monthly"): Date => {
  if (mode === "weekly") {
    const e = addDays(start, 6);
    e.setHours(23, 59, 59, 999);
    return e;
  }
  const e = new Date(start.getFullYear(), start.getMonth() + 1, 0);
  e.setHours(23, 59, 59, 999);
  return e;
};

const getDays = (start: Date, end: Date): Date[] => {
  const days: Date[] = [];
  let cur = sod(start);
  const last = sod(end);
  while (cur <= last) {
    days.push(cur);
    cur = addDays(cur, 1);
  }
  return days;
};

const isSameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

const fmtShort = (d: Date) =>
  d.toLocaleDateString("en-US", { month: "short", day: "numeric" });

const fmtWeekday = (d: Date) =>
  d.toLocaleDateString("en-US", { weekday: "short" });

const fmtPeriodLabel = (start: Date, mode: ViewMode, today: Date) => {
  if (mode === "daily")
    return today.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  if (mode === "weekly") {
    const end = addDays(start, 6);
    return `${fmtShort(start)} – ${fmtShort(end)}, ${end.getFullYear()}`;
  }
  return start.toLocaleDateString("en-US", { month: "long", year: "numeric" });
};

// ─── Visibility filter ───────────────────────────────────────────────────────

/**
 * A task is visible in the given interval when:
 * - No dates at all → hidden
 * - Only dueDate → visible if dueDate >= intervalStart
 * - Has startDate (±dueDate) → visible if the range overlaps the interval
 */
function isTaskVisible(task: Task, vs: Date, ve: Date): boolean {
  const vst = vs.getTime();
  const vet = ve.getTime();

  if (!task.startDate && !task.dueDate) return false;

  if (!task.startDate) {
    // due-date only
    return new Date(task.dueDate!).getTime() >= vst;
  }

  const ts = new Date(task.startDate).getTime();
  const te = task.dueDate ? new Date(task.dueDate).getTime() : ts;
  return ts <= vet && te >= vst;
}

// ─── Sort & flatten ──────────────────────────────────────────────────────────

const PORD: Record<string, number> = { p0: 0, p1: 1, p2: 2, p3: 3 };
const pord = (t: Task) => (t.priority ? (PORD[t.priority] ?? 4) : 4);

const sortTasks = (arr: Task[]): Task[] =>
  [...arr].sort((a, b) => {
    const d = pord(a) - pord(b);
    if (d !== 0) return d;
    if (a.dueDate && b.dueDate)
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    return a.dueDate ? -1 : b.dueDate ? 1 : 0;
  });

function flattenTasks(tasks: Task[]): FlatTask[] {
  const sorted = sortTasks(tasks);
  const result: FlatTask[] = [];
  function add(parentId: number | null, depth: number) {
    sorted
      .filter((t) => t.parentId === parentId)
      .forEach((t) => {
        result.push({ task: t, depth });
        add(t.id, depth + 1);
      });
  }
  add(null, 0);
  return result;
}

// ─── Bar geometry ────────────────────────────────────────────────────────────

function getBarForTask(task: Task, vs: Date, ve: Date): BarGeom | null {
  const vst = vs.getTime();
  const vet = ve.getTime();
  const total = vet - vst;

  // start+end range bar
  if (task.startDate && task.dueDate) {
    const ts = new Date(task.startDate).getTime();
    const te = new Date(task.dueDate).getTime();
    const cs = Math.max(ts, vst);
    const ce = Math.min(te, vet);
    if (cs >= ce) return null;
    return {
      left: ((cs - vst) / total) * 100,
      width: Math.max(((ce - cs) / total) * 100, 1.2),
      kind: "range",
    };
  }

  // due-date-only bar
  if (!task.startDate && task.dueDate) {
    const td = new Date(task.dueDate).getTime();
    if (td < vst) return null;
    if (td > vet) {
      // due date beyond interval → full-width
      return { left: 0, width: 100, kind: "due-overflow" };
    }
    // due date inside interval → from left edge to due date
    const width = Math.max(((td - vst) / total) * 100, 2);
    return { left: 0, width, kind: "due-within" };
  }

  return null;
}

// ─── Visual constants ────────────────────────────────────────────────────────

const BAR_GRADIENT: Record<string, string> = {
  p0: "from-red-500 to-red-400",
  p1: "from-orange-500 to-amber-400",
  p2: "from-amber-500 to-yellow-300",
  p3: "from-blue-500 to-indigo-400",
};

const DEFAULT_GRADIENT = "from-indigo-500 to-indigo-400";

const PRIORITY_DOT: Record<string, string> = {
  p0: "bg-red-500",
  p1: "bg-orange-500",
  p2: "bg-amber-500",
  p3: "bg-blue-500",
};

const STATUS_COLOR: Record<string, string> = {
  backlog: "gray",
  todo: "blue",
  in_progress: "yellow",
  closed: "green",
  cancelled: "red",
};

const STATUS_LABEL: Record<string, string> = {
  backlog: "Backlog",
  todo: "Todo",
  in_progress: "In Progress",
  closed: "Closed",
  cancelled: "Cancelled",
};

// ─── Avatar components ───────────────────────────────────────────────────────

function Avatar({ user, size = "xs" }: { user: User; size?: "xs" | "sm" }) {
  const initials =
    `${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}`.toUpperCase();
  const cls =
    size === "xs" ? "h-5 w-5 text-[9px] ring-1" : "h-6 w-6 text-[10px] ring-1";
  if (user.avatarUrl)
    return (
      <img
        src={user.avatarUrl}
        className={clsx("rounded-full object-cover ring-white", cls)}
        alt={initials}
      />
    );
  return (
    <span
      className={clsx(
        "inline-flex shrink-0 items-center justify-center rounded-full bg-indigo-500 font-semibold text-white ring-white",
        cls,
      )}
    >
      {initials}
    </span>
  );
}

function AvatarGroup({
  ids,
  users,
  max = 3,
  size = "xs",
}: {
  ids: number[];
  users: User[];
  max?: number;
  size?: "xs" | "sm";
}) {
  const matched = ids
    .map((id) => users.find((u) => Number(u.id) === id))
    .filter(Boolean) as User[];
  const shown = matched.slice(0, max);
  const rest = matched.length - shown.length;
  return (
    <div className="flex shrink-0 -space-x-1">
      {shown.map((u) => (
        <Avatar key={u.id} user={u} size={size} />
      ))}
      {rest > 0 && (
        <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gray-400 text-[9px] font-semibold text-white ring-1 ring-white">
          +{rest}
        </span>
      )}
    </div>
  );
}

// ─── Shared bar content ──────────────────────────────────────────────────────

function BarContent({
  task,
  allUsers,
  isMine,
  onView,
  bar,
}: {
  task: Task;
  allUsers: User[];
  isMine: boolean;
  onView: () => void;
  bar: BarGeom;
}) {
  const gradient = task.priority
    ? (BAR_GRADIENT[task.priority] ?? DEFAULT_GRADIENT)
    : DEFAULT_GRADIENT;

  return (
    <div
      className={clsx(
        "group absolute inset-y-1.5 flex items-center gap-1.5 overflow-hidden rounded-lg bg-gradient-to-r px-2 shadow-sm transition-all",
        gradient,
        bar.kind === "due-overflow" && "rounded-r-none",
        bar.kind === "due-within" && "rounded-r-sm",
        isMine
          ? "opacity-100 ring-2 ring-white/50"
          : "opacity-70 hover:opacity-100",
      )}
      style={{ left: `${bar.left}%`, width: `${bar.width}%` }}
    >
      {/* Assignees */}
      {(task.assigneeIds?.length ?? 0) > 0 && (
        <AvatarGroup
          ids={task.assigneeIds}
          users={allUsers}
          max={2}
          size="xs"
        />
      )}

      {/* Title */}
      <span
        className={clsx(
          "min-w-0 flex-1 truncate text-[11px] font-semibold text-white",
          (task.status === "closed" || task.status === "cancelled") &&
          "line-through opacity-70",
        )}
      >
        {task.title}
      </span>

      {/* Priority badge */}
      {task.priority && (
        <span className="hidden shrink-0 rounded bg-white/25 px-1 py-0.5 text-[9px] font-bold text-white sm:inline">
          {PRIORITY_SHORT[task.priority]}
        </span>
      )}

      {/* Status badge */}
      <span className="hidden shrink-0 rounded bg-white/20 px-1 py-0.5 text-[9px] font-bold text-white sm:inline">
        {STATUS_LABEL[task.status]?.split(" ")[0] ?? task.status}
      </span>

      {/* Overflow arrow */}
      {bar.kind === "due-overflow" && (
        <MoveRight size={12} className="shrink-0 text-white/80" />
      )}

      {/* View details (hover) */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onView();
        }}
        className="shrink-0 rounded p-0.5 text-white/70 opacity-0 transition-opacity hover:text-white group-hover:opacity-100 cursor-pointer"
        title="View details"
      >
        <ExternalLink size={11} />
      </button>
    </div>
  );
}

// ─── Daily row ───────────────────────────────────────────────────────────────

function DailyRow({
  task,
  depth,
  isMine,
  allUsers,
  onView,
}: {
  task: Task;
  depth: number;
  isMine: boolean;
  allUsers: User[];
  onView: () => void;
}) {
  const isSubtask = depth > 0;
  return (
    <div
      className={clsx(
        "flex items-center gap-3 border-b border-gray-100 dark:border-gray-700/60",
        isSubtask ? "py-1.5" : "py-2.5",
        isMine && "bg-indigo-50/60 dark:bg-indigo-900/10",
      )}
      style={{ paddingLeft: 12 + depth * 20, paddingRight: 12 }}
    >
      {/* Depth connector */}
      {isSubtask && (
        <span className="shrink-0 text-gray-300 dark:text-gray-600">↳</span>
      )}

      {/* Priority dot */}
      <span
        className={clsx(
          "shrink-0 rounded-full",
          isSubtask ? "h-1.5 w-1.5" : "h-2 w-2",
          task.priority
            ? (PRIORITY_DOT[task.priority] ?? "bg-indigo-500")
            : "bg-gray-300 dark:bg-gray-600",
        )}
      />

      {/* Title */}
      <span
        className={clsx(
          "min-w-0 flex-1 truncate font-medium",
          isSubtask
            ? "text-xs text-gray-600 dark:text-gray-400"
            : "text-sm text-gray-800 dark:text-gray-100",
          isMine && "text-indigo-700 dark:text-indigo-300",
          (task.status === "closed" || task.status === "cancelled") &&
          "line-through opacity-60",
        )}
      >
        {task.title}
      </span>

      {/* Assignees */}
      {(task.assigneeIds?.length ?? 0) > 0 && (
        <AvatarGroup ids={task.assigneeIds} users={allUsers} />
      )}

      {/* Due date */}
      {task.dueDate && (
        <span className="shrink-0 text-[11px] text-gray-400 dark:text-gray-500">
          {new Date(task.dueDate).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          })}
        </span>
      )}

      {task.priority && (
        <Badge
          text={PRIORITY_SHORT[task.priority]}
          color={PRIORITY_COLORS[task.priority] ?? "gray"}
          size="xs"
        />
      )}

      <Badge
        text={STATUS_LABEL[task.status] ?? task.status}
        color={STATUS_COLOR[task.status] ?? "gray"}
        size="xs"
      />

      <button
        onClick={onView}
        className="shrink-0 rounded p-0.5 text-gray-400 transition-colors hover:text-indigo-600 dark:hover:text-indigo-400"
        title="View details"
      >
        <ExternalLink size={13} />
      </button>
    </div>
  );
}

// ─── Gantt row (bar-only, no task column) ────────────────────────────────────

function GanttRow({
  task,
  depth,
  isMine,
  allUsers,
  viewStart,
  viewEnd,
  onView,
}: {
  task: Task;
  depth: number;
  isMine: boolean;
  allUsers: User[];
  viewStart: Date;
  viewEnd: Date;
  onView: () => void;
}) {
  const isSubtask = depth > 0;
  const bar = getBarForTask(task, viewStart, viewEnd);
  const indent = depth * 16; // px left indent for subtask rows

  return (
    <div
      className={clsx(
        "relative border-b border-gray-100 dark:border-gray-700/50",
        isSubtask ? "h-8" : "h-11",
        isMine && "bg-indigo-50/40 dark:bg-indigo-900/10",
      )}
    >
      {/* Subtask indent indicator */}
      {isSubtask && (
        <div
          className="absolute bottom-0 top-0 border-l-2 border-indigo-100 dark:border-indigo-900/40"
          style={{ left: indent - 6 }}
        />
      )}

      {bar && (
        <div className="absolute inset-y-0" style={{ left: indent, right: 0 }}>
          <BarContent
            task={task}
            allUsers={allUsers}
            isMine={isMine}
            onView={onView}
            bar={bar}
          />
        </div>
      )}
    </div>
  );
}

// ─── Main component ──────────────────────────────────────────────────────────

export function Timeline({ tasks, currentUser }: TimelineProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("weekly");
  const [periodStart, setPeriodStart] = useState<Date>(() =>
    startOfWeek(new Date()),
  );
  const navigate = useNavigate();
  const allUsers = useAppSelector(selectAllUsers);
  const today = sod(new Date());

  // ── View range ──
  const { viewStart, viewEnd, viewDays } = useMemo(() => {
    if (viewMode === "daily") {
      const vs = sod(today);
      const ve = addDays(vs, 1);
      ve.setHours(23, 59, 59, 999);
      return { viewStart: vs, viewEnd: ve, viewDays: [] as Date[] };
    }
    const vs = periodStart;
    const ve = endOfPeriod(vs, viewMode);
    return { viewStart: vs, viewEnd: ve, viewDays: getDays(vs, ve) };
  }, [viewMode, periodStart]);

  // ── Today line position (%) within the bar grid ──
  const todayPos = useMemo(() => {
    if (viewMode === "daily") return null;
    const pos =
      ((Date.now() - viewStart.getTime()) /
        (viewEnd.getTime() - viewStart.getTime())) *
      100;
    return pos >= 0 && pos <= 100 ? pos : null;
  }, [viewMode, viewStart, viewEnd]);

  // ── Flatten all tasks, then filter by interval ──
  const allFlat = useMemo(() => flattenTasks(tasks), [tasks]);

  const visibleFlat = useMemo(
    () => allFlat.filter(({ task }) => isTaskVisible(task, viewStart, viewEnd)),
    [allFlat, viewStart, viewEnd],
  );

  const periodLabel = useMemo(
    () => fmtPeriodLabel(viewStart, viewMode, today),
    [viewMode, viewStart],
  );

  function shift(dir: 1 | -1) {
    if (viewMode === "weekly") setPeriodStart((p) => addDays(p, dir * 7));
    else if (viewMode === "monthly") setPeriodStart((p) => addMonths(p, dir));
  }

  function onChangeMode(m: ViewMode) {
    setViewMode(m);
    if (m === "weekly") setPeriodStart(startOfWeek(new Date()));
    else if (m === "monthly")
      setPeriodStart(
        new Date(new Date().getFullYear(), new Date().getMonth(), 1),
      );
  }

  const isMonthly = viewMode === "monthly";
  const colMinPx = isMonthly ? 30 : 88;

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
      {/* ── Header ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 px-5 py-3 dark:border-gray-700">
        <div className="flex items-center gap-2.5">
          <h2 className="text-base font-semibold text-gray-900 dark:text-gray-50">
            Timeline
          </h2>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {periodLabel}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {viewMode !== "daily" && (
            <div className="flex items-center gap-0.5">
              <button
                onClick={() => shift(-1)}
                className="rounded p-1 text-gray-500 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <ChevronLeft size={15} />
              </button>
              <button
                onClick={() => shift(1)}
                className="rounded p-1 text-gray-500 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <ChevronRight size={15} />
              </button>
            </div>
          )}

          <div className="flex overflow-hidden rounded-lg border border-gray-200 dark:border-gray-600">
            {(["daily", "weekly", "monthly"] as ViewMode[]).map((m) => (
              <button
                key={m}
                onClick={() => onChangeMode(m)}
                className={clsx(
                  "px-3 py-1.5 text-xs font-medium capitalize transition-colors",
                  viewMode === m
                    ? "bg-indigo-600 text-white"
                    : "text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-700",
                )}
              >
                {m}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Daily view ── */}
      {viewMode === "daily" && (
        <div>
          {visibleFlat.length === 0 && (
            <p className="px-5 py-10 text-center text-sm text-gray-400 dark:text-gray-500">
              No tasks with dates for today.
            </p>
          )}
          {visibleFlat.map(({ task, depth }) => (
            <DailyRow
              key={task.id}
              task={task}
              depth={depth}
              isMine={
                task.assigneeIds?.includes(Number(currentUser.id)) ?? false
              }
              allUsers={allUsers}
              onView={() =>
                navigate(`/projects/${task.projectId}/tasks/${task.id}`)
              }
            />
          ))}
        </div>
      )}

      {/* ── Gantt view (weekly / monthly) ── */}
      {viewMode !== "daily" && (
        <div className="overflow-x-auto">
          <div style={{ minWidth: viewDays.length * colMinPx }}>
            {/* Date header */}
            <div className="relative flex border-b border-gray-200 dark:border-gray-700">
              {viewDays.map((day, i) => {
                const isToday = isSameDay(day, today);
                return (
                  <div
                    key={i}
                    className={clsx(
                      "flex flex-1 flex-col items-center justify-center border-r border-gray-100 py-2 last:border-r-0 dark:border-gray-700/50",
                      isToday && "bg-indigo-50 dark:bg-indigo-900/20",
                    )}
                  >
                    {!isMonthly && (
                      <span
                        className={clsx(
                          "text-[10px] font-medium leading-none",
                          isToday
                            ? "text-indigo-500 dark:text-indigo-400"
                            : "text-gray-400 dark:text-gray-500",
                        )}
                      >
                        {fmtWeekday(day)}
                      </span>
                    )}
                    <span
                      className={clsx(
                        "text-[11px] font-bold leading-tight",
                        isToday
                          ? "text-indigo-600 dark:text-indigo-400"
                          : "text-gray-600 dark:text-gray-300",
                      )}
                    >
                      {day.getDate()}
                    </span>
                    {!isMonthly && (
                      <span
                        className={clsx(
                          "text-[9px] leading-none",
                          isToday
                            ? "text-indigo-400 dark:text-indigo-500"
                            : "text-gray-300 dark:text-gray-600",
                        )}
                      >
                        {fmtShort(day).split(" ")[0]}
                      </span>
                    )}
                  </div>
                );
              })}

              {/* Today line in header */}
              {todayPos !== null && (
                <div
                  className="pointer-events-none absolute inset-y-0 w-0.5 bg-red-400"
                  style={{ left: `${todayPos}%` }}
                />
              )}
            </div>

            {/* Task rows */}
            <div className="relative">
              {/* Column grid lines */}
              <div className="pointer-events-none absolute inset-0 flex">
                {viewDays.map((day, i) => (
                  <div
                    key={i}
                    className={clsx(
                      "flex-1 border-r border-gray-100 last:border-r-0 dark:border-gray-700/40",
                      isSameDay(day, today) &&
                      "bg-indigo-50/30 dark:bg-indigo-900/10",
                    )}
                  />
                ))}
              </div>

              {/* Today line spanning all rows */}
              {todayPos !== null && (
                <div
                  className="pointer-events-none absolute inset-y-0 z-10 w-0.5 bg-red-400/60"
                  style={{ left: `${todayPos}%` }}
                />
              )}

              {visibleFlat.length === 0 && (
                <p className="py-10 text-center text-sm text-gray-400 dark:text-gray-500">
                  No tasks with dates in this period.
                </p>
              )}

              {visibleFlat.map(({ task, depth }) => (
                <GanttRow
                  key={task.id}
                  task={task}
                  depth={depth}
                  isMine={
                    task.assigneeIds?.includes(Number(currentUser.id)) ?? false
                  }
                  allUsers={allUsers}
                  viewStart={viewStart}
                  viewEnd={viewEnd}
                  onView={() =>
                    navigate(`/projects/${task.projectId}/tasks/${task.id}`)
                  }
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Timeline;
