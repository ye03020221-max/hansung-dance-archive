"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { ImagePlus, UploadCloud } from "lucide-react"

const ADMIN_EMAIL = "admin@hansung.ac.kr"

const initialForm = {
  hero_title: "",
  hero_subtitle: "",

  mission_badge: "",
  mission_title: "",
  mission_text_1: "",
  mission_text_2: "",
  mission_text_3: "",

  main_image_url: "",
  archive_count: "",
  archive_count_label: "",

  feature_1_title: "",
  feature_1_desc: "",
  feature_2_title: "",
  feature_2_desc: "",
  feature_3_title: "",
  feature_3_desc: "",
  feature_4_title: "",
  feature_4_desc: "",

  timeline_title: "",
  timeline_subtitle: "",

  year_1: "",
  event_1: "",
  year_2: "",
  event_2: "",
  year_3: "",
  event_3: "",
  year_4: "",
  event_4: "",
  year_5: "",
  event_5: "",
  year_6: "",
  event_6: "",

  contact_title: "",
  contact_subtitle: "",
  contact_phone: "",
  contact_email: "",
}

function Field({
  label,
  name,
  value,
  onChange,
  readOnly = false,
}: {
  label: string
  name: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  readOnly?: boolean
}) {
  return (
    <div className="mb-5">
      <label className="mb-2 block text-sm font-semibold text-slate-700">
        {label}
      </label>
      <input
        name={name}
        value={value}
        onChange={onChange}
        readOnly={readOnly}
        className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-sky-500 read-only:bg-slate-50"
      />
    </div>
  )
}

function Area({
  label,
  name,
  value,
  onChange,
  rows = 4,
}: {
  label: string
  name: string
  value: string
  rows?: number
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
}) {
  return (
    <div className="mb-5">
      <label className="mb-2 block text-sm font-semibold text-slate-700">
        {label}
      </label>
      <textarea
        name={name}
        value={value}
        onChange={onChange}
        rows={rows}
        className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-sky-500"
      />
    </div>
  )
}

export default function AdminAboutPage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [authorized, setAuthorized] = useState(false)
  const [message, setMessage] = useState("")
  const [uploadingImage, setUploadingImage] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [form, setForm] = useState(initialForm)

  useEffect(() => {
    const loadData = async () => {
      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser()

        if (userError || !user) {
          router.push("/login")
          return
        }

        if (user.email !== ADMIN_EMAIL) {
          setAuthorized(false)
          setLoading(false)
          return
        }

        setAuthorized(true)

        const { data, error } = await supabase
          .from("about_content")
          .select("*")
          .eq("id", 1)
          .single()

        if (error || !data) {
          setMessage("about 데이터를 불러오지 못했어.")
          setLoading(false)
          return
        }

        setForm({
          hero_title: data.hero_title ?? "",
          hero_subtitle: data.hero_subtitle ?? "",

          mission_badge: data.mission_badge ?? "",
          mission_title: data.mission_title ?? "",
          mission_text_1: data.mission_text_1 ?? "",
          mission_text_2: data.mission_text_2 ?? "",
          mission_text_3: data.mission_text_3 ?? "",

          main_image_url: data.main_image_url ?? "",
          archive_count: data.archive_count ?? "",
          archive_count_label: data.archive_count_label ?? "",

          feature_1_title: data.feature_1_title ?? "",
          feature_1_desc: data.feature_1_desc ?? "",
          feature_2_title: data.feature_2_title ?? "",
          feature_2_desc: data.feature_2_desc ?? "",
          feature_3_title: data.feature_3_title ?? "",
          feature_3_desc: data.feature_3_desc ?? "",
          feature_4_title: data.feature_4_title ?? "",
          feature_4_desc: data.feature_4_desc ?? "",

          timeline_title: data.timeline_title ?? "",
          timeline_subtitle: data.timeline_subtitle ?? "",

          year_1: data.year_1 ?? "",
          event_1: data.event_1 ?? "",
          year_2: data.year_2 ?? "",
          event_2: data.event_2 ?? "",
          year_3: data.year_3 ?? "",
          event_3: data.event_3 ?? "",
          year_4: data.year_4 ?? "",
          event_4: data.event_4 ?? "",
          year_5: data.year_5 ?? "",
          event_5: data.event_5 ?? "",
          year_6: data.year_6 ?? "",
          event_6: data.event_6 ?? "",

          contact_title: data.contact_title ?? "",
          contact_subtitle: data.contact_subtitle ?? "",
          contact_phone: data.contact_phone ?? "",
          contact_email: data.contact_email ?? "",
        })
      } catch {
        setMessage("오류가 발생했어.")
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [router])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const makeSafeFileName = (file: File) => {
    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg"
    return `about-${Date.now()}.${ext}`
  }

  const uploadMainImage = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setMessage("이미지 파일만 업로드할 수 있어.")
      return
    }

    try {
      setUploadingImage(true)
      setMessage("")

      const fileName = makeSafeFileName(file)

      const { error: uploadError } = await supabase.storage
        .from("site-images")
        .upload(fileName, file, {
          cacheControl: "3600",
          upsert: true,
        })

      if (uploadError) {
        console.error("업로드 에러:", uploadError)
        setMessage(`이미지 업로드 실패: ${uploadError.message}`)
        return
      }

      const { data } = supabase.storage
        .from("site-images")
        .getPublicUrl(fileName)

      const finalUrl = `${data.publicUrl}?t=${Date.now()}`

      setForm((prev) => ({
        ...prev,
        main_image_url: finalUrl,
      }))

      setMessage("대표 이미지 업로드 완료! 저장하기를 눌러줘.")
    } catch (error) {
      console.error("이미지 업로드 중 오류:", error)
      setMessage("이미지 업로드 중 오류가 발생했어.")
    } finally {
      setUploadingImage(false)
    }
  }

  const handleFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0]
    if (!file) return
    await uploadMainImage(file)
    e.target.value = ""
  }

  const handleDrop = async (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setDragOver(false)

    const file = e.dataTransfer.files?.[0]
    if (!file) {
      setMessage("파일을 다시 드래그해줘.")
      return
    }

    await uploadMainImage(file)
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      setMessage("")

      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        setMessage("로그인이 필요해.")
        return
      }

      if (user.email !== ADMIN_EMAIL) {
        setMessage("관리자만 수정할 수 있어.")
        return
      }

      const { error } = await supabase
        .from("about_content")
        .update({
          ...form,
          updated_at: new Date().toISOString(),
        })
        .eq("id", 1)

      if (error) {
        console.error("저장 에러:", error)
        setMessage(`저장 실패: ${error.message}`)
        return
      }

      setMessage("저장 완료!")
    } catch (error) {
      console.error("저장 중 오류:", error)
      setMessage("저장 중 오류가 발생했어.")
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="p-10">불러오는 중...</div>
  if (!authorized) return <div className="p-10">관리자만 접근할 수 있어.</div>

  return (
    <div className="min-h-screen bg-sky-50 px-4 py-10">
      <div className="mx-auto max-w-5xl rounded-3xl bg-white p-8 shadow-xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">About 관리자 페이지</h1>
            <p className="mt-2 text-slate-500">/about 페이지 내용을 수정해.</p>
          </div>
          <button
            onClick={() => router.push("/about")}
            className="rounded-xl border border-slate-300 px-4 py-2"
          >
            /about 보기
          </button>
        </div>

        <h2 className="mb-4 text-xl font-bold">Hero</h2>
        <Field
          label="메인 제목"
          name="hero_title"
          value={form.hero_title}
          onChange={handleInputChange}
        />
        <Area
          label="서브 문장"
          name="hero_subtitle"
          value={form.hero_subtitle}
          onChange={handleTextareaChange}
        />

        <h2 className="mb-4 mt-8 text-xl font-bold">Mission</h2>
        <Field
          label="배지 텍스트"
          name="mission_badge"
          value={form.mission_badge}
          onChange={handleInputChange}
        />
        <Field
          label="미션 제목"
          name="mission_title"
          value={form.mission_title}
          onChange={handleInputChange}
        />
        <Area
          label="미션 문단 1"
          name="mission_text_1"
          value={form.mission_text_1}
          onChange={handleTextareaChange}
        />
        <Area
          label="미션 문단 2"
          name="mission_text_2"
          value={form.mission_text_2}
          onChange={handleTextareaChange}
        />
        <Area
          label="미션 문단 3"
          name="mission_text_3"
          value={form.mission_text_3}
          onChange={handleTextareaChange}
        />

        <h2 className="mb-4 mt-8 text-xl font-bold">이미지 / 통계</h2>

        <div className="mb-5">
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            대표 이미지
          </label>

          <label
            onDragOver={(e) => {
              e.preventDefault()
              e.stopPropagation()
              setDragOver(true)
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            className={`flex min-h-[220px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 text-center transition ${
              dragOver
                ? "border-sky-500 bg-sky-100"
                : "border-sky-300 bg-sky-50 hover:bg-sky-100"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />

            <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-white text-sky-600 shadow-sm">
              {uploadingImage ? (
                <UploadCloud className="h-7 w-7 animate-pulse" />
              ) : (
                <ImagePlus className="h-7 w-7" />
              )}
            </div>

            <p className="text-lg font-semibold text-sky-700">
              {uploadingImage ? "업로드 중..." : "이미지를 드래그하거나 클릭해서 업로드"}
            </p>
            <p className="mt-2 text-sm text-slate-500">
              PNG, JPG, JPEG, WEBP 파일 업로드 가능
            </p>
          </label>
        </div>

        <Field
          label="현재 대표 이미지 URL"
          name="main_image_url"
          value={form.main_image_url}
          onChange={handleInputChange}
          readOnly
        />

        {form.main_image_url && (
          <div className="mb-6 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
            <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
              <p className="text-sm font-semibold text-slate-700">대표 이미지 미리보기</p>
            </div>
            <div className="p-4">
              <img
                src={form.main_image_url}
                alt="대표 이미지 미리보기"
                className="max-h-[420px] w-full rounded-xl object-cover"
              />
            </div>
          </div>
        )}

        <Field
          label="자료 수"
          name="archive_count"
          value={form.archive_count}
          onChange={handleInputChange}
        />
        <Field
          label="자료 수 라벨"
          name="archive_count_label"
          value={form.archive_count_label}
          onChange={handleInputChange}
        />

        <div className="mt-8 flex items-center gap-3">
          <button
            onClick={handleSave}
            disabled={saving || uploadingImage}
            className="rounded-xl bg-sky-600 px-6 py-3 font-semibold text-white hover:bg-sky-700 disabled:opacity-60"
          >
            {saving ? "저장 중..." : "저장하기"}
          </button>
          {message && <p className="text-sm text-slate-700">{message}</p>}
        </div>
      </div>
    </div>
  )
}