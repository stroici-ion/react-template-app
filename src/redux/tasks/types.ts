export const Status = {
  Backlog: "backlog",
  Todo: "todo",
  InProgress: "in_progress",
  Closed: "closed",
  Cancelled: "cancelled",
} as const;

export type TaskStatus = (typeof Status)[keyof typeof Status];

export interface Task {
  id: number;
  title: string;
  description: string;
  status: TaskStatus;
  startDate: string | null;
  dueDate: string | null;
  projectId: number;
  parentId: number | null;
  assigneeIds: number[];
  isExpanded?: boolean;
}
