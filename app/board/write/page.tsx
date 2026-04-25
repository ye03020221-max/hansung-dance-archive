"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"

export default function BoardWritePage() {
  const router = useRouter()
  const [title, setTitle] = useState("")
  const [author, setAuthor] = useState("")
  const [content, setContent] = useState("")
  const [category, setCategory] = useState("일반")
  const [loading, setLoading] = useState(false)
  const [userId, setUserId] = useState("")
  const [userEmail, setUserEmail] = useState("")
  const [checkingUser, setCheckingUser] = useState(true)

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser()

      if (error || !user) {
        alert("로그인한 사용자만 글을 작성할 수 있어.")
        router.push("/login")
        return
      }

      setUserId(user.id)
      setUserEmail(user.email ?? "")
      setAuthor(user.email ?? "익명")
      setCheckingUser(false)
    }

    fetchUser()
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim() || !content.trim()) {
      alert("제목과 내용을 모두 입력해주세요.")
      return
    }

    if (!userId) {
      alert("로그인 정보를 확인할 수 없어.")
      return
    }

    setLoading(true)

    const { error } = await supabase.from("board_posts").insert([
      {
        title: title.trim(),
        author: author.trim(),
        content: content.trim(),
        category,
        user_id: userId,
        user_email: userEmail,
      },
    ])

    setLoading(false)

    if (error) {
      console.error("게시글 등록 오류:", error)
      alert("등록 중 오류가 발생했어.")
      return
    }

    alert("게시글이 등록되었어.")
    router.push("/board")
    router.refresh()
  }

  if (checkingUser) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 bg-background">
          <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
            <div className="rounded-2xl bg-card p-10 text-center shadow-md">
              <p className="text-muted-foreground">사용자 확인 중...</p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1 bg-background">
        <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-navy">글쓰기</h1>
              <p className="mt-2 text-muted-foreground">
                학생 게시판에 새 글을 작성해보세요
              </p>
            </div>

            <Button variant="outline" asChild>
              <Link href="/board">
                <ArrowLeft className="mr-2 h-4 w-4" />
                목록으로
              </Link>
            </Button>
          </div>

          <div className="rounded-2xl bg-card p-6 shadow-md">
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label
                  htmlFor="category"
                  className="mb-2 block text-sm font-medium text-foreground"
                >
                  카테고리
                </label>
                <select
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full rounded-lg border border-border bg-input px-4 py-3 text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="일반">일반</option>
                  <option value="공연">공연</option>
                  <option value="자료문의">자료문의</option>
                  <option value="이용문의">이용문의</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="author"
                  className="mb-2 block text-sm font-medium text-foreground"
                >
                  작성자
                </label>
                <input
                  type="text"
                  id="author"
                  value={author}
                  readOnly
                  className="w-full rounded-lg border border-border bg-muted px-4 py-3 text-foreground"
                />
              </div>

              <div>
                <label
                  htmlFor="title"
                  className="mb-2 block text-sm font-medium text-foreground"
                >
                  제목
                </label>
                <input
                  type="text"
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="제목을 입력하세요"
                  className="w-full rounded-lg border border-border bg-input px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label
                  htmlFor="content"
                  className="mb-2 block text-sm font-medium text-foreground"
                >
                  내용
                </label>
                <textarea
                  id="content"
                  rows={10}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="내용을 입력하세요"
                  className="w-full resize-none rounded-lg border border-border bg-input px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/board")}
                >
                  취소
                </Button>

                <Button
                  type="submit"
                  disabled={loading}
                  className="bg-gradient-to-r from-sky-dark to-navy text-primary-foreground"
                >
                  {loading ? "등록 중..." : "등록"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}