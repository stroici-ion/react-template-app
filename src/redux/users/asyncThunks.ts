import { createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "../../api/axios";
import parseApiResponse from "../../utils/api";
import type { User } from "../../types/user";
import type { PaginationMeta } from "../types";

export const fetchUsers = createAsyncThunk(
  "users/fetchUsers",
  async (
    { q, projectId, page = 1, perPage = 20 }: { q?: string; projectId?: number; page?: number; perPage?: number } = {},
    { rejectWithValue },
  ) => {
    try {
      const params: Record<string, any> = { page, per_page: perPage };
      if (q) params.q = q;
      if (projectId) params.project_id = projectId;
      const response = await api.get("/users", { params });
      return parseApiResponse(response.data) as { users: User[]; pagination: PaginationMeta };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || "Failed to load users");
    }
  },
);
