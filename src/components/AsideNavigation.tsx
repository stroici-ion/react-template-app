import React from "react";
import { NavLink } from "react-router-dom";
import type { SettingsTab } from "../pages/Settings";

const AsideNavigation: React.FC<{ tabs: SettingsTab[] }> = ({ tabs }) => {
  return (
    <aside className="w-full shrink-0 md:w-64">
      <nav className="flex flex-col gap-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;

          return (
            <NavLink
              key={tab.path}
              to={tab.path}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-indigo-600 text-white"
                    : "text-gray-700 hover:bg-gray-200 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white"
                }`
              }
            >
              <Icon size={18} />
              {tab.label}
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
};

export default AsideNavigation;
