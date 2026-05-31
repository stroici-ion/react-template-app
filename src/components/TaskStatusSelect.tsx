import { useEffect, useRef, useState } from "react";
import { Archive, CheckCircle2, Circle, Clock, XCircle } from "lucide-react";
import { Status, type TaskStatus } from "../redux/tasks/types";
import ContextMenu from "./UI/ContextMenu";
import MenuOptions from "./UI/MenuOptions";

const STATUS_OPTIONS: {
  value: TaskStatus;
  label: string;
  icon: React.ReactNode;
}[] = [
    {
      value: Status.Backlog,
      label: "Backlog",
      icon: <Archive size={14} className="text-gray-400" />,
    },
    {
      value: Status.Todo,
      label: "Todo",
      icon: <Circle size={14} className="text-gray-500" />,
    },
    {
      value: Status.InProgress,
      label: "In Progress",
      icon: <Clock size={14} className="text-yellow-500" />,
    },
    {
      value: Status.Closed,
      label: "Closed",
      icon: <CheckCircle2 size={14} className="text-green-500" />,
    },
    {
      value: Status.Cancelled,
      label: "Cancelled",
      icon: <XCircle size={14} className="text-red-400" />,
    },
  ];

function currentIcon(status: TaskStatus, size = 18) {
  switch (status) {
    case Status.Backlog:
      return <Archive size={size} className="text-gray-400" />;
    case Status.Todo:
      return <Circle size={size} className="text-gray-500" />;
    case Status.InProgress:
      return <Clock size={size} className="text-yellow-500" />;
    case Status.Closed:
      return <CheckCircle2 size={size} className="text-green-500" />;
    case Status.Cancelled:
      return <XCircle size={size} className="text-red-400" />;
  }
}

interface TaskStatusSelectProps {
  status: TaskStatus;
  onChange: (status: TaskStatus) => void;
}

export default function TaskStatusSelect({
  status,
  onChange,
}: TaskStatusSelectProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  <div onClick={(e) => e.stopPropagation()}>
    {STATUS_OPTIONS.map((opt) => (
      <button
        key={opt.value}
        onClick={() => {
          setOpen(false);
        }}
        className={`flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 ${status === opt.value ? "font-semibold" : ""}`}
      >
        {opt.icon}
        <span className="text-gray-800 dark:text-gray-100">{opt.label}</span>
      </button>
    ))}
  </div>;

  const userMenuOptions = STATUS_OPTIONS.map((i) => {
    return {
      icon: i.icon,
      title: i.label,
      onClick: () => onChange(i.value),
    };
  });

  return (
    <div ref={containerRef} className="flex items-center">
      <ContextMenu
        triggerElement={
          <button
            className="flex cursor-pointer items-center p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-200 dark:hover:bg-gray-950"
            title="Change status"
          >
            {currentIcon(status)}
          </button>
        }
        body={<MenuOptions options={userMenuOptions} />}
      ></ContextMenu>
    </div>
  );
}
