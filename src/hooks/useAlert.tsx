import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";
import { ToastStack } from "../components/UI/Toast";

export type AlertKind = "success" | "error" | "info" | "warning";

export type AlertPosition =
  | "top-left"
  | "top-center"
  | "top-right"
  | "bottom-left"
  | "bottom-center"
  | "bottom-right";

export interface AlertOptions {
  duration?: number;
}

export interface AlertItem {
  id: string;
  kind: AlertKind;
  message: string;
  duration: number;
}

interface AlertApi {
  success: (message: string, options?: AlertOptions) => string;
  error: (message: string, options?: AlertOptions) => string;
  info: (message: string, options?: AlertOptions) => string;
  warning: (message: string, options?: AlertOptions) => string;
  dismiss: (id: string) => void;
  clear: () => void;
}

const AlertContext = createContext<AlertApi | undefined>(undefined);

interface AlertProviderProps {
  children: React.ReactNode;
  position?: AlertPosition;
  defaultDuration?: number;
}

const genId = () =>
  `alert_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;

export function AlertProvider({
  children,
  position = "top-right",
  defaultDuration = 5000,
}: AlertProviderProps) {
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const timers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const dismiss = useCallback((id: string) => {
    const timer = timers.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timers.current.delete(id);
    }
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  }, []);

  const clear = useCallback(() => {
    timers.current.forEach((t) => clearTimeout(t));
    timers.current.clear();
    setAlerts([]);
  }, []);

  const push = useCallback(
    (kind: AlertKind, message: string, options?: AlertOptions) => {
      const id = genId();
      const duration = options?.duration ?? defaultDuration;
      const item: AlertItem = { id, kind, message, duration };
      setAlerts((prev) => [item, ...prev]);
      if (duration > 0) {
        const timer = setTimeout(() => dismiss(id), duration);
        timers.current.set(id, timer);
      }
      return id;
    },
    [defaultDuration, dismiss],
  );

  const api = useMemo<AlertApi>(
    () => ({
      success: (m, o) => push("success", m, o),
      error: (m, o) => push("error", m, o),
      info: (m, o) => push("info", m, o),
      warning: (m, o) => push("warning", m, o),
      dismiss,
      clear,
    }),
    [push, dismiss, clear],
  );

  return (
    <AlertContext.Provider value={api}>
      {children}
      <ToastStack alerts={alerts} position={position} onDismiss={dismiss} />
    </AlertContext.Provider>
  );
}

export function useAlert(): AlertApi {
  const ctx = useContext(AlertContext);
  if (!ctx) {
    throw new Error("useAlert must be used within an AlertProvider");
  }
  return ctx;
}
