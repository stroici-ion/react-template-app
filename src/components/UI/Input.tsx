import clsx from "clsx";
import React from "react";
import { styles } from "../../utils/colors";
import Alert from "./Alert";
import type { UseFormRegister } from "react-hook-form";

interface InputProps {
  id: string;
  size?: "xs" | "sm" | "md" | "lg";
  name?: string;
  error?: string;
  label?: string;
  type?: string;
  required?: boolean;
  value?: string;
  placeholder?: string;
  color?: string;
  labelColor?: string;
  className?: string;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
  iconOnClick?: () => void;
  register?: UseFormRegister<any>;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
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

const iconColorVariants: Record<string, string> = {
  slate: "text-slate-500",
  blue: "text-blue-500",
  green: "text-green-500",
  red: "text-red-500",
  yellow: "text-yellow-500",
  purple: "text-purple-500",
  indigo: "text-indigo-500",
  pink: "text-pink-500",
  orange: "text-orange-500",
  gray: "text-gray-500",
};

const focusRingVariants: Record<string, string> = {
  slate: "focus:ring-blue-500",
  blue: "focus:ring-blue-500",
  green: "focus:ring-blue-500",
  red: "focus:ring-blue-500",
  yellow: "focus:ring-blue-500",
  purple: "focus:ring-blue-500",
  indigo: "focus:ring-blue-500",
  pink: "focus:ring-blue-500",
  orange: "focus:ring-blue-500",
  gray: "focus:ring-blue-500",
};

const sizeVariants: Record<string, string> = {
  xs: "text-xs py-1.5",
  sm: "text-sm py-1",
  md: "text-base py-2",
  lg: "text-lg py-2",
};

export function Input({
  id,
  name,
  error,
  label,
  type = "text",
  required,
  value,
  onChange,
  placeholder,
  color = styles.default.input || "slate",
  labelColor = styles.default.inputLabel || "slate",
  icon,
  iconPosition = "left",
  iconOnClick,
  className,
  register,
  onKeyDown,
  size = "md",
}: InputProps) {
  const paddingClasses = icon
    ? iconPosition === "left"
      ? "pl-10 pr-4"
      : "pl-4 pr-10"
    : "px-4";

  return (
    <div className={className}>
      {label && (
        <label
          htmlFor={id}
          className={clsx(
            "mb-1 block text-sm font-medium",
            labelColorVariants[labelColor],
          )}
        >
          {label}
        </label>
      )}

      <div className="relative">
        <input
          id={id}
          name={name}
          {...(register && name && register(name))}
          type={type}
          required={required}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={clsx(
            "w-full rounded-lg border transition-colors focus:outline-none focus:ring-1",
            inputColorVariants[color],
            focusRingVariants[styles.primary] || "focus:ring-blue-500",
            sizeVariants[size],
            paddingClasses,
          )}
          onKeyDown={onKeyDown}
        />

        {icon && (
          <div
            className={clsx(
              "absolute top-1/2 -translate-y-1/2 transform",
              iconPosition === "left" ? "left-3" : "right-3",
              iconColorVariants[color],
              iconOnClick
                ? "cursor-pointer transition-opacity hover:opacity-80"
                : "pointer-events-none",
            )}
            onClick={iconOnClick}
          >
            {icon}
          </div>
        )}
      </div>

      {error && <Alert variant="inline" text={error} kind="error" />}
    </div>
  );
}
