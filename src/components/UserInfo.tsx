import type { User } from "../types/user";

interface UserInfoProps {
    user?: User;
}

export function UserInfo({ user }: UserInfoProps) {

    if (!user) {
        return null;
    }

    return (
        <div className="flex items-center gap-2">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-200">{user.firstName} {user.lastName}</p>
            <img className="w-6 h-6 rounded-full" src={user.avatarUrl} alt={user.firstName} />
        </div>
    );
}