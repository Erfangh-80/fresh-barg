"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Editor } from "../template/editor/Editor";
import { MyInput, Button, CustomStyles } from "@/components/atoms";
import AsyncSelectBox from "@/components/atoms/MyAsyncSelect";
import AsyncSelect from "react-select/async";
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
type OptionType = { value: string; label: string };

type Props = {
    activePosition: string;
    tagOptions: { value: string; label: string }[];
    authorId: string;
};

export const LetterForm: FC<Props> = ({ activePosition, tagOptions, authorId }) => {
    const [mounted, setMounted] = useState(false);
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
        formState: { errors, isSubmitting, isDirty, isValid },
    } = useForm<LetterFormType>({
        resolver: zodResolver(letterSchema),
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

    // Watch برای وابستگی‌ها
    const watchedOrgId = watch("orgId");
    const watchedUnitId = watch("unitId");

    // لود سازمان‌ها
    const loadOrgOptions = useCallback(async (inputValue: string) => {
        try {
            const result = await getOrgans({
                set: { page: 1, limit: 20, positionId: activePosition },
                get: { _id: 1, name: 1 },
            });
            return (
                result.body?.map((org: any) => ({
                    value: org._id,
                    label: org.name,
                })) || []
            );
        } catch (error) {
            console.error("Error loading organizations:", error);
            return [];
        }
    }, [activePosition]);

    // لود واحدها (وابسته به سازمان)
    const loadUnitOptions = useCallback(async (inputValue: string) => {
        if (!watchedOrgId) return [];
        try {
            const result = await getUnits({
                set: { page: 1, limit: 20, orgId: watchedOrgId, positionId: activePosition },
                get: { _id: 1, name: 1 },
            });
            return (
                result.body?.map((unit: any) => ({
                    value: unit._id,
                    label: unit.name,
                })) || []
            );
        } catch (error) {
            console.error("Error loading units:", error);
            return [];
        }
    }, [watchedOrgId, activePosition]);

    // لود گیرنده‌ها (وابسته به واحد)
    const loadReceiverOptions = useCallback(async (inputValue: string) => {
        if (!watchedUnitId) return [];
        try {
            const result = await getPositions({
                set: { page: 1, limit: 20, unitId: watchedUnitId, filterPositions: "all" },
                get: { _id: 1, name: 1 },
            });
            return (
                result.body?.map((pos: any) => ({
                    value: pos._id,
                    label: pos.name,
                })) || []
            );
        } catch (error) {
            console.error("Error loading receivers:", error);
            return [];
        }
    }, [watchedUnitId]);

    // جستجوی برچسب‌ها
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
    console.log(errors, isDirty, isSubmitting, isValid);

    const onSubmit = async (data: LetterFormType) => {
        console.log(data);

        try {
            const responseLetter = await createLetter({
                set: {
                    authorId,
                    content: data.content,
                    leed: data.leed,
                    number: +data.number,
                    orgId: data.orgId,
                    positionId: activePosition,
                    recieversId: data.receiversId,
                    subject: data.subject,
                    tags: data.tags,
                    unitId: data.unitId,
                },
                get: { _id: 1, content: 1 },
            });

            if (responseLetter.success) {
                toast.success("نامه با موفقیت ثبت شد");
                router.push("/dashboard/letter");
                resetForm();
            } else {
                toast.error(responseLetter.message || "خطا در ثبت نامه");
            }
        } catch (error) {
            console.error("Error creating letter:", error);
            toast.error("خطایی رخ داد. دوباره تلاش کنید.");
        }
    };

    const resetForm = () => {
        reset();
        setValue("orgId", "");
        setValue("unitId", "");
        setValue("receiversId", "");
    };

    const previewContent = watch("content") || "";
    const displayContent = mounted ? previewContent : "";

    return (
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20">
            <h2 className="text-3xl font-bold text-white mb-8 text-center">ثبت نامه جدید</h2>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                {/* ردیف اول */}
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

                {/* سازمان و واحد */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <AsyncSelectBox
                        name="orgId"
                        control={control}
                        label="سازمان *"
                        setValue={setValue}
                        loadOptions={loadOrgOptions}
                        defaultOptions
                        placeholder="سازمان را انتخاب کنید"
                        errMsg={errors.orgId?.message}
                        handleGetData={() => {
                            setValue("unitId", "");
                            setValue("receiversId", "");
                        }}
                    />

                    <AsyncSelectBox
                        name="unitId"
                        control={control}
                        label="واحد *"
                        setValue={setValue}
                        loadOptions={loadUnitOptions}
                        defaultOptions={!!watchedOrgId}
                        placeholder={watchedOrgId ? "واحد را انتخاب کنید" : "ابتدا سازمان انتخاب کنید"}
                        errMsg={errors.unitId?.message}
                        isDisabled={!watchedOrgId}
                        key={`unit-${watchedOrgId}`}
                        handleGetData={() => setValue("receiversId", "")}
                    />
                </div>

                {/* گیرنده */}
                <AsyncSelectBox
                    name="receiversId"
                    control={control}
                    label="گیرنده (پوزیشن) *"
                    setValue={setValue}
                    loadOptions={loadReceiverOptions}
                    defaultOptions={!!watchedUnitId}
                    placeholder={watchedUnitId ? "گیرنده را انتخاب کنید" : "ابتدا واحد انتخاب کنید"}
                    errMsg={errors.receiversId?.message}
                    isDisabled={!watchedUnitId}
                    key={`receiver-${watchedUnitId}`}
                />

                <div>
                    <label className="block text-sm font-medium text-white mb-3">برچسب‌ها *</label>
                    <Controller
                        name="tags"
                        control={control}
                        render={({ field: { onChange, value } }) => (
                            <AsyncSelect
                                isMulti
                                cacheOptions
                                defaultOptions={tagOptions}
                                loadOptions={loadTagOptions}
                                placeholder="جستجو و انتخاب برچسب..."
                                styles={CustomStyles}
                                value={tagOptions.filter(option => value?.includes(option.value))}
                                onChange={(selectedOptions) => {
                                    const selectedValues = (selectedOptions as OptionType[] || []).map(option => option.value);
                                    onChange(selectedValues);
                                }}
                                loadingMessage={() => "در حال جستجو..."}
                                noOptionsMessage={() => "برچسبی یافت نشد"}
                            />
                        )}
                    />
                    {errors.tags && <p className="text-red-400 text-sm mt-2">{errors.tags.message}</p>}
                </div>

                {/* خلاصه */}
                <MyInput
                    name="leed"
                    label="خلاصه نامه *"
                    register={register}
                    errMsg={errors.leed?.message}
                    type="textarea"
                    placeholder="خلاصه کوتاه..."
                />

                {/* محتوا */}
                <div>
                    <div className="bg-white rounded-xl overflow-hidden">
                        <Editor
                            onContentChange={(c) =>
                                setValue("content", c, {
                                    shouldValidate: true,
                                    shouldDirty: true,
                                    shouldTouch: true,
                                })
                            }
                        />
                    </div>
                    {errors.content && <p className="text-red-400 text-sm mt-2">{errors.content.message}</p>}
                </div>

                {/* پیش‌نمایش */}
                <div className="bg-slate-800/50 rounded-xl p-6">
                    <p className="text-slate-300 text-sm mb-3">پیش‌نمایش محتوا:</p>
                    <div
                        className="prose prose-invert max-w-none text-sm"
                        dangerouslySetInnerHTML={{
                            __html: displayContent || "<p class='text-slate-500'>هنوز محتوایی وارد نشده</p>",
                        }}
                    />
                </div>

                {/* دکمه‌ها */}
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
                        disabled={isSubmitting || !isValid}
                        className={`
                px-10 py-3 font-bold rounded-xl transition-all
                ${isSubmitting || !isValid
                                ? "bg-gray-600 opacity-50 cursor-not-allowed"
                                : "bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg"
                            }
                `}
                    >
                        {isSubmitting ? "در حال ثبت..." : "ثبت نامه"}
                    </button>
                </div>
            </form>
        </div>
    );
};