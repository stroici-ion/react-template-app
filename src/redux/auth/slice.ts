import { createSlice } from "@reduxjs/toolkit";
import type { AuthState } from "./types";
import {
  fetchMe,
  loginUser,
  loginWithGoogle,
  logoutAllDevices,
  logoutUser,
  refreshUser,
  registerUser,
  updateProfile,
} from "./asyncThunks";
import type { User } from "../../types/user";

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  status: "idle",
  error: null,
  initialized: false,
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    // Allows you to manually clear state if needed without an API call
    clearAuth: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.status = "idle";
      state.error = null;
      sessionStorage.removeItem("access_token");
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(updateProfile.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })

      // FETCH ME, UPDATE PROFILE
      .addMatcher(
        (action) =>
          action.type === fetchMe.fulfilled.type ||
          action.type === updateProfile.fulfilled.type,
        (state, action: any) => {
          state.status = "succeeded";
          state.isAuthenticated = true;
          state.user = action.payload.user;
          state.error = null;
          state.initialized = true;
        },
      )

      // LOGOUT
      .addMatcher(
        (action) =>
          action.type === logoutUser.fulfilled.type ||
          action.type === logoutAllDevices.fulfilled.type,
        (state) => {
          state.user = null;
          state.isAuthenticated = false;
          state.status = "idle";
          sessionStorage.removeItem("access_token");
          // Note: Your Rails backend /auth/logout endpoint MUST clear the
          // HttpOnly cookie by sending a Set-Cookie header with an expiration in the past.
        },
      )

      // LOGIN, REGISTER, REFRESH
      .addMatcher(
        (action) =>
          action.type === loginUser.fulfilled.type ||
          action.type === registerUser.fulfilled.type ||
          action.type === refreshUser.fulfilled.type ||
          action.type === loginWithGoogle.fulfilled.type,
        (state, action: { payload: { user: User; accessToken: string } }) => {
          state.status = "succeeded";
          state.isAuthenticated = true;
          state.user = action.payload.user;
          state.error = null;
          state.initialized = true;

          // Only save the short-lived access token to session storage
          sessionStorage.setItem("access_token", action.payload.accessToken);
        },
      )
      .addMatcher(
        (action) =>
          action.type === loginUser.rejected.type ||
          action.type === registerUser.rejected.type ||
          action.type === loginWithGoogle.rejected.type,
        (state, action: any) => {
          state.status = "failed";
          state.error = action.payload as string;
        },
      )
      // REFRESH REJECTED
      .addMatcher(
        (action) =>
          action.type === refreshUser.rejected.type ||
          action.type === fetchMe.rejected.type,
        (state) => {
          state.initialized = true;
        },
      )
      // SHARED PENDING STATE
      .addMatcher(
        (action) => action.type.endsWith("/pending"),
        (state) => {
          state.status = "loading";
          state.error = null;
        },
      );
  },
});

export const { clearAuth } = authSlice.actions;
export default authSlice.reducer;
