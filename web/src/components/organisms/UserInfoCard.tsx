// components/organisms/UserCard.tsx
import { FC, useState } from "react";
import { User as UserIcon, Eye } from "lucide-react";
import { UserType } from "@/types/schemaType";
import { getGenderText } from "@/utils/helper";
import { UserLevel } from "@/types/types";
import { useRouter } from "next/navigation";

interface UserCardProps {
    user: UserType;
    onRoleChange: (userId: string, role: UserLevel) => void;
}

export const UserCard: FC<UserCardProps> = ({ user, onRoleChange }) => {
    const router = useRouter()

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("fa-IR");
    };

    return (
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 hover:border-slate-600 transition-all duration-300 hover:shadow-lg">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center">
                        <UserIcon className="text-blue-400" size={20} />
                    </div>
                    <div>
                        <h3 className="text-white font-semibold text-lg">
                            {user.first_name} {user.last_name}
                        </h3>
                        <p className="text-slate-400 text-sm">{user.personnel_code}</p>
                    </div>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={() => router.push(`/dashboard/user/${user._id}/features`)}
                        title="مشاهده"
                        className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/20 p-2 rounded-lg"
                    >
                        <Eye size={16} />
                    </button>
                </div>
            </div>

            {/* Info */}
            <div className="space-y-3">
                <InfoRow label="تلفن" value={user.phone} />
                <InfoRow label="جنسیت" value={getGenderText(user.gender)} />
                <InfoRow label="تاریخ تولد" value={formatDate(user.birth_date)} />
                {user.email && <InfoRow label="ایمیل" value={user.email} />}

            </div>
        </div>
    );
};

const InfoRow = ({ label, value }: { label: string; value: string }) => (
    <div className="flex justify-between items-center">
        <span className="text-slate-400 text-sm">{label}:</span>
        <span className="text-white font-medium">{value}</span>
    </div>
);