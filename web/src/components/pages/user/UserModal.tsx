"use client"
import { FC, useState, useCallback, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import AsyncSelect from "react-select/async";
import { UserForm, userSchema, UserType } from "@/types/schemaType";
import { Modal } from "@/components/mulecules";
import { MyInput, Button, SelectBox, CustomStyles } from "@/components/atoms";
import { getProvinces } from "@/app/actions/province/gets";
import { getCities } from "@/app/actions/city/gets";
import { getUnits } from "@/app/actions/unit/gets";
import { getPositions } from "@/app/actions/position/gets";
import { getOrgans } from "@/app/actions/organ/gets";

interface UserModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: UserForm) => void;
    user?: UserType | null;
    isLoading?: boolean;
    positionId?: string;
}

const genderOptions = [
    { _id: "Male", name: "مرد" },
    { _id: "Female", name: "زن" },
];

type OptionType = {
    value: string;
    label: string;
};

export const UserModal: FC<UserModalProps> = ({
    isOpen,
    onClose,
    onSubmit,
    user,
    isLoading = false,
    positionId = ""
}) => {
    const [selectedProvince, setSelectedProvince] = useState<string>("");
    const [selectedProvinceOption, setSelectedProvinceOption] = useState<OptionType | null>(null);
    const [selectedCityOption, setSelectedCityOption] = useState<OptionType | null>(null);
    const [selectedPositionOptions, setSelectedPositionOptions] = useState<OptionType[]>([]);
    const [selectedOrgOption, setSelectedOrgOption] = useState<OptionType | null>(null);

    const getDefaultValues = (): UserForm => {
        if (user) {
            return {
                first_name: user.first_name || "",
                last_name: user.last_name || "",
                phone: user.phone || "",
                gender: user.gender || "Male",
                birth_date: user.birth_date || "",
                personnel_code: user.personnel_code || "",
                email: user.email || "",
                provinceId: user.provinceId || "",
                cityId: user.cityId || "",
                orgId: user.orgId || "",
                unitId: user.unitId || "",
                position: user.position || [],
            };
        }

        return {
            first_name: "",
            last_name: "",
            phone: "",
            gender: "Male",
            birth_date: "",
            personnel_code: "",
            email: "",
            provinceId: "",
            cityId: "",
            orgId: "",
            unitId: "",
            position: [],
        };
    };

    const {
        register,
        handleSubmit,
        control,
        formState: { errors },
        reset,
        setValue,
        watch
    } = useForm<UserForm>({
        resolver: zodResolver(userSchema),
        defaultValues: getDefaultValues(),
    });

    // Watch برای orgId برای فیلتر کردن واحدها
    const watchedOrgId = watch("orgId");

    // وقتی user تغییر کرد، فرم رو ریست کن
    useEffect(() => {
        if (user) {
            const defaultValues = getDefaultValues();
            reset(defaultValues);

            // تنظیم مقادیر انتخابی برای نقش‌ها
            if (user.position && user.position.length > 0) {
                // اینجا باید نقش‌ها را از API لود کنیم
                loadInitialPositions(user.position);
            }

            // تنظیم مقادیر انتخابی برای سازمان
            if (user.orgId) {
                loadInitialOrg(user.orgId);
            }
        }
    }, [user, reset]);

    // تابع برای لود کردن نقش‌های اولیه
    const loadInitialPositions = async (positionIds: string[]) => {
        try {
            const result = await getPositions({
                set: { page: 1, limit: 50, filterPositions: "all" },
                get: { _id: 1, name: 1 },
            });

            if (result.body) {
                const positionOptions = result.body.map((pos: { _id: string; name: string }) => ({
                    value: pos._id,
                    label: pos.name,
                }));
                setSelectedPositionOptions(positionOptions);
            }
        } catch (error) {
            console.error("Error loading initial positions:", error);
        }
    };

    // تابع برای لود کردن سازمان اولیه
    const loadInitialOrg = async (orgId: string) => {
        try {
            const result = await getOrgans({
                set: { page: 1, limit: 1, positionId },
                get: { _id: 1, name: 1 },
            });

            if (result.body && result.body.length > 0) {
                const org = result.body[0];
                setSelectedOrgOption({
                    value: org._id,
                    label: org.name,
                });
            }
        } catch (error) {
            console.error("Error loading initial organization:", error);
        }
    };

    // توابع AsyncSelect برای استان‌ها
    const loadProvinceOptions = useCallback(async (inputValue: string) => {
        try {
            const result = await getProvinces({
                set: { page: 1, limit: 20, name: inputValue },
                get: { _id: 1, name: 1 },
            });
            return result.body?.map((p: { _id: string; name: string }) => ({
                value: p._id,
                label: p.name,
            })) || [];
        } catch (error) {
            return [];
        }
    }, []);

    // توابع AsyncSelect برای شهرها
    const loadCityOptions = useCallback(async (inputValue: string) => {
        if (!selectedProvince) return [];
        try {
            const result = await getCities({
                set: { page: 1, limit: 20, provinceId: selectedProvince, name: inputValue, positionId },
                get: { _id: 1, name: 1 },
            });
            return result.body?.map((city: { _id: string; name: string }) => ({
                value: city._id,
                label: city.name,
            })) || [];
        } catch (error) {
            return [];
        }
    }, [selectedProvince]);

    // توابع AsyncSelect برای سازمان‌ها
    const loadOrgOptions = useCallback(async () => {
        try {
            const result = await getOrgans({
                set: { page: 1, limit: 20, positionId },
                get: { _id: 1, name: 1 },
            });
            return result.body?.map((org: { _id: string; name: string }) => ({
                value: org._id,
                label: org.name,
            })) || [];
        } catch (error) {
            return [];
        }
    }, []);

    // توابع AsyncSelect برای نقش‌ها
    const loadPositionOptions = useCallback(async (inputValue: string) => {
        try {
            const result = await getPositions({
                set: { page: 1, limit: 20, filterPositions: "all" },
                get: { _id: 1, name: 1 },
            });
            return result.body?.map((pos: { _id: string; name: string }) => ({
                value: pos._id,
                label: pos.name,
            })) || [];
        } catch (error) {
            return [];
        }
    }, []);

    // توابع AsyncSelect برای واحدها - وابسته به سازمان انتخاب شده
    const loadUnitOptions = useCallback(async (inputValue: string) => {
        if (!watchedOrgId) return [];
        try {
            const result = await getUnits({
                set: {
                    page: 1,
                    limit: 20,
                    orgId: watchedOrgId,
                    positionId
                },
                get: { _id: 1, name: 1 },
            });
            return result.body?.map((unit: { _id: string; name: string }) => ({
                value: unit._id,
                label: unit.name,
            })) || [];
        } catch (error) {
            return [];
        }
    }, [watchedOrgId]);

    const handleProvinceChange = useCallback((option: OptionType | null) => {
        const provinceId = option?.value || "";
        setSelectedProvince(provinceId);
        setSelectedProvinceOption(option);
        setValue("provinceId", provinceId, { shouldValidate: true });
        setValue("cityId", "", { shouldValidate: true });
        setSelectedCityOption(null);
    }, [setValue]);

    const handleOrgChange = useCallback((option: OptionType | null) => {
        const orgId = option?.value || "";
        setSelectedOrgOption(option);
        setValue("orgId", orgId, { shouldValidate: true });
        setValue("unitId", "", { shouldValidate: true }); // ریست کردن واحد وقتی سازمان تغییر کرد
    }, [setValue]);

    const handlePositionChange = useCallback((selectedOptions: any) => {
        const options = selectedOptions as OptionType[] || [];
        setSelectedPositionOptions(options);
        setValue("position", options.map(option => option.value), { shouldValidate: true });
    }, [setValue]);

    const handleFormSubmit = (data: UserForm) => {
        console.log('Form data submitted:', data);
        const cleanedData: UserForm = {
            ...data,
            first_name: data.first_name || "",
            last_name: data.last_name || "",
            phone: data.phone || "",
            gender: data.gender || "Male",
            birth_date: data.birth_date || "",
            personnel_code: data.personnel_code || "",
            email: data.email || "",
            provinceId: data.provinceId || "",
            cityId: data.cityId || "",
            orgId: data.orgId || "",
            unitId: data.unitId || "",
            position: data.position || [],
        };
        onSubmit(cleanedData);
        resetForm();
    };

    const resetForm = () => {
        reset(getDefaultValues());
        setSelectedProvince("");
        setSelectedProvinceOption(null);
        setSelectedCityOption(null);
        setSelectedPositionOptions([]);
        setSelectedOrgOption(null);
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title={user ? "ویرایش کاربر" : "ایجاد کاربر جدید"}
            className="w-full max-w-4xl"
        >
            <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6 max-h-[70vh] overflow-y-auto">

                {/* اطلاعات شخصی */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <MyInput
                        label="نام"
                        name="first_name"
                        register={register}
                        errMsg={errors.first_name?.message}
                        placeholder="نام کاربر"
                    />
                    <MyInput
                        label="نام خانوادگی"
                        name="last_name"
                        register={register}
                        errMsg={errors.last_name?.message}
                        placeholder="نام خانوادگی کاربر"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <MyInput
                        label="کد پرسنلی"
                        name="personnel_code"
                        register={register}
                        errMsg={errors.personnel_code?.message}
                        placeholder="کد پرسنلی"
                    />
                    <MyInput
                        label="شماره تلفن"
                        name="phone"
                        register={register}
                        errMsg={errors.phone?.message}
                        placeholder="09xxxxxxxxx"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Controller
                        name="gender"
                        control={control}
                        render={({ field }) => (
                            <SelectBox
                                label="جنسیت"
                                name={field.name}
                                value={field.value || "Male"}
                                onChange={field.onChange}
                                options={genderOptions}
                                placeholder="انتخاب جنسیت"
                                errMsg={errors.gender?.message}
                            />
                        )}
                    />
                    <MyInput
                        label="تاریخ تولد"
                        name="birth_date"
                        type="date"
                        register={register}
                        errMsg={errors.birth_date?.message}
                        placeholder="تاریخ تولد"
                    />
                </div>

                <MyInput
                    label="ایمیل (اختیاری)"
                    name="email"
                    type="email"
                    register={register}
                    errMsg={errors.email?.message}
                    placeholder="example@email.com"
                />

                {/* موقعیت مکانی */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">استان</label>
                        <Controller
                            name="provinceId"
                            control={control}
                            render={({ field }) => (
                                <AsyncSelect
                                    cacheOptions
                                    defaultOptions
                                    loadOptions={loadProvinceOptions}
                                    placeholder="جستجوی استان..."
                                    styles={CustomStyles}
                                    value={selectedProvinceOption}
                                    onChange={handleProvinceChange}
                                    loadingMessage={() => "در حال جستجو..."}
                                    noOptionsMessage={() => "استانی یافت نشد"}
                                />
                            )}
                        />
                        {errors.provinceId && <p className="text-red-500 text-sm mt-1">{errors.provinceId.message}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">شهر</label>
                        <Controller
                            name="cityId"
                            control={control}
                            render={({ field }) => (
                                <AsyncSelect
                                    cacheOptions
                                    defaultOptions
                                    loadOptions={loadCityOptions}
                                    placeholder={selectedProvince ? "جستجوی شهر..." : "ابتدا استان انتخاب کنید"}
                                    styles={CustomStyles}
                                    isDisabled={!selectedProvince}
                                    value={selectedCityOption}
                                    onChange={(option: OptionType | null) => {
                                        setSelectedCityOption(option);
                                        setValue("cityId", option?.value || "", { shouldValidate: true });
                                    }}
                                    loadingMessage={() => "در حال جستجو..."}
                                    noOptionsMessage={() => "شهری یافت نشد"}
                                />
                            )}
                        />
                        {errors.cityId && <p className="text-red-500 text-sm mt-1">{errors.cityId.message}</p>}
                    </div>
                </div>

                {/* سازمان و واحد */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">سازمان</label>
                        <Controller
                            name="orgId"
                            control={control}
                            render={({ field }) => (
                                <AsyncSelect
                                    cacheOptions
                                    defaultOptions
                                    loadOptions={loadOrgOptions}
                                    placeholder="جستجوی سازمان..."
                                    styles={CustomStyles}
                                    value={selectedOrgOption}
                                    onChange={handleOrgChange}
                                    loadingMessage={() => "در حال جستجو..."}
                                    noOptionsMessage={() => "سازمانی یافت نشد"}
                                />
                            )}
                        />
                        {errors.orgId && <p className="text-red-500 text-sm mt-1">{errors.orgId.message}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">واحد</label>
                        <Controller
                            name="unitId"
                            control={control}
                            render={({ field }) => (
                                <AsyncSelect
                                    cacheOptions
                                    defaultOptions
                                    loadOptions={loadUnitOptions}
                                    placeholder={watchedOrgId ? "جستجوی واحد..." : "ابتدا سازمان انتخاب کنید"}
                                    styles={CustomStyles}
                                    isDisabled={!watchedOrgId}
                                    value={field.value ? { value: field.value, label: "" } : null}
                                    onChange={(option: OptionType | null) => {
                                        setValue("unitId", option?.value || "", { shouldValidate: true });
                                    }}
                                    loadingMessage={() => "در حال جستجو..."}
                                    noOptionsMessage={() => "واحدی یافت نشد"}
                                />
                            )}
                        />
                        {errors.unitId && <p className="text-red-500 text-sm mt-1">{errors.unitId.message}</p>}
                    </div>
                </div>

                {/* نقش شغلی - Multi Select */}
                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">نقش‌ها (چند انتخابی)</label>
                    <Controller
                        name="position"
                        control={control}
                        render={({ field }) => (
                            <AsyncSelect
                                isMulti
                                cacheOptions
                                defaultOptions
                                loadOptions={loadPositionOptions}
                                placeholder="جستجوی نقش‌ها..."
                                styles={CustomStyles}
                                value={selectedPositionOptions}
                                onChange={handlePositionChange}
                                loadingMessage={() => "در حال جستجو..."}
                                noOptionsMessage={() => "نقشی یافت نشد"}
                            />
                        )}
                    />
                    {errors.position && <p className="text-red-500 text-sm mt-1">{errors.position.message}</p>}
                </div>

                {/* دکمه‌ها */}
                <div className="flex justify-end gap-3 pt-4 border-t border-slate-700">
                    <Button
                        type="button"
                        onClick={handleClose}
                        className="px-6 py-2 bg-slate-600 hover:bg-slate-700 text-white"
                    >
                        لغو
                    </Button>
                    <button
                        type="submit"
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2"
                        disabled={isLoading}
                    >
                        {isLoading ? "در حال ذخیره..." : user ? "بروزرسانی کاربر" : "ایجاد کاربر"}
                    </button>
                </div>
            </form>
        </Modal>
    );
};