import { useAppDispatch } from "../redux/hooks";
import { forgotPassword } from "../redux/auth/asyncThunks";
import PrimaryButton from "../components/UI/PrimaryButton";
import Title from "../components/UI/Title";
import Text from "../components/UI/Text";
import Page from "../components/layouts/Page";
import Card from "../components/UI/Card";
import { Input } from "../components/UI/Input";
import Alert from "../components/UI/Alert";
import { useAlert } from "../hooks/useAlert";
import { useAsyncEvent } from "../hooks/useAsyncEvent";
import TextButton from "../components/UI/TextButton";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  forgotPasswordSchema,
  type ForgotPasswordFormValues,
} from "../utils/shemas";
import type { SyntheticEvent } from "react";

export default function ForgotPassword() {
  const dispatch = useAppDispatch();
  const alert = useAlert();

  const forgotPasswordForm = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const forgotPasswordEvent = useAsyncEvent(
    async () => {
      const validate = await forgotPasswordForm.trigger();
      if (!validate) throw new Error("Failed to send reset email");

      const { email } = forgotPasswordForm.getValues();

      await dispatch(forgotPassword(email)).unwrap();
    },
    {
      onSuccess: () => {
        alert.success("Reset email sent! Please check your inbox.");
      },
      onError: (err) => {
        const errorMessage = err || "Failed to send reset email";
        alert.error(errorMessage);
      },
    },
    {
      successMessageText: "Reset email sent! Please check your inbox.",
    },
  );

  const handleSubmit = async (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    forgotPasswordEvent.execute();
  };

  const handleOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.name)
      forgotPasswordForm.clearErrors(
        e.target.name as keyof ForgotPasswordFormValues,
      );
  };

  return (
    <Page>
      <Card>
        <Title text="Forgot Password" className="mb-6 justify-center" />
        <Text
          text="Enter your email and we'll send you instructions to reset your password."
          className="mb-6"
        />
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            id="email"
            name="email"
            label="Email"
            type="email"
            required
            placeholder="you@example.com"
            register={forgotPasswordForm.register}
            onChange={handleOnChange}
            error={forgotPasswordForm.formState.errors.email?.message}
          />
          <PrimaryButton
            text="Send Instructions"
            className="w-full"
            type="submit"
            loading={forgotPasswordEvent.isLoading}
          />
        </form>

        {forgotPasswordEvent.error && (
          <Alert
            text={forgotPasswordEvent.error}
            kind="error"
            className="mt-4"
          />
        )}

        {forgotPasswordEvent.successMsg && (
          <Alert
            text={forgotPasswordEvent.successMsg}
            kind="success"
            className="mt-4"
          />
        )}

        <p className="mt-6 text-center text-gray-400">
          Remembered your password?{" "}
          <TextButton text="Log in here" to="/auth/login" />
        </p>
      </Card>
    </Page>
  );
}
