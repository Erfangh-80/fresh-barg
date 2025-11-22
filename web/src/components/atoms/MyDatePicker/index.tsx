"use client";

import React from "react";
import DatePicker from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";

interface MyDatePickerProps {
  value?: string;
  onChange?: (date: string) => void;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  errMsg?: string;
  locale?: "fa" | "en";
}

const MyDatePicker: React.FC<MyDatePickerProps> = ({
  value,
  onChange,
  label,
  placeholder,
  disabled = false,
  className = "",
  errMsg,
  locale = "fa",
}) => {
  const dateValue = value ? new Date(value) : undefined;

  const handleDateChange = (date: any) => {
    if (date && typeof onChange === "function") {
      const dateString = date ? date.toDate().toISOString().split("T")[0] : "";
      onChange(dateString);
    }
  };

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {label && (
        <label className="text-sm font-medium text-slate-200 text-right">
          {label}
        </label>
      )}

      <DatePicker
        value={dateValue}
        onChange={handleDateChange}
        calendar={locale === "fa" ? persian : undefined}
        locale={locale === "fa" ? persian_fa : undefined}
        placeholder={placeholder || "انتخاب تاریخ"}
        disabled={disabled}
        className="w-full"
        inputClass={`
          w-full rounded-xl px-3 py-2.5 text-sm
          bg-slate-800/40 backdrop-blur-md 
          border transition-all duration-200
          focus:outline-none focus:ring-2 focus:ring-blue-500/60
          placeholder:text-slate-400 text-slate-100
          ${errMsg
            ? "border-red-500/70 bg-red-900/20 focus:ring-red-500/60"
            : "border-slate-600 hover:border-slate-400"}
          ${disabled ? "opacity-60 cursor-not-allowed" : ""}
          rtl
        `}
        containerClassName="w-full"
        calendarPosition="bottom-right"
        format="YYYY/MM/DD"
      />

      {errMsg && (
        <span className="text-red-400 text-xs font-medium text-right mt-1 flex items-center gap-1">
          <svg
            className="w-3 h-3 shrink-0"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          {errMsg}
        </span>
      )}
    </div>
  );
};

export default MyDatePicker;
