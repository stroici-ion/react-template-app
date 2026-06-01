import { FolderKanban, Home } from "lucide-react";
import { NavLink } from "react-router-dom";
import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex flex-col items-center gap-2 sm:items-start">
            <Logo />
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Manage your projects and tasks efficiently.
            </p>
          </div>

          <nav className="flex items-center gap-6">
            <NavLink
              to="/home"
              className="flex items-center gap-1.5 text-sm text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
            >
              <Home size={14} /> Home
            </NavLink>
            <NavLink
              to="/projects"
              className="flex items-center gap-1.5 text-sm text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
            >
              <FolderKanban size={14} /> Projects
            </NavLink>
          </nav>
        </div>

        <div className="mt-6 border-t border-gray-200 pt-4 dark:border-gray-700">
          <p className="text-center text-xs text-gray-400 dark:text-gray-500">
            &copy; {new Date().getFullYear()} Horizon. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
