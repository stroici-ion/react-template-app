import {
  useSortable,
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import clsx from "clsx";
import { useEffect, useRef, useState } from "react";
import { DayPicker } from "react-day-picker";
import {
  MoreVertical,
  Pencil,
  Trash2,
  Calendar,
  ExternalLink,
} from "lucide-react";
import { PRIORITY_COLORS, PRIORITY_SHORT } from "../redux/tasks/types";
import { Badge } from "./UI/Badge";
import { useNavigate } from "react-router-dom";
import { useAlert } from "../hooks/useAlert";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import {
  selectSubtasksByParentId,
  selectTaskById,
} from "../redux/tasks/selectors";
import { deleteTask, updateTask } from "../redux/tasks/asyncThunks";
import ContextMenu from "./UI/ContextMenu";
import MenuOptions from "./UI/MenuOptions";
import EditTaskModal from "./EditTaskModal";
import { AddNewTask } from "./AddNewTask";
import TaskStatusSelect from "./TaskStatusSelect";
import TextButton from "./UI/TextButton";
import InlineAssigneePicker from "./InlineAssigneePicker";

const colorVariants: Record<string, string> = {
  slate:
    "bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800",
  blue: "bg-blue-50 dark:bg-blue-800 border border-blue-200 dark:border-blue-800",
  green:
    "bg-green-100 dark:bg-green-900 border border-green-200 dark:border-green-800",
  red: "bg-red-100 dark:bg-red-900 border border-red-200 dark:border-red-800",
  yellow:
    "bg-yellow-100 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-800",
  purple:
    "bg-purple-100 dark:bg-purple-900 border border-purple-200 dark:border-purple-800",
  indigo:
    "bg-indigo-100 dark:bg-indigo-900 border border-indigo-200 dark:border-indigo-800",
  pink: "bg-pink-100 dark:bg-pink-900 border border-pink-200 dark:border-pink-800",
  orange:
    "bg-orange-100 dark:bg-orange-900 border border-orange-200 dark:border-orange-800",
  gray: "bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-800",
};

interface TaskItemProps {
  taskId: number;
  color?: string;
  expandedIds: number[];
  onToggleExpand: (id: number) => void;
}

export const TaskItem = ({
  taskId,
  color = "slate",
  expandedIds,
  onToggleExpand,
}: TaskItemProps) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const alert = useAlert();
  const task = useAppSelector((state) => selectTaskById(state, taskId));
  const subtasks = useAppSelector((state) =>
    selectSubtasksByParentId(state, taskId),
  );
  const subtaskIds = subtasks.map((st) => st.id);

  const isExpanded = expandedIds.includes(taskId);

  const [isRenaming, setIsRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const datePickerRef = useRef<HTMLDivElement>(null);
  const renameInputRef = useRef<HTMLInputElement>(null);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: taskId,
    data: {
      type: "Task",
      task,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  useEffect(() => {
    if (!showDatePicker) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (
        datePickerRef.current &&
        !datePickerRef.current.contains(event.target as Node)
      ) {
        setShowDatePicker(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showDatePicker]);

  useEffect(() => {
    if (isRenaming) renameInputRef.current?.focus();
  }, [isRenaming]);

  if (!task) return null;

  const startRename = () => {
    setRenameValue(task.title);
    setIsRenaming(true);
  };

  const commitRename = () => {
    const trimmed = renameValue.trim();
    if (trimmed && trimmed !== task.title) {
      dispatch(updateTask({ id: task.id, changes: { title: trimmed } }));
    }
    setIsRenaming(false);
  };

  const handleDelete = () => {
    dispatch(deleteTask(task.id));
  };

  const handleSelectDate = (date: Date | undefined) => {
    dispatch(
      updateTask({
        id: task.id,
        changes: { dueDate: date ? date.toISOString() : null },
      }),
    );
    setShowDatePicker(false);
  };

  const handleOpenDetail = () => {
    navigate(`/projects/${task.projectId}/tasks/${task.id}`);
  };

  const menuOptions = [
    {
      icon: <ExternalLink size={16} />,
      title: "Open Detail",
      onClick: handleOpenDetail,
    },
    {
      icon: <Pencil size={16} />,
      title: "Edit",
      onClick: () => setShowEdit(true),
    },
    {
      icon: <Pencil size={16} />,
      title: "Rename",
      onClick: startRename,
    },
    {
      icon: <Calendar size={16} />,
      title: "Set Due Date",
      onClick: () => setShowDatePicker(true),
    },
    {
      icon: <Trash2 size={16} />,
      title: "Delete",
      color: "text-red-500 hover:bg-red-50 hover:dark:bg-red-900/20",
      onClick: handleDelete,
    },
  ];

  return (
    <div ref={setNodeRef} style={style} className="relative cursor-pointer">
      <div className={clsx("rounded-lg px-3 py-2", colorVariants[color])}>
        <div
          className="flex items-center"
          onClick={() => !isRenaming && handleOpenDetail()}
        >
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab pr-2 text-gray-400 hover:text-gray-600"
            onClick={(e) => e.stopPropagation()}
          >
            ⠿
          </div>

          <div className="flex flex-1 items-center gap-2">
            <div className="w-5">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleExpand(taskId);
                }}
                className="flex h-5 w-5 cursor-pointer items-center justify-center rounded text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-700"
              >
                {isExpanded ? "▾" : "▸"}
              </button>
            </div>
            <div onClick={(e) => e.stopPropagation()}>
              <TaskStatusSelect
                status={task.status}
                onChange={async (status) => {
                  try {
                    await dispatch(
                      updateTask({ id: task.id, changes: { status } }),
                    ).unwrap();
                  } catch (err: any) {
                    alert.error(
                      typeof err === "string" ? err : "Failed to update status",
                    );
                  }
                }}
              />
            </div>
            <div className="flex-1">
              {isRenaming ? (
                <input
                  ref={renameInputRef}
                  value={renameValue}
                  onChange={(e) => setRenameValue(e.target.value)}
                  onBlur={commitRename}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") commitRename();
                    if (e.key === "Escape") setIsRenaming(false);
                  }}
                  onClick={(e) => e.stopPropagation()}
                  className="w-full rounded border border-gray-300 bg-white px-2 py-1 text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-50"
                />
              ) : (
                <h4
                  className={`text-sm ${task.status === "closed" || task.status === "cancelled" ? "text-gray-400 line-through" : "font-medium text-gray-700 dark:text-gray-200"}`}
                >
                  {task.title}
                </h4>
              )}
            </div>

            <div className="hidden items-center gap-2 sm:flex">
              <InlineAssigneePicker
                taskId={taskId}
                projectId={task.projectId}
              />
              {task.priority && (
                <div onClick={(e) => e.stopPropagation()}>
                  <Badge
                    text={PRIORITY_SHORT[task.priority]}
                    color={PRIORITY_COLORS[task.priority] ?? "gray"}
                    size="xs"
                  />
                </div>
              )}
              <div onClick={(e) => e.stopPropagation()}>
                {task.dueDate ? (
                  <div
                    className="cursor pointer flex items-center gap-2 rounded-full bg-white px-2 py-0.5 text-[11px] text-gray-400 dark:bg-gray-800"
                    onClick={() => setShowDatePicker((state) => !state)}
                  >
                    <Calendar size={12} />
                    {new Date(task.dueDate).toLocaleDateString()}
                  </div>
                ) : (
                  <TextButton
                    size="xs"
                    text="Set due date"
                    icon={<Calendar size={12} />}
                    onClick={() => setShowDatePicker((state) => !state)}
                  />
                )}
              </div>
            </div>
            <div onClick={(e) => e.stopPropagation()}>
              <ContextMenu
                maxWidth="200px"
                triggerElement={
                  <button className="cursor-pointer rounded p-1 text-gray-400 hover:bg-gray-200 hover:text-gray-200 dark:hover:bg-gray-800">
                    <MoreVertical size={16} />
                  </button>
                }
                body={<MenuOptions options={menuOptions} />}
              />
            </div>
          </div>
        </div>

        {showDatePicker && (
          <div
            ref={datePickerRef}
            className="absolute right-2 top-12 z-50 rounded-md border border-gray-200 bg-white p-2 shadow-xl dark:border-gray-700 dark:bg-gray-600 dark:text-white"
            onClick={(e) => e.stopPropagation()}
          >
            <DayPicker
              mode="single"
              selected={task.dueDate ? new Date(task.dueDate) : undefined}
              onSelect={handleSelectDate}
            />
          </div>
        )}

        {!isDragging && (
          <div
            className={`grid transition-all duration-300 ease-in-out ${
              isExpanded
                ? "mt-2 grid-rows-[1fr] opacity-100"
                : "grid-rows-[0fr] opacity-0"
            }`}
          >
            <div className="overflow-hidden">
              <div className="ml-8 mt-2 border-l border-gray-200 pl-2 dark:border-gray-700">
                <SortableContext
                  id={String(taskId)}
                  items={subtaskIds}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="min-h-[20px] space-y-2 pb-2">
                    {subtasks.map((subtask) => (
                      <TaskItem
                        key={subtask.id}
                        taskId={subtask.id}
                        expandedIds={expandedIds}
                        onToggleExpand={onToggleExpand}
                      />
                    ))}
                  </div>
                </SortableContext>

                <AddNewTask projectId={task.projectId} parentId={task.id} />
              </div>
            </div>
          </div>
        )}
      </div>

      {showEdit && (
        <EditTaskModal taskId={task.id} onClose={() => setShowEdit(false)} />
      )}
    </div>
  );
};
