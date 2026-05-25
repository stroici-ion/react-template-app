import React from "react";
import clsx from "clsx";
import Loader from "./Loader";
import { styles } from "../../utils/colors";

interface BaseButtonProps {
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  color?: string;
  outline?: boolean;
  className?: string;
  type?: "button" | "submit" | "reset";
  loading?: boolean;
  size?: "xs" | "sm" | "md" | "lg";
}

type ButtonProps = BaseButtonProps &
  (
    | { text: string; icon?: React.ReactNode }
    | { text?: string; icon: React.ReactNode }
  );

const solidVariants: Record<string, string> = {
  slate: "bg-slate-600 hover:bg-slate-700 text-white border-slate-500",
  blue: "bg-blue-600 hover:bg-blue-700 text-white border-blue-500",
  green: "bg-green-600 hover:bg-green-700 text-white border-green-500",
  red: "bg-red-600 hover:bg-red-700 text-white border-red-500",
  yellow: "bg-yellow-500 hover:bg-yellow-600 text-white border-yellow-500",
  purple: "bg-purple-600 hover:bg-purple-700 text-white border-purple-500",
  indigo:
    "bg-indigo-600 hover:bg-indigo-700 text-white border-indigo-500 border-indigo-500",
  pink: "bg-pink-600 hover:bg-pink-700 text-white border-pink-500",
  orange: "bg-orange-600 hover:bg-orange-700 text-white border-orange-500",
  gray: "bg-gray-600 hover:bg-gray-700 text-white border-gray-500",
};

const outlineVariants: Record<string, string> = {
  slate:
    "border-slate-400 text-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800 dark:border-slate-600",
  blue: "border-blue-600 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-800",
  green:
    "border-green-600 text-green-600 hover:bg-green-50 dark:hover:bg-green-800",
  red: "border-red-600 text-red-600 hover:bg-red-50 dark:hover:bg-red-800",
  yellow:
    "border-yellow-600 text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-800",
  purple:
    "border-purple-600 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-800",
  indigo:
    "border-indigo-600 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-800",
  pink: "border-pink-600 text-pink-600 hover:bg-pink-50 dark:hover:bg-pink-800",
  orange:
    "border-orange-600 text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-800",
  gray: "border-gray-600 text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800",
};

const sizeVariants: Record<string, string> = {
  xs: "py-1.5 px-2 text-xs border rounded-md gap-1",
  sm: "py-2 px-3 text-sm border rounded-md gap-2",
  md: "py-3 px-4 text-sm border-2 rounded-lg semibold gap-2",
  lg: "py-4 px-5 text-md border-2 rounded-lg semibold gap-2",
};

const PrimaryButton: React.FC<ButtonProps> = ({
  text,
  icon,
  onClick,
  color = styles.primary || "blue",
  outline = false,
  className = "",
  type = "button",
  loading = false,
  size = "md",
}) => {
  const baseStyles =
    "transition-colors duration-200 flex items-center justify-center cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed";

  const currentVariantStyles = outline
    ? outlineVariants[color]
    : solidVariants[color];

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={loading}
      className={clsx(
        baseStyles,
        currentVariantStyles,
        sizeVariants[size],
        className,
      )}
    >
      {loading ? (
        <Loader className="h-5 w-5" />
      ) : (
        <>
          {icon && <span className="flex items-center">{icon}</span>}
          {text}
        </>
      )}
    </button>
  );
};

export default PrimaryButton;
