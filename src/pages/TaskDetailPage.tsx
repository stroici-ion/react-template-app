import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  GitBranch,
  Save,
  Tag,
  Users,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { selectAllTasks, selectTaskById } from "../redux/tasks/selectors";
import { selectProjectById } from "../redux/projects/selectors";
import { selectAllUsers } from "../redux/users/selectors";
import {
  addTaskAssignee,
  fetchTasks,
  removeTaskAssignee,
  updateTask,
} from "../redux/tasks/asyncThunks";
import { fetchProject } from "../redux/projects/asyncThunks";
import { fetchUsers } from "../redux/users/asyncThunks";
import { Status, type Task, type TaskStatus } from "../redux/tasks/types";
import type { User } from "../types/user";
import { Header } from "../components/Header";
import TaskStatusSelect from "../components/TaskStatusSelect";
import UserSearchDropdown from "../components/UserSearchDropdown";
import PrimaryButton from "../components/UI/PrimaryButton";
import { Textarea } from "../components/UI/Textarea";
import { Badge } from "../components/UI/Badge";

const toInputDate = (value: string | null): string =>
  value ? new Date(value).toISOString().slice(0, 10) : "";

const fromInputDate = (value: string): string | null =>
  value ? new Date(value).toISOString() : null;

const isDescendantOf = (
  candidateParentId: number,
  taskId: number,
  tasks: Task[],
): boolean => {
  let current: Task | undefined = tasks.find((t) => t.id === candidateParentId);
  while (current && current.parentId !== null) {
    if (current.parentId === taskId) return true;
    current = tasks.find((t) => t.id === current!.parentId);
  }
  return false;
};

const STATUS_COLORS: Record<string, string> = {
  backlog: "gray",
  todo: "blue",
  in_progress: "yellow",
  closed: "green",
  cancelled: "red",
};

const STATUS_LABELS: Record<string, string> = {
  backlog: "Backlog",
  todo: "Todo",
  in_progress: "In Progress",
  closed: "Closed",
  cancelled: "Cancelled",
};

function AsideSection({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border-b border-gray-100 px-5 py-4 last:border-0 dark:border-gray-700/50">
      <div className="mb-2.5 flex items-center gap-1.5">
        <span className="text-gray-400 dark:text-gray-500">{icon}</span>
        <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
          {title}
        </span>
      </div>
      {children}
    </div>
  );
}

export default function TaskDetailPage() {
  const { id, taskId } = useParams<{ id: string; taskId: string }>();
  const projectId = Number(id);
  const taskIdNum = Number(taskId);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const task = useAppSelector((state) => selectTaskById(state, taskIdNum));
  const project = useAppSelector((state) =>
    selectProjectById(state, projectId),
  );
  const allTasks = useAppSelector(selectAllTasks);
  const allUsers = useAppSelector(selectAllUsers);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<TaskStatus>(Status.Todo);
  const [startDate, setStartDate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [parentId, setParentId] = useState<number | null>(null);
  const [pendingAssigneeIds, setPendingAssigneeIds] = useState<number[]>([]);
  const [pendingAssignees, setPendingAssignees] = useState<User[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const formInitializedRef = useRef(false);

  useEffect(() => {
    if (projectId) {
      dispatch(fetchProject(projectId));
      dispatch(fetchTasks({ projectId }));
      dispatch(fetchUsers({ projectId }));
    }
  }, [dispatch, projectId]);

  useEffect(() => {
    formInitializedRef.current = false;
  }, [taskIdNum]);

  // Initialize form from task once both task and users are available
  useEffect(() => {
    if (!task || formInitializedRef.current) return;
    const ids = task.assigneeIds ?? [];
    if (ids.length > 0 && allUsers.length === 0) return; // wait for users to load
    setTitle(task.title);
    setDescription(task.description ?? "");
    setStatus(task.status);
    setStartDate(toInputDate(task.startDate));
    setDueDate(toInputDate(task.dueDate));
    setParentId(task.parentId);
    setPendingAssigneeIds(ids);
    setPendingAssignees(allUsers.filter((u) => ids.includes(Number(u.id))));
    formInitializedRef.current = true;
  }, [task, allUsers]);

  if (!task) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header />
        <div className="flex items-center justify-center py-32">
          <div className="text-center">
            <div className="mb-3 text-gray-300 dark:text-gray-600">
              <svg
                className="mx-auto h-12 w-12"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
            </div>
            <p className="text-sm text-gray-400 dark:text-gray-500">
              {allTasks.length > 0 ? "Task not found" : "Loading task…"}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const parentOptions = allTasks.filter(
    (t) =>
      t.id !== task.id &&
      t.projectId === task.projectId &&
      !isDescendantOf(t.id, task.id, allTasks),
  );

  const handleAddAssignee = (user: User) => {
    if (!pendingAssigneeIds.includes(Number(user.id))) {
      setPendingAssigneeIds((prev) => [...prev, Number(user.id)]);
      setPendingAssignees((prev) => [...prev, user]);
    }
  };

  const handleRemoveAssignee = (user: User) => {
    setPendingAssigneeIds((prev) => prev.filter((id) => id !== Number(user.id)));
    setPendingAssignees((prev) => prev.filter((u) => u.id !== user.id));
  };

  const handleSave = async () => {
    setSubmitting(true);
    setSaveSuccess(false);
    try {
      await dispatch(
        updateTask({
          id: task.id,
          changes: {
            title,
            description,
            status,
            startDate: fromInputDate(startDate),
            dueDate: fromInputDate(dueDate),
            parentId,
          },
        }),
      ).unwrap();

      const currentIds = task.assigneeIds ?? [];
      const toAdd = pendingAssigneeIds.filter((id) => !currentIds.includes(id));
      const toRemove = currentIds.filter(
        (id) => !pendingAssigneeIds.includes(id),
      );
      await Promise.all([
        ...toAdd.map((userId) =>
          dispatch(addTaskAssignee({ taskId: task.id, userId })).unwrap(),
        ),
        ...toRemove.map((userId) =>
          dispatch(removeTaskAssignee({ taskId: task.id, userId })).unwrap(),
        ),
      ]);

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch {
      // error state could be added here
    } finally {
      setSubmitting(false);
    }
  };

  const isOverdue =
    dueDate &&
    new Date(dueDate) < new Date() &&
    status !== Status.Closed &&
    status !== Status.Cancelled;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
        {/* Breadcrumb */}
        <div className="mb-6 flex items-center gap-2 text-sm">
          <button
            onClick={() => navigate(`/projects/${projectId}`)}
            className="flex items-center gap-1.5 text-gray-500 transition-colors hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-100"
          >
            <ArrowLeft size={14} />
            {project ? project.name : "Back to Project"}
          </button>
          <span className="text-gray-300 dark:text-gray-600">/</span>
          <span className="max-w-xs truncate text-gray-400 dark:text-gray-500">
            {task.title}
          </span>
        </div>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* ── Left: Main content ── */}
          <div className="space-y-5 lg:col-span-2">
            <div className="rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
              {/* Status row */}
              <div className="flex items-center gap-3 border-b border-gray-100 px-6 py-3 dark:border-gray-700/50">
                <TaskStatusSelect status={status} onChange={setStatus} />
                <Badge
                  text={STATUS_LABELS[status] ?? status}
                  color={STATUS_COLORS[status] ?? "gray"}
                  dot
                />
                {isOverdue && (
                  <Badge text="Overdue" color="red" className="ml-auto" />
                )}
              </div>

              <div className="p-6">
                {/* Title */}
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Task title…"
                  className="mb-1 w-full border-0 border-b-2 border-transparent bg-transparent pb-1 text-xl font-bold text-gray-900 transition-colors placeholder:text-gray-300 hover:border-gray-200 focus:border-indigo-500 focus:outline-none dark:text-gray-50 dark:placeholder:text-gray-600 dark:hover:border-gray-600 dark:focus:border-indigo-400 sm:text-2xl"
                />
                <p className="mb-6 text-xs text-gray-400 dark:text-gray-500">
                  Task #{task.id} · Project{" "}
                  {project ? `"${project.name}"` : `#${projectId}`}
                </p>

                {/* Description */}
                <Textarea
                  id="task-description"
                  label="Description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={12}
                  placeholder="Add a description, steps to reproduce, acceptance criteria…"
                />
              </div>
            </div>

            {/* Subtasks hint */}
            {allTasks.filter((t) => t.parentId === task.id).length > 0 && (
              <div className="rounded-xl border border-gray-200 bg-white px-6 py-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                  Subtasks (
                  {allTasks.filter((t) => t.parentId === task.id).length})
                </p>
                <ul className="space-y-1.5">
                  {allTasks
                    .filter((t) => t.parentId === task.id)
                    .map((sub) => (
                      <li key={sub.id}>
                        <button
                          onClick={() =>
                            navigate(
                              `/projects/${projectId}/tasks/${sub.id}`,
                            )
                          }
                          className="group flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50"
                        >
                          <CheckCircle2
                            size={14}
                            className={
                              sub.status === "closed"
                                ? "text-green-500"
                                : "text-gray-300 dark:text-gray-600"
                            }
                          />
                          <span
                            className={
                              sub.status === "closed" ||
                              sub.status === "cancelled"
                                ? "text-gray-400 line-through dark:text-gray-500"
                                : "text-gray-700 group-hover:text-gray-900 dark:text-gray-200"
                            }
                          >
                            {sub.title}
                          </span>
                          <Badge
                            text={STATUS_LABELS[sub.status] ?? sub.status}
                            color={STATUS_COLORS[sub.status] ?? "gray"}
                            size="xs"
                            className="ml-auto"
                          />
                        </button>
                      </li>
                    ))}
                </ul>
              </div>
            )}
          </div>

          {/* ── Right: Aside panel ── */}
          <div className="lg:col-span-1">
            <div className="rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800 lg:sticky lg:top-6">
              {/* Assignees */}
              <AsideSection icon={<Users size={13} />} title="Assignees">
                <UserSearchDropdown
                  projectId={task.projectId}
                  selectedUsers={pendingAssignees}
                  onAdd={handleAddAssignee}
                  onRemove={handleRemoveAssignee}
                  label=""
                />
              </AsideSection>

              {/* Tags placeholder */}
              <AsideSection icon={<Tag size={13} />} title="Tags">
                <p className="text-xs italic text-gray-300 dark:text-gray-600">
                  No tags
                </p>
              </AsideSection>

              {/* Parent Task */}
              <AsideSection
                icon={<GitBranch size={13} />}
                title="Parent Task"
              >
                <select
                  value={parentId === null ? "" : parentId}
                  onChange={(e) =>
                    setParentId(
                      e.target.value === "" ? null : Number(e.target.value),
                    )
                  }
                  className="w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-1.5 text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-50"
                >
                  <option value="">None (top-level)</option>
                  {parentOptions.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.title}
                    </option>
                  ))}
                </select>
              </AsideSection>

              {/* Start Date */}
              <AsideSection
                icon={<Calendar size={13} />}
                title="Start Date"
              >
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-1.5 text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-50"
                />
              </AsideSection>

              {/* Due Date */}
              <AsideSection icon={<Calendar size={13} />} title="Due Date">
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className={`w-full rounded-lg border px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                    isOverdue
                      ? "border-red-300 bg-red-50 text-red-900 dark:border-red-700 dark:bg-red-900/20 dark:text-red-300"
                      : "border-gray-300 bg-gray-50 text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-50"
                  }`}
                />
                {isOverdue && (
                  <p className="mt-1 text-xs text-red-500">Past due date</p>
                )}
              </AsideSection>

              {/* Save area */}
              <div className="px-5 pb-5 pt-4">
                {saveSuccess && (
                  <div className="mb-3 flex items-center gap-1.5 rounded-lg bg-green-50 px-3 py-2 text-xs font-medium text-green-700 dark:bg-green-900/20 dark:text-green-400">
                    <CheckCircle2 size={13} />
                    Changes saved successfully
                  </div>
                )}
                <PrimaryButton
                  text="Save Changes"
                  icon={<Save size={14} />}
                  onClick={handleSave}
                  loading={submitting}
                  className="w-full"
                />
                <button
                  onClick={() => navigate(`/projects/${projectId}`)}
                  className="mt-2 w-full rounded-lg py-2 text-center text-sm text-gray-400 transition-colors hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
