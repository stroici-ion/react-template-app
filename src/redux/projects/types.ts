import type { User } from "../../types/user";

export interface ProjectMember {
  id: number;
  role: "admin" | "member";
  isCreator: boolean;
  user: User;
}

export interface Project {
  id: number;
  name: string;
  description: string | null;
  colorCode: string | null;
  status: string | null;
  creatorId: number;
  createdAt: string;
  updatedAt: string;
  memberCount: number;
  currentUserRole: "admin" | "member" | null;
  members?: ProjectMember[];
}
