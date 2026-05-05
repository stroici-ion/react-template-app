import { createAsyncThunk } from "@reduxjs/toolkit";
import { api, apiWithoutAuth } from "../../api/axios";
import type { AuthResponse, UpdatePasswordPayload } from "./types";
import parseApiResponse from "../../utils/api";

export const loginUser = createAsyncThunk(
  "auth/login",
  async (credentials: Record<string, string>, { rejectWithValue }) => {
    try {
      const response = await apiWithoutAuth.post<AuthResponse>(
        "/auth/login",
        credentials,
      );
      return parseApiResponse(response.data);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error);
    }
  },
);

export const registerUser = createAsyncThunk(
  "auth/register",
  async (userData: Record<string, string>, { rejectWithValue }) => {
    try {
      const response = await apiWithoutAuth.post<AuthResponse>(
        "/auth/register",
        userData,
      );
      return parseApiResponse(response.data);
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.error ||
          error.response?.data?.errors?.join(", ") ||
          "Registration failed",
      );
    }
  },
);

export const confirmEmail = createAsyncThunk(
  "auth/confirmEmail",
  async ({ token }: { token: string }, { rejectWithValue }) => {
    try {
      const response = await apiWithoutAuth.get(
        `/auth/confirm_email?token=${token}`,
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Email confirmation failed",
      );
    }
  },
);

export const logoutUser = createAsyncThunk(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      await api.delete("/auth/logout");
      return true;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Logout failed");
    }
  },
);

export const logoutAllDevices = createAsyncThunk(
  "auth/logoutAll",
  async (_, { rejectWithValue }) => {
    try {
      await api.delete("/auth/logout_all");
      return true;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Logout failed");
    }
  },
);

export const refreshUser = createAsyncThunk(
  "auth/refresh",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.post<AuthResponse>("/auth/refresh");
      return parseApiResponse(response.data);
    } catch (error: any) {
      return rejectWithValue("Session expired");
    }
  },
);

export const forgotPassword = createAsyncThunk(
  "auth/forgotPassword",
  async (email: string, { rejectWithValue }) => {
    try {
      // Rails expects { email }
      const response = await api.post("/password_resets", { email });
      return parseApiResponse(response.data);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Request failed");
    }
  },
);

export const resetPassword = createAsyncThunk(
  "auth/resetPassword",
  async ({ token, password }: Record<string, string>, { rejectWithValue }) => {
    try {
      // Rails expects PATCH /password_resets/:token with { password }
      const response = await api.patch(`/password_resets/${token}`, {
        password,
      });
      return parseApiResponse(response.data);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || "Reset failed");
    }
  },
);

export const loginWithGoogle = createAsyncThunk(
  "auth/googleLogin",
  async (idToken: string, { rejectWithValue }) => {
    try {
      // Send the token to your Rails backend
      const response = await api.post("/auth/google_login", { token: idToken });
      return parseApiResponse(response.data); // Should return { user, access_token, refresh_token }
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Google login failed",
      );
    }
  },
);

export const fetchMe = createAsyncThunk(
  "auth/fetchMe",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/users/me");
      return parseApiResponse(response.data); // Expected: { user: { id, email, first_name... } }
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch user",
      );
    }
  },
);

export const updateProfile = createAsyncThunk(
  "auth/updateProfile",
  async (formData: FormData, { rejectWithValue }) => {
    try {
      // Axios automatically sets 'multipart/form-data' when receiving FormData
      const response = await api.patch("/users/update_profile", formData, {
        headers: {
          "Content-Type": "multipart/form-data", // Explicitly set for FormData
        },
      });
      return parseApiResponse(response.data); // Expected: { message, user: { ... } }
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.errors?.join(", ") || "Update failed",
      );
    }
  },
);

export const updatePassword = createAsyncThunk(
  "auth/updatePassword",
  async (payload: UpdatePasswordPayload, { rejectWithValue }) => {
    try {
      const response = await api.put("/auth/update_password", payload);
      return response.data; // Expected: { message: 'Password successfully updated.' }
    } catch (error: any) {
      // Rails might return `{ error: '...' }` for a single error or `{ errors: [...] }` for model validations
      const errorMessage =
        error.response?.data?.error ||
        error.response?.data?.errors?.join(", ") ||
        "Failed to update password";

      return rejectWithValue(errorMessage);
    }
  },
);
