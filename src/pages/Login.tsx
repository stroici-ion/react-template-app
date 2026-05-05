import { useNavigate } from "react-router-dom";
import { loginUser, loginWithGoogle } from "../redux/auth/asyncThunks";
import { useAppDispatch } from "../redux/hooks";
import { GoogleLogin, useGoogleOneTapLogin } from "@react-oauth/google";
import { Logo } from "../components/Logo";
import { Input } from "../components/UI/Input";
import PrimaryButton from "../components/UI/PrimaryButton";
import Alert from "../components/UI/Alert";
import { InputPassword } from "../components/UI/InputPassword";
import Card from "../components/UI/Card";
import Page from "../components/layouts/Page";
import Title from "../components/UI/Title";
import TextButton from "../components/UI/TextButton";
import { useAsyncEvent } from "../hooks/useAsyncEvent";
import { useAlert } from "../hooks/useAlert";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginFormValues } from "../utils/shemas";
import type { SyntheticEvent } from "react";

export default function Login() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const alert = useAlert();

  useGoogleOneTapLogin({
    onSuccess: async (credentialResponse) => {
      if (credentialResponse.credential) {
        googleLogin(credentialResponse.credential);
      }
    },
    onError: () => {
      alert.error("One Tap Login Failed");
    },
  });

  const { execute: googleLogin, error: googleError } = useAsyncEvent(
    async (credential: string) =>
      await dispatch(loginWithGoogle(credential)).unwrap(),
    {
      onSuccess: () => navigate("/home"),
      onError: (err) => alert.error(err),
    },
  );

  const handleGoogleLogin = async (credentialResponse: any) => {
    if (credentialResponse.credential) {
      googleLogin(credentialResponse.credential);
    }
  };

  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const loginEvent = useAsyncEvent(
    async () => {
      const validate = await loginForm.trigger();
      if (!validate) throw new Error("Invalid fields");

      const { email, password } = loginForm.getValues();

      await dispatch(loginUser({ email, password })).unwrap();
    },
    {
      onSuccess: () => navigate("/home"),
      onError: (err) => alert.error(err),
    },
  );

  const handleSubmit = async (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    loginEvent.execute();
  };

  const handleOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.name)
      loginForm.clearErrors(e.target.name as keyof LoginFormValues);
  };

  const getLoginFormError = (name: keyof LoginFormValues) => {
    return loginForm.formState.errors[name]?.message;
  };

  return (
    <Page>
      <Card>
        <Logo className="mb-6 w-full" />
        <Title text="Welcome Back" className="mb-6 justify-center" />

        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            id="email"
            name="email"
            label="Email"
            type="email"
            required
            register={loginForm.register}
            onChange={handleOnChange}
            placeholder="you@example.com"
            error={getLoginFormError("email")}
          />
          <InputPassword
            id="password"
            name="password"
            label="Password"
            required
            register={loginForm.register}
            onChange={handleOnChange}
            error={getLoginFormError("password")}
          />
          {loginEvent.error && (
            <Alert text={loginEvent.error} kind="error" className="mt-4" />
          )}
          <PrimaryButton
            text="Sign In"
            type="submit"
            className="w-full"
            loading={loginEvent.isLoading}
          />
          <TextButton
            text="Forgot Password?"
            to="/auth/forgot-password"
            className="w-full"
          />
          {googleError && (
            <Alert text={googleError} kind="error" className="mt-4" />
          )}
          <GoogleLogin
            onSuccess={handleGoogleLogin}
            onError={() => {
              console.log("Login Failed");
            }}
            theme="outline"
            shape="pill"
          />
        </form>
        <p className="mt-6 text-center text-gray-400">
          Don't have an account?{" "}
          <TextButton text="Register here" to="/auth/register" />
        </p>
      </Card>
    </Page>
  );
}
