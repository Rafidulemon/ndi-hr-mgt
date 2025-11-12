'use client';

/* eslint-disable @next/next/no-img-element */
import { useState, ChangeEvent } from "react";

type ImageInputProps = {
  className?: string;
  label?: string;
  id?: string;
  isRequired?: boolean;
  initialImage?: string;
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
};

const ImageInput = (props: ImageInputProps) => {
  const {
    className,
    label,
    id,
    isRequired = false,
    initialImage = "/default_profile.png",
    onChange,
  } = props;

  const [preview, setPreview] = useState<string>(initialImage);

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (onChange) onChange(event);

    const file = event.target.files?.[0];
    if (file) {
      setPreview(URL.createObjectURL(file));
    }
  };

  return (
    <div className={`flex flex-col ${className}`}>
      {label && (
        <div className="mb-2 flex gap-1">
          <label
            htmlFor={id}
            className="text-[16px] font-bold text-text_bold dark:text-slate-200"
          >
            {label}
          </label>
          {isRequired && (
            <span className="text-[16px] font-bold text-tertiary">*</span>
          )}
        </div>
      )}

      <div className="relative h-24 w-24 overflow-hidden rounded-full border border-white/80 shadow shadow-slate-200/50 transition-colors duration-200 dark:border-slate-700 dark:shadow-slate-900/50">
        <img
          src={preview}
          alt="Profile preview"
          className="h-full w-full object-cover"
        />

        <label
          htmlFor={id}
          className="absolute inset-0 flex cursor-pointer items-center justify-center bg-black/50 opacity-0 transition-opacity hover:opacity-100"
        >
          <span className="text-sm font-semibold text-white">Change</span>
        </label>

        <input
          id={id}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleImageChange}
        />
      </div>
    </div>
  );
};

export default ImageInput;
