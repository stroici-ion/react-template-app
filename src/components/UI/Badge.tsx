import clsx from "clsx";

interface BadgeProps {
  text: string;
  color?: string;
  size?: "xs" | "sm" | "md";
  dot?: boolean;
  className?: string;
}

const colorVariants: Record<string, string> = {
  gray: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  blue: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  green: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
  red: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
  yellow:
    "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300",
  purple:
    "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
  indigo:
    "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300",
  orange:
    "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300",
  pink: "bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300",
};

const dotVariants: Record<string, string> = {
  gray: "bg-gray-500",
  blue: "bg-blue-500",
  green: "bg-green-500",
  red: "bg-red-500",
  yellow: "bg-yellow-500",
  purple: "bg-purple-500",
  indigo: "bg-indigo-500",
  orange: "bg-orange-500",
  pink: "bg-pink-500",
};

const sizeVariants: Record<string, string> = {
  xs: "text-[10px] px-1.5 py-0.5",
  sm: "text-xs px-2 py-0.5",
  md: "text-sm px-2.5 py-1",
};

export function Badge({
  text,
  color = "gray",
  size = "sm",
  dot = false,
  className,
}: BadgeProps) {
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1 rounded-full font-medium",
        colorVariants[color] ?? colorVariants.gray,
        sizeVariants[size] ?? sizeVariants.sm,
        className,
      )}
    >
      {dot && (
        <span
          className={clsx(
            "h-1.5 w-1.5 rounded-full",
            dotVariants[color] ?? dotVariants.gray,
          )}
        />
      )}
      {text}
    </span>
  );
}
