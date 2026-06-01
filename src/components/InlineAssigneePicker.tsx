import { useEffect, useRef, useState } from "react";
import { UserPlus } from "lucide-react";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { selectTaskById } from "../redux/tasks/selectors";
import { selectProjectMemberUsers } from "../redux/projects/selectors";
import { addTaskAssignee } from "../redux/tasks/asyncThunks";
import type { User } from "../types/user";

interface InlineAssigneePickerProps {
  taskId: number;
  projectId: number;
}

function initials(u: User) {
  return `${u.firstName?.[0] ?? ""}${u.lastName?.[0] ?? ""}`.toUpperCase();
}

export default function InlineAssigneePicker({
  taskId,
  projectId,
}: InlineAssigneePickerProps) {
  const dispatch = useAppDispatch();
  const task = useAppSelector((state) => selectTaskById(state, taskId));
  const memberUsers = useAppSelector((state) =>
    selectProjectMemberUsers(state, projectId),
  );
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
        setQuery("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  if (!task) return null;

  const assigneeIds = task.assigneeIds ?? [];
  const assignedUsers = memberUsers.filter((u) =>
    assigneeIds.includes(Number(u.id)),
  );
  const availableUsers = memberUsers.filter(
    (u) =>
      !assigneeIds.includes(Number(u.id)) &&
      (!query ||
        `${u.firstName} ${u.lastName}`
          .toLowerCase()
          .includes(query.toLowerCase())),
  );

  return (
    <div
      ref={containerRef}
      className="relative flex items-center gap-0.5"
      onClick={(e) => e.stopPropagation()}
    >
      {assignedUsers.map((u) => (
        <div key={u.id} className="group relative">
          {u.avatarUrl ? (
            <img
              src={u.avatarUrl}
              title={`${u.firstName} ${u.lastName}`}
              className="-ml-1 h-5 w-5 rounded-full border border-white object-cover first:ml-0 dark:border-gray-800"
              alt=""
            />
          ) : (
            <span
              title={`${u.firstName} ${u.lastName}`}
              className="-ml-1 flex h-5 w-5 items-center justify-center rounded-full border border-white bg-indigo-500 text-[9px] font-medium text-white first:ml-0 dark:border-gray-800"
            >
              {initials(u)}
            </span>
          )}
        </div>
      ))}

      <button
        onClick={(e) => {
          e.stopPropagation();
          setOpen((v) => !v);
        }}
        className="ml-1 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border border-dashed border-gray-300 text-gray-400 hover:border-indigo-400 hover:text-indigo-500 dark:border-gray-600"
        title="Assign user"
      >
        <UserPlus size={10} />
      </button>

      {open && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="absolute left-0 top-full z-50 mt-1 w-52 rounded-lg border border-gray-200 bg-white shadow-xl dark:border-gray-700 dark:bg-gray-800"
        >
          <div className="border-b border-gray-100 px-2 py-1.5 dark:border-gray-700">
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search members…"
              className="w-full bg-transparent text-xs text-gray-800 placeholder-gray-400 focus:outline-none dark:text-gray-100"
            />
          </div>
          {availableUsers.length === 0 ? (
            <div className="px-3 py-2 text-xs text-gray-400">
              {memberUsers.length === 0
                ? "No project members loaded"
                : "No more members to add"}
            </div>
          ) : (
            <ul className="max-h-40 overflow-y-auto py-1">
              {availableUsers.map((u) => (
                <li key={u.id}>
                  <button
                    onClick={() => {
                      dispatch(
                        addTaskAssignee({ taskId, userId: Number(u.id) }),
                      );
                      setQuery("");
                    }}
                    className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-xs hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    {u.avatarUrl ? (
                      <img
                        src={u.avatarUrl}
                        className="h-5 w-5 rounded-full object-cover"
                        alt=""
                      />
                    ) : (
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-500 text-[9px] font-medium text-white">
                        {initials(u)}
                      </span>
                    )}
                    <span className="text-gray-800 dark:text-gray-100">
                      {u.firstName} {u.lastName}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
