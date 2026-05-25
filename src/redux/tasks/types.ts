export const Status = {
  Todo: "todo",
  InProgress: "in_progress",
  Done: "done",
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
  isExpanded?: boolean;
}
