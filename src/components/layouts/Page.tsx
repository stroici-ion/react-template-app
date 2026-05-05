import React from "react";
import clsx from "clsx";
import { styles } from "../../utils/colors";

interface PageProps {
  color?: string;
  className?: string;
  children: React.ReactNode;
}

const pageColorVariants: Record<string, string> = {
  slate: "bg-slate-100 text-slate-900 dark:bg-slate-900 dark:text-slate-50",
  blue: "bg-blue-100 text-blue-900 dark:bg-blue-900 dark:text-blue-50",
  green: "bg-green-100 text-green-900 dark:bg-green-900 dark:text-green-50",
  red: "bg-red-100 text-red-900 dark:bg-red-900 dark:text-red-50",
  yellow:
    "bg-yellow-100 text-yellow-900 dark:bg-yellow-900 dark:text-yellow-50",
  purple:
    "bg-purple-100 text-purple-900 dark:bg-purple-900 dark:text-purple-50",
  indigo:
    "bg-indigo-100 text-indigo-900 dark:bg-indigo-900 dark:text-indigo-50",
  pink: "bg-pink-100 text-pink-900 dark:bg-pink-900 dark:text-pink-50",
  orange:
    "bg-orange-100 text-orange-900 dark:bg-orange-900 dark:text-orange-50",
  gray: "bg-gray-100 text-gray-900 dark:bg-gray-900 dark:text-gray-50",
};

const Page: React.FC<PageProps> = ({
  children,
  className,
  color = styles.default.page || "slate",
}) => {
  return (
    <div
      className={clsx(
        "flex min-h-screen items-center justify-center transition-colors duration-200",
        pageColorVariants[color],
        className,
      )}
    >
      {children}
    </div>
  );
};

export default Page;
