import React from "react";
import { Outlet } from "react-router-dom";
import AsideNavigation from "../components/AsideNavigation";
import { Shield, User } from "lucide-react";
import { Header } from "../components/Header";
import Title from "../components/UI/Title";

export interface SettingsTab {
  path: string;
  label: string;
  icon: React.ComponentType<{ size?: number }>;
}

const Settings: React.FC = () => {
  const tabs: SettingsTab[] = [
    { path: "/settings/personal-info", label: "Personal Info", icon: User },
    { path: "/settings/security", label: "Security", icon: Shield },
  ];

  return (
    <div className="min-h-screen bg-gray-100 font-sans text-gray-900 dark:bg-gray-900 dark:text-white">
      <Header />
      <div className="bg-gray-100 px-4 py-8 dark:bg-gray-900 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <Title
            text="Settings"
            color="gray"
            className="mb-8"
            colorIntensity="intense"
          />
          <div className="flex flex-col gap-8 md:flex-row">
            {/* Sidebar */}
            <AsideNavigation tabs={tabs} />

            {/* Page Content Area (Rendered via Router) */}
            <main className="flex-1">
              <Outlet />
            </main>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
