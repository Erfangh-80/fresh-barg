import { getLetters } from "@/app/actions/letter/gets";
import { getActivePositionId } from "@/app/actions/position/getActivePosition";
import { LettersList, LetterStats } from "@/components/organisms/letter";
import { redirect } from "next/navigation";

export default async function LettersPage({ }: {}) {

  const activePosition = await getActivePositionId()
  if (!activePosition) redirect("/dashboard")
  const response = await getLetters({
    get: {
      _id: 1,
      number: 1,
      subject: 1,
      leed: 1,
      tags: 1,
      created_at: 1,
      delivered: 1,
      is_end: 1,
      content: 1,
    },
    set: {
      positionId: activePosition
    },
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">مدیریت نامه‌ها</h1>
      </div>

      <LetterStats />

      <LettersList initialLetters={response.body} />
    </div>
  )
}
