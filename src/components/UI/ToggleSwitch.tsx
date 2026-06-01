import React from "react";
import clsx from "clsx";
import { styles } from "../../utils/colors";

interface ToggleSwitchProps {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  color?: string;
  labelColor?: string;
  disabled?: boolean;
}

const labelColorVariants: Record<string, string> = {
  slate: "text-slate-900 dark:text-slate-50",
  blue: "text-blue-900 dark:text-blue-50",
  green: "text-green-900 dark:text-green-50",
  red: "text-red-900 dark:text-red-50",
  yellow: "text-yellow-900 dark:text-yellow-50",
  purple: "text-purple-900 dark:text-purple-50",
  indigo: "text-indigo-900 dark:text-indigo-50",
  pink: "text-pink-900 dark:text-pink-50",
  orange: "text-orange-900 dark:text-orange-50",
  gray: "text-gray-900 dark:text-gray-50",
};

const descriptionColorVariants: Record<string, string> = {
  slate: "text-slate-500 dark:text-slate-400",
  blue: "text-blue-500 dark:text-blue-400",
  green: "text-green-500 dark:text-green-400",
  red: "text-red-500 dark:text-red-400",
  yellow: "text-yellow-500 dark:text-yellow-400",
  purple: "text-purple-500 dark:text-purple-400",
  indigo: "text-indigo-500 dark:text-indigo-400",
  pink: "text-pink-500 dark:text-pink-400",
  orange: "text-orange-500 dark:text-orange-400",
  gray: "text-gray-500 dark:text-gray-400",
};

const toggleColorVariants: Record<string, string> = {
  slate: "peer-checked:bg-slate-600 peer-focus:ring-slate-500",
  blue: "peer-checked:bg-blue-600 peer-focus:ring-blue-500",
  green: "peer-checked:bg-green-600 peer-focus:ring-green-500",
  red: "peer-checked:bg-red-600 peer-focus:ring-red-500",
  yellow: "peer-checked:bg-yellow-500 peer-focus:ring-yellow-500",
  purple: "peer-checked:bg-purple-600 peer-focus:ring-purple-500",
  indigo: "peer-checked:bg-indigo-600 peer-focus:ring-indigo-500",
  pink: "peer-checked:bg-pink-600 peer-focus:ring-pink-500",
  orange: "peer-checked:bg-orange-600 peer-focus:ring-orange-500",
  gray: "peer-checked:bg-gray-600 peer-focus:ring-gray-500",
};

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({
  label,
  description,
  checked,
  onChange,
  color = styles.default.toggle || "blue",
  labelColor = styles.default.inputLabel || "slate",
  disabled = false,
}) => {
  return (
    <label
      className={clsx(
        "group flex items-center justify-between",
        disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer",
      )}
    >
      <div className="flex flex-col pr-4">
        <span
          className={clsx(
            "text-sm font-medium",
            labelColorVariants[labelColor] || labelColorVariants["slate"],
          )}
        >
          {label}
        </span>
        {description && (
          <span
            className={clsx(
              "text-sm",
              descriptionColorVariants[labelColor] ||
                descriptionColorVariants["slate"],
            )}
          >
            {description}
          </span>
        )}
      </div>

      <div className="relative inline-flex items-center">
        <input
          type="checkbox"
          className="peer sr-only"
          checked={checked}
          disabled={disabled}
          onChange={(e) => !disabled && onChange(e.target.checked)}
        />
        <div
          className={clsx(
            "peer h-6 w-11 rounded-full bg-gray-200 dark:border-gray-600 dark:bg-gray-700",
            "after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-['']",
            "peer-checked:after:translate-x-full peer-checked:after:border-white",
            "peer-focus:outline-none peer-focus:ring-2",
            toggleColorVariants[color] || toggleColorVariants["blue"],
          )}
        ></div>
      </div>
    </label>
  );
};

export default ToggleSwitch;
