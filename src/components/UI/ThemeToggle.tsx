import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "../../hooks/useTheme";
import type { Theme } from "../../utils/theme";

const ORDER: Theme[] = ["light", "dark", "system"];

const ICONS: Record<Theme, React.ReactNode> = {
  light: <Sun size={16} />,
  dark: <Moon size={16} />,
  system: <Monitor size={16} />,
};

const LABELS: Record<Theme, string> = {
  light: "Light",
  dark: "Dark",
  system: "System",
};

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const handleClick = () => {
    const nextIndex = (ORDER.indexOf(theme) + 1) % ORDER.length;
    setTheme(ORDER[nextIndex]);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={`Theme: ${LABELS[theme]}. Click to change.`}
      title={`Theme: ${LABELS[theme]}`}
      className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-700 transition-colors hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-700/50 dark:text-gray-200 dark:hover:bg-gray-700"
    >
      {ICONS[theme]}
      <span className="text-xs font-medium">{LABELS[theme]}</span>
    </button>
  );
}
