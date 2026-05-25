// src/pages/ProjectDashboard.tsx
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
  type DragCancelEvent,
  MeasuringStrategy,
  DragOverlay,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { TaskItem } from "../components/TaskItem";
import Card from "../components/UI/Card";
import { LayoutGrid, ListTodo } from "lucide-react";
import { arrayMove } from "@dnd-kit/sortable";
import { useEffect, useState } from "react";
import { fetchTasks, reorderTasks } from "../redux/tasks/asyncThunks";
import Title from "../components/UI/Title";
import Text from "../components/UI/Text";
import { AddNewTask } from "../components/AddNewTask";

export const TaskList = ({ projectId }: { projectId: number }) => {
  const dispatch = useAppDispatch();
  const topLevelTasks = useAppSelector((state) => state.tasks.topLevelOrder);
  const subtaskOrders = useAppSelector((state) => state.tasks.subtaskOrders);
  const [expandedIds, setExpandedIds] = useState<number[]>([]);
  const [expandedIdsBackup, setExpandedIdsBackup] = useState<number[]>([]);
  const [activeId, setActiveId] = useState<number | null>(null);

  const handleToggleExpand = (id: number) => {
    setExpandedIds((prev) =>
      prev.includes(id)
        ? prev.filter((expandedId) => expandedId !== id)
        : [...prev, id],
    );
  };
  const tasks = useAppSelector((state) => state.tasks.entities);
  // Set up sensors for mouse/touch interactions
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor),
  );

  useEffect(() => {
    dispatch(fetchTasks(projectId));
  }, [dispatch, projectId]);

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const draggedTaskId = active.id as number;
    const draggedTask = tasks[draggedTaskId];
    setActiveId(draggedTaskId);

    if (!draggedTask) return;

    // 1. Backup the current user's expanded state
    setExpandedIdsBackup(expandedIds);

    // 2. Find all tasks that are on the "same level" (share the same parentId)
    // If parentId is null, it means it's a top-level task.
    const siblingTasks = Object.values(tasks).filter(
      (task) => task?.parentId === draggedTask.parentId,
    );

    const siblingIds = siblingTasks.map((t) => t!.id);

    // 3. Remove all sibling IDs from the expanded list (collapsing them)
    // Optional: You can keep the dragged item itself expanded if you want,
    // or collapse it too. This code collapses all of them.
    setExpandedIds((prev) => prev.filter((id) => !siblingIds.includes(id)));
  };

  // Note on handleDragOver:
  // If you are ONLY reordering a single list (top-level tasks), you actually
  // do not need handleDragOver. handleDragOver is specifically for Kanban boards
  // where you move an item from "To Do" to "In Progress" mid-drag.
  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;
    // Kanban logic would go here
  };

  // Handle final drop (Data persistence)
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    // If dropped outside a valid droppable area, do nothing
    if (!over) return;

    // If the item was actually moved to a new position
    if (active.id !== over.id) {
      const draggedTask = tasks[active.id as number];
      const overTask = tasks[over.id as number];

      // Only reorder when both items belong to the same parent container
      if (
        draggedTask &&
        overTask &&
        draggedTask.parentId === overTask.parentId
      ) {
        const parentId = draggedTask.parentId;
        const currentOrder =
          parentId === null ? topLevelTasks : (subtaskOrders[parentId] ?? []);

        const oldIndex = currentOrder.indexOf(active.id as number);
        const newIndex = currentOrder.indexOf(over.id as number);

        if (oldIndex !== -1 && newIndex !== -1) {
          const newOrder = arrayMove(currentOrder, oldIndex, newIndex);

          // Dispatch the thunk — applies the new order optimistically
          // and persists it to the backend (rolls back on failure).
          dispatch(
            reorderTasks({
              projectId,
              order: newOrder,
              previousOrder: currentOrder,
              parentId,
            }),
          );
        }
      }
    }

    setExpandedIds(expandedIdsBackup);
  };

  const handleDragCancel = (event: DragCancelEvent) => {
    // If they press Escape, just restore the visual state
    setActiveId(null);
    setExpandedIds(expandedIdsBackup);
  };

  return (
    <Card maxWidth="none">
      <>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
          onDragCancel={handleDragCancel}
          onDragStart={handleDragStart}
          measuring={{
            droppable: {
              strategy: MeasuringStrategy.Always,
            },
          }}
        >
          <header className="mb-8 flex items-end justify-between">
            <div>
              <Title text="Project Tasks" />
              <Text text="Manage your team's workflow and subtasks." />
            </div>
            <div className="flex gap-2 rounded-lg bg-gray-100 p-1">
              <button className="rounded-md bg-white p-1.5 text-indigo-600 shadow-sm">
                <ListTodo size={18} />
              </button>
              <button className="p-1.5 text-gray-500 hover:text-gray-700">
                <LayoutGrid size={18} />
              </button>
            </div>
          </header>

          <div className="min-h-[100px] p-6">
            <SortableContext
              id="ROOT"
              items={topLevelTasks}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-2">
                {topLevelTasks.map((taskId) => (
                  <TaskItem
                    key={taskId}
                    taskId={taskId}
                    expandedIds={expandedIds}
                    onToggleExpand={handleToggleExpand}
                  />
                ))}
              </div>
            </SortableContext>
          </div>
          <DragOverlay>
            {activeId ? (
              <TaskItem
                taskId={activeId}
                expandedIds={expandedIds}
                onToggleExpand={handleToggleExpand}
              />
            ) : null}
          </DragOverlay>
        </DndContext>

        <AddNewTask projectId={projectId} />
      </>
    </Card>
  );
};
