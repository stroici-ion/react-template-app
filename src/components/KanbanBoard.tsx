import { useState } from "react";
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  DragOverlay,
} from "@dnd-kit/core";
import { useDroppable, useDraggable } from "@dnd-kit/core";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { selectAllTasks } from "../redux/tasks/selectors";
import { updateTask } from "../redux/tasks/asyncThunks";
import { Status, type Task, type TaskStatus } from "../redux/tasks/types";
import { Calendar, Eye, EyeOff, ExternalLink } from "lucide-react";
import TaskStatusSelect from "./TaskStatusSelect";
import InlineAssigneePicker from "./InlineAssigneePicker";

const COLUMNS: { key: TaskStatus; label: string; color: string }[] = [
  {
    key: Status.Backlog,
    label: "Backlog",
    color: "bg-gray-100 dark:bg-gray-900 border-1 border-gray-900",
  },
  {
    key: Status.Todo,
    label: "Todo",
    color: "bg-gray-100 dark:bg-gray-900 border-1 border-blue-900",
  },
  {
    key: Status.InProgress,
    label: "In Progress",
    color: "bg-gray-100 dark:bg-gray-900 border-1 border-yellow-900",
  },
  {
    key: Status.Closed,
    label: "Closed",
    color: "bg-gray-100 dark:bg-gray-900 border-1 border-green-900",
  },
  {
    key: Status.Cancelled,
    label: "Cancelled",
    color: "bg-gray-100 dark:bg-gray-900 border-1 border-red-900",
  },
];

const COLUMN_HEADER_COLORS: Record<TaskStatus, string> = {
  backlog: "text-gray-600 dark:text-gray-300",
  todo: "text-blue-600 dark:text-blue-400",
  in_progress: "text-yellow-600 dark:text-yellow-400",
  closed: "text-green-600 dark:text-green-400",
  cancelled: "text-red-500 dark:text-red-400",
};

function KanbanCard({
  task,
  isDragging = false,
}: {
  task: Task;
  isDragging?: boolean;
}) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const isOverdue =
    task.dueDate &&
    new Date(task.dueDate) < new Date() &&
    task.status !== Status.Closed &&
    task.status !== Status.Cancelled;

  return (
    <div
      onClick={() => navigate(`/projects/${task.projectId}/tasks/${task.id}`)}
      className={`group cursor-pointer rounded-lg border border-gray-200 bg-white p-3 shadow-sm transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-gray-700 ${isDragging ? "opacity-50" : ""}`}
    >
      <div className="flex items-start gap-2">
        <div onClick={(e) => e.stopPropagation()}>
          <TaskStatusSelect
            status={task.status}
            onChange={(status) =>
              dispatch(updateTask({ id: task.id, changes: { status } }))
            }
          />
        </div>
        <p className="flex-1 text-sm font-medium text-gray-800 dark:text-gray-100">
          {task.title}
        </p>
        <ExternalLink
          size={13}
          className="mt-0.5 shrink-0 text-gray-300 opacity-0 transition-opacity group-hover:opacity-100 dark:text-gray-500"
        />
      </div>

      {task.dueDate && (
        <div
          className={`mt-2 flex items-center gap-1 text-xs ${isOverdue ? "text-red-500" : "text-gray-400"}`}
        >
          <Calendar size={11} />
          {new Date(task.dueDate).toLocaleDateString()}
          {isOverdue && (
            <span className="ml-1 rounded-full bg-red-100 px-1.5 py-0.5 text-[10px] font-medium text-red-600 dark:bg-red-900/30">
              Overdue
            </span>
          )}
        </div>
      )}

      <div className="mt-2" onClick={(e) => e.stopPropagation()}>
        <InlineAssigneePicker taskId={task.id} projectId={task.projectId} />
      </div>
    </div>
  );
}

function DraggableCard({ task }: { task: Task }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: task.id,
    data: { task },
  });
  return (
    <div ref={setNodeRef} {...attributes} {...listeners}>
      <KanbanCard task={task} isDragging={isDragging} />
    </div>
  );
}

function DroppableColumn({
  column,
  tasks,
}: {
  column: (typeof COLUMNS)[number];
  tasks: Task[];
}) {
  const { setNodeRef, isOver } = useDroppable({ id: column.key });

  return (
    <div className="flex min-w-[220px] flex-1 flex-col">
      <div className="mb-3 flex items-center justify-between">
        <span
          className={`text-sm font-semibold ${COLUMN_HEADER_COLORS[column.key]}`}
        >
          {column.label}
        </span>
        <span className="rounded-full bg-gray-200 px-2 py-0.5 text-xs text-gray-600 dark:bg-gray-700 dark:text-gray-300">
          {tasks.length}
        </span>
      </div>

      <div
        ref={setNodeRef}
        className={`flex-1 space-y-2 rounded-xl p-2 transition-colors ${column.color} ${isOver ? "ring-2 ring-indigo-400" : ""}`}
        style={{ minHeight: "120px" }}
      >
        {tasks.map((task) => (
          <DraggableCard key={task.id} task={task} />
        ))}
      </div>
    </div>
  );
}

export default function KanbanBoard({
  projectId: _projectId,
}: {
  projectId: number;
}) {
  const dispatch = useAppDispatch();
  const allTasks = useAppSelector(selectAllTasks);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [showClosed, setShowClosed] = useState(false);
  const [showCancelled, setShowCancelled] = useState(false);

  const tasksByStatus: Record<TaskStatus, Task[]> = {
    backlog: [],
    todo: [],
    in_progress: [],
    closed: [],
    cancelled: [],
  };

  for (const task of allTasks) {
    const s = (task.status as TaskStatus) || Status.Todo;
    if (tasksByStatus[s]) {
      tasksByStatus[s].push(task);
    } else {
      tasksByStatus[Status.Backlog].push(task);
    }
  }

  for (const key of Object.keys(tasksByStatus) as TaskStatus[]) {
    tasksByStatus[key].sort((a, b) => {
      if (!a.dueDate && !b.dueDate) return 0;
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    });
  }

  const visibleColumns = COLUMNS.filter(
    (col) =>
      (col.key !== Status.Closed || showClosed) &&
      (col.key !== Status.Cancelled || showCancelled),
  );

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);
    if (!over) return;
    const newStatus = over.id as TaskStatus;
    const task = allTasks.find((t) => t.id === active.id);
    if (task && task.status !== newStatus) {
      dispatch(updateTask({ id: task.id, changes: { status: newStatus } }));
    }
  };

  const closedCount = tasksByStatus[Status.Closed].length;
  const cancelledCount = tasksByStatus[Status.Cancelled].length;

  return (
    <DndContext
      sensors={sensors}
      onDragStart={(e) => {
        const task = allTasks.find((t) => t.id === e.active.id);
        setActiveTask(task ?? null);
      }}
      onDragEnd={handleDragEnd}
      onDragCancel={() => setActiveTask(null)}
    >
      <div className="mb-3 flex flex-wrap justify-end gap-2">
        <button
          onClick={() => setShowClosed((v) => !v)}
          className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-500 shadow-sm hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
        >
          {showClosed ? <EyeOff size={13} /> : <Eye size={13} />}
          {showClosed
            ? "Hide Closed"
            : `Show Closed${closedCount > 0 ? ` (${closedCount})` : ""}`}
        </button>

        <button
          onClick={() => setShowCancelled((v) => !v)}
          className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-500 shadow-sm hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
        >
          {showCancelled ? <EyeOff size={13} /> : <Eye size={13} />}
          {showCancelled
            ? "Hide Cancelled"
            : `Show Cancelled${cancelledCount > 0 ? ` (${cancelledCount})` : ""}`}
        </button>
      </div>

      <div className="flex min-h-[500px] gap-4 overflow-x-auto px-1 pb-4">
        {visibleColumns.map((col) => (
          <DroppableColumn
            key={col.key}
            column={col}
            tasks={tasksByStatus[col.key]}
          />
        ))}
      </div>

      <DragOverlay>
        {activeTask ? <KanbanCard task={activeTask} /> : null}
      </DragOverlay>
    </DndContext>
  );
}
