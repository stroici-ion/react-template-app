import clsx from "clsx";
import React from "react";
import { styles } from "../../utils/colors";

interface TextareaProps {
  id: string;
  label?: string;
  value?: string;
  placeholder?: string;
  rows?: number;
  color?: string;
  className?: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  error?: string;
}

const inputColorVariants: Record<string, string> = {
  slate:
    "text-slate-900 dark:text-slate-50 bg-slate-50 dark:bg-slate-700 border-slate-300 dark:border-slate-600",
  blue: "text-blue-900 dark:text-blue-50 bg-blue-50 dark:bg-blue-700 border-blue-300 dark:border-blue-600",
  green:
    "text-green-900 dark:text-green-50 bg-green-50 dark:bg-green-700 border-green-300 dark:border-green-600",
  red: "text-red-900 dark:text-red-50 bg-red-50 dark:bg-red-700 border-red-300 dark:border-red-600",
  yellow:
    "text-yellow-900 dark:text-yellow-50 bg-yellow-50 dark:bg-yellow-700 border-yellow-300 dark:border-yellow-600",
  purple:
    "text-purple-900 dark:text-purple-50 bg-purple-50 dark:bg-purple-700 border-purple-300 dark:border-purple-600",
  indigo:
    "text-indigo-900 dark:text-indigo-50 bg-indigo-50 dark:bg-indigo-700 border-indigo-300 dark:border-indigo-600",
  pink: "text-pink-900 dark:text-pink-50 bg-pink-50 dark:bg-pink-700 border-pink-300 dark:border-pink-600",
  orange:
    "text-orange-900 dark:text-orange-50 bg-orange-50 dark:bg-orange-700 border-orange-300 dark:border-orange-600",
  gray: "text-gray-900 dark:text-gray-50 bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600",
};

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

export function Textarea({
  id,
  label,
  value,
  placeholder,
  rows = 4,
  color = styles.default.input || "gray",
  className,
  onChange,
  error,
}: TextareaProps) {
  const c = inputColorVariants[color] || inputColorVariants.gray;
  const lc = labelColorVariants[color] || labelColorVariants.gray;

  return (
    <div className={className}>
      {label && (
        <label
          htmlFor={id}
          className={clsx("mb-1 block text-sm font-medium", lc)}
        >
          {label}
        </label>
      )}
      <textarea
        id={id}
        value={value}
        onChange={onChange}
        rows={rows}
        placeholder={placeholder}
        className={clsx(
          "w-full rounded-lg border px-4 py-2 text-sm transition-colors focus:outline-none focus:ring-1 focus:ring-blue-500",
          c,
        )}
      />
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}
