import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { selectAllTasks, selectTaskById } from "../redux/tasks/selectors";
import { updateTask } from "../redux/tasks/asyncThunks";
import { Status, type Task, type TaskStatus } from "../redux/tasks/types";
import Card from "./UI/Card";
import { Input } from "./UI/Input";
import PrimaryButton from "./UI/PrimaryButton";

interface TaskDetailsModalProps {
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

export const TaskDetailsModal = ({
  taskId,
  onClose,
}: TaskDetailsModalProps) => {
  const dispatch = useAppDispatch();
  const task = useAppSelector((state) => selectTaskById(state, taskId));
  const allTasks = useAppSelector(selectAllTasks);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<TaskStatus>(Status.Todo);
  const [startDate, setStartDate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [parentId, setParentId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!task) return;
    setTitle(task.title);
    setDescription(task.description ?? "");
    setStatus(task.status);
    setStartDate(toInputDate(task.startDate));
    setDueDate(toInputDate(task.dueDate));
    setParentId(task.parentId);
  }, [task]);

  if (!task) return null;

  const parentOptions = allTasks.filter(
    (t) =>
      t.id !== task.id &&
      t.projectId === task.projectId &&
      !isDescendantOf(t.id, task.id, allTasks),
  );

  const handleSave = async () => {
    setSubmitting(true);
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
      onClose();
    } catch (e) {
      // keep modal open on failure
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
            className="absolute right-4 top-4 text-gray-500 hover:text-gray-700"
          >
            <X size={18} />
          </button>
          <h2 className="mb-4 text-xl font-bold text-gray-900 dark:text-gray-50">
            Task Details
          </h2>

          <div className="space-y-3">
            <Input
              id="task-title"
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

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-900 dark:text-gray-50">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as TaskStatus)}
                className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2 text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-50"
              >
                <option value={Status.Todo}>Todo</option>
                <option value={Status.InProgress}>In Progress</option>
                <option value={Status.Done}>Done</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Input
                id="task-start-date"
                label="Start Date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
              <Input
                id="task-due-date"
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
                  setParentId(e.target.value === "" ? null : Number(e.target.value))
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
          </div>

          <div className="mt-5 flex justify-end gap-2">
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

export default TaskDetailsModal;
