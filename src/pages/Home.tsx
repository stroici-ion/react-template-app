import { useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import {
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  ListTodo,
  XCircle,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { fetchAllTasks } from "../redux/tasks/asyncThunks";
import { fetchUsers } from "../redux/users/asyncThunks";
import { fetchProjects } from "../redux/projects/asyncThunks";
import { selectAllTasks } from "../redux/tasks/selectors";
import { selectAllUsers } from "../redux/users/selectors";
import { selectAllProjects } from "../redux/projects/selectors";
import { selectAuth } from "../redux/auth/selectors";
import { PRIORITY_SHORT } from "../redux/tasks/types";
import { Badge } from "../components/UI/Badge";
import Timeline from "../components/Timeline";
import { useTheme } from "../hooks/useTheme";

// ─── helpers ──────────────────────────────────────────────────────────────────

function relativeDate(iso: string): {
  label: string;
  level: "ok" | "warn" | "danger";
} {
  const due = new Date(iso);
  due.setHours(0, 0, 0, 0);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const diff = Math.round((due.getTime() - now.getTime()) / 86400000);
  if (diff < 0) return { label: `${Math.abs(diff)}d overdue`, level: "danger" };
  if (diff === 0) return { label: "Due today", level: "danger" };
  if (diff === 1) return { label: "Tomorrow", level: "warn" };
  if (diff <= 3) return { label: `In ${diff} days`, level: "warn" };
  return { label: `In ${diff} days`, level: "ok" };
}

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
const PRIORITY_DOT: Record<string, string> = {
  p0: "bg-red-500",
  p1: "bg-orange-500",
  p2: "bg-amber-500",
  p3: "bg-blue-500",
};
const PIE_COLORS = ["#94a3b8", "#60a5fa", "#fbbf24", "#4ade80", "#f87171"];

// ─── stat card ────────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  sub,
  icon,
  accent,
}: {
  label: string;
  value: number | string;
  sub?: string;
  icon: React.ReactNode;
  accent: string;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
          {label}
        </span>
        <span className={`rounded-lg p-2 ${accent}`}>{icon}</span>
      </div>
      <p className="text-3xl font-bold text-gray-900 dark:text-white">
        {value}
      </p>
      {sub && <p className="text-xs text-gray-400 dark:text-gray-500">{sub}</p>}
    </div>
  );
}

// ─── main ─────────────────────────────────────────────────────────────────────

export default function Home() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const { user } = useAppSelector(selectAuth);
  const allTasks = useAppSelector(selectAllTasks);
  const allUsers = useAppSelector(selectAllUsers);
  const allProjects = useAppSelector(selectAllProjects);

  useEffect(() => {
    dispatch(fetchAllTasks());
    dispatch(fetchUsers({ perPage: 200 }));
    dispatch(fetchProjects({ perPage: 100 }));
  }, [dispatch]);

  // ── derived data ──
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const sevenDaysOut = useMemo(() => {
    const d = new Date(today);
    d.setDate(d.getDate() + 7);
    return d;
  }, [today]);

  const myId = Number(user?.id);

  const stats = useMemo(() => {
    const open = allTasks.filter(
      (t) => t.status !== "closed" && t.status !== "cancelled",
    );
    const overdue = open.filter(
      (t) => t.dueDate && new Date(t.dueDate) < today,
    );
    const closed = allTasks.filter((t) => t.status === "closed");
    const cancelled = allTasks.filter((t) => t.status === "cancelled");
    const myOpen = open.filter((t) => t.assigneeIds?.includes(myId));
    return { overdue, closed, cancelled, myOpen };
  }, [allTasks, today, myId]);

  // tasks due in the next 7 days (not closed/cancelled)
  const dueSoon = useMemo(
    () =>
      allTasks
        .filter(
          (t) =>
            t.dueDate &&
            t.status !== "closed" &&
            t.status !== "cancelled" &&
            new Date(t.dueDate) >= today &&
            new Date(t.dueDate) <= sevenDaysOut,
        )
        .sort(
          (a, b) =>
            new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime(),
        )
        .slice(0, 8),
    [allTasks, today, sevenDaysOut],
  );

  // tasks assigned to current user (for timeline)
  const myTasks = useMemo(
    () => allTasks.filter((t) => t.assigneeIds?.includes(myId)),
    [allTasks, myId],
  );

  // pie chart — status breakdown
  const pieData = useMemo(() => {
    const counts: Record<string, number> = {
      backlog: 0,
      todo: 0,
      in_progress: 0,
      closed: 0,
      cancelled: 0,
    };
    allTasks.forEach((t) => {
      if (counts[t.status] !== undefined) counts[t.status]++;
    });
    return Object.entries(counts)
      .filter(([, v]) => v > 0)
      .map(([key, value]) => ({ name: STATUS_LABEL[key] ?? key, value }));
  }, [allTasks]);

  // bar chart — closed tasks per user (top 10)
  const closedPerUser = useMemo(() => {
    const closedTasks = allTasks.filter((t) => t.status === "closed");
    return allUsers
      .map((u) => ({
        name: `${u.firstName} ${u.lastName}`.trim() || u.email.split("@")[0],
        closed: closedTasks.filter((t) => t.assigneeIds?.includes(Number(u.id)))
          .length,
      }))
      .filter((u) => u.closed > 0)
      .sort((a, b) => b.closed - a.closed)
      .slice(0, 10);
  }, [allTasks, allUsers]);

  const projectMap = useMemo(
    () => new Map(allProjects.map((p) => [p.id, p])),
    [allProjects],
  );

  // chart theme
  const gridStroke = isDark ? "#374151" : "#e5e7eb";
  const axisStroke = isDark ? "#9ca3af" : "#6b7280";
  const tooltipBg = isDark ? "#1f2937" : "#ffffff";
  const tooltipColor = isDark ? "#fff" : "#111827";
  const legendColor = isDark ? "#9ca3af" : "#4b5563";
  const pieStroke = isDark ? "#1f2937" : "#ffffff";

  const firstName = user?.firstName ?? "there";

  return (
    <div className="min-h-screen bg-gray-100 font-sans text-gray-900 dark:bg-gray-900 dark:text-white">
      <main className="mx-auto max-w-7xl space-y-8 p-4 sm:p-6 md:p-10">
        {/* ── Welcome banner ── */}
        <header className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800 sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50 sm:text-3xl">
                Welcome back, {firstName} 👋
              </h1>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {allProjects.length} project
                {allProjects.length !== 1 ? "s" : ""} · {allTasks.length} total
                tasks · {stats.myOpen.length} open and assigned to you
              </p>
            </div>
            <div className="flex gap-2">
              <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300">
                {allUsers.length} team member
                {allUsers.length !== 1 ? "s" : ""}
              </span>
            </div>
          </div>
        </header>

        {/* ── Stat cards ── */}
        <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard
            label="My open tasks"
            value={stats.myOpen.length}
            sub="Assigned to you, not closed"
            icon={
              <ListTodo
                size={18}
                className="text-indigo-600 dark:text-indigo-400"
              />
            }
            accent="bg-indigo-50 dark:bg-indigo-900/30"
          />
          <StatCard
            label="Overdue"
            value={stats.overdue.length}
            sub="Past due date, still open"
            icon={<AlertTriangle size={18} className="text-red-500" />}
            accent="bg-red-50 dark:bg-red-900/20"
          />
          <StatCard
            label="Closed"
            value={stats.closed.length}
            sub="Completed across all projects"
            icon={<CheckCircle2 size={18} className="text-green-500" />}
            accent="bg-green-50 dark:bg-green-900/20"
          />
          <StatCard
            label="Cancelled"
            value={stats.cancelled.length}
            sub="Cancelled across all projects"
            icon={<XCircle size={18} className="text-gray-400" />}
            accent="bg-gray-100 dark:bg-gray-700/40"
          />
        </section>

        {/* ── Charts ── */}
        <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Team closed tasks */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800 lg:col-span-2">
            <h3 className="mb-1 text-base font-semibold text-gray-800 dark:text-gray-100">
              Team Leaderboard
            </h3>
            <p className="mb-5 text-xs text-gray-400 dark:text-gray-500">
              Closed tasks per team member
            </p>
            {closedPerUser.length === 0 ? (
              <div className="flex h-64 items-center justify-center text-sm text-gray-400">
                No closed tasks yet
              </div>
            ) : (
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={closedPerUser}
                    margin={{ top: 4, right: 16, left: 0, bottom: 4 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke={gridStroke}
                      vertical={false}
                    />
                    <XAxis
                      dataKey="name"
                      stroke={axisStroke}
                      fontSize={11}
                      tickLine={false}
                      tick={{ fill: axisStroke }}
                    />
                    <YAxis
                      stroke={axisStroke}
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                      allowDecimals={false}
                      tick={{ fill: axisStroke }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: tooltipBg,
                        border: "none",
                        borderRadius: "8px",
                        color: tooltipColor,
                        fontSize: "12px",
                      }}
                      cursor={{ fill: isDark ? "#374151" : "#f3f4f6" }}
                    />
                    <Bar
                      dataKey="closed"
                      name="Closed tasks"
                      radius={[4, 4, 0, 0]}
                      fill="#6366f1"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Status breakdown */}
          <div className="flex flex-col rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <h3 className="mb-1 text-base font-semibold text-gray-800 dark:text-gray-100">
              Status Breakdown
            </h3>
            <p className="mb-2 text-xs text-gray-400 dark:text-gray-500">
              All tasks by status
            </p>
            {pieData.length === 0 ? (
              <div className="flex flex-1 items-center justify-center text-sm text-gray-400">
                No tasks yet
              </div>
            ) : (
              <div className="h-64 w-full flex-1">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="45%"
                      innerRadius={52}
                      outerRadius={76}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {pieData.map((_, i) => (
                        <Cell
                          key={i}
                          fill={PIE_COLORS[i % PIE_COLORS.length]}
                          stroke={pieStroke}
                          strokeWidth={2}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: tooltipBg,
                        border: "none",
                        borderRadius: "8px",
                        color: tooltipColor,
                        fontSize: "12px",
                      }}
                    />
                    <Legend
                      iconType="circle"
                      iconSize={8}
                      wrapperStyle={{
                        fontSize: "11px",
                        color: legendColor,
                        paddingTop: "8px",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </section>

        {/* ── Due soon ── */}
        {dueSoon.length > 0 && (
          <section>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-base font-semibold text-gray-900 dark:text-gray-50">
                Due in the next 7 days
              </h2>
              <span className="text-xs text-gray-400">
                {dueSoon.length} task{dueSoon.length !== 1 ? "s" : ""}
              </span>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {dueSoon.map((task) => {
                const { label, level } = relativeDate(task.dueDate!);
                const project = projectMap.get(task.projectId);
                const isMyTask = task.assigneeIds?.includes(myId);
                return (
                  <div
                    key={task.id}
                    className={`flex flex-col gap-2.5 rounded-xl border bg-white p-4 shadow-sm transition-shadow hover:shadow-md dark:bg-gray-800 ${isMyTask
                      ? "border-indigo-200 dark:border-indigo-700/50"
                      : "border-gray-200 dark:border-gray-700"
                      }`}
                  >
                    {/* Priority + due label */}
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${level === "danger"
                          ? "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
                          : level === "warn"
                            ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                            : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300"
                          }`}
                      >
                        {label}
                      </span>
                      {task.priority && (
                        <span
                          className={`h-2 w-2 rounded-full ${PRIORITY_DOT[task.priority] ?? "bg-indigo-500"}`}
                          title={`P: ${PRIORITY_SHORT[task.priority]}`}
                        />
                      )}
                    </div>

                    {/* Title */}
                    <p className="line-clamp-2 text-sm font-medium text-gray-800 dark:text-gray-100">
                      {task.title}
                    </p>

                    {/* Project name */}
                    {project && (
                      <div className="flex items-center gap-1.5">
                        <span
                          className="h-2 w-2 shrink-0 rounded-full"
                          style={{
                            backgroundColor: project.colorCode ?? "#6366f1",
                          }}
                        />
                        <span className="truncate text-[11px] text-gray-400 dark:text-gray-500">
                          {project.name}
                        </span>
                      </div>
                    )}

                    {/* Status + view */}
                    <div className="flex items-center justify-between gap-2">
                      <Badge
                        text={STATUS_LABEL[task.status] ?? task.status}
                        color={STATUS_COLOR[task.status] ?? "gray"}
                        size="xs"
                      />
                      <button
                        onClick={() =>
                          navigate(
                            `/projects/${task.projectId}/tasks/${task.id}`,
                          )
                        }
                        className="text-gray-400 transition-colors hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer"
                        title="View details"
                      >
                        <ExternalLink size={13} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* ── Timeline (my tasks) ── */}
        {user && (
          <section>
            <div className="mb-3">
              <h2 className="text-base font-semibold text-gray-900 dark:text-gray-50">
                My Timeline
              </h2>
              <p className="text-xs text-gray-400 dark:text-gray-500">
                Tasks assigned to you across all projects
              </p>
            </div>
            <Timeline tasks={myTasks} currentUser={user} />
          </section>
        )}
      </main>
    </div>
  );
}
