import { CheckCircle2, Circle } from "lucide-react";

interface CheckButtonProps {
  checked: boolean;
  onChange?: () => void;
}

export const CheckButton: React.FC<CheckButtonProps> = ({
  checked,
  onChange,
}) => {
  return (
    <button
      className="cursor-pointer text-gray-400 hover:text-indigo-600"
      onClick={onChange}
    >
      {checked ? (
        <CheckCircle2 size={18} className="text-green-500" />
      ) : (
        <Circle size={18} />
      )}
    </button>
  );
};
