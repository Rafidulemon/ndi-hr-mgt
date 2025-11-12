/* eslint-disable @typescript-eslint/no-explicit-any */
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

type Props = {
  id?: string;
  name?: string;
  label?: string;
  isRequired?: boolean;
  placeholder?: string;
  className?: string;
  error?: any;
  value?: Date | null;
  onChange: (date: Date | null) => void;
};

function CustomDatePicker(props: Props) {
  const {
    id,
    name = "name",
    className,
    isRequired = false,
    label,
    placeholder,
    error,
    value,
    onChange,
  } = props;

  return (
    <div className={`flex flex-col ${className}`}>
      <div className="flex flex-row gap-[5px] mb-2">
        <label htmlFor={id} className="text-[16px] font-bold text-text_bold">
          {label}
        </label>
        {isRequired && (
          <span className="text-[16px] font-bold text-tertiary">*</span>
        )}
      </div>
      <DatePicker
        className="cursor-pointer w-full h-[40px] bg-white rounded-[5px] drop-shadow-lg text-text_primary px-4 focus:outline-none mb-2"
        selected={value}
        onChange={onChange}
        placeholderText={placeholder}
        autoComplete="off"
        id={id}
        name={name}
      />
      {error && (
        <div className="text-[14px] text-tertiary">{error.message}</div>
      )}
    </div>
  );
}

export default CustomDatePicker;
