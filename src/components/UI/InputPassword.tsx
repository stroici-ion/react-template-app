import React, { useState } from "react";
import { Input } from "./Input";
import { styles } from "../../utils/colors";
import { Eye, EyeOff } from "lucide-react";
import type { UseFormRegister } from "react-hook-form";

interface InputPasswordProps {
  id: string;
  label?: string;
  name?: string;
  error?: string;
  required?: boolean;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  color?: string;
  labelColor?: string;
  className?: string;
  register?: UseFormRegister<any>;
}

export function InputPassword({
  id,
  name,
  label,
  error,
  required,
  value,
  onChange,
  placeholder = "••••••••",
  color = styles.default.input,
  labelColor = styles.default.inputLabel,
  className,
  register,
}: InputPasswordProps) {
  const [showPassword, setShowPassword] = useState(false);

  const handleToggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Input
      id={id}
      name={name}
      error={error}
      type={showPassword ? "text" : "password"}
      required={required}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      color={color}
      label={label}
      labelColor={labelColor}
      icon={showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
      iconPosition="right"
      iconOnClick={handleToggleShowPassword}
      className={className}
      register={register}
    />
  );
}
