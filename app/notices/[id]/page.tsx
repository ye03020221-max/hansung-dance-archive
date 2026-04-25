"use client"

import { use, useEffect, useState } from "react"
import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { supabase } from "@/lib/supabase"
import { ArrowLeft, Loader2, Pin } from "lucide-react"

type NoticeDetail = {
  id: number
  title: string
  content: string
  author: string | null
  is_pinned: boolean | null
  created_at: string | null
}

export default function NoticeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const [loading, setLoading] = useState(true)
  const [notice, setNotice] = useState<NoticeDetail | null>(null)

  useEffect(() => {
    const fetchNotice = async () => {
      setLoading(true)

      const { data, error } = await supabase
        .from("공지사항")
        .select("*")
        .eq("id", Number(id))
        .single()

      if (error) {
        console.error("공지사항 상세 불러오기 오류:", error)
        setNotice(null)
        setLoading(false)
        return
      }

      setNotice(data)
      setLoading(false)
    }

    if (id) {
      fetchNotice()
    }
  }, [id])

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex flex-1 items-center justify-center bg-slate-50">
          <div className="flex items-center gap-3 text-slate-500">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>공지사항 불러오는 중...</span>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (!notice) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex flex-1 items-center justify-center bg-slate-50 px-4">
          <div className="rounded-3xl bg-white p-10 text-center shadow-sm">
            <h1 className="text-2xl font-bold text-slate-900">
              공지사항을 찾을 수 없어요
            </h1>
            <p className="mt-2 text-slate-500">
              삭제되었거나 존재하지 않는 공지사항일 수 있어요.
            </p>
            <Link
              href="/notices"
              className="mt-6 inline-flex rounded-xl bg-sky-600 px-5 py-3 text-sm font-semibold text-white hover:bg-sky-700"
            >
              공지사항 목록으로
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <Header />

      <main className="flex-1 px-4 py-8 md:px-8">
        <div className="mx-auto max-w-4xl">
          <Link
            href="/notices"
            className="mb-6 inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900"
          >
            <ArrowLeft className="h-4 w-4" />
            공지사항 목록으로
          </Link>

          <div className="rounded-3xl border bg-white p-8 shadow-sm">
            <div className="mb-6 border-b pb-6">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                {notice.is_pinned && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold text-sky-700">
                    <Pin className="h-3 w-3" />
                    중요 공지
                  </span>
                )}
              </div>

              <h1 className="text-3xl font-bold text-slate-900">
                {notice.title}
              </h1>

              <div className="mt-4 flex flex-wrap gap-4 text-sm text-slate-500">
                <span>작성자: {notice.author || "관리자"}</span>
                <span>
                  작성일:{" "}
                  {notice.created_at
                    ? new Date(notice.created_at).toLocaleString("ko-KR")
                    : "-"}
                </span>
              </div>
            </div>

            <div className="whitespace-pre-line leading-8 text-slate-700">
              {notice.content}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}