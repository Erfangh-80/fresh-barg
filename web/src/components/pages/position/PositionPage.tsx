"use client";

import { FC } from "react";
import { Shield } from "lucide-react";
import { Button } from "@/components/atoms";
import { DeviceCard } from "@/components/organisms/PositionCard";
import { CreateRoleModal } from "@/components/organisms/form/CreateRoleModal";
import { useModal } from "@/hooks/useModal";

export type TRole = {
    _id: string;
    name: string;
    unit: { _id: string; name: string };
    org: { _id: string; name: string };
    panel: string;
    level: string;
    features: string[];
};

interface RoleClientProps {
    roles: TRole[];
    activePositionId: string;
}

export const RoleClient: FC<RoleClientProps> = ({ roles, activePositionId }) => {
    const { isOpen, open, close } = useModal();

    return (
        <>
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">مدیریت نقش‌های کاربران</h1>
                    <p className="text-slate-400">تعریف و مدیریت سطح دسترسی کاربران در سازمان‌ها و واحدها</p>
                </div>
                <Button
                    onClick={open}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/25"
                >
                    ایجاد نقش جدید
                </Button>
            </div>

            {/* Roles Grid */}
            {roles.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {roles.map((role) => (
                        <DeviceCard
                            key={role._id}
                            _id={role._id}
                            name={role.name}
                            unitId={role.unit?.name}
                            orgId={role.org?.name}
                            panel={role.panel}
                            level={role.level}
                            positionId={activePositionId}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center py-16">
                    <div className="w-24 h-24 mx-auto mb-4 bg-slate-800 rounded-full flex items-center justify-center">
                        <Shield className="text-slate-400" size={40} />
                    </div>
                    <h3 className="text-xl font-semibold text-slate-300 mb-2">نقشی تعریف نشده</h3>
                    <p className="text-slate-500 mb-6">اولین نقش سازمانی را ایجاد کنید</p>
                    <Button onClick={open} className="bg-blue-600 hover:bg-blue-700 text-white">
                        ایجاد نقش جدید
                    </Button>
                </div>
            )}

            <CreateRoleModal isOpen={isOpen} onClose={close} positionId={activePositionId} />
        </>
    );
};