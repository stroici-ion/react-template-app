import type { RootState } from "..";
import { usersAdapter } from "./slice";

export const { selectAll: selectAllUsers, selectById: selectUserById } =
  usersAdapter.getSelectors((state: RootState) => state.users);

export const selectUsersLoading = (state: RootState) => state.users.loading;
export const selectUsersPagination = (state: RootState) => state.users.pagination;
