// --- Types ---

import type { User } from "../../types/user";

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
  initialized: boolean;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
}

export interface UpdatePasswordPayload {
  old_password: string;
  new_password: string;
  new_password_confirmation: string;
}
