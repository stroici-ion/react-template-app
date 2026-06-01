import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { logoutUser } from "../redux/auth/asyncThunks";
import { Logo } from "./Logo";
import { UserInfo } from "./UserInfo";
import { selectAuth } from "../redux/auth/selectors";
import ContextMenu from "./UI/ContextMenu";
import MenuOptions from "./UI/MenuOptions";
import ThemeToggle from "./UI/ThemeToggle";
import { FolderKanban, Home, LogOut, Menu, Settings, X } from "lucide-react";

export function Header() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAppSelector(selectAuth);
  const [mobileOpen, setMobileOpen] = useState(false);

  const closeMobile = () => setMobileOpen(false);

  const handleLogout = async () => {
    closeMobile();
    try {
      await dispatch(logoutUser()).unwrap();
      navigate("/auth/login");
    } catch {
      // ignore
    }
  };

  const handleLogin = () => {
    closeMobile();
    navigate("/auth/login");
  };

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-1.5 text-sm font-medium transition-colors ${
      isActive
        ? "text-indigo-600 dark:text-indigo-400"
        : "text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
    }`;

  const mobileNavLinkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
      isActive
        ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400"
        : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
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
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800">
      {/* Main bar */}
      <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 sm:py-4">
        <div className="flex items-center justify-between">
          <Logo />

          {/* Desktop nav links */}
          {isAuthenticated && (
            <nav className="hidden items-center gap-5 sm:flex">
              <NavLink to="/home" className={navLinkClass}>
                <Home size={16} /> Home
              </NavLink>
              <NavLink to="/projects" className={navLinkClass}>
                <FolderKanban size={16} /> Projects
              </NavLink>
            </nav>
          )}

          <div className="flex items-center gap-3">
            <ThemeToggle />

            {/* Desktop user menu */}
            {isAuthenticated && user ? (
              <div className="hidden sm:block">
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
              </div>
            ) : (
              <button
                onClick={handleLogin}
                className="hidden items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors duration-200 hover:bg-blue-700 sm:flex"
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
            )}

            {/* Mobile hamburger */}
            <button
              className="rounded-lg p-2 text-gray-600 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 sm:hidden"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile dropdown menu */}
      {mobileOpen && (
        <div className="border-t border-gray-200 bg-white px-4 pb-4 pt-2 dark:border-gray-700 dark:bg-gray-800 sm:hidden">
          {isAuthenticated && user && (
            <div className="mb-3 flex items-center gap-2.5 rounded-xl bg-gray-50 px-3 py-2.5 dark:bg-gray-700/50">
              <div className="h-2.5 w-2.5 shrink-0 rounded-full bg-green-500" />
              <span className="truncate text-sm font-medium text-gray-800 dark:text-gray-200">
                <UserInfo user={user} />
              </span>
            </div>
          )}

          <nav className="flex flex-col gap-0.5">
            {isAuthenticated ? (
              <>
                <NavLink
                  to="/home"
                  className={mobileNavLinkClass}
                  onClick={closeMobile}
                >
                  <Home size={16} /> Home
                </NavLink>
                <NavLink
                  to="/projects"
                  className={mobileNavLinkClass}
                  onClick={closeMobile}
                >
                  <FolderKanban size={16} /> Projects
                </NavLink>
                <NavLink
                  to="/settings"
                  className={mobileNavLinkClass}
                  onClick={closeMobile}
                >
                  <Settings size={16} /> Settings
                </NavLink>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                >
                  <LogOut size={16} /> Logout
                </button>
              </>
            ) : (
              <button
                onClick={handleLogin}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
              >
                Login
              </button>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
