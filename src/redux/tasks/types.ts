export const Status = {
  Backlog: "backlog",
  Todo: "todo",
  InProgress: "in_progress",
  Closed: "closed",
  Cancelled: "cancelled",
} as const;

export type TaskStatus = (typeof Status)[keyof typeof Status];

export const Priority = {
  P0: "p0",
  P1: "p1",
  P2: "p2",
  P3: "p3",
} as const;

export type TaskPriority = (typeof Priority)[keyof typeof Priority];

export const PRIORITY_LABELS: Record<string, string> = {
  p0: "P0 — Critical",
  p1: "P1 — High",
  p2: "P2 — Medium",
  p3: "P3 — Low",
};

export const PRIORITY_COLORS: Record<string, string> = {
  p0: "red",
  p1: "orange",
  p2: "yellow",
  p3: "blue",
};

export const PRIORITY_SHORT: Record<string, string> = {
  p0: "P0",
  p1: "P1",
  p2: "P2",
  p3: "P3",
};

export interface Task {
  id: number;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority | null;
  startDate: string | null;
  dueDate: string | null;
  projectId: number;
  parentId: number | null;
  assigneeIds: number[];
  isExpanded?: boolean;
}
