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
        <div className="flex gap-1 mb-2">
          <label htmlFor={id} className="text-[16px] font-bold text-text_bold">
            {label}
          </label>
          {isRequired && <span className="text-[16px] font-bold text-tertiary">*</span>}
        </div>
      )}

      <div className="relative w-24 h-24 rounded-full overflow-hidden border border-black">
        <img src={preview} alt="Profile preview" className="w-full h-full object-cover" />
        
        <label htmlFor={id} className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 hover:opacity-100 cursor-pointer transition-opacity">
          <span className="text-white text-sm font-semibold">Change</span>
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
