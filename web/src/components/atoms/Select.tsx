// components/atoms/SelectBox.tsx
import Select from "react-select";
import { ReactSelectOption } from "@/types/types";

interface SelectBoxProps {
  label: string;
  name: string;
  value: string | undefined; // _id
  onChange: (value: string) => void;
  options: { _id: string; name: string }[]; // داده خام
  placeholder?: string;
  errMsg?: string;
}

export const CustomStyles = {
  control: (base: any, state: any) => ({
    ...base,
    backgroundColor: "rgb(15 23 42 / 0.8)",
    borderColor: state.isFocused ? "rgb(34 197 94)" : "rgb(51 65 85)",
    borderWidth: "1px",
    borderRadius: "0.75rem",
    padding: "0.5rem 0.75rem",
    boxShadow: state.isFocused ? "0 0 0 2px rgba(34, 197, 94, 0.1)" : "none",
    "&:hover": { borderColor: "rgb(34 197 94)" },
  }),
  menu: (base: any) => ({
    ...base,
    backgroundColor: "rgb(15 23 42)",
    border: "1px solid rgb(51 65 85)",
    borderRadius: "0.75rem",
    zIndex: 9999,
  }),
  option: (base: any, state: any) => ({
    ...base,
    backgroundColor: state.isSelected
      ? "rgb(34 197 94)"
      : state.isFocused
        ? "rgb(34 197 94 / 0.2)"
        : "transparent",
    color: state.isSelected ? "white" : "rgb(203 213 225)",
    padding: "0.75rem 1rem",
    "&:hover": { backgroundColor: "rgb(34 197 94 / 0.3)" },
  }),
  singleValue: (base: any) => ({
    ...base,
    color: "rgb(203 213 225)",
  }),
  placeholder: (base: any) => ({
    ...base,
    color: "rgb(148 163 184)",
  }),
};

export const SelectBox = ({
  label,
  name,
  value,
  onChange,
  options,
  placeholder = "انتخاب کنید",
  errMsg,
}: SelectBoxProps) => {
  // یک بار options رو تبدیل کن
  const selectOptions: ReactSelectOption[] = options.map((item) => ({
    label: item.name,
    value: item._id,
  }));

  // همان آبجکت را از آرایه اصلی پیدا کن (نه جدید بساز!)
  const selectedOption =
    selectOptions.find((opt) => opt.value === value) || null;

  return (
    <div className="w-full space-y-1">
      {label && (
        <label
          htmlFor={name}
          className="block text-sm font-medium text-gray-300"
        >
          {label}
        </label>
      )}
      <Select
        id={name}
        value={selectedOption}
        onChange={(opt) => onChange(opt?.value || "")}
        options={selectOptions}
        placeholder={placeholder}
        classNamePrefix="react-select"
        className={`text-sm ${errMsg ? "border-red-500" : ""}`}
        styles={CustomStyles}
        isClearable
        menuPortalTarget={typeof window !== 'undefined' ? document.getElementById('select-portal-target') || undefined : undefined}
      />
      {errMsg && <span className="text-red-500 text-xs">{errMsg}</span>}
    </div>
  );
};
