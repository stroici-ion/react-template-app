import clsx from "clsx";
import { styles } from "../../utils/colors";

interface CardProps {
  color?: string;
  className?: string;
  children: React.ReactNode;
  maxWidth?: "none" | "medium" | "large" | "xlarge";
}

const colorVariants: Record<string, string> = {
  slate:
    "bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800",
  blue: "bg-blue-50 dark:bg-blue-800 border border-blue-200 dark:border-blue-800",
  green:
    "bg-green-50 dark:bg-green-800 border border-green-200 dark:border-green-800",
  red: "bg-red-50 dark:bg-red-800 border border-red-200 dark:border-red-800",
  yellow:
    "bg-yellow-50 dark:bg-yellow-800 border border-yellow-200 dark:border-yellow-800",
  purple:
    "bg-purple-50 dark:bg-purple-800 border border-purple-200 dark:border-purple-800",
  indigo:
    "bg-indigo-50 dark:bg-indigo-800 border border-indigo-200 dark:border-indigo-800",
  pink: "bg-pink-50 dark:bg-pink-800 border border-pink-200 dark:border-pink-800",
  orange:
    "bg-orange-50 dark:bg-orange-800 border border-orange-200 dark:border-orange-800",
  gray: "bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-800",
};

const maxWidthVariants = {
  none: "max-w-none",
  medium: "max-w-md",
  large: "max-w-lg",
  xlarge: "max-w-xl",
};

const Card: React.FC<CardProps> = ({
  children,
  className,
  color = styles.default.card || "slate",
  maxWidth = "medium",
}) => {
  return (
    <div
      className={clsx(
        colorVariants[color],
        maxWidthVariants[maxWidth],
        "w-full rounded-xl p-4 shadow-2xl sm:p-8",
        className,
      )}
    >
      {children}
    </div>
  );
};

export default Card;
