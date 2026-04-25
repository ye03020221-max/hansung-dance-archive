"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { supabase } from "@/lib/supabase"
import { ArrowLeft } from "lucide-react"

const ADMIN_EMAIL = "admin@hansung.ac.kr"

export default function NoticeCreatePage() {
  const [userEmail, setUserEmail] = useState("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [form, setForm] = useState({
    title: "",
    content: "",
    author: "관리자",
    is_pinned: false,
  })

  useEffect(() => {
    const checkAdmin = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      const email = user?.email || ""
      setUserEmail(email)
      setLoading(false)

      if (email !== ADMIN_EMAIL) {
        alert("관리자만 접근할 수 있어요.")
        window.location.href = "/notices"
      }
    }

    checkAdmin()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (userEmail !== ADMIN_EMAIL) {
      alert("관리자만 작성할 수 있어요.")
      return
    }

    if (!form.title.trim() || !form.content.trim()) {
      alert("제목과 내용을 입력해주세요.")
      return
    }

    setSaving(true)

    try {
      const { error } = await supabase.from("공지사항").insert([
        {
          title: form.title,
          content: form.content,
          author: form.author || "관리자",
          is_pinned: form.is_pinned,
        },
      ])

      if (error) throw error

      alert("공지사항이 등록되었어요.")
      window.location.href = "/notices"
    } catch (err: any) {
      console.error("공지사항 등록 오류:", err)
      alert(err.message || "공지사항 등록 중 오류가 발생했어요.")
    } finally {
      setSaving(false)
    }
  }

  if (loading) return null

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <Header />

      <main className="flex-1 p-8">
        <div className="mx-auto max-w-4xl rounded-3xl border bg-white p-8 shadow-sm">
          <Link
            href="/notices"
            className="mb-6 inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900"
          >
            <ArrowLeft className="h-4 w-4" />
            공지사항 목록으로
          </Link>

          <h1 className="mb-8 text-3xl font-bold text-slate-900">공지사항 작성</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="mb-2 block text-sm font-semibold">제목</label>
              <input
                value={form.title}
                onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                className="w-full rounded-xl border p-3"
                placeholder="공지사항 제목"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold">작성자</label>
              <input
                value={form.author}
                onChange={(e) => setForm((prev) => ({ ...prev, author: e.target.value }))}
                className="w-full rounded-xl border p-3"
                placeholder="작성자 이름"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold">내용</label>
              <textarea
                value={form.content}
                onChange={(e) => setForm((prev) => ({ ...prev, content: e.target.value }))}
                rows={10}
                className="w-full rounded-xl border p-3"
                placeholder="공지사항 내용을 입력하세요"
              />
            </div>

            <label className="flex items-center gap-2 text-sm font-medium">
              <input
                type="checkbox"
                checked={form.is_pinned}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, is_pinned: e.target.checked }))
                }
              />
              중요 공지로 상단 고정
            </label>

            <button
              type="submit"
              disabled={saving}
              className="w-full rounded-xl bg-sky-600 p-4 text-lg font-bold text-white hover:bg-sky-700 disabled:bg-sky-300"
            >
              {saving ? "등록 중..." : "공지사항 등록"}
            </button>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  )
}