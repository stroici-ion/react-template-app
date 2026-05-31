import { createEntityAdapter, createSlice } from "@reduxjs/toolkit";
import type { Project } from "./types";
import {
  fetchProjects,
  fetchProject,
  createProject,
  updateProject,
  deleteProject,
  fetchProjectMembers,
  addProjectMember,
  updateMemberRole,
  removeProjectMember,
} from "./asyncThunks";
import type { PaginationMeta } from "../types";

export const projectsAdapter = createEntityAdapter<Project>();

const projectsSlice = createSlice({
  name: "projects",
  initialState: projectsAdapter.getInitialState({
    loading: false,
    error: null as string | null,
    pagination: null as PaginationMeta | null,
  }),
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProjects.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProjects.fulfilled, (state, action) => {
        state.loading = false;
        projectsAdapter.setAll(state, action.payload.projects);
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchProjects.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchProject.fulfilled, (state, action) => {
        projectsAdapter.upsertOne(state, action.payload);
      })
      .addCase(createProject.fulfilled, (state, action) => {
        projectsAdapter.addOne(state, action.payload);
        if (state.pagination) state.pagination.totalCount += 1;
      })
      .addCase(updateProject.fulfilled, (state, action) => {
        projectsAdapter.upsertOne(state, action.payload);
      })
      .addCase(deleteProject.fulfilled, (state, action) => {
        projectsAdapter.removeOne(state, action.payload);
        if (state.pagination) state.pagination.totalCount -= 1;
      })
      .addCase(fetchProjectMembers.fulfilled, (state, action) => {
        const { projectId, members } = action.payload;
        const project = state.entities[projectId];
        if (project) {
          projectsAdapter.updateOne(state, {
            id: projectId,
            changes: { members },
          });
        }
      })
      .addCase(addProjectMember.fulfilled, (state, action) => {
        const { projectId, member } = action.payload;
        const project = state.entities[projectId];
        if (project) {
          const members = [...(project.members ?? []), member];
          projectsAdapter.updateOne(state, {
            id: projectId,
            changes: { members, memberCount: members.length },
          });
        }
      })
      .addCase(updateMemberRole.fulfilled, (state, action) => {
        const { projectId, member } = action.payload;
        const project = state.entities[projectId];
        if (project && project.members) {
          const members = project.members.map((m) =>
            m.id === member.id ? member : m,
          );
          projectsAdapter.updateOne(state, {
            id: projectId,
            changes: { members },
          });
        }
      })
      .addCase(removeProjectMember.fulfilled, (state, action) => {
        const { projectId, membershipId } = action.payload;
        const project = state.entities[projectId];
        if (project && project.members) {
          const members = project.members.filter((m) => m.id !== membershipId);
          projectsAdapter.updateOne(state, {
            id: projectId,
            changes: { members, memberCount: members.length },
          });
        }
      });
  },
});

export default projectsSlice.reducer;
