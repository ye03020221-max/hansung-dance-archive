"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { supabase } from "@/lib/supabase"
import { Bell, Loader2, Pin, Pencil, Trash2 } from "lucide-react"

const ADMIN_EMAIL = "admin@hansung.ac.kr"

type NoticeItem = {
  id: number
  title: string
  content: string
  author: string | null
  is_pinned: boolean | null
  created_at: string | null
}

export default function NoticesPage() {
  const [loading, setLoading] = useState(true)
  const [notices, setNotices] = useState<NoticeItem[]>([])
  const [userEmail, setUserEmail] = useState("")
  const [deletingId, setDeletingId] = useState<number | null>(null)

  const isAdmin = userEmail === ADMIN_EMAIL

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)

      const {
        data: { user },
      } = await supabase.auth.getUser()

      setUserEmail(user?.email || "")

      const { data, error } = await supabase
        .from("공지사항")
        .select("*")
        .order("is_pinned", { ascending: false })
        .order("created_at", { ascending: false })

      if (error) {
        console.error("공지사항 불러오기 오류:", error)
        setNotices([])
        setLoading(false)
        return
      }

      setNotices(data || [])
      setLoading(false)
    }

    fetchData()
  }, [])

  const handleDelete = async (noticeId: number) => {
    if (!isAdmin) {
      alert("관리자만 삭제할 수 있어요.")
      return
    }

    const ok = window.confirm("정말 이 공지사항을 삭제할까요?")
    if (!ok) return

    setDeletingId(noticeId)

    try {
      const { error } = await supabase
        .from("공지사항")
        .delete()
        .eq("id", noticeId)

      if (error) throw error

      setNotices((prev) => prev.filter((notice) => notice.id !== noticeId))
      alert("공지사항이 삭제되었어요.")
    } catch (err: any) {
      console.error("공지사항 삭제 오류:", err)
      alert(err.message || "공지사항 삭제 중 오류가 발생했어요.")
    } finally {
      setDeletingId(null)
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return ""
    return new Date(dateString).toLocaleDateString("ko-KR")
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <Header />

      <main className="flex-1 px-4 py-8 md:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="mb-8 flex items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">공지사항</h1>
              <p className="mt-2 text-slate-500">
                무용 아카이브 관련 소식을 확인하세요.
              </p>
            </div>

            {isAdmin && (
              <Link
                href="/notices/create"
                className="rounded-xl bg-sky-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-sky-700"
              >
                공지사항 작성
              </Link>
            )}
          </div>

          {loading ? (
            <div className="flex items-center justify-center rounded-3xl bg-white py-20 shadow-sm">
              <div className="flex items-center gap-3 text-slate-500">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>공지사항 불러오는 중...</span>
              </div>
            </div>
          ) : notices.length === 0 ? (
            <div className="rounded-3xl bg-white py-20 text-center shadow-sm">
              <div className="mb-4 flex justify-center text-slate-400">
                <Bell className="h-10 w-10" />
              </div>
              <p className="text-slate-500">등록된 공지사항이 없어요.</p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-3xl border border-sky-100 bg-white shadow-sm">
              {notices.map((notice, index) => (
                <div
                  key={notice.id}
                  className={`px-6 py-6 transition-colors hover:bg-slate-50 ${
                    index !== notices.length - 1 ? "border-b border-sky-100" : ""
                  }`}
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div className="min-w-0 flex-1">
                      <Link href={`/notices/${notice.id}`}>
                        <div className="flex items-center gap-3">
                          {notice.is_pinned && (
                            <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold text-sky-700">
                              <Pin className="h-3 w-3" />
                              중요
                            </span>
                          )}

                          <p className="truncate text-xl font-semibold text-slate-900 hover:underline">
                            {notice.title}
                          </p>
                        </div>
                      </Link>

                      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-500">
                        <span>{notice.author || "관리자"}</span>
                        <span>{formatDate(notice.created_at)}</span>
                      </div>

                      {notice.content && (
                        <p className="mt-3 line-clamp-2 text-sm text-slate-500 md:hidden">
                          {notice.content}
                        </p>
                      )}
                    </div>

                    {isAdmin && (
                      <div className="flex shrink-0 gap-2 md:ml-6">
                        <Link
                          href={`/notices/edit/${notice.id}`}
                          className="inline-flex items-center justify-center rounded-lg bg-amber-100 px-3 py-2 text-amber-700 transition-colors hover:bg-amber-200"
                        >
                          <Pencil className="h-4 w-4" />
                        </Link>

                        <button
                          onClick={() => handleDelete(notice.id)}
                          disabled={deletingId === notice.id}
                          className="inline-flex items-center justify-center rounded-lg bg-red-100 px-3 py-2 text-red-600 transition-colors hover:bg-red-200 disabled:opacity-50"
                        >
                          {deletingId === notice.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}