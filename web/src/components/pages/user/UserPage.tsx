// app/users/page.tsx
"use client";
import { FC, useState } from "react";
import { UserForm, UserType } from "@/types/schemaType";
import { UserCard } from "@/components/organisms/UserInfoCard";
import { Button } from "@/components/atoms";
import { UserPlus, Users } from "lucide-react";
import toast from "react-hot-toast";
import { UserModal } from "./UserModal";
import { createUser } from "@/app/actions/user/create";
import { useRouter } from "next/navigation";

interface IUsersProps {
    users: UserType[]
    userPosition: { _id: string, level: string }
}

const UsersPage: FC<IUsersProps> = ({ users, userPosition }) => {
    const router = useRouter()
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<UserType | null>(null);
    const [isLoading, setIsLoading] = useState(false);


    const handleCreateUser = async (data: UserForm) => {
        setIsLoading(true);
        try {
            const response = await createUser({ set: { city: data.cityId, first_name: data.first_name, last_name: data.last_name, gender: data.gender, orgIds: [data.orgId], personnel_code: data.personnel_code, phone: +data.phone, position: data.position, positionId: userPosition._id, province: data.provinceId, email: data.email, unitIds: [data.unitId], birth_date: (new Date(data.birth_date)) }, get: { _id: 1, birth_date: 1, first_name: 1, last_name: 1, } })
            if (response.success) {
                toast.success("کاربر جدید با موفقیت ایجاد شد");
                router.refresh();
            } else {
                toast.error(response.error.message)
            }
            setIsModalOpen(false);
        } catch (error) {
            toast.error("خطا در ایجاد کاربر");
        } finally {
            setIsLoading(false);
        }
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingUser(null);
    };

    const handleSubmit = (data: UserForm) => {
        console.log("data");
        handleCreateUser(data);
    };

    return (
        <div className="p-6">
            {/* هدر صفحه */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">مدیریت کاربران</h1>
                    <p className="text-slate-400">ایجاد، ویرایش و مدیریت کاربران سیستم</p>
                </div>
                <Button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/25 flex items-center gap-2"
                >
                    <UserPlus size={20} />
                    ایجاد کاربر جدید
                </Button>
            </div>

            {/* لیست کاربران */}
            {users.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {users?.map((user) => (
                        <UserCard
                            key={user._id}
                            user={user}
                            onRoleChange={() => { }}
                        />
                    ))}
                </div>
            ) : (
                /* حالت خالی */
                <div className="text-center py-16">
                    <div className="w-24 h-24 mx-auto mb-4 bg-slate-800 rounded-full flex items-center justify-center">
                        <Users className="text-slate-400" size={40} />
                    </div>
                    <h3 className="text-xl font-semibold text-slate-300 mb-2">
                        کاربری یافت نشد
                    </h3>
                    <p className="text-slate-500 mb-6">
                        اولین کاربر را ایجاد کنید
                    </p>
                    <Button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg"
                    >
                        ایجاد کاربر
                    </Button>
                </div>
            )}

            {/* مودال */}
            <UserModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onSubmit={handleSubmit}
                user={editingUser}
                positionId={userPosition._id}
                isLoading={isLoading}
            />
        </div>
    );
};

export default UsersPage;
