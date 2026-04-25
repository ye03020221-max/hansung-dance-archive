"use client"

import { useEffect, useMemo, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { supabase } from "@/lib/supabase"
import {
  User,
  Lock,
  ImageIcon,
  FileText,
  Loader2,
  ExternalLink,
  Trash2,
} from "lucide-react"

type MyMaterial = {
  id: number
  title: string | null
  genre: string | null
  type: string | null
  year: string | null
  file_url: string | null
  file_name: string | null
  created_at: string | null
}

export default function MyPage() {
  const [loading, setLoading] = useState(true)
  const [userEmail, setUserEmail] = useState("")
  const [userId, setUserId] = useState("")
  const [materials, setMaterials] = useState<MyMaterial[]>([])

  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [changingPassword, setChangingPassword] = useState(false)
  const [deletingId, setDeletingId] = useState<number | null>(null)

  useEffect(() => {
    const fetchMyPageData = async () => {
      setLoading(true)

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()

      if (userError || !user) {
        alert("로그인이 필요해요.")
        window.location.href = "/login"
        return
      }

      setUserEmail(user.email || "")
      setUserId(user.id)

      const { data, error } = await supabase
        .from("자료")
        .select("id, title, genre, type, year, file_url, file_name, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

      if (error) {
        console.error(error)
        setMaterials([])
      } else {
        setMaterials(data || [])
      }

      setLoading(false)
    }

    fetchMyPageData()
  }, [])

  const isImageFile = (url: string | null) => {
    if (!url) return false
    return /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(url)
  }

  const isVideoFile = (url: string | null) => {
    if (!url) return false
    return /\.(mp4|webm|ogg|mov)$/i.test(url)
  }

  const getStoragePathFromUrl = (url: string | null) => {
    if (!url) return null

    const marker = "/storage/v1/object/public/performances/"
    const index = url.indexOf(marker)

    if (index === -1) return null

    return decodeURIComponent(url.substring(index + marker.length))
  }

  const handleDelete = async (item: MyMaterial) => {
    const ok = window.confirm(
      `정말 "${item.title || "제목 없음"}" 자료를 삭제할까요?\n삭제하면 되돌릴 수 없어요.`
    )

    if (!ok) return

    setDeletingId(item.id)

    try {
      const storagePath = getStoragePathFromUrl(item.file_url)

      if (storagePath) {
        await supabase.storage.from("performances").remove([storagePath])
      }

      const { error } = await supabase
        .from("자료")
        .delete()
        .eq("id", item.id)

      if (error) throw error

      setMaterials((prev) =>
        prev.filter((material) => material.id !== item.id)
      )

      alert("삭제 완료")
    } catch (err: any) {
      alert(err.message || "삭제 실패")
    } finally {
      setDeletingId(null)
    }
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!newPassword.trim()) {
      alert("새 비밀번호를 입력해주세요.")
      return
    }

    if (newPassword.length < 6) {
      alert("비밀번호는 6자 이상이어야 해요.")
      return
    }

    if (newPassword !== confirmPassword) {
      alert("비밀번호 확인이 일치하지 않아요.")
      return
    }

    setChangingPassword(true)

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      })

      if (error) throw error

      alert("비밀번호 변경 완료")
      setNewPassword("")
      setConfirmPassword("")
    } catch (err: any) {
      alert(err.message || "변경 실패")
    } finally {
      setChangingPassword(false)
    }
  }

  const materialCountText = useMemo(() => {
    return `${materials.length}개`
  }, [materials.length])

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex flex-1 items-center justify-center bg-slate-50">
          <div className="flex items-center gap-2 text-slate-500">
            <Loader2 className="h-5 w-5 animate-spin" />
            불러오는 중...
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
        <div className="mx-auto max-w-6xl space-y-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              마이페이지
            </h1>
            <p className="mt-2 text-slate-500">
              내 계정 정보와 내가 업로드한 자료를 확인할 수 있어요.
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-3">
            {/* 왼쪽 */}
            <div className="space-y-6 lg:col-span-1">
              <div className="rounded-3xl border bg-white p-6 shadow-sm">
                <div className="mb-4 flex items-center gap-2">
                  <User className="h-5 w-5 text-sky-600" />
                  <h2 className="text-xl font-bold">
                    계정 정보
                  </h2>
                </div>

                <div className="space-y-3 text-sm">
                  <div>
                    <p className="text-slate-500">이메일</p>
                    <p className="font-medium">{userEmail}</p>
                  </div>

                  <div>
                    <p className="text-slate-500">내가 올린 자료</p>
                    <p className="font-medium">{materialCountText}</p>
                  </div>

                  <div>
                    <p className="text-slate-500">사용자 ID</p>
                    <p className="break-all text-xs">
                      {userId}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border bg-white p-6 shadow-sm">
                <div className="mb-4 flex items-center gap-2">
                  <Lock className="h-5 w-5 text-sky-600" />
                  <h2 className="text-xl font-bold">
                    비밀번호 변경
                  </h2>
                </div>

                <form
                  onSubmit={handlePasswordChange}
                  className="space-y-4"
                >
                  <input
                    type="password"
                    placeholder="새 비밀번호"
                    value={newPassword}
                    onChange={(e) =>
                      setNewPassword(e.target.value)
                    }
                    className="w-full rounded-xl border p-3"
                  />

                  <input
                    type="password"
                    placeholder="새 비밀번호 확인"
                    value={confirmPassword}
                    onChange={(e) =>
                      setConfirmPassword(e.target.value)
                    }
                    className="w-full rounded-xl border p-3"
                  />

                  <button
                    type="submit"
                    disabled={changingPassword}
                    className="w-full rounded-xl bg-sky-600 p-3 font-bold text-white hover:bg-sky-700"
                  >
                    {changingPassword
                      ? "변경 중..."
                      : "비밀번호 변경"}
                  </button>
                </form>
              </div>
            </div>

            {/* 오른쪽 */}
            <div className="lg:col-span-2">
              <div className="rounded-3xl border bg-white p-6 shadow-sm">
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold">
                      내가 올린 자료
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                      최근 업로드 순으로 보여줘요.
                    </p>
                  </div>

                  <Link
                    href="/upload"
                    className="rounded-xl bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-700"
                  >
                    새 자료 업로드
                  </Link>
                </div>

                {materials.length === 0 ? (
                  <div className="rounded-2xl bg-slate-50 py-16 text-center">
                    업로드 자료 없음
                  </div>
                ) : (
                  <div className="grid gap-5 sm:grid-cols-2">
                    {materials.map((item) => (
                      <div
                        key={item.id}
                        className="overflow-hidden rounded-2xl border bg-white shadow-sm"
                      >
                        {/* 썸네일 수정 완료 */}
                        <div className="relative aspect-[4/3] bg-slate-100">
                          {item.file_url ? (
                            isVideoFile(item.file_url) ? (
                              <video
                                src={item.file_url}
                                className="h-full w-full object-cover"
                                muted
                                playsInline
                                preload="metadata"
                              />
                            ) : isImageFile(item.file_url) ? (
                              <Image
                                src={item.file_url}
                                alt={item.title || "자료"}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-slate-400">
                                <FileText className="h-10 w-10" />
                              </div>
                            )
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-slate-400">
                              <ImageIcon className="h-10 w-10" />
                            </div>
                          )}
                        </div>

                        <div className="p-4">
                          <div className="mb-2 flex flex-wrap gap-2">
                            {item.genre && (
                              <span className="rounded-full bg-sky-100 px-2 py-1 text-xs font-medium text-sky-700">
                                {item.genre}
                              </span>
                            )}

                            {item.type && (
                              <span className="rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-600">
                                {item.type}
                              </span>
                            )}
                          </div>

                          <h3 className="text-lg font-bold">
                            {item.title || "제목 없음"}
                          </h3>

                          <p className="mt-2 text-sm text-slate-500">
                            연도: {item.year || "미입력"}
                          </p>

                          <div className="mt-4 grid grid-cols-2 gap-2">
                            <Link
                              href={`/performances/${item.id}`}
                              className="rounded-xl border px-3 py-2 text-center text-sm font-semibold"
                            >
                              상세
                            </Link>

                            <Link
                              href={`/mypage/edit/${item.id}`}
                              className="rounded-xl border border-sky-300 bg-sky-50 px-3 py-2 text-center text-sm font-semibold text-sky-700"
                            >
                              수정
                            </Link>

                            {item.file_url ? (
                              <a
                                href={item.file_url}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-3 py-2 text-white"
                              >
                                <ExternalLink className="h-4 w-4" />
                              </a>
                            ) : (
                              <button
                                disabled
                                className="rounded-xl bg-slate-200 px-3 py-2 text-slate-400"
                              >
                                없음
                              </button>
                            )}

                            <button
                              onClick={() => handleDelete(item)}
                              disabled={deletingId === item.id}
                              className="inline-flex items-center justify-center rounded-xl bg-red-500 px-3 py-2 text-white"
                            >
                              {deletingId === item.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}