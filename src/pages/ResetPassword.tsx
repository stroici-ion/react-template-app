import { useNavigate, useParams } from "react-router-dom";
import { useAppDispatch } from "../redux/hooks";
import { useState, type SyntheticEvent } from "react";
import { resetPassword } from "../redux/auth/asyncThunks";
import PrimaryButton from "../components/UI/PrimaryButton";
import Title from "../components/UI/Title";
import Page from "../components/layouts/Page";
import Card from "../components/UI/Card";
import { InputPassword } from "../components/UI/InputPassword";
import Alert from "../components/UI/Alert";

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (password !== confirm) return setError("Passwords don't match");

    try {
      await dispatch(resetPassword({ token: token!, password })).unwrap();
      alert("Password reset! Please log in.");
      navigate("/auth/login");
    } catch (err: any) {
      setError(err || "Failed to reset password");
    }
  };

  return (
    <Page>
      <Card>
        <Title text="Set New Password" className="mb-6 justify-center" />
        <form onSubmit={handleSubmit} className="space-y-4">
          <InputPassword
            id="password"
            label="New Password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <InputPassword
            id="confirm"
            label="Confirm New Password"
            required
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />
          {error && <Alert text={error} kind="error" className="my-4" />}
          <PrimaryButton
            text="Update Password"
            className="w-full"
            type="submit"
          />
        </form>
      </Card>
    </Page>
  );
}
