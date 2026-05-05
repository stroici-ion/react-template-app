import { useState, useCallback } from "react";

interface AsyncEvents<TData, TArgs extends any[]> {
  onSuccess?: (data: TData, args: TArgs) => void;
  onError?: (error: string, args: TArgs) => void;
  onFinally?: (args: TArgs) => void;
}

interface AsyncEventOptions {
  successMessageText?: string;
}

export function useAsyncEvent<TData, TArgs extends any[]>(
  asyncFunction: (...args: TArgs) => Promise<TData>,
  events?: AsyncEvents<TData, TArgs>,
  options?: AsyncEventOptions,
) {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [data, setData] = useState<TData | null>(null);

  const execute = useCallback(
    async (...args: TArgs) => {
      setIsLoading(true);
      setError(null);
      setSuccessMsg(null);

      try {
        const result = await asyncFunction(...args);
        setData(result);

        events?.onSuccess?.(result, args);
        options?.successMessageText &&
          setSuccessMsg(options.successMessageText);

        return result;
      } catch (err) {
        window.alert(JSON.stringify(err));
        const errorMessage =
          err instanceof Error
            ? err.message
            : typeof err === "string"
              ? err
              : "Failed to execute async event";

        setError(errorMessage);

        events?.onError?.(errorMessage, args);
      } finally {
        setIsLoading(false);
        events?.onFinally?.(args);
      }
    },
    [asyncFunction, events],
  );

  return { execute, isLoading, data, error, successMsg };
}
