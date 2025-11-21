'use client'
import { useState, useEffect } from 'react'
import {
    ArrowRight,
    Download,
    Printer,
    User,
    Users,
    Reply,
    Copy,
    Check,
    Tag,
    Calendar,
    Edit3
} from 'lucide-react'
import Link from 'next/link'

interface Author {
    _id: string
    first_name: string
    last_name: string
    phone?: number
    gender?: string
    birth_date?: string
    personnel_code?: string
    email?: string
    is_active?: boolean
}

interface Sender {
    _id: string
    name: string
    level?: string
    panel?: string
}

interface Receiver {
    _id: string
    name: string
    level?: string
    panel?: string
}

interface Letter {
    _id: string
    number: number | string
    subject: string
    created_at: string
    leed?: string
    content: string
    author: Author
    sender: Sender
    recievers: Receiver
    tags: string[]
    readByPositions?: Array<{ _id: string }>
    readByUsers?: Array<{ _id: string }>
}

export const LetterDetailsPage = ({ initialLetter }: { initialLetter?: Letter }) => {
    const [letter, setLetter] = useState<Letter | null>(null)
    const [copied, setCopied] = useState(false)
    const [loading, setLoading] = useState(!initialLetter)

    useEffect(() => {
        if (initialLetter) {
            setLetter(initialLetter)
            setLoading(false)
        }
    }, [initialLetter])

    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        return date.toLocaleDateString('fa-IR') + ' - ' + date.toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })
    }

    const handleDownload = () => {
        if (!letter) return
        const element = document.createElement('a')
        const file = new Blob([letter.content], { type: 'text/html' })
        element.href = URL.createObjectURL(file)
        element.download = `نامه-${letter.number}.html`
        document.body.appendChild(element)
        element.click()
        document.body.removeChild(element)
    }

    const handlePrint = () => window.print()

    const handleCopyLink = () => {
        navigator.clipboard.writeText(window.location.href)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    const handleReply = () => {
        if (!letter) return
        window.location.href = `/letters/create?replyTo=${letter._id}&number=${letter.number}`
    }

    if (loading) {
        return (
            <div className="p-6 flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        )
    }

    if (!letter) return <div className="p-6 text-red-400">نامه یافت نشد.</div>

    const authorName = `${letter.author.first_name} ${letter.author.last_name}`

    return (
        <div className="p-6 space-y-6">
            {/* هدر */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard/letter" className="p-2 bg-slate-700 hover:bg-slate-600 rounded-xl transition-colors">
                        <ArrowRight className="text-slate-300" size={20} />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-white">جزئیات نامه</h1>
                        <p className="text-slate-400 text-sm mt-1">شماره: {letter.number}</p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <button onClick={handleReply} className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl transition-colors">
                        <Reply size={18} /> پاسخ
                    </button>
                    <button onClick={handleCopyLink} className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-xl transition-colors">
                        {copied ? <Check size={18} /> : <Copy size={18} />}
                        {copied ? 'کپی شد!' : 'کپی لینک'}
                    </button>
                    <button onClick={handlePrint} className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-xl transition-colors">
                        <Printer size={18} /> چاپ
                    </button>
                    <button onClick={handleDownload} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors">
                        <Download size={18} /> دانلود
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* سایدبار */}
                <div className="lg:col-span-1 space-y-6">
                    {/* اطلاعات اصلی */}
                    <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                        <h3 className="text-lg font-semibold text-white mb-4">اطلاعات نامه</h3>
                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <span className="text-slate-400">شماره</span>
                                <span className="text-white font-mono font-bold">{letter.number}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-400 flex items-center gap-1"><Calendar size={14} /> ایجاد</span>
                                <span className="text-white text-xs">{formatDate(letter.created_at)}</span>
                            </div>
                            {letter.leed && (
                                <div className="flex justify-between">
                                    <span className="text-slate-400">لید</span>
                                    <span className="text-white text-sm truncate max-w-[180px]">{letter.leed}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* فرستنده و گیرندگان */}
                    <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                        <h3 className="text-lg font-semibold text-white mb-4">فرستنده و گیرنده</h3>
                        <div className="space-y-4">
                            {/* فرستنده */}
                            <div>
                                <div className="flex items-center gap-2 text-slate-400 mb-2 text-sm">
                                    <User size={16} /> فرستنده
                                </div>
                                <p className="text-white font-medium">{authorName}</p>
                                <p className="text-slate-400 text-sm">{letter.sender.name}</p>
                            </div>

                            {/* گیرنده */}
                            <div>
                                <div className="flex items-center gap-2 text-slate-400 mb-2 text-sm">
                                    <Users size={16} /> گیرنده
                                </div>
                                <p className="text-white text-sm">• {letter.recievers.name}</p>
                            </div>
                        </div>
                    </div>

                    {/* تگ‌ها */}
                    {letter.tags.length > 0 && (
                        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                <Tag size={18} /> تگ‌ها
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {letter.tags.map((tag, i) => (
                                    <span key={i} className="px-3 py-1 bg-slate-700 text-slate-300 rounded-full text-xs border border-slate-600">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* خوانده شده توسط */}
                    {(letter.readByPositions?.length || letter.readByUsers?.length) ? (
                        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                            <h3 className="text-lg font-semibold text-white mb-4">خوانده شده توسط</h3>
                            <div className="text-xs text-slate-400 space-y-1">
                                {letter.readByPositions?.map((p, i) => (
                                    <div key={i}>• نقش: {p._id}</div>
                                ))}
                                {letter.readByUsers?.map((u, i) => (
                                    <div key={i}>• کاربر: {u._id}</div>
                                ))}
                            </div>
                        </div>
                    ) : null}
                </div>

                {/* محتوای اصلی */}
                <div className="lg:col-span-2 space-y-6">
                    {/* موضوع */}
                    <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                        <h2 className="text-xl font-bold text-white mb-3">{letter.subject}</h2>
                        {letter.leed && <p className="text-slate-400 text-sm mb-2 line-clamp-2">لید: {letter.leed}</p>}
                        <div className="flex flex-wrap gap-2 mt-3">
                            {letter.tags.map((tag, i) => (
                                <span key={i} className="px-3 py-1 bg-slate-700 text-slate-300 rounded-full text-xs border border-slate-600">
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* محتوای نامه */}
                    <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                        <h3 className="text-lg font-semibold text-white mb-4">محتوای نامه</h3>
                        <div
                            className="prose prose-lg max-w-none dark:prose-invert prose-headings:text-white prose-p:text-slate-300 prose-li:text-slate-300 prose-strong:text-white prose-blockquote:text-slate-300 prose-p:leading-8 prose-ul:list-disc prose-ul:pr-6"
                            dangerouslySetInnerHTML={{ __html: letter.content }}
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}