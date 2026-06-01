import { memo, useEffect, useState } from "react";
import { Crown, Shield, Trash2, UserPlus } from "lucide-react";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import {
  addProjectMember,
  fetchProjectMembers,
  removeProjectMember,
  updateMemberRole,
} from "../redux/projects/asyncThunks";
import { selectProjectMembers } from "../redux/projects/selectors";
import { selectAuth } from "../redux/auth/selectors";
import type { ProjectMember } from "../redux/projects/types";
import { Input } from "./UI/Input";
import PrimaryButton from "./UI/PrimaryButton";

interface MembersListProps {
  projectId: number;
  creatorId: number;
  currentUserRole: "admin" | "member" | null;
}

const MembersList = memo(function MembersList({
  projectId,
  creatorId,
  currentUserRole,
}: MembersListProps) {
  const dispatch = useAppDispatch();
  const members = useAppSelector((state) =>
    selectProjectMembers(state, projectId),
  );
  const { user: currentUser } = useAppSelector(selectAuth);
  const [email, setEmail] = useState("");
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchProjectMembers({ projectId }));
  }, [dispatch, projectId]);

  const isAdmin = currentUserRole === "admin";

  const handleAdd = async () => {
    if (!email.trim()) return;
    setAdding(true);
    setAddError(null);
    try {
      await dispatch(
        addProjectMember({ projectId, email: email.trim() }),
      ).unwrap();
      setEmail("");
    } catch (e: any) {
      setAddError(e as string);
    } finally {
      setAdding(false);
    }
  };

  const handleRoleToggle = (member: ProjectMember) => {
    const newRole = member.role === "admin" ? "member" : "admin";
    dispatch(
      updateMemberRole({ projectId, membershipId: member.id, role: newRole }),
    );
  };

  const handleRemove = (member: ProjectMember) => {
    if (
      !confirm(
        `Remove ${member.user.firstName} ${member.user.lastName} from this project?`,
      )
    )
      return;
    dispatch(removeProjectMember({ projectId, membershipId: member.id }));
  };

  const initials = (m: ProjectMember) =>
    `${m.user.firstName?.[0] ?? ""}${m.user.lastName?.[0] ?? ""}`.toUpperCase();

  return (
    <div className="space-y-4">
      {isAdmin && (
        <div className="flex gap-2">
          <div className="flex-1">
            <Input
              id="add-member-email"
              placeholder="Enter email address…"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            />
            {addError && (
              <p className="mt-1 text-xs text-red-500">{addError}</p>
            )}
          </div>
          <PrimaryButton
            text="Add"
            icon={<UserPlus size={16} />}
            onClick={handleAdd}
            loading={adding}
          />
        </div>
      )}

      <div className="divide-y divide-gray-100 dark:divide-gray-700">
        {members.map((member) => {
          const isCreator = member.user.id === creatorId;
          const isSelf = member.user.id === currentUser?.id;

          return (
            <div key={member.id} className="flex items-center gap-3 py-3">
              {member.user.avatarUrl ? (
                <img
                  src={member.user.avatarUrl}
                  className="h-9 w-9 rounded-full object-cover"
                  alt=""
                />
              ) : (
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-500 text-sm font-medium text-white">
                  {initials(member)}
                </span>
              )}

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-gray-900 dark:text-gray-50">
                  {member.user.firstName} {member.user.lastName}
                  {isSelf && (
                    <span className="ml-1 text-xs text-gray-400">(you)</span>
                  )}
                </p>
                <p className="truncate text-xs text-gray-500">
                  {member.user.email}
                </p>
              </div>

              <div className="flex items-center gap-2">
                {isCreator ? (
                  <span className="flex items-center gap-1 rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">
                    <Crown size={11} /> Creator
                  </span>
                ) : (
                  <span
                    className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                      member.role === "admin"
                        ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400"
                        : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300"
                    }`}
                  >
                    {member.role === "admin" && <Shield size={11} />}
                    {member.role === "admin" ? "Admin" : "Member"}
                  </span>
                )}

                {isAdmin && !isCreator && (
                  <>
                    <button
                      onClick={() => handleRoleToggle(member)}
                      title={`Change to ${member.role === "admin" ? "member" : "admin"}`}
                      className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-indigo-600 dark:hover:bg-gray-700"
                    >
                      <Shield size={15} />
                    </button>
                    <button
                      onClick={() => handleRemove(member)}
                      title="Remove member"
                      className="rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20"
                    >
                      <Trash2 size={15} />
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
});

export default MembersList;
