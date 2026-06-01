import React, { useState } from "react";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { selectAuth } from "../redux/auth/selectors";
import PrimaryButton from "../components/UI/PrimaryButton";
import Alert from "../components/UI/Alert";
import Title from "../components/UI/Title";
import Text from "../components/UI/Text";
import Card from "../components/UI/Card";
import { useForm } from "react-hook-form";
import ToggleSwitch from "../components/UI/ToggleSwitch";
import { useAlert } from "../hooks/useAlert";
import { LogOut, Mail, Save, Shield, KeyRound } from "lucide-react";
import {
  logoutAllDevices,
  updatePassword,
  addPassword,
  requestEmailChange,
  updateSecurityPreferences,
} from "../redux/auth/asyncThunks";
import { useNavigate } from "react-router-dom";
import { useAsyncEvent } from "../hooks/useAsyncEvent";
import { InputPassword } from "../components/UI/InputPassword";
import { Input } from "../components/UI/Input";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  updatePasswordSchema,
  addPasswordSchema,
  changeEmailSchema,
  type AddPasswordFormValues,
  type ChangeEmailFormValues,
} from "../utils/shemas";

interface PasswordFormValues {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

// ─── Section wrapper ─────────────────────────────────────────────────────────

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-8">
      <h3 className="mb-1 text-lg font-semibold text-gray-900 dark:text-gray-50">
        {title}
      </h3>
      {description && (
        <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
          {description}
        </p>
      )}
      {children}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

const Security: React.FC = () => {
  const dispatch = useAppDispatch();
  const alert = useAlert();
  const navigate = useNavigate();
  const { user } = useAppSelector(selectAuth);

  const authMethod = user?.authMethod ?? "email";
  const isGoogleOnly = authMethod === "google";
  const hasPassword = authMethod === "email" || authMethod === "both";

  // ── Change Password (email / both users) ──────────────────────────────────

  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(updatePasswordSchema),
  });

  const passwordEvent = useAsyncEvent(
    async () => {
      const ok = await passwordForm.trigger();
      if (!ok) throw new Error("Invalid fields");
      await dispatch(
        updatePassword({
          old_password: passwordForm.getValues("currentPassword"),
          new_password: passwordForm.getValues("newPassword"),
          new_password_confirmation: passwordForm.getValues("confirmPassword"),
        }),
      ).unwrap();
    },
    {
      onSuccess: () => {
        alert.success("Password updated successfully.");
        passwordForm.reset();
      },
      onError: (err) => alert.error(err || "Failed to update password."),
    },
    { successMessageText: "Password updated successfully." },
  );

  // ── Add Password (Google-only users) ─────────────────────────────────────

  const addPasswordForm = useForm<AddPasswordFormValues>({
    resolver: zodResolver(addPasswordSchema),
  });

  const addPasswordEvent = useAsyncEvent(
    async () => {
      const ok = await addPasswordForm.trigger();
      if (!ok) throw new Error("Invalid fields");
      await dispatch(
        addPassword({
          new_password: addPasswordForm.getValues("newPassword"),
          new_password_confirmation:
            addPasswordForm.getValues("confirmPassword"),
        }),
      ).unwrap();
    },
    {
      onSuccess: () => {
        alert.success(
          "Password set! You can now sign in with email and password.",
        );
        addPasswordForm.reset();
      },
      onError: (err) => alert.error(err || "Failed to set password."),
    },
    {
      successMessageText:
        "Password set! You can now sign in with email and password.",
    },
  );

  // ── Change Email ──────────────────────────────────────────────────────────

  const emailForm = useForm<ChangeEmailFormValues>({
    resolver: zodResolver(changeEmailSchema),
  });
  const [emailChangeMsg, setEmailChangeMsg] = useState<string | null>(null);

  const emailChangeEvent = useAsyncEvent(
    async () => {
      const ok = await emailForm.trigger();
      if (!ok) throw new Error("Invalid fields");
      await dispatch(
        requestEmailChange(emailForm.getValues("newEmail")),
      ).unwrap();
    },
    {
      onSuccess: () => {
        const newEmail = emailForm.getValues("newEmail");
        setEmailChangeMsg(
          `Confirmation email sent to ${newEmail}. Click the link to confirm.`,
        );
        emailForm.reset();
      },
      onError: (err) => alert.error(err || "Failed to request email change."),
    },
  );

  // ── Login Alerts ──────────────────────────────────────────────────────────

  const [alertsLoading, setAlertsLoading] = useState(false);

  const handleLoginAlertsToggle = async (enabled: boolean) => {
    setAlertsLoading(true);
    try {
      await dispatch(
        updateSecurityPreferences({ login_alerts_enabled: enabled }),
      ).unwrap();
      alert.success(
        enabled ? "Login alerts enabled." : "Login alerts disabled.",
      );
    } catch (err: any) {
      alert.error(err || "Failed to update preferences.");
    } finally {
      setAlertsLoading(false);
    }
  };

  // ── Logout all devices ────────────────────────────────────────────────────

  const { execute: handleLogoutAll, error: logoutError } = useAsyncEvent(
    async () => await dispatch(logoutAllDevices()).unwrap(),
    {
      onSuccess: () => navigate("/auth/login"),
      onError: (err) =>
        alert.error(err || "Failed to log out from other devices."),
    },
  );

  return (
    <Card maxWidth="none" className="min-h-screen">
      <div>
        <Title text="Security Settings" />
        <Text
          text="Manage your password, email, and security preferences."
          colorIntensity="soft"
          className="mt-1"
        />
      </div>

      <hr className="my-6 border-gray-200 dark:border-gray-700" />

      {/* ── Authentication method badge ── */}
      <Section title="Sign-in Method">
        <div className="flex flex-wrap items-center gap-3">
          {(authMethod === "email" || authMethod === "both") && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1.5 text-sm font-medium text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300">
              <KeyRound size={14} /> Password
            </span>
          )}
          {(authMethod === "google" || authMethod === "both") && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
              <Shield size={14} /> Google
            </span>
          )}
          {authMethod === "both" && (
            <span className="text-sm text-gray-500 dark:text-gray-400">
              You can sign in with either Google or your
              email&nbsp;+&nbsp;password.
            </span>
          )}
          {isGoogleOnly && (
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Your account is linked to Google. Add a password below to also
              enable email&nbsp;+&nbsp;password sign-in.
            </span>
          )}
        </div>
      </Section>

      <hr className="my-6 border-gray-200 dark:border-gray-700" />

      {/* ── Change password (email / both users) ── */}
      {hasPassword && (
        <>
          <Section
            title="Change Password"
            description="Choose a strong password you don't use elsewhere."
          >
            <form
              onSubmit={(e) => {
                e.preventDefault();
                passwordEvent.execute();
              }}
              className="space-y-5 md:w-2/3 lg:w-1/2"
            >
              <InputPassword
                id="currentPassword"
                name="currentPassword"
                label="Current Password"
                register={passwordForm.register}
                onChange={() => passwordForm.clearErrors("currentPassword")}
                error={passwordForm.formState.errors.currentPassword?.message}
                required
              />
              <InputPassword
                id="newPassword"
                name="newPassword"
                label="New Password"
                register={passwordForm.register}
                onChange={() => passwordForm.clearErrors("newPassword")}
                error={passwordForm.formState.errors.newPassword?.message}
                required
              />
              <InputPassword
                id="confirmPassword"
                name="confirmPassword"
                label="Confirm New Password"
                register={passwordForm.register}
                onChange={() => passwordForm.clearErrors("confirmPassword")}
                error={passwordForm.formState.errors.confirmPassword?.message}
                required
              />
              {passwordEvent.error && (
                <Alert text={passwordEvent.error} kind="error" />
              )}
              {passwordEvent.successMsg && (
                <Alert text={passwordEvent.successMsg} kind="success" />
              )}
              <div className="flex justify-end">
                <PrimaryButton
                  type="submit"
                  text="Update Password"
                  loading={passwordEvent.loading}
                />
              </div>
            </form>
          </Section>
          <hr className="my-6 border-gray-200 dark:border-gray-700" />
        </>
      )}

      {/* ── Add password (Google-only users) ── */}
      {isGoogleOnly && (
        <>
          <Section
            title="Add a Password"
            description="Set a password to enable signing in with your email and password in addition to Google."
          >
            <form
              onSubmit={(e) => {
                e.preventDefault();
                addPasswordEvent.execute();
              }}
              className="space-y-5 md:w-2/3 lg:w-1/2"
            >
              <InputPassword
                id="ap-newPassword"
                name="newPassword"
                label="New Password"
                register={addPasswordForm.register}
                onChange={() => addPasswordForm.clearErrors("newPassword")}
                error={addPasswordForm.formState.errors.newPassword?.message}
                required
              />
              <InputPassword
                id="ap-confirmPassword"
                name="confirmPassword"
                label="Confirm Password"
                register={addPasswordForm.register}
                onChange={() => addPasswordForm.clearErrors("confirmPassword")}
                error={
                  addPasswordForm.formState.errors.confirmPassword?.message
                }
                required
              />
              {addPasswordEvent.error && (
                <Alert text={addPasswordEvent.error} kind="error" />
              )}
              {addPasswordEvent.successMsg && (
                <Alert text={addPasswordEvent.successMsg} kind="success" />
              )}
              <div className="flex justify-end">
                <PrimaryButton
                  type="submit"
                  text="Set Password"
                  loading={addPasswordEvent.loading}
                />
              </div>
            </form>
          </Section>
          <hr className="my-6 border-gray-200 dark:border-gray-700" />
        </>
      )}

      {/* ── Change email ── */}
      <Section
        title="Change Email Address"
        description="A confirmation link will be sent to your new email. Your current email remains active until confirmed."
      >
        {user?.pendingEmail && (
          <Alert
            text={`Waiting for confirmation at ${user.pendingEmail}. Check your inbox.`}
            kind="info"
            className="mb-4"
          />
        )}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setEmailChangeMsg(null);
            emailChangeEvent.execute();
          }}
          className="space-y-4 md:w-2/3 lg:w-1/2"
        >
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Current email:{" "}
            <span className="font-medium text-gray-900 dark:text-gray-50">
              {user?.email}
            </span>
          </div>
          <Input
            id="newEmail"
            name="newEmail"
            label="New Email Address"
            type="email"
            register={emailForm.register}
            error={emailForm.formState.errors.newEmail?.message}
          />
          {emailChangeEvent.error && (
            <Alert text={emailChangeEvent.error} kind="error" />
          )}
          {emailChangeMsg && <Alert text={emailChangeMsg} kind="success" />}
          <div className="flex justify-end">
            <PrimaryButton
              type="submit"
              text="Send Confirmation"
              icon={<Mail size={15} />}
              loading={emailChangeEvent.loading}
            />
          </div>
        </form>
      </Section>

      <hr className="my-6 border-gray-200 dark:border-gray-700" />

      {/* ── Security preferences ── */}
      <Section
        title="Security Preferences"
        description="Control security notifications for your account."
      >
        <div className="md:w-2/3 lg:w-1/2">
          <ToggleSwitch
            label="New Login Alerts"
            description="Receive an email whenever a new sign-in is detected on your account."
            checked={user?.loginAlertsEnabled ?? false}
            onChange={handleLoginAlertsToggle}
            disabled={alertsLoading}
          />
        </div>
      </Section>

      <hr className="my-6 border-gray-200 dark:border-gray-700" />

      {/* ── Active sessions ── */}
      <Section title="Active Sessions">
        <Text
          text="If you notice suspicious activity, force a logout on all other devices and browsers."
          colorIntensity="soft"
          className="mb-4"
        />
        {logoutError && (
          <Alert text={logoutError} kind="error" className="mb-4" />
        )}
        <PrimaryButton
          text="Log out from all devices"
          onClick={handleLogoutAll}
          color="red"
          outline
          icon={<LogOut size={16} />}
        />
      </Section>
    </Card>
  );
};

export default Security;
