"use client"

import { use, useEffect, useState } from "react"
import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { supabase } from "@/lib/supabase"
import { ArrowLeft, Loader2 } from "lucide-react"

type EditMaterial = {
  id: number
  title: string | null
  creator: string | null
  subject: string | null
  description: string | null
  publisher: string | null
  contributor: string | null
  date: string | null
  type: string | null
  format: string | null
  identifier: string | null
  source: string | null
  language: string | null
  relation: string | null
  coverage: string | null
  rights: string | null
  genre: string | null
  category: string | null
  year: string | null
  choreographer: string | null
  dancers: string | null
  user_id: string | null
}

export default function EditMaterialPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [mediaTypeCode, setMediaTypeCode] = useState("")
  const [identifierPreview, setIdentifierPreview] = useState("")

  const [form, setForm] = useState({
    title: "",
    creator: "",
    subject: "",
    description: "",
    publisher: "",
    contributor: "",
    date: "",
    type: "",
    format: "",
    identifier: "",
    source: "",
    language: "",
    relation: "",
    coverage: "",
    rights: "",
    genre: "",
    category: "",
    year: "",
    choreographer: "",
    dancers: "",
  })

  const genreCodeMap: Record<string, string> = {
    한국무용: "KB",
    현대무용: "CD",
    발레: "BL",
  }

  const categoryCodeMap: Record<string, string> = {
    졸업공연: "GR",
    창작발표회: "CP",
    "H-Festa": "HD",
  }

  const generateIdentifier = async () => {
    const year = form.year.trim()
    const categoryCode = categoryCodeMap[form.category] || ""
    const genreCode = genreCodeMap[form.genre] || ""

    if (!year || !categoryCode || !genreCode || !mediaTypeCode) {
      return form.identifier || ""
    }

    const prefix = `${year}${categoryCode}_${genreCode}_${mediaTypeCode}`
    const currentIdentifier = form.identifier.trim()

    if (currentIdentifier.startsWith(prefix)) {
      return currentIdentifier
    }

    const { data, error } = await supabase
      .from("자료")
      .select("id, identifier")
      .ilike("identifier", `${prefix}%`)
      .neq("id", Number(id))

    if (error) {
      console.error("식별자 조회 오류:", error)
      return `${prefix}01`
    }

    const usedNumbers =
      data
        ?.map((item) => {
          const match = item.identifier?.match(new RegExp(`^${prefix}(\\d+)$`))
          return match ? Number(match[1]) : null
        })
        .filter((num): num is number => num !== null) || []

    const nextNumber = usedNumbers.length > 0 ? Math.max(...usedNumbers) + 1 : 1

    return `${prefix}${String(nextNumber).padStart(2, "0")}`
  }

  useEffect(() => {
    const fetchItem = async () => {
      setLoading(true)

      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        alert("로그인이 필요해요.")
        window.location.href = "/login"
        return
      }

      const { data, error } = await supabase
        .from("자료")
        .select("*")
        .eq("id", Number(id))
        .eq("user_id", user.id)
        .single()

      if (error || !data) {
        console.error("수정 데이터 불러오기 오류:", error)
        alert("수정할 자료를 찾을 수 없어요.")
        window.location.href = "/mypage"
        return
      }

      const item = data as EditMaterial

      const mediaCodeMatch = item.identifier?.match(
        /_(VR|VF|PP|PB|PT|PR|BK|PG)\d+$/
      )

      if (mediaCodeMatch) {
        setMediaTypeCode(mediaCodeMatch[1])
      } else if (item.type === "video") {
        setMediaTypeCode("VF")
      } else if (item.type === "photo") {
        setMediaTypeCode("PP")
      } else if (item.type === "poster") {
        setMediaTypeCode("PT")
      } else if (item.type === "pamphlet") {
        setMediaTypeCode("BK")
      }

      setForm({
        title: item.title || "",
        creator: item.creator || "",
        subject: item.subject || "",
        description: item.description || "",
        publisher: item.publisher || "",
        contributor: item.contributor || "",
        date: item.date || "",
        type: item.type || "",
        format: item.format || "",
        identifier: item.identifier || "",
        source: item.source || "",
        language: item.language || "",
        relation: item.relation || "",
        coverage: item.coverage || "",
        rights: item.rights || "",
        genre: item.genre || "",
        category: item.category || "",
        year: item.year || "",
        choreographer: item.choreographer || "",
        dancers: item.dancers || "",
      })

      setLoading(false)
    }

    fetchItem()
  }, [id])

  useEffect(() => {
    const updateIdentifierPreview = async () => {
      const nextIdentifier = await generateIdentifier()
      setIdentifierPreview(nextIdentifier)
    }

    updateIdentifierPreview()
  }, [form.year, form.genre, form.category, form.identifier, mediaTypeCode])

  const handleChange = (key: string, value: string) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!form.title.trim()) {
      alert("제목을 입력해주세요.")
      return
    }

    setSaving(true)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        alert("로그인이 필요해요.")
        setSaving(false)
        return
      }

      const newIdentifier = await generateIdentifier()

      const payload = {
        ...form,
        date: form.date || null,
        identifier: newIdentifier,
      }

      const { error } = await supabase
        .from("자료")
        .update(payload)
        .eq("id", Number(id))
        .eq("user_id", user.id)

      if (error) throw error

      alert("수정이 완료되었어요.")
      window.location.href = "/mypage"
    } catch (err: any) {
      console.error("수정 오류:", err)
      alert(err.message || "수정 중 오류가 발생했어요.")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex flex-1 items-center justify-center bg-slate-50">
          <div className="flex items-center gap-3 text-slate-500">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>수정 페이지 불러오는 중...</span>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <Header />

      <main className="flex-1 p-8">
        <div className="mx-auto max-w-5xl rounded-3xl border bg-white p-8 shadow-md">
          <Link
            href="/mypage"
            className="mb-6 inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900"
          >
            <ArrowLeft className="h-4 w-4" />
            마이페이지로 돌아가기
          </Link>

          <h1 className="mb-8 text-3xl font-bold text-slate-900">자료 수정</h1>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div>
              <h2 className="mb-4 text-xl font-bold">무용 아카이브 기본 정보</h2>
              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold">
                    작품 장르
                  </label>
                  <select
                    value={form.genre}
                    onChange={(e) => handleChange("genre", e.target.value)}
                    className="w-full rounded-xl border p-3"
                  >
                    <option value="">선택하세요</option>
                    <option value="한국무용">한국무용</option>
                    <option value="현대무용">현대무용</option>
                    <option value="발레">발레</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold">
                    공연 구분
                  </label>
                  <select
                    value={form.category}
                    onChange={(e) => handleChange("category", e.target.value)}
                    className="w-full rounded-xl border p-3"
                  >
                    <option value="">선택하세요</option>
                    <option value="졸업공연">졸업공연</option>
                    <option value="창작발표회">창작발표회</option>
                    <option value="H-Festa">H-Festa</option>
                  </select>
                </div>

                <InputField
                  label="공연 연도"
                  value={form.year}
                  onChange={(v) => handleChange("year", v)}
                />

                <div>
                  <label className="mb-2 block text-sm font-semibold">
                    미디어 타입 코드
                  </label>
                  <select
                    value={mediaTypeCode}
                    onChange={(e) => setMediaTypeCode(e.target.value)}
                    className="w-full rounded-xl border p-3"
                  >
                    <option value="">선택하세요</option>
                    <option value="VR">VR - 리허설 영상</option>
                    <option value="VF">VF - 본공연 영상</option>
                    <option value="PP">PP - 공연 사진</option>
                    <option value="PB">PB - 백스테이지 사진</option>
                    <option value="PT">PT - 포스터</option>
                    <option value="PR">PR - 프로필 사진</option>
                    <option value="BK">BK - 프로그램북</option>
                    <option value="PG">PG - 프로그램북 설명 페이지</option>
                  </select>
                </div>

                <InputField
                  label="안무가"
                  value={form.choreographer}
                  onChange={(v) => handleChange("choreographer", v)}
                />
                <InputField
                  label="참여 무용수"
                  value={form.dancers}
                  onChange={(v) => handleChange("dancers", v)}
                />
              </div>
            </div>

            <div>
              <h2 className="mb-4 text-xl font-bold">Dublin Core 메타데이터</h2>

              <div className="mb-5 rounded-xl border bg-slate-50 p-4">
                <label className="mb-2 block text-sm font-semibold">
                  Identifier (식별자 자동 생성)
                </label>
                <input
                  value={
                    identifierPreview ||
                    "장르, 공연 구분, 연도, 미디어 타입 코드를 선택하면 자동 생성됩니다"
                  }
                  readOnly
                  className="w-full rounded-xl border bg-white p-3 text-slate-700"
                />
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <InputField
                  label="Title (제목) *"
                  value={form.title}
                  onChange={(v) => handleChange("title", v)}
                  required
                />
                <InputField
                  label="Creator (제작자)"
                  value={form.creator}
                  onChange={(v) => handleChange("creator", v)}
                />
                <InputField
                  label="Subject (주제)"
                  value={form.subject}
                  onChange={(v) => handleChange("subject", v)}
                />
                <InputField
                  label="Publisher (발행처)"
                  value={form.publisher}
                  onChange={(v) => handleChange("publisher", v)}
                />
                <InputField
                  label="Contributor (기여자)"
                  value={form.contributor}
                  onChange={(v) => handleChange("contributor", v)}
                />
                <InputField
                  label="Date (날짜)"
                  value={form.date}
                  onChange={(v) => handleChange("date", v)}
                />
                <InputField
                  label="Type"
                  value={form.type}
                  onChange={(v) => handleChange("type", v)}
                />
                <InputField
                  label="Format"
                  value={form.format}
                  onChange={(v) => handleChange("format", v)}
                />
                <InputField
                  label="Source"
                  value={form.source}
                  onChange={(v) => handleChange("source", v)}
                />
                <InputField
                  label="Language"
                  value={form.language}
                  onChange={(v) => handleChange("language", v)}
                />
                <InputField
                  label="Relation"
                  value={form.relation}
                  onChange={(v) => handleChange("relation", v)}
                />
                <InputField
                  label="Coverage"
                  value={form.coverage}
                  onChange={(v) => handleChange("coverage", v)}
                />
                <InputField
                  label="Rights"
                  value={form.rights}
                  onChange={(v) => handleChange("rights", v)}
                />
              </div>

              <div className="mt-5">
                <label className="mb-2 block text-sm font-semibold">
                  Description (설명)
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  rows={5}
                  className="w-full rounded-xl border p-3"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full rounded-xl bg-amber-500 p-4 text-lg font-bold text-white hover:bg-amber-600 disabled:bg-amber-300"
            >
              {saving ? "수정 중..." : "수정 저장"}
            </button>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  )
}

type InputFieldProps = {
  label: string
  value: string
  onChange: (value: string) => void
  required?: boolean
}

function InputField({
  label,
  value,
  onChange,
  required = false,
}: InputFieldProps) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold">{label}</label>
      <input
        value={value}
        required={required}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border p-3"
      />
    </div>
  )
}