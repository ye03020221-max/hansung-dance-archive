"use client"

import { use, useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import {
  ArrowLeft,
  Calendar,
  User,
  MapPin,
  Download,
  ImageIcon,
  FileText,
  Loader2,
} from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"

type PerformanceDetail = {
  id: number
  title: string | null
  year: string | null
  type: string | null
  genre: string | null
  date: string | null
  coverage: string | null
  description: string | null
  creator: string | null
  contributor: string | null
  choreographer: string | null
  dancers: string | null
  identifier: string | null
  format: string | null
  language: string | null
  rights: string | null
  source: string | null
  file_url: string | null
  file_name: string | null
  created_at?: string | null
}

export default function PerformanceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)

  const [performance, setPerformance] = useState<PerformanceDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [downloading, setDownloading] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const ADMIN_EMAIL = "admin@hansung.ac.kr"

  useEffect(() => {
    const fetchPerformance = async () => {
      setLoading(true)

      const { data, error } = await supabase
        .from("자료")
        .select("*")
        .eq("id", Number(id))
        .single()

      if (error) {
        console.error("상세페이지 불러오기 오류:", error)
        setPerformance(null)
      } else {
        setPerformance(data)
      }

      setLoading(false)
    }

    const checkAdmin = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      setIsAdmin(user?.email === ADMIN_EMAIL)
    }

    fetchPerformance()
    checkAdmin()
  }, [id])

  const isImageFile = (url: string | null) => {
    if (!url) return false
    return /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(url)
  }

  const isVideoFile = (url: string | null) => {
    if (!url) return false
    return /\.(mp4|webm|ogg|mov)$/i.test(url)
  }

  const formatDancers = (value: string | null) => {
    if (!value) return []
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean)
  }

  const handleDownload = async () => {
    if (!performance?.file_url) return

    try {
      setDownloading(true)

      const response = await fetch(performance.file_url)
      if (!response.ok) {
        throw new Error("파일을 가져오지 못했습니다.")
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)

      const link = document.createElement("a")
      link.href = url
      link.download = performance.file_name || "download"
      document.body.appendChild(link)
      link.click()
      link.remove()

      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error("다운로드 실패:", error)
      alert("다운로드 실패")
    } finally {
      setDownloading(false)
    }
  }

  const handleDelete = async () => {
    if (!performance) return

    const ok = window.confirm("정말 삭제할까?")
    if (!ok) return

    try {
      setDeleting(true)

      const { error } = await supabase
        .from("자료")
        .delete()
        .eq("id", performance.id)

      if (error) {
        console.error("삭제 오류:", error)
        alert("삭제 실패")
        return
      }

      alert("삭제 완료")
      window.location.href = "/performances"
    } finally {
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex flex-1 items-center justify-center">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            불러오는 중...
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (!performance) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex flex-1 items-center justify-center">
          자료를 찾을 수 없습니다.
        </main>
        <Footer />
      </div>
    )
  }

  const dancers = formatDancers(performance.dancers)

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1 bg-background">
        <div className="mx-auto max-w-7xl px-4 py-8">
          <Link
            href="/performances"
            className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            공연자료 목록으로
          </Link>

          <div className="grid gap-8 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-2">
              <div className="overflow-hidden rounded-2xl bg-card shadow-lg">
                {performance.file_url ? (
                  isImageFile(performance.file_url) ? (
                    <div className="relative aspect-video bg-foreground/5">
                      <Image
                        src={performance.file_url}
                        alt={performance.title || "공연 자료"}
                        fill
                        priority
                        className="object-cover"
                      />
                    </div>
                  ) : isVideoFile(performance.file_url) ? (
                    <div className="bg-black p-2 md:p-3">
                      <video
                        src={performance.file_url}
                        controls
                        playsInline
                        preload="metadata"
                        className="mx-auto h-auto max-h-[80vh] w-full rounded-xl object-contain bg-black"
                      />
                    </div>
                  ) : (
                    <div className="flex min-h-[420px] w-full flex-col items-center justify-center gap-3 bg-muted text-muted-foreground">
                      <FileText className="h-14 w-14" />
                      <p className="text-sm">
                        미리보기를 지원하지 않는 파일입니다
                      </p>
                    </div>
                  )
                ) : (
                  <div className="flex min-h-[420px] w-full items-center justify-center bg-muted text-muted-foreground">
                    <ImageIcon className="h-14 w-14" />
                  </div>
                )}
              </div>

              <div>
                <div className="mb-4 flex flex-wrap gap-2">
                  {performance.genre && (
                    <span className="rounded-full bg-primary/10 px-3 py-1 text-sm text-primary">
                      {performance.genre}
                    </span>
                  )}

                  {performance.type && (
                    <span className="rounded-full bg-muted px-3 py-1 text-sm text-muted-foreground">
                      {performance.type}
                    </span>
                  )}
                </div>

                <h1 className="text-3xl font-bold text-navy">
                  {performance.title || "제목 없음"}
                </h1>

                <div className="mt-4 flex flex-wrap gap-4 text-sm text-muted-foreground">
                  {(performance.date || performance.year) && (
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {performance.date || performance.year}
                    </span>
                  )}

                  {performance.coverage && (
                    <span className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {performance.coverage}
                    </span>
                  )}
                </div>
              </div>

              <div className="rounded-xl bg-card p-6 shadow-md">
                <h2 className="mb-4 text-lg font-semibold text-navy">
                  작품 소개
                </h2>

                <p className="whitespace-pre-line leading-relaxed text-muted-foreground">
                  {performance.description || "설명이 없습니다."}
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="rounded-xl bg-card p-6 shadow-md">
                <Button
                  onClick={handleDownload}
                  disabled={!performance.file_url || downloading}
                  className="w-full gap-2"
                >
                  <Download className="h-4 w-4" />
                  {downloading ? "다운로드 중..." : "자료 다운로드"}
                </Button>
              </div>

              {isAdmin && (
                <div className="rounded-xl bg-card p-6 shadow-md">
                  <Button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="w-full bg-red-500 text-white hover:bg-red-600"
                  >
                    {deleting ? "삭제 중..." : "자료 삭제"}
                  </Button>
                </div>
              )}

              <div className="rounded-xl bg-card p-6 shadow-md">
                <h2 className="mb-4 text-lg font-semibold text-navy">
                  공연 정보
                </h2>

                <div className="space-y-4 text-sm">
                  {(performance.creator || performance.contributor) && (
                    <div>
                      <p className="text-muted-foreground">제작자 / 연출</p>
                      <p className="mt-1 flex items-center gap-2 font-medium">
                        <User className="h-4 w-4 text-primary" />
                        {performance.creator || performance.contributor}
                      </p>
                    </div>
                  )}

                  {performance.choreographer && (
                    <div>
                      <p className="text-muted-foreground">안무가</p>
                      <p className="mt-1 flex items-center gap-2 font-medium">
                        <User className="h-4 w-4 text-primary" />
                        {performance.choreographer}
                      </p>
                    </div>
                  )}

                  {dancers.length > 0 && (
                    <div>
                      <p className="mb-2 text-muted-foreground">출연자</p>
                      <div className="flex flex-wrap gap-2">
                        {dancers.map((name) => (
                          <span
                            key={name}
                            className="rounded-full bg-muted px-2 py-1 text-xs"
                          >
                            {name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="rounded-xl bg-card p-6 shadow-md">
                <h2 className="mb-4 text-lg font-semibold text-navy">
                  메타데이터
                </h2>

                <div className="space-y-3 text-sm">
                  {performance.format && <p>형식: {performance.format}</p>}
                  {performance.language && <p>언어: {performance.language}</p>}
                  {performance.rights && <p>권리: {performance.rights}</p>}
                  {performance.source && <p>출처: {performance.source}</p>}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}