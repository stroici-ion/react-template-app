import React from "react";
import Loader from "./Loader";
import { Link } from "react-router-dom";
import clsx from "clsx";

interface BaseButtonProps {
  onClick?: (
    e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>,
  ) => void;
  to?: string;
  color?: string;
  colorIntensity?: "intense" | "soft";
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

const colorVariants: Record<string, Record<"intense" | "soft", string>> = {
  slate: {
    intense: "text-slate-900 dark:text-slate-50",
    soft: "text-slate-600 dark:text-slate-400",
  },
  blue: {
    intense: "text-blue-900 dark:text-blue-50",
    soft: "text-blue-600 dark:text-blue-400",
  },
  green: {
    intense: "text-green-900 dark:text-green-50",
    soft: "text-green-600 dark:text-green-400",
  },
  red: {
    intense: "text-red-900 dark:text-red-50",
    soft: "text-red-600 dark:text-red-400",
  },
  yellow: {
    intense: "text-yellow-900 dark:text-yellow-50",
    soft: "text-yellow-600 dark:text-yellow-400",
  },
  purple: {
    intense: "text-purple-900 dark:text-purple-50",
    soft: "text-purple-600 dark:text-purple-400",
  },
  indigo: {
    intense: "text-indigo-900 dark:text-indigo-50",
    soft: "text-indigo-600 dark:text-indigo-400",
  },
  pink: {
    intense: "text-pink-900 dark:text-pink-50",
    soft: "text-pink-600 dark:text-pink-400",
  },
  orange: {
    intense: "text-orange-900 dark:text-orange-50",
    soft: "text-orange-600 dark:text-orange-400",
  },
  gray: {
    intense: "text-gray-900 dark:text-gray-50",
    soft: "text-gray-600 dark:text-gray-400",
  },
};

const TextButton: React.FC<ButtonProps> = ({
  text,
  icon,
  onClick,
  to,
  color = "blue",
  colorIntensity = "soft",
  className = "",
  type = "button",
  loading = false,
  size = "md",
}) => {
  const baseStyles =
    "inline-flex items-center justify-center transition-all duration-200 cursor-pointer bg-transparent border-none p-0 outline-none hover:opacity-80";

  const dynamicColorStyles =
    colorVariants[color]?.[colorIntensity] || colorVariants["blue"]["soft"];

  const sizeVariants: Record<string, string> = {
    xs: "gap-1 text-xs",
    sm: "gap-1 text-sm",
    md: "gap-1.5 text-sm semibold",
    lg: "gap-2 text-md semibold",
  };

  const combinedClasses = clsx(
    baseStyles,
    dynamicColorStyles,
    loading && "opacity-50 pointer-events-none",
    sizeVariants[size],
    className,
  );

  const content = (
    <>
      {loading ? (
        <Loader className="h-4 w-4" />
      ) : (
        <>
          {icon && <span className="flex items-center">{icon}</span>}
          {text && <span className="hover:underline">{text}</span>}
        </>
      )}
    </>
  );

  if (to) {
    return (
      <Link to={to} className={combinedClasses} onClick={onClick}>
        {content}
      </Link>
    );
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={loading}
      className={combinedClasses}
    >
      {content}
    </button>
  );
};

export default TextButton;
