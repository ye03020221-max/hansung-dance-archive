"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Calendar, User, Eye } from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"

type BoardPost = {
  id: number
  title: string
  author: string
  content: string
  category: string
  views: number
  created_at: string
  user_id: string | null
  user_email: string | null
  admin_reply: string | null
  admin_reply_updated_at: string | null
}

export default function BoardDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [post, setPost] = useState<BoardPost | null>(null)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)
  const [savingReply, setSavingReply] = useState(false)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null)
  const [adminReply, setAdminReply] = useState("")

  const ADMIN_EMAIL = "admin@hansung.ac.kr"

  useEffect(() => {
    const fetchPost = async () => {
      if (!params?.id) return

      setLoading(true)

      const {
        data: { user },
      } = await supabase.auth.getUser()

      setCurrentUserId(user?.id ?? null)
      setCurrentUserEmail(user?.email ?? null)

      const postId = Number(params.id)

      const { data, error } = await supabase
        .from("board_posts")
        .select("*")
        .eq("id", postId)
        .single()

      if (error || !data) {
        console.error("게시글 불러오기 오류:", error)
        setPost(null)
        setLoading(false)
        return
      }

      const newViews = (data.views ?? 0) + 1

      const { error: updateError } = await supabase
        .from("board_posts")
        .update({ views: newViews })
        .eq("id", postId)

      if (updateError) {
        console.error("조회수 증가 오류:", updateError)
      }

      setPost({
        ...data,
        views: newViews,
      })

      setAdminReply(data.admin_reply || "")
      setLoading(false)
    }

    fetchPost()
  }, [params?.id])

  const handleDelete = async () => {
    if (!post) return

    if (!currentUserId || post.user_id !== currentUserId) {
      alert("본인이 작성한 글만 삭제할 수 있어.")
      return
    }

    const ok = window.confirm("정말 이 게시글을 삭제할까?")
    if (!ok) return

    setDeleting(true)

    const { error } = await supabase
      .from("board_posts")
      .delete()
      .eq("id", post.id)

    setDeleting(false)

    if (error) {
      console.error("게시글 삭제 오류:", error)
      alert("삭제 중 오류가 발생했어.")
      return
    }

    alert("게시글이 삭제되었어.")
    router.push("/board")
    router.refresh()
  }

  const handleSaveReply = async () => {
    if (!post) return

    if (currentUserEmail !== ADMIN_EMAIL) {
      alert("관리자만 답글을 작성할 수 있어.")
      return
    }

    setSavingReply(true)

    const { error } = await supabase
      .from("board_posts")
      .update({
        admin_reply: adminReply,
        admin_reply_updated_at: new Date().toISOString(),
      })
      .eq("id", post.id)

    setSavingReply(false)

    if (error) {
      console.error("답글 저장 오류:", error)
      alert("답글 저장 중 오류가 발생했어.")
      return
    }

    setPost({
      ...post,
      admin_reply: adminReply,
      admin_reply_updated_at: new Date().toISOString(),
    })

    alert("답글이 저장되었어.")
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const day = String(date.getDate()).padStart(2, "0")
    return `${year}.${month}.${day}`
  }

  const isMyPost = !!post && !!currentUserId && post.user_id === currentUserId
  const isAdmin = currentUserEmail === ADMIN_EMAIL

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1 bg-background">
        <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="mb-6">
            <Button variant="outline" asChild>
              <Link href="/board">
                <ArrowLeft className="mr-2 h-4 w-4" />
                목록으로
              </Link>
            </Button>
          </div>

          {loading ? (
            <div className="rounded-2xl bg-card p-10 text-center shadow-md">
              <p className="text-muted-foreground">게시글 불러오는 중...</p>
            </div>
          ) : !post ? (
            <div className="rounded-2xl bg-card p-10 text-center shadow-md">
              <h1 className="mb-3 text-2xl font-bold text-navy">
                게시글을 찾을 수 없어
              </h1>
              <p className="mb-6 text-muted-foreground">
                삭제되었거나 존재하지 않는 게시글이야.
              </p>
              <Button onClick={() => router.push("/board")}>
                게시판으로 돌아가기
              </Button>
            </div>
          ) : (
            <div className="rounded-2xl bg-card shadow-md">
              <div className="border-b border-border p-6">
                <div className="mb-3">
                  <span className="rounded bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                    {post.category}
                  </span>
                </div>

                <h1 className="mb-4 text-2xl font-bold text-navy md:text-3xl">
                  {post.title}
                </h1>

                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    {post.author}
                  </span>

                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {formatDate(post.created_at)}
                  </span>

                  <span className="flex items-center gap-1">
                    <Eye className="h-4 w-4" />
                    {post.views}
                  </span>
                </div>
              </div>

              <div className="p-6">
                <div className="min-h-[240px] whitespace-pre-wrap break-words leading-8 text-foreground">
                  {post.content}
                </div>
              </div>

              {(post.admin_reply || isAdmin) && (
                <div className="border-t border-border bg-sky-50/50 p-6">
                  <h2 className="mb-3 text-lg font-bold text-navy">
                    관리자 답변
                  </h2>

                  {post.admin_reply && !isAdmin && (
                    <div className="whitespace-pre-wrap rounded-xl bg-white p-4 leading-7 text-foreground shadow-sm">
                      {post.admin_reply}
                    </div>
                  )}

                  {isAdmin && (
                    <div className="space-y-3">
                      <textarea
                        value={adminReply}
                        onChange={(e) => setAdminReply(e.target.value)}
                        rows={6}
                        placeholder="관리자 답변을 입력하세요."
                        className="w-full rounded-xl border p-4 leading-7 outline-none focus:border-primary"
                      />

                      <div className="flex justify-end">
                        <Button
                          type="button"
                          onClick={handleSaveReply}
                          disabled={savingReply}
                        >
                          {savingReply ? "저장 중..." : "답변 저장"}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="flex flex-wrap justify-end gap-3 border-t border-border p-6">
                <Button variant="outline" asChild>
                  <Link href="/board">목록으로</Link>
                </Button>

                {isMyPost && (
                  <>
                    <Button variant="outline" asChild>
                      <Link href={`/board/${post.id}/edit`}>수정</Link>
                    </Button>

                    <Button
                      type="button"
                      onClick={handleDelete}
                      disabled={deleting}
                      className="bg-red-500 text-white hover:bg-red-600"
                    >
                      {deleting ? "삭제 중..." : "삭제"}
                    </Button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}