type RadioButtonProps = {
  label: string;
  value: string;
  name: string;
  selectedValue: string;
  onChange: (value: string) => void;
};

function RadioButton({ label, value, name, selectedValue, onChange }: RadioButtonProps) {
  return (
    <label className="flex items-center gap-2 cursor-pointer">
      <input
        type="radio"
        name={name}
        value={value}
        checked={selectedValue === value}
        onChange={() => onChange(value)}
        className={`appearance-none w-4 h-4 rounded-full border transition-colors cursor-pointer 
            ${selectedValue === value ? "bg-[#0DBAD2] border-[#0DBAD2]" : "bg-white border-[#555454]"}
          `}
      />
      <span className="text-text_primary">{label}</span>
    </label>
  );
}

export default RadioButton;
