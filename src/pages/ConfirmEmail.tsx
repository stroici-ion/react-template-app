import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useAppDispatch } from "../redux/hooks";
import { confirmEmail } from "../redux/auth/asyncThunks";
import Title from "../components/UI/Title";
import Page from "../components/layouts/Page";
import Alert from "../components/UI/Alert";
import PrimaryButton from "../components/UI/PrimaryButton";
import Loader from "../components/UI/Loader";
import Card from "../components/UI/Card";

export default function ConfirmEmail() {
  const { token } = useParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading",
  );
  const [message, setMessage] = useState("Verifying your email...");

  useEffect(() => {
    // Prevent firing if token is missing
    if (!token) {
      setStatus("error");
      setMessage("Invalid confirmation link.");
      return;
    }

    const verifyEmailToken = async () => {
      try {
        // Dispatch the thunk to verify the token with Rails
        await dispatch(confirmEmail({ token })).unwrap();

        setStatus("success");
        setMessage("Your email has been successfully confirmed!");

        // Optional: Auto-redirect to login after 3 seconds
        setTimeout(() => {
          navigate("/auth/login");
        }, 3000);
      } catch (err: any) {
        setStatus("error");
        setMessage(
          err || "Failed to confirm email. The link may have expired.",
        );
      }
    };

    verifyEmailToken();
  }, [token, dispatch, navigate]);

  return (
    <Page>
      <Card className="text-center">
        <Title text="Email Confirmation" className="mb-6 justify-center" />

        {status === "loading" && (
          <div className="py-8">
            {/* You can replace this with your own Spinner component if you have one */}
            <Loader />
          </div>
        )}

        {status === "error" && (
          <div className="space-y-6">
            <Alert text={message} kind="error" className="my-4" />
            <p className="text-sm text-gray-500">
              Please try requesting a new confirmation link.
            </p>
            <PrimaryButton
              text="Go to Login"
              className="w-full"
              onClick={() => navigate("/auth/login")}
            />
          </div>
        )}

        {status === "success" && (
          <div className="space-y-6">
            <Alert text={message} kind="success" className="my-4" />
            <p className="text-sm text-gray-500">Redirecting to login...</p>
            <Link
              to="/auth/login"
              className="text-sm text-blue-600 hover:underline"
            >
              Click here if you are not redirected automatically.
            </Link>
          </div>
        )}
      </Card>
    </Page>
  );
}
