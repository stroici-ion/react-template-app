import { Archive, CheckCircle2, Circle, Clock, XCircle } from "lucide-react";
import type { TaskStatus } from "../redux/tasks/types";

interface TaskStatusButtonProps {
  status: TaskStatus;
  onChange?: () => void;
}

export const TaskStatusButton: React.FC<TaskStatusButtonProps> = ({
  status,
  onChange,
}) => {
  const icon =
    status === "todo" ? (
      <Circle size={18} />
    ) : status === "in_progress" ? (
      <Clock size={18} className="text-yellow-500" />
    ) : status === "closed" ? (
      <CheckCircle2 size={18} className="text-green-500" />
    ) : status === "cancelled" ? (
      <XCircle size={18} className="text-red-400" />
    ) : (
      <Archive size={18} className="text-gray-400" />
    );

  return (
    <button
      className="cursor-pointer text-gray-400 hover:text-indigo-600"
      onClick={onChange}
    >
      {icon}
    </button>
  );
};
