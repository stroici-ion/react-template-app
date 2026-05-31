import { NavLink, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { logoutUser } from "../redux/auth/asyncThunks";
import { Logo } from "./Logo";
import { UserInfo } from "./UserInfo";
import { selectAuth } from "../redux/auth/selectors";
import ContextMenu from "./UI/ContextMenu";
import MenuOptions from "./UI/MenuOptions";
import ThemeToggle from "./UI/ThemeToggle";
import { FolderKanban, Home, LogOut, Settings } from "lucide-react";

export function Header() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAppSelector(selectAuth);

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
      navigate("/auth/login");
    } catch {
      // ignore
    }
  };

  const handleLogin = () => navigate("/auth/login");

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-1.5 text-sm font-medium transition-colors ${
      isActive
        ? "text-indigo-600 dark:text-indigo-400"
        : "text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
    }`;

  const userMenuOptions = [
    {
      icon: <Settings size={18} />,
      title: "Settings",
      backgroundHover: "#f1f1f1",
      subtitle: "Manage your account",
      onClick: () => navigate("/settings"),
    },
    {
      icon: <LogOut size={18} />,
      title: "Logout",
      color: "#ef4444",
      iconColor: "#b91c1c",
      backgroundHover: "#fee2e2",
      onClick: handleLogout,
    },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white px-6 py-4 shadow-lg dark:border-gray-700 dark:bg-gray-800">
      <nav className="mx-auto flex max-w-7xl items-center justify-between">
        <Logo />

        {isAuthenticated && (
          <nav className="flex items-center gap-5">
            <NavLink to="/home" className={navLinkClass}>
              <Home size={16} /> Home
            </NavLink>
            <NavLink to="/projects" className={navLinkClass}>
              <FolderKanban size={16} /> Projects
            </NavLink>
          </nav>
        )}

        <div className="flex items-center gap-6">
          <ThemeToggle />
          {isAuthenticated && user ? (
            <ContextMenu
              maxWidth="200px"
              triggerElement={
                <div className="flex items-center gap-3 rounded-full border border-gray-200 bg-gray-100 px-4 py-2 dark:border-gray-600 dark:bg-gray-700/50">
                  <div
                    className={`h-3 w-3 rounded-full ${isAuthenticated ? "bg-green-500" : "bg-red-500"}`}
                  />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                    {isAuthenticated && <UserInfo user={user} />}
                  </span>
                </div>
              }
              body={<MenuOptions options={userMenuOptions} />}
            />
          ) : (
            <>
              <button
                onClick={handleLogin}
                className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors duration-200 hover:bg-blue-700"
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                  />
                </svg>
                Login
              </button>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
