'use client';

/* eslint-disable @typescript-eslint/no-explicit-any */
import { UseFormRegister, type FieldError } from "react-hook-form";
import { TbEyeFilled } from "react-icons/tb";
import { IoMdEyeOff } from "react-icons/io";
import { useState } from "react";

type Props = {
  className?: string;
  isRequired?: boolean;
  label: string;
  defaultValue?: string;
  placeholder?: string;
  value?: string;
  error?: FieldError | undefined;
  id?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  name?: string;
  register?: UseFormRegister<any>;
};

function PasswordInput(props: Props) {
  const {
    id,
    name = "name",
    register,
    className,
    isRequired = false,
    label,
    defaultValue,
    placeholder,
    value,
    error,
    onChange,
  } = props;

  const [viewPassword, setViewPassword] = useState<boolean>(false);

  return (
    <div className={`flex flex-col ${className}`}>
      <div className="flex flex-row gap-[5px] mb-2">
        <label className="text-[16px] text-text_bold font-bold">{label}</label>
        {isRequired && (
          <span className="text-[16px] font-bold text-tertiary">*</span>
        )}
      </div>
      <div className={`relative h-[56px] w-full border-black`}>
      <input
        id={id}
        className={`w-full h-[40px] bg-white rounded-[5px] drop-shadow-lg text-text_primary px-4 focus:outline-none mb-2`}
        type={viewPassword ? "text" : "password"}
        defaultValue={defaultValue}
        value={value}
        placeholder={placeholder ? placeholder : "********"}
        onChange={onChange}
        {...register?.(name)}
      />
      {viewPassword ? (
        <TbEyeFilled
          size={22}
          color="#555454"
          className="cursor-pointer absolute -top-6 bottom-0 right-[6px] m-auto md:-top-5 md:right-[8px]"
          onClick={() => setViewPassword((prev) => !prev)}
        />
      ) : (
        <IoMdEyeOff
          size={22}
          color="#555454"
          className="cursor-pointer absolute -top-6 bottom-0 right-[6px] m-auto md:-top-5 md:right-[8px]"
          onClick={() => setViewPassword((prev) => !prev)}
        />
      )}
      {error && (
        <div className="text-[14px] text-tertiary">{error.message}</div>
      )}
      </div>
    </div>
  );
}

export default PasswordInput;
