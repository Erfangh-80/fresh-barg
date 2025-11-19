import { getActivePositionId } from "@/app/actions/position/getActivePosition";
import { LetterForm } from "@/components/organisms/FormLetter";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const tagOptions = [
    { value: "فوری", label: "فوری" },
    { value: "اداری", label: "اداری" },
    { value: "محرمانه", label: "محرمانه" },
    { value: "مهم", label: "مهم" },
    { value: "داخلی", label: "داخلی" },
];

export default async function LettersPage() {
    const cookieStore = await cookies()
    const userCookie = cookieStore.get("user")
    if (!userCookie?.value) redirect("/login")

    const user = JSON.parse(userCookie.value)

    const activePosition = await getActivePositionId()
    if (!activePosition) redirect("/dashboard")

    return (
        <div className="p-6 space-y-6">
            <LetterForm
                authorId={user._id}
                activePosition={activePosition}
                tagOptions={tagOptions}
            />
        </div>
    )
}