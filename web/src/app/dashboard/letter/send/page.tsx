import { getLetters } from '@/app/actions/letter/gets';
import { getActivePositionId } from '@/app/actions/position/getActivePosition';
import { LetterStats, AdvancedFilters, LettersList } from '@/components/organisms/letter'
import { cookies } from 'next/headers';

export default async function SentLettersPage() {
    const userCookie = (await cookies()).get("user");
    const user = userCookie ? JSON.parse(userCookie.value) : null;

    const positionId = await getActivePositionId()
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
            senderId: positionId!,
            positionId: positionId!
        },
    });
    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-white">نامه‌های ارسالی</h1>
            </div>

            <LetterStats />
            <LettersList initialLetters={response.body} />
        </div>
    )
}