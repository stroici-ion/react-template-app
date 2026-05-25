import { createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "../../api/axios";
import parseApiResponse from "../../utils/api";
import type { Task } from "./types";

const toSnakeCase = (input: Record<string, any>): Record<string, any> => {
  const out: Record<string, any> = {};
  for (const key in input) {
    const snake = key.replace(/[A-Z]/g, (c) => `_${c.toLowerCase()}`);
    out[snake] = input[key];
  }
  return out;
};

export const fetchTasks = createAsyncThunk(
  "tasks/fetchTasks",
  async (projectId: number, { rejectWithValue }) => {
    try {
      const response = await api.get(`/projects/${projectId}/tasks`);
      return parseApiResponse(response.data);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error);
    }
  },
);

export const createTask = createAsyncThunk(
  "tasks/createTask",
  async (payload: Partial<Task>, { rejectWithValue }) => {
    try {
      const { projectId, ...rest } = payload;
      const response = await api.post(`/projects/${projectId}/tasks`, {
        task: toSnakeCase(rest),
      });
      return parseApiResponse(response.data) as Task;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.error ||
          error.response?.data?.errors?.join(", ") ||
          "Failed to create task",
      );
    }
  },
);

export const updateTask = createAsyncThunk(
  "tasks/updateTask",
  async (
    { id, changes }: { id: number; changes: Partial<Task> },
    { rejectWithValue },
  ) => {
    try {
      const response = await api.patch(`/tasks/${id}`, {
        task: toSnakeCase(changes),
      });
      const data = parseApiResponse(response.data) as Task;
      return { id, changes: data };
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.error ||
          error.response?.data?.errors?.join(", ") ||
          "Failed to update task",
      );
    }
  },
);

export const deleteTask = createAsyncThunk(
  "tasks/deleteTask",
  async (id: number, { rejectWithValue }) => {
    try {
      await api.delete(`/tasks/${id}`);
      return id;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to delete task",
      );
    }
  },
);

export const reorderTasks = createAsyncThunk(
  "tasks/reorderTasks",
  async (
    {
      projectId,
      order,
      previousOrder,
      parentId,
    }: {
      projectId: number;
      order: number[];
      previousOrder: number[];
      parentId: number | null;
    },
    { rejectWithValue },
  ) => {
    try {
      await api.patch(`/projects/${projectId}/tasks/reorder`, {
        task_ids: order,
        parent_id: parentId,
      });
      return order;
    } catch (error: any) {
      return rejectWithValue({
        previousOrder,
        parentId,
        error: error.response?.data?.error || "Failed to save task order",
      });
    }
  },
);
