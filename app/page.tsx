"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Search, Calendar, Users, ArrowRight, ImageIcon, Play } from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { supabase } from "@/lib/supabase"

type HomePerformance = {
  id: number
  title: string | null
  year: string | null
  genre: string | null
  category: string | null
  file_url: string | null
  thumbnail_url: string | null
  type: string | null
}

export default function HomePage() {
  const router = useRouter()

  const [searchQuery, setSearchQuery] = useState("")
  const [performances, setPerformances] = useState<HomePerformance[]>([])
  const [loading, setLoading] = useState(true)
  const [aboutImageUrl, setAboutImageUrl] = useState("")

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)

      const { data, error } = await supabase
        .from("자료")
        .select("id, title, year, genre, category, file_url, thumbnail_url, type")
        .order("created_at", { ascending: false })

      if (error) {
        console.error("홈 최신 자료 불러오기 오류:", error)
        setPerformances([])
      } else {
        const videoData =
          (data || []).filter((item) => item.type?.toLowerCase() === "video")

        setPerformances(videoData)
      }

      const { data: aboutData, error: aboutError } = await supabase
        .from("about_content")
        .select("main_image_url")
        .eq("id", 1)
        .single()

      if (aboutError) {
        console.error("about 이미지 불러오기 오류:", aboutError)
      } else {
        setAboutImageUrl(aboutData?.main_image_url || "")
      }

      setLoading(false)
    }

    fetchData()
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()

    const keyword = searchQuery.trim()

    if (!keyword) {
      router.push("/performances")
      return
    }

    router.push(`/performances?q=${encodeURIComponent(keyword)}`)
  }

  const archiveSections = [
    {
      title: "졸업작품",
      description: "졸업공연 동영상 자료를 확인하세요",
      href: "/performances?q=졸업공연",
      items: performances
        .filter((item) => item.category === "졸업공연")
        .slice(0, 3),
    },
    {
      title: "발레",
      description: "발레 장르의 동영상 자료를 확인하세요",
      href: "/performances?q=발레",
      items: performances
        .filter((item) => item.genre === "발레")
        .slice(0, 3),
    },
    {
      title: "창작발표회",
      description: "창작발표회 동영상 자료를 확인하세요",
      href: "/performances?q=창작발표회",
      items: performances
        .filter((item) => item.category === "창작발표회")
        .slice(0, 3),
    },
  ]

  return (
    <div className="flex min-h-screen flex-col bg-[#eef7ff]">
      <Header />

      <main className="flex-1">
        {/* HERO */}
        <section className="relative overflow-hidden bg-gradient-sky pb-16 pt-8 md:pb-20 md:pt-10">
          <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-b from-transparent via-[#eaf6ff] to-[#eef7ff]" />

          <div className="relative z-10 mx-auto max-w-5xl px-4 text-center">
            <div className="mb-6 flex justify-center">
              <div className="w-full max-w-[520px] md:max-w-[620px]">
                <Image
                  src="/hero-logo.png"
                  alt="HANSUNG DANCE ARCHIVE 로고"
                  width={1200}
                  height={800}
                  priority
                  className="mx-auto h-auto w-full object-contain"
                />
              </div>
            </div>

            <h1 className="mb-4 text-balance text-2xl font-semibold text-navy md:text-3xl">
              한성대학교 무용 아카이브에 오신 것을 환영합니다
            </h1>

            <p className="mb-8 text-muted-foreground md:text-lg">
              한성대학교 무용학과의 역사와 작품들을 기록하고 공유합니다
            </p>

            <form onSubmit={handleSearch} className="mx-auto max-w-xl">
              <div className="relative">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />

                <Input
                  type="search"
                  placeholder="작품명, 장르, 공연 구분, 연도로 검색하세요"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-14 rounded-full border-2 border-primary/20 bg-card pl-12 pr-28 text-lg shadow-lg transition-shadow focus:border-primary focus:shadow-xl"
                />

                <button
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-sky-500 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-sky-600"
                >
                  검색
                </button>
              </div>
            </form>
          </div>
        </section>

        {/* 공연 아카이브 */}
        <section className="relative z-20 bg-[#eef7ff] py-12 md:py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-navy md:text-3xl">
                  공연 아카이브
                </h2>
                <p className="mt-2 text-muted-foreground">
                  졸업작품, 발레, 창작발표회 동영상 자료를 빠르게 확인하세요
                </p>
              </div>

              <Button
                variant="ghost"
                asChild
                className="gap-2 text-primary hover:text-primary/80"
              >
                <Link href="/performances">
                  전체보기
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>

            {loading ? (
              <div className="rounded-2xl bg-card py-16 text-center shadow-md">
                <p className="text-muted-foreground">자료 불러오는 중...</p>
              </div>
            ) : (
              <div className="space-y-12">
                {archiveSections.map((section) => (
                  <div key={section.title}>
                    <div className="mb-5 flex items-end justify-between">
                      <div>
                        <h3 className="text-xl font-bold text-navy md:text-2xl">
                          {section.title}
                        </h3>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {section.description}
                        </p>
                      </div>

                      <Link
                        href={section.href}
                        className="flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
                      >
                        더보기
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </div>

                    {section.items.length === 0 ? (
                      <div className="rounded-2xl bg-card py-10 text-center shadow-md">
                        <p className="text-muted-foreground">
                          아직 등록된 {section.title} 동영상 자료가 없어요.
                        </p>
                      </div>
                    ) : (
                      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {section.items.map((performance) => (
                          <Link
                            key={performance.id}
                            href={`/performances/${performance.id}`}
                            className="group relative overflow-hidden rounded-2xl bg-card shadow-md transition-all duration-300 hover:scale-[1.02] hover:shadow-xl"
                          >
                            <div className="relative aspect-video overflow-hidden bg-slate-100">
                              {performance.thumbnail_url ? (
                                <Image
                                  src={performance.thumbnail_url}
                                  alt={performance.title || "공연 동영상 썸네일"}
                                  fill
                                  className="object-cover transition-transform duration-300 group-hover:scale-110"
                                />
                              ) : performance.file_url ? (
                                <video
                                  src={`${performance.file_url}#t=30`}
                                  className="h-full w-full object-cover"
                                  muted
                                  playsInline
                                  preload="metadata"
                                />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center text-slate-400">
                                  <ImageIcon className="h-10 w-10" />
                                </div>
                              )}

                              <div className="absolute inset-0 flex items-center justify-center bg-black/10 transition-colors group-hover:bg-black/25">
                                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/90 text-primary shadow-lg">
                                  <Play className="ml-1 h-7 w-7 fill-current" />
                                </div>
                              </div>
                            </div>

                            <div className="p-4">
                              <div className="mb-2 flex flex-wrap gap-2">
                                {performance.genre && (
                                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                                    {performance.genre}
                                  </span>
                                )}
                                {performance.category && (
                                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500">
                                    {performance.category}
                                  </span>
                                )}
                              </div>

                              <h4 className="font-semibold text-card-foreground">
                                {performance.title || "제목 없음"}
                              </h4>

                              <div className="mt-2 flex items-center gap-1 text-sm text-muted-foreground">
                                <Calendar className="h-4 w-4" />
                                {performance.year || "연도 미입력"}
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* 학과 역사 */}
        <section className="bg-[#eef7ff] py-16 md:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid items-center gap-12 lg:grid-cols-2">
              <div className="order-2 lg:order-1">
                <h2 className="mb-6 text-2xl font-bold text-navy md:text-3xl">
                  학과 역사
                </h2>

                <p className="mb-6 text-lg leading-relaxed text-muted-foreground">
                  한성대학교 무용학과는 2000년대 초반부터 시작되어 지금까지 이어져오고 있습니다.
                  현대무용, 한국무용, 발레의 세 전공을 중심으로 수많은 예술가를 배출하며
                  한국 무용계의 발전에 기여해왔습니다.
                </p>

                <p className="mb-8 leading-relaxed text-muted-foreground">
                  매년 졸업공연, 창작발표회, H-Festa 등 다양한 공연을 통해 학생들의 예술적 역량을
                  선보이고 있으며, 이 아카이브는 그 소중한 기록들을 보존하고 공유하기 위해
                  만들어졌습니다.
                </p>

                <div className="flex flex-wrap gap-6">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                      <Users className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-navy">500+</p>
                      <p className="text-sm text-muted-foreground">졸업생</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                      <Calendar className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-navy">20+</p>
                      <p className="text-sm text-muted-foreground">년의 역사</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="order-1 lg:order-2">
                <div className="overflow-hidden rounded-2xl shadow-2xl">
                  <Image
                    src={
                      aboutImageUrl ||
                      "https://images.unsplash.com/photo-1508700929628-666bc8bd84ea?w=800&h=600&fit=crop"
                    }
                    alt="한성대학교 무용학과 공연"
                    width={800}
                    height={600}
                    className="h-auto w-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}