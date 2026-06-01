import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAppDispatch } from "../redux/hooks";
import { confirmEmailChange } from "../redux/auth/asyncThunks";
import { Logo } from "../components/Logo";

export default function ConfirmEmailChange() {
  const { token } = useParams<{ token: string }>();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [state, setState] = useState<"loading" | "success" | "error">(
    "loading",
  );
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setState("error");
      setMessage("Invalid confirmation link.");
      return;
    }
    dispatch(confirmEmailChange(token))
      .unwrap()
      .then((data) => {
        setState("success");
        setMessage(data.message || "Email address updated successfully.");
      })
      .catch((err) => {
        setState("error");
        setMessage(
          typeof err === "string"
            ? err
            : "Invalid or expired confirmation link.",
        );
      });
  }, [token]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 dark:bg-gray-900">
      <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 shadow-lg dark:border-gray-700 dark:bg-gray-800">
        <div className="mb-6 flex justify-center">
          <Logo />
        </div>

        {state === "loading" && (
          <div className="text-center">
            <div className="mb-3 text-gray-400 dark:text-gray-500">
              Confirming your new email…
            </div>
            <div className="mx-auto h-6 w-6 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
          </div>
        )}

        {state === "success" && (
          <div className="text-center">
            <div className="mb-3 flex justify-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                <svg
                  className="h-6 w-6 text-green-600 dark:text-green-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </span>
            </div>
            <h2 className="mb-2 text-xl font-bold text-gray-900 dark:text-gray-50">
              Email confirmed
            </h2>
            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
              {message}
            </p>
            <button
              onClick={() => navigate("/auth/login")}
              className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-700"
            >
              Go to Login
            </button>
          </div>
        )}

        {state === "error" && (
          <div className="text-center">
            <div className="mb-3 flex justify-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
                <svg
                  className="h-6 w-6 text-red-600 dark:text-red-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </span>
            </div>
            <h2 className="mb-2 text-xl font-bold text-gray-900 dark:text-gray-50">
              Confirmation failed
            </h2>
            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
              {message}
            </p>
            <button
              onClick={() => navigate("/settings/security")}
              className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-700"
            >
              Back to Security Settings
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
