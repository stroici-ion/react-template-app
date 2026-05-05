import clsx from "clsx";
import { Loader2Icon } from "lucide-react";

interface LoaderProps {
  className?: string;
}

export default function Loader({ className }: LoaderProps) {
  const loaderStyles = className ? className : "h-5 w-5";

  return <Loader2Icon className={clsx("animate-spin", loaderStyles)} />;
}
