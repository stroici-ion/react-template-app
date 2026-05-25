// Selectors (The "Magic" part for Subtasks)

import type { RootState } from "..";
import { tasksAdapter } from "./slice";
import type { Task } from "./types";

export const { selectAll: selectAllTasks, selectById: selectTaskById } =
  tasksAdapter.getSelectors((state: RootState) => state.tasks);

export const selectSubtasksByParentId = (
  state: RootState,
  parentId: number | null,
): Task[] => {
  const ids =
    parentId === null
      ? state.tasks.topLevelOrder
      : (state.tasks.subtaskOrders[parentId] ?? []);
  return ids
    .map((id) => state.tasks.entities[id])
    .filter((t): t is Task => Boolean(t));
};
