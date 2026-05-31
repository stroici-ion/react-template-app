import { createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "../../api/axios";
import parseApiResponse from "../../utils/api";
import type { Project, ProjectMember } from "./types";
import type { PaginationMeta } from "../types";

export const fetchProjects = createAsyncThunk(
  "projects/fetchProjects",
  async ({ page = 1, perPage = 20 }: { page?: number; perPage?: number } = {}, { rejectWithValue }) => {
    try {
      const response = await api.get("/projects", { params: { page, per_page: perPage } });
      return parseApiResponse(response.data) as { projects: Project[]; pagination: PaginationMeta };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || "Failed to load projects");
    }
  },
);

export const fetchProject = createAsyncThunk(
  "projects/fetchProject",
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await api.get(`/projects/${id}`);
      return parseApiResponse(response.data) as Project;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || "Failed to load project");
    }
  },
);

export const createProject = createAsyncThunk(
  "projects/createProject",
  async (
    payload: { name: string; description?: string; colorCode?: string },
    { rejectWithValue },
  ) => {
    try {
      const response = await api.post("/projects", {
        project: {
          name: payload.name,
          description: payload.description,
          color_code: payload.colorCode,
        },
      });
      return parseApiResponse(response.data) as Project;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || "Failed to create project");
    }
  },
);

export const updateProject = createAsyncThunk(
  "projects/updateProject",
  async (
    { id, changes }: { id: number; changes: Partial<Pick<Project, "name" | "description" | "colorCode" | "status">> },
    { rejectWithValue },
  ) => {
    try {
      const body: Record<string, any> = {};
      if (changes.name !== undefined) body.name = changes.name;
      if (changes.description !== undefined) body.description = changes.description;
      if (changes.colorCode !== undefined) body.color_code = changes.colorCode;
      if (changes.status !== undefined) body.status = changes.status;
      const response = await api.patch(`/projects/${id}`, { project: body });
      return parseApiResponse(response.data) as Project;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || "Failed to update project");
    }
  },
);

export const deleteProject = createAsyncThunk(
  "projects/deleteProject",
  async (id: number, { rejectWithValue }) => {
    try {
      await api.delete(`/projects/${id}`);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || "Failed to delete project");
    }
  },
);

export const fetchProjectMembers = createAsyncThunk(
  "projects/fetchProjectMembers",
  async ({ projectId, page = 1 }: { projectId: number; page?: number }, { rejectWithValue }) => {
    try {
      const response = await api.get(`/projects/${projectId}/project_memberships`, {
        params: { page, per_page: 50 },
      });
      const data = parseApiResponse(response.data) as { members: ProjectMember[]; pagination: PaginationMeta };
      return { projectId, members: data.members };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || "Failed to load members");
    }
  },
);

export const addProjectMember = createAsyncThunk(
  "projects/addProjectMember",
  async (
    { projectId, email, role = "member" }: { projectId: number; email: string; role?: string },
    { rejectWithValue },
  ) => {
    try {
      const response = await api.post(`/projects/${projectId}/project_memberships`, { email, role });
      const member = parseApiResponse(response.data) as ProjectMember;
      return { projectId, member };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || "Failed to add member");
    }
  },
);

export const updateMemberRole = createAsyncThunk(
  "projects/updateMemberRole",
  async (
    { projectId, membershipId, role }: { projectId: number; membershipId: number; role: string },
    { rejectWithValue },
  ) => {
    try {
      const response = await api.patch(
        `/projects/${projectId}/project_memberships/${membershipId}`,
        { role },
      );
      const member = parseApiResponse(response.data) as ProjectMember;
      return { projectId, member };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || "Failed to update role");
    }
  },
);

export const removeProjectMember = createAsyncThunk(
  "projects/removeProjectMember",
  async (
    { projectId, membershipId }: { projectId: number; membershipId: number },
    { rejectWithValue },
  ) => {
    try {
      await api.delete(`/projects/${projectId}/project_memberships/${membershipId}`);
      return { projectId, membershipId };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || "Failed to remove member");
    }
  },
);
