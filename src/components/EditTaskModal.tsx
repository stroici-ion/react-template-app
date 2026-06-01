import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { useSelector } from "react-redux";
import { selectAllTasks, selectTaskById } from "../redux/tasks/selectors";
import { selectAllUsers } from "../redux/users/selectors";
import {
  addTaskAssignee,
  removeTaskAssignee,
  updateTask,
} from "../redux/tasks/asyncThunks";
import {
  Priority,
  Status,
  type Task,
  type TaskPriority,
  type TaskStatus,
  PRIORITY_LABELS,
} from "../redux/tasks/types";
import type { User } from "../types/user";
import Card from "./UI/Card";
import { Input } from "./UI/Input";
import PrimaryButton from "./UI/PrimaryButton";
import UserSearchDropdown from "./UserSearchDropdown";

interface EditTaskModalProps {
  taskId: number;
  onClose: () => void;
}

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

export const EditTaskModal = ({ taskId, onClose }: EditTaskModalProps) => {
  const dispatch = useAppDispatch();
  const task = useAppSelector((state) => selectTaskById(state, taskId));
  const allTasks = useAppSelector(selectAllTasks);
  const allUsers = useSelector(selectAllUsers);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<TaskStatus>(Status.Todo);
  const [priority, setPriority] = useState<TaskPriority | null>(null);
  const [startDate, setStartDate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [parentId, setParentId] = useState<number | null>(null);
  const [pendingAssigneeIds, setPendingAssigneeIds] = useState<number[]>([]);
  const [pendingAssignees, setPendingAssignees] = useState<User[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    if (!task) return;
    setTitle(task.title);
    setDescription(task.description ?? "");
    setStatus(task.status);
    setPriority(task.priority ?? null);
    setStartDate(toInputDate(task.startDate));
    setDueDate(toInputDate(task.dueDate));
    setParentId(task.parentId);
    const ids = task.assigneeIds ?? [];
    setPendingAssigneeIds(ids);
    setPendingAssignees(allUsers.filter((u) => ids.includes(Number(u.id))));
  }, [task?.id]);

  if (!task) return null;

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
    setPendingAssigneeIds((prev) =>
      prev.filter((id) => id !== Number(user.id)),
    );
    setPendingAssignees((prev) => prev.filter((u) => u.id !== user.id));
  };

  const handleSave = async () => {
    setSubmitting(true);
    setSaveError(null);
    try {
      await dispatch(
        updateTask({
          id: task.id,
          changes: {
            title,
            description,
            status,
            priority,
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

      onClose();
    } catch (err: any) {
      setSaveError(typeof err === "string" ? err : "Failed to save changes");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div onClick={(e) => e.stopPropagation()} className="w-full max-w-xl">
        <Card maxWidth="xlarge" className="relative">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X size={18} />
          </button>
          <h2 className="mb-4 text-xl font-bold text-gray-900 dark:text-gray-50">
            Edit Task
          </h2>

          <div className="space-y-3">
            <Input
              id="edit-task-title"
              label="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-900 dark:text-gray-50">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2 text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-50"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-900 dark:text-gray-50">
                  Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as TaskStatus)}
                  className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2 text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-50"
                >
                  <option value={Status.Backlog}>Backlog</option>
                  <option value={Status.Todo}>Todo</option>
                  <option value={Status.InProgress}>In Progress</option>
                  <option value={Status.Closed}>Closed</option>
                  <option value={Status.Cancelled}>Cancelled</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-900 dark:text-gray-50">
                  Priority
                </label>
                <select
                  value={priority ?? ""}
                  onChange={(e) =>
                    setPriority(
                      e.target.value === ""
                        ? null
                        : (e.target.value as TaskPriority),
                    )
                  }
                  className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2 text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-50"
                >
                  <option value="">No priority</option>
                  <option value={Priority.P0}>{PRIORITY_LABELS.p0}</option>
                  <option value={Priority.P1}>{PRIORITY_LABELS.p1}</option>
                  <option value={Priority.P2}>{PRIORITY_LABELS.p2}</option>
                  <option value={Priority.P3}>{PRIORITY_LABELS.p3}</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Input
                id="edit-task-start-date"
                label="Start Date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
              <Input
                id="edit-task-due-date"
                label="Due Date"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-900 dark:text-gray-50">
                Parent Task
              </label>
              <select
                value={parentId === null ? "" : parentId}
                onChange={(e) =>
                  setParentId(
                    e.target.value === "" ? null : Number(e.target.value),
                  )
                }
                className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2 text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-50"
              >
                <option value="">None (top-level)</option>
                {parentOptions.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.title}
                  </option>
                ))}
              </select>
            </div>

            <UserSearchDropdown
              projectId={task.projectId}
              selectedUsers={pendingAssignees}
              onAdd={handleAddAssignee}
              onRemove={handleRemoveAssignee}
            />
          </div>

          {saveError && (
            <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
              {saveError}
            </p>
          )}

          <div className="mt-4 flex justify-end gap-2">
            <PrimaryButton
              text="Cancel"
              outline
              color="gray"
              onClick={onClose}
            />
            <PrimaryButton
              text="Save"
              onClick={handleSave}
              loading={submitting}
            />
          </div>
        </Card>
      </div>
    </div>
  );
};

export default EditTaskModal;
