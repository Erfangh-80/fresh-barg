// components/molecules/Modals/CreateCityModal.tsx
'use client'
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Modal } from "@/components/mulecules"
import { Button } from "@/components/atoms/Button"
import { MyInput } from "@/components/atoms/Input"
import MyAsyncMultiSelect from "@/components/atoms/AsyncSelect"
import { createCity } from "@/app/actions/city/create"
import { getProvinces } from "@/app/actions/province/gets"
import { citySchema, CityForm } from "@/types/schemaType"
import { useRouter } from "next/navigation"
import toast from "react-hot-toast"

type Option = { value: string; label: string }

interface CreateCityModalProps {
    isOpen: boolean
    onClose: () => void
}

export const CreateCityModal: React.FC<CreateCityModalProps> = ({ isOpen, onClose }) => {
    const router = useRouter()
    const { register, handleSubmit, control, formState: { errors } } = useForm<CityForm>({
        resolver: zodResolver(citySchema),
    })

    const loadProvinceOptions = async (inputValue: string): Promise<Option[]> => {
        try {
            const res = await getProvinces({
                set: { page: 1, limit: 20, name: inputValue },
                get: { _id: 1, name: 1 },
            })
            return res.body.map((p: { _id: string, name: string }) => ({ value: p._id, label: p.name }))
        } catch (error) {
            console.error(error)
            return []
        }
    }

    const onSubmit = async (data: CityForm) => {
        const res = await createCity({
            set: { name: data.name, enName: data.enName, abb: data.abb, provinceId: data.province },
            get: { _id: 1, name: 1 },
        })
        if (res.success) {
            toast.success("شهر ایجاد شد")
            router.refresh()
            onClose()
        }
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="ایجاد شهر جدید">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <MyInput label="نام شهر" name="name" register={register} errMsg={errors.name?.message} />
                <MyInput label="نام انگلیسی" name="enName" register={register} errMsg={errors.enName?.message} />
                <MyInput label="مخفف" name="abb" register={register} errMsg={errors.abb?.message} />

                <Controller
                    name="province"
                    control={control}
                    render={({ field }) => (
                        <MyAsyncMultiSelect
                            name="province"
                            label="استان"
                            loadOptions={loadProvinceOptions}
                            defaultOptions// در کلاینت فچ میشه
                            placeholder="جستجو و انتخاب استان..."
                            errMsg={errors.province?.message}
                            setValue={(_, value) => {
                                const selected = Array.isArray(value) ? value[0] : value
                                field.onChange(selected || "")
                            }}
                        />
                    )}
                />

                <div className="flex justify-end gap-2 pt-4 border-t border-slate-700">
                    <Button type="button" onClick={onClose} className="px-6 py-3 bg-slate-600 hover:bg-slate-500 text-white rounded-xl transition-colors 
 duration-200 font-medium border border-slate-500">
                        لغو
                    </Button>
                    <Button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all duration-200 
 hover:shadow-lg hover:shadow-blue-500/25 font-medium disabled:opacity-50 disabled:cursor-not-allowed" type="submit">ذخیره</Button>
                </div>
            </form>
        </Modal>
    )
}