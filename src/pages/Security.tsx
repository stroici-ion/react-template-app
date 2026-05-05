import React, { useState } from "react";
import { useAppDispatch } from "../redux/hooks";
import PrimaryButton from "../components/UI/PrimaryButton";
import Alert from "../components/UI/Alert";
import Title from "../components/UI/Title";
import Text from "../components/UI/Text";
import Card from "../components/UI/Card";
import { useForm } from "react-hook-form";
import ToggleSwitch from "../components/UI/ToggleSwitch";
import { useAlert } from "../hooks/useAlert";
import { LogOut, Save } from "lucide-react";
import { logoutAllDevices, updatePassword } from "../redux/auth/asyncThunks";
import { useNavigate } from "react-router-dom";
import { useAsyncEvent } from "../hooks/useAsyncEvent";
import { InputPassword } from "../components/UI/InputPassword";
import { zodResolver } from "@hookform/resolvers/zod";
import { updatePasswordSchema } from "../utils/shemas";

interface PasswordFormValues {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const Security: React.FC = () => {
  const dispatch = useAppDispatch();
  const alert = useAlert();
  const navigate = useNavigate();

  const passwordUpdateForm = useForm<PasswordFormValues>({
    resolver: zodResolver(updatePasswordSchema),
  });

  const passwordUpdateEvent = useAsyncEvent(
    async () => {
      const validate = await passwordUpdateForm.trigger();

      if (!validate) throw new Error("Invalid fields");

      const payload = {
        old_password: passwordUpdateForm.getValues("currentPassword"),
        new_password: passwordUpdateForm.getValues("newPassword"),
        new_password_confirmation:
          passwordUpdateForm.getValues("confirmPassword"),
      };

      await dispatch(updatePassword(payload)).unwrap();
    },
    {
      onSuccess: () => {
        alert.success("Password successfully updated.");
        passwordUpdateForm.reset();
      },
      onError: (err) => {
        alert.error(err || "Failed to update password. ");
      },
    },
    {
      successMessageText: "Password successfully updated.",
    },
  );

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    passwordUpdateEvent.execute();
  };

  const handleOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.name)
      passwordUpdateForm.clearErrors(e.target.name as keyof PasswordFormValues);
  };

  const getpasswordUpdateFormError = (name: keyof PasswordFormValues) => {
    return passwordUpdateForm.formState.errors[name]?.message;
  };

  const [preferences, setPreferences] = useState({
    twoFactorEnabled: false,
    loginAlerts: true,
  });

  const changePreference = (
    key: keyof typeof preferences,
    value: string | boolean,
  ) => {
    const updatedPreferences = { ...preferences, [key]: value };
    setPreferences(updatedPreferences);
  };

  const { execute: handleLogoutAllDevices, error: logoutError } = useAsyncEvent(
    async () => await dispatch(logoutAllDevices()).unwrap(),
    {
      onSuccess: () => navigate("/auth/login"),
      onError: (err) => {
        const errorMessage = err || "Failed to log out from other devices";
        alert.error(errorMessage);
      },
    },
  );

  return (
    <Card maxWidth="none" className="min-h-screen">
      <div>
        <Title text="Security Settings" />
        <Text
          text="Manage your password, active sessions, and security preferences."
          colorIntensity="soft"
          className="mt-1"
        />
      </div>

      <hr className="my-6 border-gray-200 dark:border-gray-700" />

      <div className="mb-8">
        <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-50">
          Change Password
        </h3>
        <form
          onSubmit={handlePasswordSubmit}
          className="space-y-6 md:w-2/3 lg:w-1/2"
        >
          <InputPassword
            id="currentPassword"
            name="currentPassword"
            label="Current Password"
            register={passwordUpdateForm.register}
            onChange={handleOnChange}
            error={getpasswordUpdateFormError("currentPassword")}
            required
          />
          <InputPassword
            id="newPassword"
            name="newPassword"
            label="New Password"
            register={passwordUpdateForm.register}
            onChange={handleOnChange}
            error={getpasswordUpdateFormError("newPassword")}
            required
          />
          <InputPassword
            id="confirmPassword"
            name="confirmPassword"
            label="Confirm New Password"
            register={passwordUpdateForm.register}
            onChange={handleOnChange}
            error={getpasswordUpdateFormError("confirmPassword")}
            required
          />
          {passwordUpdateEvent.error && (
            <Alert text={passwordUpdateEvent.error} kind="error" />
          )}
          {passwordUpdateEvent.successMsg && (
            <Alert text={passwordUpdateEvent.successMsg} kind="success" />
          )}
          <div className="flex justify-end">
            <PrimaryButton type="submit" text="Update Password" />
          </div>
        </form>
      </div>

      <hr className="my-6 border-gray-200 dark:border-gray-700" />

      <div className="mb-8">
        <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-50">
          Security Preferences
        </h3>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <div className="space-y-6">
            <ToggleSwitch
              label="Two-Factor Authentication (2FA)"
              description="Add an extra layer of security to your account."
              checked={preferences.twoFactorEnabled}
              onChange={(val) => changePreference("twoFactorEnabled", val)}
            />
            <ToggleSwitch
              label="New Login Alerts"
              description="Get an email when someone logs into your account from a new device."
              checked={preferences.loginAlerts}
              onChange={(val) => changePreference("loginAlerts", val)}
            />
          </div>
        </div>
        <div className="mt-6 flex justify-end">
          <PrimaryButton text="Save Changes" icon={<Save size={16} />} />
        </div>
      </div>

      <hr className="my-6 border-gray-200 dark:border-gray-700" />

      <div>
        <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-gray-50">
          Active Sessions
        </h3>
        <Text
          text="If you notice suspicious activity, you can force a logout all devices and browsers."
          colorIntensity="soft"
          className="mb-4"
        />
        {logoutError && (
          <Alert text={logoutError} kind="error" className="my-4" />
        )}

        <PrimaryButton
          text="Log out from all devices"
          onClick={handleLogoutAllDevices}
          color="red"
          outline
          icon={<LogOut size={18} />}
        />
      </div>
    </Card>
  );
};

export default Security;
