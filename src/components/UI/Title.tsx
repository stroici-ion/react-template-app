import clsx from "clsx";
import React from "react";
import { styles } from "../../utils/colors";

interface TitleProps {
  text: string;
  icon?: React.ReactNode;
  iconSize?: number;
  iconColor?: string;
  color?: string;
  className?: string;
  iconClassName?: string;
  iconPosition?: "left" | "right";
  colorIntensity?: "intense" | "soft";
}

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

const Title: React.FC<TitleProps> = ({
  text,
  icon,
  iconSize = 24,
  iconColor = styles.default.title || "slate",
  iconPosition = "left",
  color = styles.default.title || "slate",
  colorIntensity = "soft",
  className = "",
  iconClassName = "",
}) => {
  if (!text) return null;

  const titleColorClasses =
    colorVariants[color]?.[colorIntensity] || colorVariants["slate"]["soft"];

  const iconColorClasses =
    colorVariants[iconColor]?.[colorIntensity] ||
    colorVariants["slate"]["soft"];

  const renderIcon = () => {
    if (!icon) return null;
    return (
      <span
        className={clsx(
          iconColorClasses,
          "flex items-center justify-center",
          iconClassName,
        )}
        style={{ width: iconSize, height: iconSize }}
      >
        {icon}
      </span>
    );
  };

  return (
    <h2
      className={clsx(
        "flex items-center gap-2 text-3xl font-bold",
        titleColorClasses,
        className,
      )}
    >
      {icon && iconPosition === "left" && renderIcon()}
      {text}
      {icon && iconPosition === "right" && renderIcon()}
    </h2>
  );
};

export default Title;
