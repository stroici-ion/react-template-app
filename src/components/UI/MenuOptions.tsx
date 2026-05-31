import clsx from "clsx";
import React from "react";

interface MenuOption {
  icon?: React.ReactNode;
  title: string;
  subtitle?: string;
  color?: string;
  iconColor?: string;
  onClick: () => void;
}

interface MenuOptionsProps {
  options: MenuOption[];
}

const MenuOptions: React.FC<MenuOptionsProps> = ({ options }) => {
  return (
    <div className="flex w-full flex-col overflow-hidden rounded-md">
      {options.map((option, index) => {
        return (
          <button
            key={index}
            onClick={() => option.onClick()}
            className={clsx(
              `group flex w-full cursor-pointer items-center px-3 py-3 text-left transition-colors duration-200`,
              `${option.color ? option.color : "text-gray-800 hover:bg-gray-50 dark:text-gray-100 hover:dark:bg-gray-900"}`,
            )}
          >
            {option.icon && (
              <div className={`mr-3 flex-shrink-0 ${option.iconColor}`}>
                {option.icon}
              </div>
            )}

            <div className="flex flex-col overflow-hidden">
              <span className="truncate text-sm font-semibold">
                {option.title}
              </span>
              {option.subtitle && (
                <span className="truncate text-xs opacity-70">
                  {option.subtitle}
                </span>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
};

export default MenuOptions;
