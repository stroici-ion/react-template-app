import type { RootState } from "..";
import type { User } from "../../types/user";
import { projectsAdapter } from "./slice";

export const { selectAll: selectAllProjects, selectById: selectProjectById } =
  projectsAdapter.getSelectors((state: RootState) => state.projects);

export const selectProjectMembers = (state: RootState, projectId: number) =>
  state.projects.entities[projectId]?.members ?? [];

export const selectProjectMemberUsers = (
  state: RootState,
  projectId: number,
): User[] =>
  state.projects.entities[projectId]?.members?.map((m) => m.user) ?? [];

export const selectProjectsLoading = (state: RootState) =>
  state.projects.loading;
export const selectProjectsPagination = (state: RootState) =>
  state.projects.pagination;
