import React from "react";

interface MenuOption {
  icon?: React.ReactNode;
  title: string;
  subtitle?: string;
  color?: string; // Text color
  background?: string;
  backgroundHover?: string;
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
        // Fallback: iconColor defaults to text color (color) if not provided
        const finalIconColor = option.iconColor || option.color || "inherit";

        return (
          <button
            key={index}
            onClick={(e) => {
              e.stopPropagation(); // Prevents trigger conflicts
              option.onClick();
            }}
            className="group flex w-full cursor-pointer items-center px-3 py-3 text-left transition-colors duration-200"
            style={{
              backgroundColor: option.background || "transparent",
              color: option.color || "#374151", // Default gray-700
            }}
            // Note: For dynamic hover backgrounds that aren't in Tailwind's registry,
            // we use onMouseEnter/Leave or standard CSS.
            onMouseEnter={(e) => {
              if (option.backgroundHover)
                e.currentTarget.style.backgroundColor = option.backgroundHover;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor =
                option.background || "transparent";
            }}
          >
            {/* Icon Slot */}
            {option.icon && (
              <div
                className="mr-3 flex-shrink-0"
                style={{ color: finalIconColor }}
              >
                {option.icon}
              </div>
            )}

            {/* Text Content */}
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
