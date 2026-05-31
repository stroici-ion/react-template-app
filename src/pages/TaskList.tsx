import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
  type DragCancelEvent,
  MeasuringStrategy,
  DragOverlay,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { TaskItem } from "../components/TaskItem";
import Card from "../components/UI/Card";
import { LayoutGrid, ListTodo } from "lucide-react";
import { useEffect, useState } from "react";
import { fetchTasks, reorderTasks } from "../redux/tasks/asyncThunks";
import KanbanBoard from "../components/KanbanBoard";
import Title from "../components/UI/Title";
import Text from "../components/UI/Text";
import { AddNewTask } from "../components/AddNewTask";

export const TaskList = ({ projectId }: { projectId: number }) => {
  const dispatch = useAppDispatch();
  const topLevelTasks = useAppSelector((state) => state.tasks.topLevelOrder);
  const subtaskOrders = useAppSelector((state) => state.tasks.subtaskOrders);
  const tasks = useAppSelector((state) => state.tasks.entities);
  const [expandedIds, setExpandedIds] = useState<number[]>([]);
  const [expandedIdsBackup, setExpandedIdsBackup] = useState<number[]>([]);
  const [activeId, setActiveId] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<"list" | "kanban">("list");

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor),
  );

  useEffect(() => {
    dispatch(fetchTasks({ projectId }));
  }, [dispatch, projectId]);

  const handleToggleExpand = (id: number) => {
    setExpandedIds((prev) =>
      prev.includes(id) ? prev.filter((eid) => eid !== id) : [...prev, id],
    );
  };

  const handleDragStart = (event: DragStartEvent) => {
    const draggedTaskId = event.active.id as number;
    const draggedTask = tasks[draggedTaskId];
    setActiveId(draggedTaskId);
    if (!draggedTask) return;
    setExpandedIdsBackup(expandedIds);
    const siblingIds = Object.values(tasks)
      .filter((t) => t?.parentId === draggedTask.parentId)
      .map((t) => t!.id);
    setExpandedIds((prev) => prev.filter((id) => !siblingIds.includes(id)));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    setExpandedIds(expandedIdsBackup);
    if (!over || active.id === over.id) return;

    const draggedTask = tasks[active.id as number];
    const overTask = tasks[over.id as number];

    if (draggedTask && overTask && draggedTask.parentId === overTask.parentId) {
      const parentId = draggedTask.parentId;
      const currentOrder =
        parentId === null ? topLevelTasks : (subtaskOrders[parentId] ?? []);
      const oldIndex = currentOrder.indexOf(active.id as number);
      const newIndex = currentOrder.indexOf(over.id as number);
      if (oldIndex !== -1 && newIndex !== -1) {
        dispatch(
          reorderTasks({
            projectId,
            order: arrayMove(currentOrder, oldIndex, newIndex),
            previousOrder: currentOrder,
            parentId,
          }),
        );
      }
    }
  };

  const handleDragCancel = (_event: DragCancelEvent) => {
    setActiveId(null);
    setExpandedIds(expandedIdsBackup);
  };

  const viewToggle = (
    <div className="flex gap-2 rounded-lg bg-gray-100 p-1 dark:bg-gray-900">
      <button
        className={`cursor-pointer rounded-md p-1.5 shadow-sm ${viewMode === "list" ? "bg-gray-200 text-indigo-400 dark:bg-gray-800" : "text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800"}`}
        onClick={() => setViewMode("list")}
        title="List view"
      >
        <ListTodo size={18} />
      </button>
      <button
        className={`cursor-pointer rounded-md p-1.5 shadow-sm ${viewMode === "kanban" ? "bg-gray-200 text-indigo-400 dark:bg-gray-800" : "text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800"}`}
        onClick={() => setViewMode("kanban")}
        title="Kanban view"
      >
        <LayoutGrid size={18} />
      </button>
    </div>
  );

  return (
    <Card maxWidth="none">
      <>
        <header className="mb-8 flex items-end justify-between">
          <div>
            <Title text="Project Tasks" />
            <Text text="Manage your team's workflow and subtasks." />
          </div>
          {viewToggle}
        </header>

        {viewMode === "kanban" ? (
          <KanbanBoard projectId={projectId} />
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
            onDragCancel={handleDragCancel}
            onDragStart={handleDragStart}
            measuring={{ droppable: { strategy: MeasuringStrategy.Always } }}
          >
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
        )}

        {viewMode === "list" && <AddNewTask projectId={projectId} />}
      </>
    </Card>
  );
};
