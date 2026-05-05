import clsx from "clsx";
import { styles } from "../../utils/colors";

interface TextProps {
  text: string;
  size?: "xs" | "sm" | "base" | "lg" | "xl" | "2xl";
  color?: string;
  className?: string;
  colorIntensity?: "intense" | "soft";
}

const sizeVariants: Record<string, string> = {
  xs: "text-xs",
  sm: "text-sm",
  base: "text-base",
  lg: "text-lg",
  xl: "text-xl",
  "2xl": "text-2xl",
};

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

export default function Text({
  text,
  size = "sm",
  color = styles.default.text || "slate",
  colorIntensity = "soft",
  className = "",
}: TextProps) {
  const currentSize = sizeVariants[size] || sizeVariants["sm"];
  const currentColorClasses =
    colorVariants[color]?.[colorIntensity] || colorVariants["slate"]["soft"];

  return (
    <p className={clsx(currentColorClasses, currentSize, className)}>{text}</p>
  );
}
