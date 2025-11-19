import { getActivePositionId } from "@/app/actions/position/getActivePosition";
import { getUsers } from "@/app/actions/user/getUsers";
import UsersPage from "@/components/pages/user/UserPage";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { UserLevel } from "@/types/types"; // ✅ اضافه کن

// تابع کمکی برای تأیید اینکه مقدار یک UserLevel معتبر است
function isValidUserLevel(level: string): level is UserLevel {
    return ["Ghost", "Orghead", "Unithead", "Staff"].includes(level);
}

const Page = async () => {
    const cookieStore = await cookies();
    const userCookie = cookieStore.get("user");

    if (!userCookie?.value) redirect("/login");

    const user = JSON.parse(userCookie.value) as { position: Array<{ _id: string; level: string }> };
    if (!user) redirect("/login")
    const activePositionId = await getActivePositionId();
    const foundPosition = activePositionId
        ? user.position.find(p => p._id === activePositionId)
        : user.position[0];

    if (!foundPosition) redirect("/dashboard");

    // ✅ تأیید اینکه `level` معتبر است
    if (!isValidUserLevel(foundPosition.level)) {
        redirect("/dashboard"); // یا نمایش خطا
    }

    // حالا می‌توانیم به صورت ایمن به `UserLevel` تبدیل کنیم
    const activePosition = {
        _id: foundPosition._id,
        level: foundPosition.level, // حالا این `UserLevel` است
    };

    // دسترسی: فقط Ghost, Orghead, Unithead
    const allowedRoles: UserLevel[] = ["Ghost", "Orghead", "Unithead"];
    if (!allowedRoles.includes(activePosition.level)) {
        redirect("/dashboard");
    }

    const responseUser = await getUsers({
        get: {
            _id: 1,
            email: 1,
            first_name: 1,
            last_name: 1,
            birth_date: 1,
            gender: 1,
            phone: 1,
            personnel_code: 1,
            is_active: 1,
        },
        set: { limit: 10, page: 1 },
    });

    return (
        <UsersPage
            userPosition={activePosition}
            users={responseUser}
        />
    );
};

export default Page;