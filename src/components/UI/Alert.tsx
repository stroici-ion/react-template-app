import React, { useEffect, useState } from "react";
import { CheckCircle2, XCircle, Info, AlertTriangle } from "lucide-react";
import type { AlertKind } from "../../hooks/useAlert";

interface AlertProps {
  text: string;
  kind?: AlertKind;
  variant?: "inline" | "block";
  className?: string;
}

const kindStyles: Record<
  AlertKind,
  { container: string; icon: string; inlineText: string }
> = {
  success: {
    container:
      "bg-green-50 border-green-300 text-green-900 dark:bg-green-950 dark:border-green-800 dark:text-green-100",
    icon: "text-green-500 dark:text-green-400",
    inlineText: "text-green-600 dark:text-green-400",
  },
  error: {
    container:
      "bg-red-50 border-red-300 text-red-900 dark:bg-red-950 dark:border-red-800 dark:text-red-100",
    icon: "text-red-500 dark:text-red-400",
    inlineText: "text-red-600 dark:text-red-400",
  },
  info: {
    container:
      "bg-blue-50 border-blue-300 text-blue-900 dark:bg-blue-950 dark:border-blue-800 dark:text-blue-100",
    icon: "text-blue-500 dark:text-blue-400",
    inlineText: "text-blue-600 dark:text-blue-400",
  },
  warning: {
    container:
      "bg-yellow-50 border-yellow-300 text-yellow-900 dark:bg-yellow-950 dark:border-yellow-800 dark:text-yellow-100",
    icon: "text-yellow-500 dark:text-yellow-400",
    inlineText: "text-yellow-600 dark:text-yellow-400",
  },
};

const kindIcons: Record<AlertKind, (size: number) => React.ReactNode> = {
  success: (size) => <CheckCircle2 size={size} />,
  error: (size) => <XCircle size={size} />,
  info: (size) => <Info size={size} />,
  warning: (size) => <AlertTriangle size={size} />,
};

const Alert: React.FC<AlertProps> = ({
  text,
  kind = "info",
  variant = "block",
  className = "",
}) => {
  if (!text) return null;

  const styles = kindStyles[kind];

  if (variant === "inline") {
    return (
      <div
        className={`mt-1 flex items-center gap-1.5 text-xs ${styles.inlineText} ${className}`}
      >
        {kindIcons[kind](14)}
        <span>{text}</span>
      </div>
    );
  }

  return <BlockAlert text={text} kind={kind} className={className} />;
};

interface BlockAlertProps {
  text: string;
  kind: AlertKind;
  className: string;
}

const BlockAlert: React.FC<BlockAlertProps> = ({ text, kind, className }) => {
  const [open, setOpen] = useState(false);
  const styles = kindStyles[kind];

  useEffect(() => {
    const raf = requestAnimationFrame(() => setOpen(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div
      className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out ${
        open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
      } ${className}`}
    >
      <div className="overflow-hidden">
        <div
          className={`flex items-center gap-3 rounded-xl border p-4 shadow-sm ${styles.container}`}
        >
          <div className={`shrink-0 ${styles.icon}`}>{kindIcons[kind](20)}</div>
          <p className="text-sm font-medium">{text}</p>
        </div>
      </div>
    </div>
  );
};

export default Alert;
