import React, { useState } from "react";
import ImageCropper from "../components/ImageCropper";
import { selectAuth } from "../redux/auth/selectors";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import PrimaryButton from "../components/UI/PrimaryButton";
import { updateProfile } from "../redux/auth/asyncThunks";
import Alert from "../components/UI/Alert";
import Title from "../components/UI/Title";
import Text from "../components/UI/Text";
import Card from "../components/UI/Card";
import { Input } from "../components/UI/Input";
import { Save } from "lucide-react";
import { useAsyncEvent } from "../hooks/useAsyncEvent";
import { useAlert } from "../hooks/useAlert";
import { useForm } from "react-hook-form";
import { infoSchema, type InfoFormValues } from "../utils/shemas";
import { zodResolver } from "@hookform/resolvers/zod";

const PersonalInformation: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector(selectAuth);
  const alert = useAlert();

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>(
    user?.avatarUrl || "",
  );

  const infoForm = useForm<InfoFormValues>({
    resolver: zodResolver(infoSchema),
    defaultValues: {
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
    },
  });

  const handleAvatarCrop = (file: File) => {
    setAvatarFile(file);
    const previewUrl = URL.createObjectURL(file);
    setAvatarPreview(previewUrl);
  };

  const infoUpdateEvent = useAsyncEvent(
    async () => {
      const validate = await infoForm.trigger();
      if (!validate) throw new Error("Invalid fields");

      const { firstName, lastName } = infoForm.getValues();

      const payload = new FormData();
      payload.append("user[first_name]", firstName);
      payload.append("user[last_name]", lastName);

      if (avatarFile) payload.append("user[avatar]", avatarFile);

      await dispatch(updateProfile(payload)).unwrap();
    },
    {
      onSuccess: () => {
        const message = "User info updated successfully";
        alert.success(message);
      },
      onError: (err: string) => {
        const errorMessage = err || "Failed to update user info";
        alert.error(errorMessage);
      },
    },
    {
      successMessageText: "User info updated successfully",
    },
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    infoUpdateEvent.execute();
  };

  const handleOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.name)
      infoForm.clearErrors(e.target.name as keyof InfoFormValues);
  };

  const getinfoFormError = (name: keyof InfoFormValues) => {
    return infoForm.formState.errors[name]?.message;
  };

  return (
    <Card maxWidth="none" className="min-h-screen">
      <div>
        <Title text="Personal Information" />
        <Text
          text="Update your photo and personal details here."
          colorIntensity="soft"
          className="mt-1"
        />
      </div>

      <hr className="my-6 border-gray-200 dark:border-gray-700" />

      {infoUpdateEvent.successMsg && (
        <Alert
          text={infoUpdateEvent.successMsg}
          kind="success"
          className="mb-4"
        />
      )}
      {infoUpdateEvent.error && (
        <Alert text={infoUpdateEvent.error} kind="error" className="mb-4" />
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex flex-col gap-6 md:flex-row md:items-start">
          <div className="w-full shrink-0 md:w-1/3">
            <label className="mb-2 block text-sm font-medium">
              Profile Photo
            </label>
            <div className="flex items-center justify-center">
              <ImageCropper
                onCrop={handleAvatarCrop}
                currentAvatar={avatarPreview}
              />
            </div>
          </div>

          <div className="grid w-full grid-cols-1 gap-6 md:grid-cols-2">
            <Input
              id="first_name"
              name="firstName"
              label="First Name"
              type="text"
              onChange={handleOnChange}
              placeholder={user?.firstName || "Ion"}
              register={infoForm.register}
              error={getinfoFormError("firstName")}
            />

            <Input
              id="last_name"
              name="lastName"
              label="Last Name"
              type="text"
              onChange={handleOnChange}
              placeholder={user?.lastName || "Stroici"}
              register={infoForm.register}
              error={getinfoFormError("lastName")}
            />
          </div>
        </div>
        <hr className="my-6 border-gray-200 dark:border-gray-700" />
        <div className="flex justify-end">
          <PrimaryButton
            type="submit"
            text="Save Changes"
            icon={<Save size={16} />}
            loading={infoUpdateEvent.isLoading}
          />
        </div>
      </form>
    </Card>
  );
};

export default PersonalInformation;
