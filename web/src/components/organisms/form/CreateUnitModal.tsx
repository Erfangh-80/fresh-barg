'use client';

import { useState, useCallback, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Modal } from '@/components/mulecules';
import { Button, MyInput, SelectBox, SelectOption } from '@/components/atoms';
import AsyncSelectBox from '@/components/atoms/MyAsyncSelect';
import { createUnit } from '@/app/actions/unit/create';
import { getProvinces } from '@/app/actions/province/gets';
import { getCities } from '@/app/actions/city/gets';
import { getOrgans } from '@/app/actions/organ/gets';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { UnitForm, UnitSchema } from '@/types/schemaType';

interface CreateUnitModalProps {
    isOpen: boolean;
    onClose: () => void;
    positionId: string;
}

export const CreateUnitModal: React.FC<CreateUnitModalProps> = ({
    isOpen,
    onClose,
    positionId,
}) => {
    const router = useRouter();
    const [organs, setOrgans] = useState<{ _id: string; name: string }[]>([]);
    const [isOrgansLoading, setIsOrgansLoading] = useState(true);

    const {
        register,
        handleSubmit,
        control,
        reset,
        setValue,
        watch,
        formState: { errors, isSubmitting },
    } = useForm<UnitForm>({
        resolver: zodResolver(UnitSchema),
        defaultValues: {
            name: '',
            categories: [],
            provinceId: '',
            cityId: '',
            orgId: '',
        },
    });

    const provinceId = watch('provinceId');

    // فچ سازمان‌ها
    useEffect(() => {
        if (!isOpen) return;

        const fetchOrgans = async () => {
            setIsOrgansLoading(true);
            try {
                const res = await getOrgans({
                    get: { _id: 1, name: 1 },
                    set: { page: 1, limit: 50, positionId },
                });
                setOrgans(res.body ?? []);
            } catch (error) {
                console.error('Error loading organs:', error);
                toast.error('خطا در بارگذاری سازمان‌ها');
                setOrgans([]);
            } finally {
                setIsOrgansLoading(false);
            }
        };

        fetchOrgans();
    }, [isOpen, positionId]);

    // لود استان‌ها
    const loadProvinces = useCallback(async (input: string) => {
        try {
            const res = await getProvinces({
                set: { name: input, page: 1, limit: 20 },
                get: { _id: 1, name: 1 },
            });
            return (res.body || []).map((p: { _id: string; name: string }) => ({
                value: p._id,
                label: p.name,
            }));
        } catch {
            return [];
        }
    }, []);

    // لود شهرها
    const loadCities = useCallback(async (input: string) => {
        if (!provinceId) return [];
        try {
            const res = await getCities({
                set: { provinceId, name: input, page: 1, limit: 20, positionId },
                get: { _id: 1, name: 1 },
            });
            return (res.body || []).map((c: { _id: string; name: string }) => ({
                value: c._id,
                label: c.name,
            }));
        } catch {
            return [];
        }
    }, [provinceId, positionId]);


    const onSubmit = async (data: UnitForm) => {
        try {
            const res = await createUnit({
                set: { ...data, positionId },
                get: { _id: 1, name: 1 },
            });

            if (res.success) {
                toast.success('واحد جدید با موفقیت ایجاد شد');
                router.refresh();
                handleClose();
            } else {
                toast.error(res.error?.message || 'خطا در ایجاد واحد');
            }
        } catch (error) {
            toast.error('خطا در ارتباط با سرور');
            console.error(error);
        }
    };

    const handleClose = () => {
        reset();
        onClose();
    };

    // Handle province selection
    // When province changes, city and city_zone should be cleared
    const handleProvinceSelect = async (option: SelectOption | null) => {
        setValue("cityId", "");
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title="ایجاد واحد جدید">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* نام واحد */}
                <MyInput
                    label="نام واحد"
                    name="name"
                    register={register}
                    errMsg={errors.name?.message}
                    placeholder="مثال: واحد توسعه Front-end"
                />

                {/* دسته‌بندی‌ها — فعلاً غیرفعال (چون options خالیه) */}
                <Controller
                    name="categories"
                    control={control}
                    render={({ field }) => (
                        <SelectBox
                            name='categories'
                            label="دسته‌بندی"
                            options={[]}
                            value={field.value?.[0] || ''}
                            onChange={(v) => field.onChange(v ? [v] : [])}
                            errMsg={errors.categories?.message}
                            placeholder="در دست توسعه..."
                        />
                    )}
                />

                {/* استان و شهر */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <AsyncSelectBox
                        name="provinceId"
                        label="انتخاب استان *"
                        setValue={setValue}
                        loadOptions={loadProvinces}
                        defaultOptions
                        placeholder="استان را انتخاب کنید"
                        errMsg={errors.provinceId?.message}
                        onSelectChange={handleProvinceSelect}
                    />

                    {/* City Selection */}
                    <AsyncSelectBox
                        key={watch("provinceId") || "no-province"}
                        name="cityId"
                        label="انتخاب شهر *"
                        setValue={setValue}
                        defaultOptions
                        loadOptions={loadCities}
                        placeholder=" شهر را انتخاب کنید"
                        errMsg={errors.cityId?.message}
                    />
                </div>

                {/* سازمان */}
                <Controller
                    name="orgId"
                    control={control}
                    render={({ field }) => (
                        <SelectBox
                            name='orgId'
                            label="سازمان"
                            options={organs}
                            value={field.value || ''}
                            onChange={field.onChange}
                            errMsg={errors.orgId?.message}
                            placeholder={
                                isOrgansLoading
                                    ? 'در حال بارگذاری...'
                                    : organs.length === 0
                                        ? 'سازمانی موجود نیست'
                                        : 'انتخاب سازمان'
                            }
                        />
                    )}
                />

                {/* دکمه‌ها */}
                <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-4 border-t border-slate-700">
                    <Button
                        type="button"
                        onClick={handleClose}
                        className="px-5 py-2.5 text-slate-300 bg-slate-700 hover:bg-slate-600 rounded-lg font-medium transition-colors"
                    >
                        لغو
                    </Button>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all duration-200 hover:shadow-lg hover:shadow-blue-500/20 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                        {isSubmitting ? (
                            <>
                                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                                در حال ایجاد...
                            </>
                        ) : (
                            'ذخیره واحد'
                        )}
                    </button>
                </div>
            </form>
        </Modal>
    );
};