import { useNavigate } from "react-router-dom";
import LogoIcon from "../assets/icons/LogoIcon";

export function Logo({ className }: { className?: string }) {
  const navigate = useNavigate();
  const handleLogoClick = () => {
    navigate("/");
  };

  return (
    <div
      className={`flex cursor-pointer items-center justify-center gap-2 ${className}`}
      onClick={handleLogoClick}
    >
      <LogoIcon size={32} />
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
        Horiz<span className="text-blue-500 dark:text-blue-400">on</span>
      </h1>
    </div>
  );
}
