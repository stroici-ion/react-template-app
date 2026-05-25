import { CheckCircle2, Circle, Clock } from "lucide-react";
import type { TaskStatus } from "../redux/tasks/types";

interface TaskStatusButtonProps {
  status: TaskStatus;
  onChange?: () => void;
}

export const TaskStatusButton: React.FC<TaskStatusButtonProps> = ({
  status,
  onChange,
}) => {
  return (
    <button
      className="cursor-pointer text-gray-400 hover:text-indigo-600"
      onClick={onChange}
    >
      {status === "todo" ? (
        <Circle size={18} />
      ) : status === "in_progress" ? (
        <Clock size={18} className="text-blue-500" />
      ) : (
        <CheckCircle2 size={18} className="text-green-500" />
      )}
    </button>
  );
};
