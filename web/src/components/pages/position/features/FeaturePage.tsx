'use client';
import { updatePosition } from "@/app/actions/position/update";
import { AddPositionToUserForm } from "@/components/organisms/AddPositionToUserForm";
import { MyAsyncMultiSelect } from "@/components/atoms";
import { AvatarUpload } from "@/components/mulecules";
import { ReactSelectOption } from "@/types/types";
import { Briefcase, Building, Mail, MapPin, Phone, Shield, User, Save, Settings, Key, CheckCircle2, Circle, CircleCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { FC, useMemo, useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";


interface UserData {
    _id: string;
    first_name: string;
    last_name: string;
    gender?: string;
    avatar?: string;
    email?: string;
    phone?: string;
    position: {
        _id: string;
        name: string;
        level?: string;
        features: string[];
    }[];
    province: { _id: string; name: string };
    city: { _id: string; name: string };
    org: { _id: string; name: string }[];
    unit: { _id: string; name: string }[];
}

interface IProps {
    user: UserData
    activePosition: string;
}

const AVAILABLE_FEATURES: ReactSelectOption[] = [
    { value: "create unit", label: "ایجاد واحد" },
    { value: "create chart", label: "ایجاد چارت" },
    { value: "read letters", label: "مشاهده نامه‌ها" },
    { value: "create letters", label: "ایجاد نامه" },
    { value: "reffer letters", label: "ارجاع نامه" },
    { value: "add staff", label: "افزودن کارمند" },
    { value: "add position to user", label: "افزودن نقش به کاربر" },
    { value: "read positions", label: "مشاهده نقش‌ها" },
    { value: "add position", label: "افزودن نقش" },
    { value: "edit org", label: "ویرایش سازمان" },
    { value: "edit unit", label: "ویرایش واحد" },
];

export const FeaturesPage: FC<IProps> = ({ activePosition, user }) => {

    const router = useRouter()
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [selectedPositionId, setSelectedPositionId] = useState<string>(activePosition);
    const [isSaving, setIsSaving] = useState(false);
    const { setValue, watch } = useForm()

    // پوزیشن انتخابی
    const selectedPosition = useMemo(() => {
        if (!user?.position?.length) return null;
        return user.position.find(pos => pos._id === selectedPositionId) || user.position[0];
    }, [user?.position, selectedPositionId]);

    // تبدیل features پوزیشن انتخابی به فرمت ReactSelectOption
    const currentFeatures = useMemo((): ReactSelectOption[] => {
        if (!selectedPosition?.features?.length) return [];
        return selectedPosition.features.map(feature => {
            const foundFeature = AVAILABLE_FEATURES.find(af => af.value === feature);
            return foundFeature || { value: feature, label: feature };
        });
    }, [selectedPosition]);

    // وقتی پوزیشن تغییر کرد، form values رو آپدیت کن
    useEffect(() => {
        setValue('features', currentFeatures);
    }, [currentFeatures, setValue]);

    const loadOptions = (
        inputValue: string,
        callback: (options: ReactSelectOption[]) => void
    ) => {
        const filtered = AVAILABLE_FEATURES.filter(feature =>
            feature.label.includes(inputValue) ||
            feature.value.includes(inputValue) ||
            inputValue === ''
        );
        callback(filtered);
    };

    const handlePositionClick = (positionId: string) => {
        setSelectedPositionId(positionId);
    };

    const handleSaveChanges = async () => {
        if (!selectedPosition?._id) {
            toast.error("هیچ نقشی برای شما تعریف نشده")
            return;
        }

        setIsSaving(true);
        const formFeatures = watch('features');
        console.log({ user, selectedPosition, formFeatures });

        try {
            const response = await updatePosition({
                set: {
                    _id: selectedPosition._id,
                    positionId: selectedPositionId,
                    features: formFeatures
                },
                get: {
                    _id: 1,
                    features: 1,
                    level: 1,
                    name: 1,
                    user: { _id: 1, first_name: 1, last_name: 1 }
                }
            })
            console.log(response);

            if (response.success) {
                toast.success("تغییرات با موفقیت ذخیره شد");
                router.refresh();
            } else {
                toast.error("خطا در ذخیره تغییرات");
            }
        } catch (error) {
            console.error('Error saving changes:', error);
            toast.error("خطا در ذخیره تغییرات");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="flex gap-6 p-6">
            {/* پنل سمت چپ - اطلاعات کاربر */}
            <div className="flex-1 bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl p-6 border border-white/20">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                    <div className="w-10 h-10 bg-linear-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                        <User className="w-6 h-6 text-white" />
                    </div>
                    اطلاعات کاربر
                </h2>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* ستون اول - آواتار و اطلاعات اصلی */}
                    <div className="space-y-6">
                        <div className="flex flex-col items-center text-center">
                            <AvatarUpload
                                initialAvatar={user.avatar || '/images/noPhoto.png'}
                                onAvatarChange={setAvatarFile}
                                size="lg"
                            />
                            <h3 className="text-2xl font-bold text-white">
                                {user.first_name} {user.last_name}
                            </h3>
                            <p className="text-slate-300 mt-2">
                                {selectedPosition?.name || 'بدون نقش'}
                            </p>
                            {selectedPosition && (
                                <div className="mt-3">
                                    <span className="text-sm bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full">
                                        نقش فعال: {selectedPosition.name}
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* اطلاعات تماس */}
                        <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                            <h4 className="text-lg font-semibold text-white mb-4">اطلاعات تماس</h4>
                            <div className="space-y-3">
                                {user.email && (
                                    <div className="flex items-center gap-3">
                                        <Mail className="w-5 h-5 text-blue-400 shrink-0" />
                                        <span className="text-slate-300 text-sm">{user.email}</span>
                                    </div>
                                )}
                                {user.phone && (
                                    <div className="flex items-center gap-3">
                                        <Phone className="w-5 h-5 text-green-400 shrink-0" />
                                        <span dir="ltr" className="text-slate-300 text-sm">{user.phone}</span>
                                    </div>
                                )}
                                <div className="flex items-center gap-3">
                                    <MapPin className="w-5 h-5 text-purple-400 shrink-0" />
                                    <span className="text-slate-300 text-sm">
                                        {user.province?.name} - {user.city?.name}
                                    </span>
                                </div>
                                {user.org?.[0] && (
                                    <div className="flex items-center gap-3">
                                        <Building className="w-5 h-5 text-cyan-400 shrink-0" />
                                        <span className="text-slate-300 text-sm">{user.org[0].name}</span>
                                    </div>
                                )}
                                {user.unit?.[0] && (
                                    <div className="flex items-center gap-3">
                                        <Briefcase className="w-5 h-5 text-emerald-400 shrink-0" />
                                        <span className="text-slate-300 text-sm">{user.unit[0].name}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* ستون دوم - نقش‌های کاربر با radio box */}
                    <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                        <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <Settings className="w-5 h-5 text-blue-400" />
                            نقش‌های کاربر
                        </h4>
                        <div className="space-y-3">
                            {user.position?.map((position) => (
                                <div
                                    key={position._id}
                                    className={`p-4 rounded-xl border-2 transition-all duration-300 cursor-pointer ${selectedPositionId === position._id
                                        ? 'bg-linear-to-r from-blue-500/20 to-purple-500/20 border-blue-400/50 shadow-lg'
                                        : 'bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/10'
                                        }`}
                                    onClick={() => handlePositionClick(position._id)}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            {/* Radio Button */}
                                            <div className="flex items-center justify-center">
                                                {selectedPositionId === position._id ? (
                                                    <CircleCheck className="w-6 h-6 text-green-400" />
                                                ) : (
                                                    <Circle className="w-6 h-6 text-slate-400" />
                                                )}
                                            </div>

                                            <div className="text-right">
                                                <div className="font-medium text-white">
                                                    {position.name}
                                                </div>
                                                {position.level && (
                                                    <div className="text-sm text-slate-300 mt-1">
                                                        سطح: {position.level}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* تعداد ویژگی‌ها */}
                                        <div className="text-left">
                                            <span className={`text-xs px-2 py-1 rounded-full ${selectedPositionId === position._id
                                                ? 'bg-blue-500/30 text-blue-300'
                                                : 'bg-slate-600/50 text-slate-300'
                                                }`}>
                                                {position.features?.length || 0} ویژگی
                                            </span>
                                        </div>
                                    </div>

                                    {/* ویژگی‌های این نقش */}
                                    {selectedPositionId === position._id && position.features && position.features.length > 0 && (
                                        <div className="mt-3 pt-3 border-t border-white/10">
                                            <div className="flex flex-wrap gap-1">
                                                {position.features.slice(0, 3).map((feature, index) => {
                                                    const foundFeature = AVAILABLE_FEATURES.find(af => af.value === feature);
                                                    return (
                                                        <span
                                                            key={index}
                                                            className="px-2 py-1 bg-green-500/20 text-green-300 rounded-lg text-xs border border-green-500/30"
                                                        >
                                                            {foundFeature?.label || feature}
                                                        </span>
                                                    );
                                                })}
                                                {position.features.length > 3 && (
                                                    <span className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded-lg text-xs border border-blue-500/30">
                                                        +{position.features.length - 3} بیشتر
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* خلاصه نقش فعال */}
                        {selectedPosition && (
                            <div className="mt-4 p-3 bg-linear-to-r from-blue-500/10 to-purple-500/10 rounded-lg border border-blue-400/30">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-blue-300">نقش فعال:</span>
                                    <span className="text-white font-medium">{selectedPosition.name}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm mt-1">
                                    <span className="text-blue-300">تعداد ویژگی‌ها:</span>
                                    <span className="text-white font-medium">{selectedPosition.features?.length || 0}</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* پنل سمت راست - مدیریت ویژگی‌ها */}
            <div className="flex-1 bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl p-6 border border-white/20">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-white flex items-center gap-3">
                        <div className="w-10 h-10 bg-linear-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center shadow-lg">
                            <Key className="w-5 h-5 text-white" />
                        </div>
                        مدیریت ویژگی‌ها
                    </h3>
                    {selectedPosition && (
                        <span className="text-sm text-blue-300 bg-blue-500/20 px-3 py-1 rounded-full">
                            {selectedPosition.name}
                        </span>
                    )}
                </div>

                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-3">
                            ویژگی‌ها {selectedPosition && `برای ${selectedPosition.name}`}
                        </label>
                        <MyAsyncMultiSelect
                            key={selectedPositionId}
                            label="ویژگی ها"
                            name="features"
                            setValue={setValue}
                            loadOptions={loadOptions}
                            defaultValue={currentFeatures}
                            defaultOptions={AVAILABLE_FEATURES}
                        />
                        <p className="text-xs text-slate-400 mt-3">
                            {selectedPosition
                                ? `ویژگی‌ها برای نقش "${selectedPosition.name}" مدیریت می‌شوند`
                                : 'لطفاً ابتدا نقش کاربر را تنظیم کنید'
                            }
                        </p>
                    </div>

                    <div className="bg-slate-800/50 rounded-xl p-4">
                        <h4 className="text-sm font-medium text-slate-300 mb-3 flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-green-400" />
                            ویژگی‌های فعلی
                        </h4>
                        <div className="flex flex-wrap gap-2">
                            {currentFeatures.map((feature, index) => (
                                <span
                                    key={index}
                                    className="px-3 py-2 bg-green-500/20 text-green-300 rounded-lg text-sm border border-green-500/30"
                                >
                                    {feature.label}
                                </span>
                            ))}
                            {currentFeatures.length === 0 && (
                                <span className="text-slate-500 text-sm">هیچ ویژگی‌ای انتخاب نشده</span>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-white/10">
                        <div className="flex items-center gap-4 text-sm text-slate-400">
                            <span>ویژگی فعال: {currentFeatures.length}</span>
                            <span>نقش: {user.position?.length || 0}</span>
                            <span>ویژگی کل: {AVAILABLE_FEATURES.length}</span>
                        </div>

                        <button
                            onClick={handleSaveChanges}
                            disabled={!selectedPosition || isSaving}
                            className="bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-slate-600 disabled:to-slate-700 text-white font-medium py-3 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {isSaving ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    در حال ذخیره...
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4" />
                                    ذخیره تغییرات
                                </>
                            )}
                        </button>
                    </div>
                    <div className="border-t border-white/15">
                        <AddPositionToUserForm
                            userId={user._id}
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}