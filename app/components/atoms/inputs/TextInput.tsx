/* eslint-disable @typescript-eslint/no-explicit-any */
import { UseFormRegister, type FieldError } from "react-hook-form";

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

function TextInput(props: Props) {
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

  return (
    <div className={`flex flex-col ${className}`}>
      <div className="mb-2 flex flex-row gap-[5px]">
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
      <input
        id={id}
        type="text"
        className="mb-2 h-[40px] w-full rounded-[5px] bg-white px-4 text-text_primary shadow-sm shadow-slate-200/70 transition-colors duration-200 focus:outline-none dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500 dark:shadow-slate-900/40"
        defaultValue={defaultValue}
        value={value}
        placeholder={placeholder}
        onChange={onChange}
        {...register?.(name)}
      />
      {error && (
        <div className="text-[14px] text-tertiary">{error.message}</div>
      )}
    </div>
  );
}

export default TextInput;
