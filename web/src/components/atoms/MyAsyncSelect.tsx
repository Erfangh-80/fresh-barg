"use client";
import dynamic from "next/dynamic";
import {
    Controller,
    FieldPath,
    FieldValues,
    Path,
    PathValue,
    UseFormSetValue,
} from "react-hook-form";
import { GroupBase, OptionsOrGroups } from "react-select";
import { CustomStyles } from "./Select";

const AsyncSelect = dynamic(() => import("react-select/async"), { ssr: false });

interface InputProps<
    Option,
    Group extends GroupBase<Option>,
    T extends FieldValues = FieldValues,
> {
    name: FieldPath<T>;
    control: any; // Use any type for control to handle react-hook-form's control prop
    label: string;
    setValue: UseFormSetValue<T>;
    labelAsValue?: boolean;
    errMsg?: string;
    placeholder?: string;
    loadOptions?: (
        inputValue: string,
        callback: (options: OptionsOrGroups<Option, Group>) => void,
    ) => Promise<OptionsOrGroups<Option, Group>> | void;
    defaultOptions?: OptionsOrGroups<Option, Group> | boolean;
    className?: string;
    isDisabled?: boolean
    handleGetData?: () => void
}

const AsyncSelectBox = <
    Option,
    Group extends GroupBase<Option>,
    T extends FieldValues = FieldValues,
>({
    errMsg,
    name,
    control,
    label,
    loadOptions,
    setValue,
    labelAsValue,
    defaultOptions,
    className,
    placeholder,
    isDisabled,
    handleGetData
}: InputProps<Option, Group, T>) => {
    return (
        <div className={`flex flex-col gap-2 ${className || ""}`}>
            <label
                htmlFor={name}
                className="text-sm font-medium text-slate-700 text-right"
            >
                {label}
            </label>

            <div className="relative">
                <Controller
                    name={name}
                    control={control}
                    render={({ field: { onChange } }) => (
                        <AsyncSelect
                            cacheOptions
                            defaultOptions={defaultOptions}
                            loadOptions={loadOptions}
                            onChange={(newVal: any) => {
                                if (handleGetData) handleGetData()
                                if (newVal) {
                                    const selectedValue = labelAsValue
                                        ? newVal.label
                                        : newVal.value;
                                    onChange(selectedValue as PathValue<T, Path<T>>);
                                    // Also call setValue to ensure form is updated properly
                                    setValue(name, selectedValue as PathValue<T, Path<T>>);
                                } else {
                                    onChange(null as PathValue<T, Path<T>>);
                                    setValue(name, null as PathValue<T, Path<T>>);
                                }
                            }}
                            name={name}
                            placeholder={placeholder || `${label} را انتخاب کنید`}
                            styles={CustomStyles}
                            noOptionsMessage={() => "گزینه‌ای یافت نشد"}
                            loadingMessage={() => "در حال بارگذاری..."}
                            isClearable
                            isRtl={true}
                            className="react-select-container"
                            classNamePrefix="react-select"
                            isDisabled={isDisabled ? true : false}
                        // menuPortalTarget={typeof window !== 'undefined' ? document.getElementById('select-portal-target') || undefined : undefined}
                        />
                    )}
                />
            </div>

            {errMsg && (
                <span className="text-red-500 text-xs font-medium text-right mt-1 flex items-center gap-1">
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

export default AsyncSelectBox;
