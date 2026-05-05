import { useNavigate } from "react-router-dom";
import { useAppDispatch } from "../redux/hooks";
import { loginWithGoogle, registerUser } from "../redux/auth/asyncThunks";
import { Logo } from "../components/Logo";
import { Input } from "../components/UI/Input";
import { InputPassword } from "../components/UI/InputPassword";
import Page from "../components/layouts/Page";
import { GoogleLogin, useGoogleOneTapLogin } from "@react-oauth/google";
import PrimaryButton from "../components/UI/PrimaryButton";
import Title from "../components/UI/Title";
import TextButton from "../components/UI/TextButton";
import Alert from "../components/UI/Alert";
import { useAsyncEvent } from "../hooks/useAsyncEvent";
import { useAlert } from "../hooks/useAlert";
import Card from "../components/UI/Card";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, type RegisterFormValues } from "../utils/shemas";
import type { SyntheticEvent } from "react";

export default function Register() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const alert = useAlert();

  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  const { execute: googleLogin, error: googleError } = useAsyncEvent(
    async (credential: string) =>
      await dispatch(loginWithGoogle(credential)).unwrap(),
    {
      onSuccess: () => navigate("/home"),
      onError: (err) => alert.error(err),
    },
  );

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

  const handleGoogleLogin = async (credentialResponse: any) => {
    if (credentialResponse.credential) {
      googleLogin(credentialResponse.credential);
    }
  };

  const registerEvent = useAsyncEvent(
    async () => {
      const validate = await registerForm.trigger();
      if (!validate) throw new Error("Invalid fields");

      const payload = {
        email: registerForm.getValues("email"),
        password: registerForm.getValues("password"),
        password_confirmation: registerForm.getValues("passwordConfirmation"),
        first_name: registerForm.getValues("firstName"),
        last_name: registerForm.getValues("lastName"),
      };

      await dispatch(registerUser(payload)).unwrap();
    },
    {
      onSuccess: () => navigate("/auth/email-verification"),
      onError: (err: string) => alert.error(err),
    },
  );

  const handleSubmit = async (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    registerEvent.execute();
  };

  const handleOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.name)
      registerForm.clearErrors(e.target.name as keyof RegisterFormValues);
  };

  const getRegisterFormError = (name: keyof RegisterFormValues) => {
    return registerForm.formState.errors[name]?.message;
  };

  return (
    <Page>
      <Card>
        <Logo className="mb-6 w-full" />
        <Title text="Create Account" className="mb-6 justify-center" />
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <Input
              id="firstName"
              name="firstName"
              label="First Name"
              type="text"
              required
              placeholder="John"
              onChange={handleOnChange}
              register={registerForm.register}
              error={getRegisterFormError("firstName")}
            />
            <Input
              id="lastName"
              name="lastName"
              label="Last Name"
              type="text"
              required
              placeholder="Doe"
              onChange={handleOnChange}
              register={registerForm.register}
              error={getRegisterFormError("lastName")}
            />
          </div>
          <Input
            id="email"
            name="email"
            label="Email"
            type="email"
            required
            placeholder="you@example.com"
            onChange={handleOnChange}
            register={registerForm.register}
            error={getRegisterFormError("email")}
          />
          <InputPassword
            id="password"
            name="password"
            label="Password"
            required
            onChange={handleOnChange}
            register={registerForm.register}
            error={getRegisterFormError("password")}
          />
          <InputPassword
            id="passwordConfirmation"
            name="passwordConfirmation"
            label="Password Confirmation"
            required
            onChange={handleOnChange}
            register={registerForm.register}
            error={getRegisterFormError("passwordConfirmation")}
          />
          {registerEvent.error && (
            <Alert text={registerEvent.error} kind="error" className="mt-4" />
          )}
          <PrimaryButton
            text="Sign Up"
            type="submit"
            className="w-full"
            loading={registerEvent.isLoading}
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
          Already have an account?{" "}
          <TextButton text="Log in here" to="/auth/login" color="green" />
        </p>
      </Card>
    </Page>
  );
}
