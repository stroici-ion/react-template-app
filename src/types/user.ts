export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  avatarUrl: string;
  authMethod: "email" | "google" | "both";
  loginAlertsEnabled: boolean;
  pendingEmail?: string | null;
}
