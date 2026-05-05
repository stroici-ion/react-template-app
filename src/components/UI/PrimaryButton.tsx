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
}

type ButtonProps = BaseButtonProps &
  (
    | { text: string; icon?: React.ReactNode }
    | { text?: string; icon: React.ReactNode }
  );

const solidVariants: Record<string, string> = {
  slate: "bg-slate-600 hover:bg-slate-700 text-white",
  blue: "bg-blue-600 hover:bg-blue-700 text-white",
  green: "bg-green-600 hover:bg-green-700 text-white",
  red: "bg-red-600 hover:bg-red-700 text-white",
  yellow: "bg-yellow-500 hover:bg-yellow-600 text-white",
  purple: "bg-purple-600 hover:bg-purple-700 text-white",
  indigo: "bg-indigo-600 hover:bg-indigo-700 text-white",
  pink: "bg-pink-600 hover:bg-pink-700 text-white",
  orange: "bg-orange-600 hover:bg-orange-700 text-white",
  gray: "bg-gray-600 hover:bg-gray-700 text-white",
};

const outlineVariants: Record<string, string> = {
  slate:
    "border-2 border-slate-600 text-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800",
  blue: "border-2 border-blue-600 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-800",
  green:
    "border-2 border-green-600 text-green-600 hover:bg-green-50 dark:hover:bg-green-800",
  red: "border-2 border-red-600 text-red-600 hover:bg-red-50 dark:hover:bg-red-800",
  yellow:
    "border-2 border-yellow-600 text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-800",
  purple:
    "border-2 border-purple-600 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-800",
  indigo:
    "border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-800",
  pink: "border-2 border-pink-600 text-pink-600 hover:bg-pink-50 dark:hover:bg-pink-800",
  orange:
    "border-2 border-orange-600 text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-800",
  gray: "border-2 border-gray-600 text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800",
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
}) => {
  const baseStyles =
    "py-3 px-4 rounded-lg text-sm font-semibold transition-colors duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed";

  const currentVariantStyles = outline
    ? outlineVariants[color]
    : solidVariants[color];

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={loading}
      className={clsx(baseStyles, currentVariantStyles, className)}
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
