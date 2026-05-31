import {
  createSlice,
  createEntityAdapter,
  type PayloadAction,
} from "@reduxjs/toolkit";
import type { Task } from "./types";
import {
  fetchTasks,
  createTask,
  updateTask,
  deleteTask,
  reorderTasks,
  addTaskAssignee,
  removeTaskAssignee,
} from "./asyncThunks";

// 2. Initialize the Adapter
// This provides built-in CRUD functions like addOne, updateOne, removeOne
export const tasksAdapter = createEntityAdapter<Task>();

// 4. Create the Slice
const tasksSlice = createSlice({
  name: "tasks",
  initialState: tasksAdapter.getInitialState({
    loading: false,
    topLevelOrder: [] as number[],
    subtaskOrders: {} as Record<number, number[]>,
    error: null as string | null,
  }),
  reducers: {
    taskAdded: tasksAdapter.addOne,
    taskUpdated: tasksAdapter.updateOne,
    taskRemoved: tasksAdapter.removeOne,
    // Useful for drag-and-drop status changes
    updateTaskStatus: (
      state,
      action: PayloadAction<{ id: number; status: Task["status"] }>,
    ) => {
      const { id, status } = action.payload;
      tasksAdapter.updateOne(state, { id, changes: { status } });
    },
    setTopLevelOrder: (state, action: PayloadAction<number[]>) => {
      state.topLevelOrder = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTasks.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.loading = false;
        const tasks = action.payload.tasks;
        tasksAdapter.setAll(state, tasks);
        state.topLevelOrder = tasks
          .filter((t: any) => t.parentId === null)
          .map((t: any) => t.id);
        const subtaskOrders: Record<number, number[]> = {};
        for (const t of tasks as any[]) {
          if (t.parentId !== null) {
            (subtaskOrders[t.parentId] ||= []).push(t.id);
          }
        }
        state.subtaskOrders = subtaskOrders;
      })
      .addCase(createTask.fulfilled, (state, action) => {
        const task = action.payload;
        tasksAdapter.addOne(state, task);
        if (task.parentId === null) {
          if (!state.topLevelOrder.includes(task.id)) {
            state.topLevelOrder.push(task.id);
          }
        } else {
          const bucket = (state.subtaskOrders[task.parentId] ||= []);
          if (!bucket.includes(task.id)) bucket.push(task.id);
        }
      })
      .addCase(updateTask.fulfilled, (state, action) => {
        const { id, changes } = action.payload;
        const oldParentId = state.entities[id]?.parentId ?? null;
        tasksAdapter.updateOne(state, { id, changes });

        // Keep hierarchy ordering in sync when parentId changes
        if (Object.prototype.hasOwnProperty.call(changes, "parentId")) {
          const newParentId = changes.parentId ?? null;
          if (oldParentId !== newParentId) {
            // Remove from old container
            if (oldParentId === null) {
              state.topLevelOrder = state.topLevelOrder.filter(
                (orderId) => orderId !== id,
              );
            } else if (state.subtaskOrders[oldParentId]) {
              state.subtaskOrders[oldParentId] = state.subtaskOrders[
                oldParentId
              ].filter((orderId) => orderId !== id);
            }
            // Add to new container
            if (newParentId === null) {
              if (!state.topLevelOrder.includes(id)) {
                state.topLevelOrder.push(id);
              }
            } else {
              const bucket = (state.subtaskOrders[newParentId] ||= []);
              if (!bucket.includes(id)) bucket.push(id);
            }
          }
        }
      })
      .addCase(deleteTask.fulfilled, (state, action) => {
        const id = action.payload;
        tasksAdapter.removeOne(state, id);
        state.topLevelOrder = state.topLevelOrder.filter(
          (orderId) => orderId !== id,
        );
        for (const key of Object.keys(state.subtaskOrders)) {
          const parentKey = Number(key);
          state.subtaskOrders[parentKey] = state.subtaskOrders[
            parentKey
          ].filter((orderId) => orderId !== id);
        }
      })
      .addCase(reorderTasks.pending, (state, action) => {
        // Optimistic update: apply the new order to the appropriate list
        const { order, parentId } = action.meta.arg;
        if (parentId === null) {
          state.topLevelOrder = order;
        } else {
          state.subtaskOrders[parentId] = order;
        }
      })
      .addCase(reorderTasks.rejected, (state, action) => {
        const payload = action.payload as
          | { previousOrder: number[]; parentId: number | null; error: string }
          | undefined;
        if (payload) {
          if (payload.parentId === null) {
            state.topLevelOrder = payload.previousOrder;
          } else {
            state.subtaskOrders[payload.parentId] = payload.previousOrder;
          }
          state.error = payload.error;
        }
      })
      .addCase(addTaskAssignee.fulfilled, (state, action) => {
        const { id, assigneeIds } = action.payload;
        tasksAdapter.updateOne(state, { id, changes: { assigneeIds } });
      })
      .addCase(removeTaskAssignee.fulfilled, (state, action) => {
        const { id, assigneeIds } = action.payload;
        tasksAdapter.updateOne(state, { id, changes: { assigneeIds } });
      });
  },
});

export const {
  taskAdded,
  taskUpdated,
  taskRemoved,
  updateTaskStatus,
  setTopLevelOrder,
} = tasksSlice.actions;

export default tasksSlice.reducer;
