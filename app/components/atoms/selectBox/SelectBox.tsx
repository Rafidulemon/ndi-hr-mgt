/* eslint-disable @typescript-eslint/no-explicit-any */
import { type FieldError, UseFormRegister } from "react-hook-form";
type Option = {
  label: string;
  value: string;
};

type SelectBoxProps = {
  label?: string;
  options: Option[];
  name: string;
  className?: string;
  isRequired?: boolean;
  register?: UseFormRegister<any>;
  error?: FieldError | undefined;
};

export default function SelectBox({
  label = "Select Option",
  options = [],
  className = "",
  name = "name",
  isRequired = false,
  error,
  register,
}: SelectBoxProps) {
  const allOptions = [{ label: "Select Any", value: "default" }, ...options];
  return (
    <div className="flex flex-col">
      <div className="flex flex-row gap-1 mb-2">
        <label
          className="text-[16px] font-bold text-text_bold"
          htmlFor={label}
        >
          {label}
        </label>
        {isRequired && (
          <span className="text-[16px] font-bold text-tertiary">*</span>
        )}
      </div>

      <select
        id={label}
        {...register?.(name)}
        className={`h-[40px] px-4 text-[16px] text-text_primary rounded-lg shadow-xl bg-white 
        focus:outline-none hover:cursor-pointer ${className}`}
      >
        {options.length > 0 ? (
          allOptions.map((option, index) => (
            <option
              key={index}
              value={option.value}
              className="hover:bg-primary"
            >
              {option.label}
            </option>
          ))
        ) : (
          <option disabled>No options available</option>
        )}
      </select>
      {error && (
        <div className="text-[14px] text-tertiary mt-2">{error.message}</div>
      )}
    </div>
  );
}
