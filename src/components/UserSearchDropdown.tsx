import { useEffect, useMemo, useRef, useState } from "react";
import { Search, X } from "lucide-react";
import { api } from "../api/axios";
import parseApiResponse from "../utils/api";
import type { User } from "../types/user";
import { useClickOutside } from "../hooks/useClickOutside";

interface UserSearchDropdownProps {
  projectId: number;
  selectedUsers: User[];
  onAdd: (user: User) => void;
  onRemove: (user: User) => void;
  label?: string;
}

export default function UserSearchDropdown({
  projectId,
  selectedUsers,
  onAdd,
  onRemove,
  label = "Assignees",
}: UserSearchDropdownProps) {
  const [query, setQuery] = useState("");
  const [fetchedUsers, setFetchedUsers] = useState<User[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { ref: dropdownRef } = useClickOutside<HTMLDivElement>(
    () => setOpen(false),
    open,
  );

  const results = useMemo(
    () => fetchedUsers.filter((u) => !selectedUsers.some((s) => s.id === u.id)),
    [fetchedUsers, selectedUsers],
  );

  useEffect(() => {
    const timeout = setTimeout(async () => {
      setLoading(true);
      try {
        const response = await api.get("/users", {
          params: {
            project_id: projectId,
            q: query || undefined,
            per_page: 15,
          },
        });
        const data = parseApiResponse(response.data) as { users: User[] };
        setFetchedUsers(data.users);
      } catch {
        setFetchedUsers([]);
      } finally {
        setLoading(false);
      }
    }, 250);
    return () => clearTimeout(timeout);
  }, [query, projectId]);

  const initials = (user: User) =>
    `${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}`.toUpperCase();

  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-gray-900 dark:text-gray-50">
        {label}
      </label>

      {selectedUsers.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-1">
          {selectedUsers.map((user) => (
            <span
              key={user.id}
              className="flex items-center gap-1 rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300"
            >
              {user.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  className="h-4 w-4 rounded-full object-cover"
                  alt=""
                />
              ) : (
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-indigo-500 text-[9px] text-white">
                  {initials(user)}
                </span>
              )}
              {user.firstName} {user.lastName}
              <button
                onClick={() => onRemove(user)}
                className="ml-0.5 text-indigo-500 hover:text-indigo-800 dark:hover:text-indigo-100"
              >
                <X size={12} />
              </button>
            </span>
          ))}
        </div>
      )}

      <div className="relative" ref={dropdownRef}>
        <div className="flex items-center gap-2 rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 dark:border-gray-600 dark:bg-gray-700">
          <Search size={14} className="shrink-0 text-gray-400" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setOpen(true)}
            placeholder="Search by name…"
            className="w-full bg-transparent text-sm text-gray-900 placeholder-gray-400 focus:outline-none dark:text-gray-50"
          />
        </div>

        {open && (
          <div className="absolute z-50 mt-1 w-full rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800">
            {loading ? (
              <div className="px-3 py-2 text-sm text-gray-400">Searching…</div>
            ) : results.length === 0 ? (
              <div className="px-3 py-2 text-sm text-gray-400">
                {query ? "No users found" : "No more project members to add"}
              </div>
            ) : (
              <ul className="max-h-48 overflow-y-auto py-1">
                {results.map((user) => (
                  <li key={user.id}>
                    <button
                      onClick={() => {
                        onAdd(user);
                        setQuery("");
                        inputRef.current?.focus();
                      }}
                      className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      {user.avatarUrl ? (
                        <img
                          src={user.avatarUrl}
                          className="h-6 w-6 rounded-full object-cover"
                          alt=""
                        />
                      ) : (
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-500 text-[10px] font-medium text-white">
                          {initials(user)}
                        </span>
                      )}
                      <span className="text-gray-800 dark:text-gray-100">
                        {user.firstName} {user.lastName}
                      </span>
                      <span className="ml-auto text-xs text-gray-400">
                        {user.email}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
