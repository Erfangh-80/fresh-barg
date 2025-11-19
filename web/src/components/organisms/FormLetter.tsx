"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import AsyncSelect from "react-select/async";
import { z } from "zod";
import { Editor } from "../template/editor/Editor";
import { MyInput, Button, CustomStyles } from "@/components/atoms";
import { FC, useEffect, useState, useCallback } from "react";
import { createLetter } from "@/app/actions/letter/create";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { getOrgans } from "@/app/actions/organ/gets";
import { getPositions } from "@/app/actions/position/gets";
import { getUnits } from "@/app/actions/unit/gets";

const letterSchema = z.object({
    number: z.string().min(1, "شماره نامه الزامی است"),
    subject: z.string().min(1, "موضوع الزامی است"),
    receiversId: z.string().min(1, "گیرنده الزامی است"),
    orgId: z.string().min(1, "سازمان الزامی است"),
    unitId: z.string().min(1, "واحد الزامی است"),
    tags: z.array(z.string()).min(1, "حداقل یک برچسب انتخاب کنید"),
    leed: z.string().min(1, "خلاصه الزامی است"),
    content: z.string().min(1, "محتوا الزامی است"),
});

type LetterFormType = z.infer<typeof letterSchema>;

type OptionType = {
    value: string;
    label: string;
};

type Props = {
    activePosition: string;
    tagOptions: { value: string; label: string }[];
    authorId: string;
};

export const LetterForm: FC<Props> = ({ activePosition, tagOptions, authorId }) => {
    const [mounted, setMounted] = useState(false);
    const [selectedOrgOption, setSelectedOrgOption] = useState<OptionType | null>(null);
    const [selectedReceiverOption, setSelectedReceiverOption] = useState<OptionType | null>(null);
    const [selectedUnitOption, setSelectedUnitOption] = useState<OptionType | null>(null);
    const [selectedTagOptions, setSelectedTagOptions] = useState<OptionType[]>([]);
    const router = useRouter();

    useEffect(() => {
        setMounted(true);
    }, []);

    const {
        register,
        handleSubmit,
        control,
        setValue,
        watch,
        reset,
        formState: { errors, isSubmitting, isValid },
    } = useForm<LetterFormType>({
        resolver: zodResolver(letterSchema),
        mode: "onChange",
        defaultValues: {
            number: "",
            subject: "",
            receiversId: "",
            orgId: "",
            unitId: "",
            tags: [],
            leed: "",
            content: "",
        },
    });

    // Watch برای orgId و unitId برای فیلتر کردن واحدها و گیرنده‌ها
    const watchedOrgId = watch("orgId");
    const watchedUnitId = watch("unitId");

    // توابع AsyncSelect برای سازمان‌ها
    const loadOrgOptions = useCallback(async (inputValue: string) => {
        try {
            const result = await getOrgans({
                set: {
                    page: 1,
                    limit: 20,
                    positionId: activePosition
                },
                get: { _id: 1, name: 1 },
            });
            return result.body?.map((org: { _id: string; name: string }) => ({
                value: org._id,
                label: org.name,
            })) || [];
        } catch (error) {
            console.error("Error loading organizations:", error);
            return [];
        }
    }, [activePosition]);

    // توابع AsyncSelect برای واحدها - وابسته به سازمان انتخاب شده
    const loadUnitOptions = useCallback(async (inputValue: string) => {
        if (!watchedOrgId) return [];
        try {
            const result = await getUnits({
                set: {
                    page: 1,
                    limit: 20,
                    orgId: watchedOrgId,
                    positionId: activePosition
                },
                get: { _id: 1, name: 1 },
            });
            return result.body?.map((unit: { _id: string; name: string }) => ({
                value: unit._id,
                label: unit.name,
            })) || [];
        } catch (error) {
            console.error("Error loading units:", error);
            return [];
        }
    }, [watchedOrgId, activePosition]);

    // توابع AsyncSelect برای گیرنده‌ها (positionها) - وابسته به واحد انتخاب شده
    const loadReceiverOptions = useCallback(async (inputValue: string) => {
        if (!watchedUnitId) return [];
        try {
            const result = await getPositions({
                set: {
                    page: 1,
                    limit: 20,
                    unitId: watchedUnitId,
                    filterPositions: "all"
                },
                get: { _id: 1, name: 1 },
            });

            return result.body?.map((position: { _id: string; name: string }) => ({
                value: position._id,
                label: position.name,
            })) || [];
        } catch (error) {
            console.error("Error loading receiver positions:", error);
            return [];
        }
    }, [watchedUnitId]);

    // تابع برای لود کردن برچسب‌ها
    const loadTagOptions = useCallback(async (inputValue: string) => {
        return new Promise<OptionType[]>((resolve) => {
            setTimeout(() => {
                const filtered = tagOptions.filter(
                    (tag) =>
                        tag.label.toLowerCase().includes(inputValue.toLowerCase()) ||
                        tag.value.toLowerCase().includes(inputValue.toLowerCase())
                );
                resolve(filtered);
            }, 200);
        });
    }, [tagOptions]);

    const handleOrgChange = useCallback((option: OptionType | null) => {
        const orgId = option?.value || "";
        setSelectedOrgOption(option);
        setValue("orgId", orgId, { shouldValidate: true });
        setValue("unitId", "", { shouldValidate: true }); // ریست کردن واحد وقتی سازمان تغییر کرد
        setValue("receiversId", "", { shouldValidate: true }); // ریست کردن گیرنده وقتی سازمان تغییر کرد
        setSelectedUnitOption(null);
        setSelectedReceiverOption(null);
    }, [setValue]);

    const handleUnitChange = useCallback((option: OptionType | null) => {
        const unitId = option?.value || "";
        setSelectedUnitOption(option);
        setValue("unitId", unitId, { shouldValidate: true });
        setValue("receiversId", "", { shouldValidate: true }); // ریست کردن گیرنده وقتی واحد تغییر کرد
        setSelectedReceiverOption(null);
    }, [setValue]);

    const handleReceiverChange = useCallback((option: OptionType | null) => {
        const receiverId = option?.value || "";
        setSelectedReceiverOption(option);
        setValue("receiversId", receiverId, { shouldValidate: true });
    }, [setValue]);

    const handleTagChange = useCallback((selectedOptions: any) => {
        const options = selectedOptions as OptionType[] || [];
        setSelectedTagOptions(options);
        setValue("tags", options.map(option => option.value), { shouldValidate: true });
    }, [setValue]);

    const onSubmit = async (data: LetterFormType) => {
        try {
            const responseLetter = await createLetter({
                set: {
                    authorId: authorId,
                    content: data.content,
                    leed: data.leed,
                    number: +data.number,
                    orgId: data.orgId,
                    positionId: activePosition,
                    recieversId: data.receiversId,
                    subject: data.subject,
                    tags: data.tags,
                    unitId: data.unitId
                },
                get: { _id: 1, content: 1 }
            });

            if (responseLetter.success) {
                toast.success("نامه با موفقیت ثبت شد");
                router.push("/dashboard/letter");
                resetForm();
            } else {
                toast.error("خطا در ثبت نامه");
            }
        } catch (error) {
            console.error("Error creating letter:", error);
            toast.error("خطا در ثبت نامه");
        }
    };

    const resetForm = () => {
        reset();
        setSelectedOrgOption(null);
        setSelectedReceiverOption(null);
        setSelectedUnitOption(null);
        setSelectedTagOptions([]);
    };

    const previewContent = watch("content") || "";
    const displayContent = mounted ? previewContent : "";

    return (
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20">
            <h2 className="text-3xl font-bold text-white mb-8 text-center">ثبت نامه جدید</h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <MyInput
                        name="number"
                        label="شماره نامه *"
                        register={register}
                        errMsg={errors.number?.message}
                        placeholder="۱۴۰۳/۱۲۳"
                    />
                    <MyInput
                        name="subject"
                        register={register}
                        label="موضوع *"
                        errMsg={errors.subject?.message}
                        placeholder="موضوع نامه..."
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-white mb-3">سازمان *</label>
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
                        {errors.orgId && <p className="text-red-400 text-sm mt-2">{errors.orgId.message}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-white mb-3">واحد *</label>
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
                                    value={selectedUnitOption}
                                    onChange={handleUnitChange}
                                    loadingMessage={() => "در حال جستجو..."}
                                    noOptionsMessage={() => "واحدی یافت نشد"}
                                />
                            )}
                        />
                        {errors.unitId && <p className="text-red-400 text-sm mt-2">{errors.unitId.message}</p>}
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-white mb-3">گیرنده (پوزیشن) *</label>
                    <Controller
                        name="receiversId"
                        control={control}
                        render={({ field }) => (
                            <AsyncSelect
                                cacheOptions
                                defaultOptions
                                loadOptions={loadReceiverOptions}
                                placeholder={watchedUnitId ? "جستجوی پوزیشن..." : "ابتدا واحد انتخاب کنید"}
                                styles={CustomStyles}
                                isDisabled={!watchedUnitId}
                                value={selectedReceiverOption}
                                onChange={handleReceiverChange}
                                loadingMessage={() => "در حال جستجو..."}
                                noOptionsMessage={() => watchedUnitId ? "پوزیشنی یافت نشد" : "ابتدا واحد انتخاب کنید"}
                            />
                        )}
                    />
                    {errors.receiversId && <p className="text-red-400 text-sm mt-2">{errors.receiversId.message}</p>}
                </div>

                <div>
                    <label className="block text-sm font-medium text-white mb-3">برچسب‌ها *</label>
                    <Controller
                        name="tags"
                        control={control}
                        render={({ field }) => (
                            <AsyncSelect
                                isMulti
                                cacheOptions
                                defaultOptions={tagOptions}
                                loadOptions={loadTagOptions}
                                placeholder="جستجو و انتخاب برچسب..."
                                styles={CustomStyles}
                                value={selectedTagOptions}
                                onChange={handleTagChange}
                                loadingMessage={() => "در حال جستجو..."}
                                noOptionsMessage={() => "برچسبی یافت نشد"}
                            />
                        )}
                    />
                    {errors.tags && <p className="text-red-400 text-sm mt-2">{errors.tags.message}</p>}
                </div>

                <MyInput
                    name="leed"
                    label="خلاصه نامه *"
                    register={register}
                    errMsg={errors.leed?.message}
                    type="textarea"
                    placeholder="خلاصه کوتاه..."
                />

                <div>
                    <label className="block text-sm font-medium text-white mb-3">محتوای نامه *</label>
                    <div className="bg-white rounded-xl overflow-hidden">
                        <Editor onContentChange={(c) => setValue("content", c, { shouldValidate: true })} />
                    </div>
                    {errors.content && <p className="text-red-400 text-sm mt-2">{errors.content.message}</p>}
                </div>

                <div className="bg-slate-800/50 rounded-xl p-6">
                    <p className="text-slate-300 text-sm mb-3">پیش‌نمایش محتوا:</p>
                    <div
                        className="prose prose-invert max-w-none text-sm"
                        dangerouslySetInnerHTML={{
                            __html: displayContent || "<p className='text-slate-500'>هنوز محتوایی وارد نشده</p>"
                        }}
                    />
                </div>

                <div className="flex justify-end gap-4 pt-6 border-t border-white/10">
                    <Button
                        type="button"
                        onClick={resetForm}
                        className="bg-gray-600 hover:bg-gray-700 px-8 py-3"
                    >
                        پاک کردن
                    </Button>
                    <button
                        type="submit"
                        disabled={!isValid || isSubmitting}
                        className="bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-10 py-3 font-bold disabled:opacity-50"
                    >
                        {isSubmitting ? "در حال ثبت..." : "ثبت نامه"}
                    </button>
                </div>
            </form>
        </div>
    );
};