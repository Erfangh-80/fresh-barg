// components/molecules/Modals/CreateOrganModal.tsx
'use client'
import { useEffect, useState } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button, LocationMap, MyInput, SelectBox, SelectOption } from "@/components/atoms"
import { createOrgan } from "@/app/actions/organ/create"
import { getProvinces } from "@/app/actions/province/gets"
import { getCities } from "@/app/actions/city/gets"
import { useRouter } from "next/navigation"
import toast from "react-hot-toast"
import { OrganizationForm, organizationSchema } from "@/types/schemaType"
import AsyncSelectBox from "@/components/atoms/MyAsyncSelect"
import { Modal } from "@/components/mulecules"

interface ProvinceOption {
    value: string;
    label: string;
}

interface CityOption {
    value: string;
    label: string;
}

const ownershipTypes = [
    { _id: "government", name: "دولتی" },
    { _id: "private", name: "خصوصی" },
    { _id: "semi-private", name: "نیمه خصوصی" },
];

const organizationTypes = [
    { _id: "service", name: "خدماتی" },
    { _id: "industrial", name: "صنعتی" },
    { _id: "trading", name: "تجاری" },
    { _id: "technology", name: "فناوری" },
    { _id: "financial", name: "مالی" },
    { _id: "healthcare", name: "بهداشتی" },
];

interface CreateOrganModalProps {
    isOpen: boolean
    onClose: () => void
    positionId: string
}

export const CreateOrganModal: React.FC<CreateOrganModalProps> = ({
    isOpen,
    onClose,
    positionId
}) => {
    const router = useRouter()
    const [selectedProvince, setSelectedProvince] = useState<string>("")
    const {
        register,
        handleSubmit,
        control,
        reset,
        setValue,
        formState: { errors },
        watch
    } = useForm<OrganizationForm>({
        resolver: zodResolver(organizationSchema),
        defaultValues: {
            latitude: "",
            longitude: "",
            name: "",
            address: "",
            description: "",
            ownership: "private",  // Default to a valid enum value
            type: "service",       // Default to a valid enum value
            provinceId: "",
            cityId: ""
        }
    })


    const loadProvinces = async (inputValue: string): Promise<ProvinceOption[]> => {
        const res = await getProvinces({
            set: { name: inputValue, page: 1, limit: 20 },
            get: { _id: 1, name: 1, cities: { _id: 1, name: 1 } }
        })
        return res.body.map((p: { _id: string, name: string }) => ({
            value: p._id,
            label: p.name
        }))
    }
    const provinceId = watch("provinceId")

    const loadCities = async (inputValue?: string): Promise<CityOption[]> => {
        if (!provinceId) return []
        const set = {
            provinceId: provinceId,
            name: inputValue,
            page: 1,
            limit: 50,
            positionId
        }

        const res = await getCities({
            set,
            get: { _id: 1, name: 1 }
        })
        console.log(res);

        return res.body.map((c: { _id: string, name: string }) => ({
            value: c._id,
            label: c.name
        }))
    }

    // Handle province selection
    // When province changes, city and city_zone should be cleared
    const handleProvinceSelect = async (option: SelectOption | null) => {
        setValue("cityId", "");
    };

    // Handle city selection
    // const handleCitySelect = async (option: SelectOption | null) => {
    //     setValue("city_zone", "");
    // };

    const onSubmit = async (data: OrganizationForm) => {
        // اعتبارسنجی موقعیت جغرافیایی
        if (!data.latitude || !data.longitude) {
            toast.error("لطفاً موقعیت جغرافیایی را روی نقشه انتخاب کنید")
            return
        }

        const res = await createOrgan({
            set: {
                name: data.name,
                address: data.address,
                description: data.description,
                ownership: data.ownership,
                type: data.type,
                provinceId: data.provinceId,
                cityId: data.cityId,
                latitude: +data.latitude,
                longitude: +data.longitude,
            },
            get: { _id: 1 }
        })

        if (res.success) {
            toast.success("سازمان ایجاد شد")
            router.refresh()
            reset()
            setSelectedProvince("")
            onClose()
        } else {
            toast.error("خطا در ایجاد سازمان")
        }
    }

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="ایجاد سازمان جدید"
            className="max-w-4xl w-full max-h-[90vh] flex flex-col" // عرض بیشتر برای نقشه
        >
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col h-full max-h-[70vh] overflow-y-auto space-y-6">
                {/* نام و آدرس */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <MyInput
                        label="نام سازمان"
                        name="name"
                        register={register}
                        errMsg={errors.name?.message}
                    />
                    <MyInput
                        label="آدرس"
                        name="address"
                        register={register}
                        errMsg={errors.address?.message}
                    />
                </div>

                {/* مالکیت و نوع */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <Controller
                        name="ownership"
                        control={control}
                        render={({ field }) => (
                            <SelectBox
                                name="ownership"
                                label="نوع مالکیت"
                                options={ownershipTypes}
                                value={field.value}
                                onChange={field.onChange}
                                errMsg={errors.ownership?.message}
                            />
                        )}
                    />
                    <Controller
                        name="type"
                        control={control}
                        render={({ field }) => (
                            <SelectBox
                                name="type"
                                label="نوع سازمان"
                                options={organizationTypes}
                                value={field.value}
                                onChange={field.onChange}
                                errMsg={errors.type?.message}
                            />
                        )}
                    />
                </div>

                {/* موقعیت مکانی با Leaflet */}
                {control && ( // مهم! فقط وقتی control آماده بود رندر بشه
                    <LocationMap
                        control={control}
                        setValue={setValue}
                        latitudeName="latitude"
                        longitudeName="longitude"
                        label="موقعیت مکانی سازمان"
                        errMsg={errors.latitude?.message || errors.longitude?.message}
                    />
                )}

                {/* استان و شهر */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
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

                {/* توضیحات */}
                <MyInput
                    label="توضیحات"
                    name="description"
                    register={register}
                    errMsg={errors.description?.message}
                    type="textarea"
                />

                {/* دکمه‌ها */}
                <div className="flex justify-end gap-3 pt-4 border-t border-slate-700 sticky bottom-0 bg-slate-900/80 backdrop-blur-sm">
                    <Button
                        type="button"
                        onClick={onClose}
                        className="px-6 py-3 bg-slate-600 hover:bg-slate-500 text-white rounded-xl transition-colors duration-200 font-medium border border-slate-500"
                    >
                        لغو
                    </Button>
                    <Button
                        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-blue-500/25 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        type="submit"
                    >
                        ذخیره
                    </Button>
                </div>
            </form>
        </Modal>
    )
}