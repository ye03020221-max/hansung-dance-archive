"use client"

import { Suspense, useEffect, useMemo, useState } from "react"
import { useSearchParams } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Filter, Calendar, X, Search, ImageIcon, FileText } from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { supabase } from "@/lib/supabase"

type PerformanceItem = {
  id: number
  title: string | null
  year: string | null
  type: string | null
  genre: string | null
  category: string | null
  file_url: string | null
  thumbnail_url: string | null
  created_at?: string | null
}

export default function PerformancesPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen flex-col">
          <Header />
          <main className="flex-1 bg-background">
            <div className="mx-auto max-w-7xl px-4 py-16 text-center sm:px-6 lg:px-8">
              <p className="text-muted-foreground">공연자료 불러오는 중...</p>
            </div>
          </main>
          <Footer />
        </div>
      }
    >
      <PerformancesContent />
    </Suspense>
  )
}

function PerformancesContent() {
  const searchParams = useSearchParams()

  const [performances, setPerformances] = useState<PerformanceItem[]>([])
  const [loading, setLoading] = useState(true)

  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "")
  const [selectedGenres, setSelectedGenres] = useState<string[]>([])
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [yearRange, setYearRange] = useState([2015, 2035])
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false)

  useEffect(() => {
    const q = searchParams.get("q") || ""
    setSearchQuery(q)
  }, [searchParams])

  useEffect(() => {
    const fetchPerformances = async () => {
      setLoading(true)

      const { data, error } = await supabase
        .from("자료")
        .select("id, title, year, type, genre, category, file_url, thumbnail_url, created_at")
        .order("created_at", { ascending: false })

      if (error) {
        console.error("자료 불러오기 오류:", error)
        setPerformances([])
        setLoading(false)
        return
      }

      setPerformances(data || [])
      setLoading(false)
    }

    fetchPerformances()
  }, [])

  const isVideoFile = (url: string | null) => {
    if (!url) return false
    return /\.(mp4|webm|ogg|mov)$/i.test(url)
  }

  const isImageFile = (url: string | null) => {
    if (!url) return false
    return /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(url)
  }

  const genres = useMemo(() => {
    const uniqueGenres = performances
      .map((item) => item.genre)
      .filter((genre): genre is string => !!genre && genre.trim() !== "")
    return [...new Set(uniqueGenres)]
  }, [performances])

  const categories = useMemo(() => {
    const uniqueCategories = performances
      .map((item) => item.category)
      .filter((category): category is string => !!category && category.trim() !== "")
    return [...new Set(uniqueCategories)]
  }, [performances])

  const toggleGenre = (genre: string) => {
    setSelectedGenres((prev) =>
      prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre]
    )
  }

  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    )
  }

  const filteredPerformances = performances.filter((p) => {
    const safeTitle = (p.title || "").toLowerCase()
    const safeGenre = (p.genre || "").toLowerCase()
    const safeCategory = (p.category || "").toLowerCase()
    const safeYearText = String(p.year || "")
    const safeYearNumber = Number(p.year || 0)
    const keyword = searchQuery.toLowerCase()

    const matchesSearch =
      safeTitle.includes(keyword) ||
      safeGenre.includes(keyword) ||
      safeCategory.includes(keyword) ||
      safeYearText.includes(keyword)

    const matchesGenre =
      selectedGenres.length === 0 || selectedGenres.includes(p.genre || "")

    const matchesCategory =
      selectedCategories.length === 0 ||
      selectedCategories.includes(p.category || "")

    const matchesYear =
      !safeYearNumber || (safeYearNumber >= yearRange[0] && safeYearNumber <= yearRange[1])

    return matchesSearch && matchesGenre && matchesCategory && matchesYear
  })

  const clearFilters = () => {
    setSelectedGenres([])
    setSelectedCategories([])
    setYearRange([2015, 2035])
    setSearchQuery("")
  }

  const FilterSidebar = () => (
    <div className="space-y-8">
      <div className="space-y-3">
        <Label className="text-sm font-semibold text-navy">검색</Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="작품명, 장르, 공연 구분, 연도 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="space-y-3">
        <Label className="text-sm font-semibold text-navy">작품 장르</Label>
        <div className="space-y-2">
          {genres.length === 0 ? (
            <p className="text-sm text-muted-foreground">등록된 장르가 없어요</p>
          ) : (
            genres.map((genre) => (
              <div key={genre} className="flex items-center gap-3">
                <Checkbox
                  id={`genre-${genre}`}
                  checked={selectedGenres.includes(genre)}
                  onCheckedChange={() => toggleGenre(genre)}
                />
                <Label
                  htmlFor={`genre-${genre}`}
                  className="cursor-pointer text-sm font-normal text-foreground/80"
                >
                  {genre}
                </Label>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="space-y-3">
        <Label className="text-sm font-semibold text-navy">연도 범위</Label>
        <div className="px-2">
          <Slider
            value={yearRange}
            onValueChange={(value) => setYearRange(value as number[])}
            min={2015}
            max={2035}
            step={1}
            className="mb-2"
          />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>{yearRange[0]}</span>
            <span>{yearRange[1]}</span>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <Label className="text-sm font-semibold text-navy">공연 구분</Label>
        <div className="space-y-2">
          {categories.length === 0 ? (
            <p className="text-sm text-muted-foreground">등록된 공연 구분이 없어요</p>
          ) : (
            categories.map((category) => (
              <div key={category} className="flex items-center gap-3">
                <Checkbox
                  id={`category-${category}`}
                  checked={selectedCategories.includes(category)}
                  onCheckedChange={() => toggleCategory(category)}
                />
                <Label
                  htmlFor={`category-${category}`}
                  className="cursor-pointer text-sm font-normal text-foreground/80"
                >
                  {category}
                </Label>
              </div>
            ))
          )}
        </div>
      </div>

      <Button variant="outline" onClick={clearFilters} className="w-full">
        필터 초기화
      </Button>
    </div>
  )

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1 bg-background">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-navy">공연자료</h1>
            <p className="mt-2 text-muted-foreground">
              한성대학교 무용학과의 공연 아카이브를 탐색하세요
            </p>
          </div>

          <div className="flex gap-8">
            <aside className="hidden w-64 flex-shrink-0 lg:block">
              <div className="sticky top-24 rounded-2xl bg-card p-6 shadow-md">
                <h2 className="mb-6 flex items-center gap-2 text-lg font-semibold text-navy">
                  <Filter className="h-5 w-5" />
                  필터
                </h2>
                <FilterSidebar />
              </div>
            </aside>

            <div className="flex-1">
              <div className="mb-6 lg:hidden">
                <Button
                  variant="outline"
                  onClick={() => setMobileFilterOpen(true)}
                  className="w-full gap-2"
                >
                  <Filter className="h-4 w-4" />
                  필터 열기
                </Button>
              </div>

              <div className="mb-6 flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  총{" "}
                  <span className="font-semibold text-foreground">
                    {filteredPerformances.length}
                  </span>
                  개의 작품
                </p>

                {(selectedGenres.length > 0 ||
                  selectedCategories.length > 0 ||
                  searchQuery) && (
                  <button
                    onClick={clearFilters}
                    className="text-sm text-primary hover:underline"
                  >
                    필터 초기화
                  </button>
                )}
              </div>

              {loading ? (
                <div className="rounded-2xl bg-card py-16 text-center shadow-md">
                  <p className="text-muted-foreground">자료 불러오는 중...</p>
                </div>
              ) : (
                <>
                  <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                    {filteredPerformances.map((performance) => (
                      <Link
                        key={performance.id}
                        href={`/performances/${performance.id}`}
                        className="group overflow-hidden rounded-2xl bg-card shadow-md transition-all duration-300 hover:scale-[1.02] hover:shadow-xl"
                      >
                        <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                          {performance.thumbnail_url ? (
                            <Image
                              src={performance.thumbnail_url}
                              alt={performance.title || "공연 이미지"}
                              fill
                              className="object-cover transition-transform duration-300 group-hover:scale-110"
                            />
                          ) : performance.file_url ? (
                            isVideoFile(performance.file_url) ? (
                              <video
                                src={performance.file_url}
                                className="h-full w-full object-cover"
                                muted
                                playsInline
                                preload="metadata"
                              />
                            ) : isImageFile(performance.file_url) ? (
                              <Image
                                src={performance.file_url}
                                alt={performance.title || "공연 이미지"}
                                fill
                                className="object-cover transition-transform duration-300 group-hover:scale-110"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                                <FileText className="h-10 w-10" />
                              </div>
                            )
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                              <ImageIcon className="h-10 w-10" />
                            </div>
                          )}
                        </div>

                        <div className="p-4">
                          <div className="mb-2 flex flex-wrap items-center gap-2">
                            {performance.genre && (
                              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                                {performance.genre}
                              </span>
                            )}
                            {performance.category && (
                              <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                                {performance.category}
                              </span>
                            )}
                            {performance.type && (
                              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500">
                                {performance.type}
                              </span>
                            )}
                          </div>

                          <h3 className="font-semibold text-card-foreground">
                            {performance.title || "제목 없음"}
                          </h3>

                          <div className="mt-2 flex items-center gap-1 text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            {performance.year || "연도 미입력"}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>

                  {filteredPerformances.length === 0 && (
                    <div className="flex flex-col items-center justify-center rounded-2xl bg-card py-16 text-center">
                      <div className="mb-4 text-muted-foreground">
                        <Search className="h-12 w-12" />
                      </div>
                      <h3 className="text-lg font-semibold text-foreground">
                        검색 결과가 없습니다
                      </h3>
                      <p className="mt-2 text-muted-foreground">
                        다른 검색어나 필터를 시도해보세요
                      </p>
                      <Button
                        variant="outline"
                        onClick={clearFilters}
                        className="mt-4"
                      >
                        필터 초기화
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {mobileFilterOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div
              className="absolute inset-0 bg-foreground/20 backdrop-blur-sm"
              onClick={() => setMobileFilterOpen(false)}
            />
            <div className="absolute inset-y-0 left-0 w-full max-w-xs bg-card p-6 shadow-xl">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="flex items-center gap-2 text-lg font-semibold text-navy">
                  <Filter className="h-5 w-5" />
                  필터
                </h2>
                <button
                  onClick={() => setMobileFilterOpen(false)}
                  className="rounded-full p-2 text-muted-foreground hover:bg-muted"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <FilterSidebar />
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}