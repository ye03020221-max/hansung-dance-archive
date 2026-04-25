"use client"

import { useRef, useState } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { supabase } from "@/lib/supabase"

export default function UploadPage() {
  const [resourceType, setResourceType] = useState("")
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const [metadata, setMetadata] = useState({
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

  const handleChange = (key: string, value: string) => {
    setMetadata((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  const addFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return

    const newFiles = Array.from(files)

    setSelectedFiles((prev) => {
      const merged = [...prev]

      newFiles.forEach((file) => {
        const exists = merged.some(
          (prevFile) =>
            prevFile.name === file.name &&
            prevFile.size === file.size &&
            prevFile.lastModified === file.lastModified
        )

        if (!exists) {
          merged.push(file)
        }
      })

      return merged
    })
  }

  const removeFile = (targetFile: File) => {
    setSelectedFiles((prev) =>
      prev.filter(
        (file) =>
          !(
            file.name === targetFile.name &&
            file.size === targetFile.size &&
            file.lastModified === targetFile.lastModified
          )
      )
    )
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    addFiles(e.dataTransfer.files)
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    addFiles(e.target.files)

    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const resetForm = () => {
    setSelectedFiles([])
    setResourceType("")
    setIsDragging(false)
    setMetadata({
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

    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (selectedFiles.length === 0) {
      alert("파일을 선택해주세요.")
      return
    }

    if (!resourceType) {
      alert("자료 유형을 선택해주세요.")
      return
    }

    if (!metadata.title.trim()) {
      alert("제목을 입력해주세요.")
      return
    }

    setUploading(true)

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()

      if (userError) throw userError

      if (!user) {
        alert("로그인 후 업로드할 수 있어요.")
        return
      }

      for (const file of selectedFiles) {
        const fileExt = file.name.split(".").pop()?.toLowerCase() || "bin"
        const safeFileName = `${Date.now()}-${Math.random()
          .toString(36)
          .slice(2)}.${fileExt}`

        const filePath = `${resourceType}/${safeFileName}`

        const { error: uploadError } = await supabase.storage
          .from("performances")
          .upload(filePath, file, {
            upsert: true,
          })

        if (uploadError) throw uploadError

        const { data: publicUrlData } = supabase.storage
          .from("performances")
          .getPublicUrl(filePath)

        const publicUrl = publicUrlData.publicUrl

        const fileTitle =
          selectedFiles.length === 1
            ? metadata.title
            : `${metadata.title} - ${file.name.replace(/\.[^/.]+$/, "")}`

        const { error: insertError } = await supabase.from("자료").insert([
          {
            ...metadata,
            title: fileTitle,
            date: metadata.date || new Date().toISOString(),
            identifier: publicUrl,
            type: resourceType,
            file_url: publicUrl,
            file_name: file.name,
            user_id: user.id,
          },
        ])

        if (insertError) throw insertError
      }

      alert("업로드 성공!")
      resetForm()
    } catch (err: any) {
      console.error("업로드 오류:", err)
      alert(err.message || "업로드 중 오류가 발생했어요.")
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <Header />

      <main className="flex-1 p-8">
        <div className="mx-auto max-w-5xl rounded-3xl border bg-white p-8 shadow-md">
          <h1 className="mb-8 text-3xl font-bold text-slate-900">자료 업로드</h1>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold">파일 선택 * (여러 개 가능)</label>

                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  onChange={handleFileInputChange}
                  className="hidden"
                />

                <div
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`flex min-h-[220px] w-full cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-8 text-center transition ${
                    isDragging
                      ? "border-sky-500 bg-sky-50"
                      : "border-sky-200 bg-slate-50 hover:border-sky-400 hover:bg-sky-50/60"
                  }`}
                >
                  <div className="mb-3 text-4xl">📁</div>
                  <p className="text-lg font-semibold text-slate-800">
                    파일을 드래그해서 올리거나 클릭해서 선택하세요
                  </p>
                  <p className="mt-2 text-sm text-slate-500">
                    사진, 동영상, 문서, PDF 여러 개 업로드 가능
                  </p>

                  {selectedFiles.length > 0 && (
                    <div className="mt-5 w-full rounded-xl bg-white p-4 text-left text-sm text-slate-700 shadow-sm">
                      <p className="mb-3 font-semibold">
                        선택된 파일 {selectedFiles.length}개
                      </p>

                      <div className="max-h-48 space-y-2 overflow-y-auto">
                        {selectedFiles.map((file, index) => (
                          <div
                            key={`${file.name}-${file.size}-${file.lastModified}-${index}`}
                            className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2"
                          >
                            <span className="truncate pr-3">{file.name}</span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                removeFile(file)
                              }}
                              className="rounded-md px-2 py-1 text-xs font-semibold text-red-500 hover:bg-red-50"
                            >
                              삭제
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold">자료 유형 *</label>
                <select
                  value={resourceType}
                  onChange={(e) => setResourceType(e.target.value)}
                  className="w-full rounded-xl border p-3"
                >
                  <option value="">선택하세요</option>
                  <option value="photo">사진</option>
                  <option value="video">동영상</option>
                  <option value="pamphlet">팜플렛</option>
                  <option value="poster">포스터</option>
                  <option value="document">문서</option>
                </select>
              </div>
            </div>

            <div>
              <h2 className="mb-4 text-xl font-bold">무용 아카이브 기본 정보</h2>
              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold">작품 장르</label>
                  <select
                    value={metadata.genre}
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
                  <label className="mb-2 block text-sm font-semibold">공연 구분</label>
                  <select
                    value={metadata.category}
                    onChange={(e) => handleChange("category", e.target.value)}
                    className="w-full rounded-xl border p-3"
                  >
                    <option value="">선택하세요</option>
                    <option value="졸업공연">졸업공연</option>
                    <option value="창작발표회">창작발표회</option>
                    <option value="H-Festa">H-Festa</option>
                    <option value="기타">기타</option>
                  </select>
                </div>

                <InputField
                  label="공연 연도"
                  value={metadata.year}
                  onChange={(v) => handleChange("year", v)}
                />

                <InputField
                  label="안무가"
                  value={metadata.choreographer}
                  onChange={(v) => handleChange("choreographer", v)}
                />

                <InputField
                  label="참여 무용수"
                  value={metadata.dancers}
                  onChange={(v) => handleChange("dancers", v)}
                />
              </div>
            </div>

            <div>
              <h2 className="mb-4 text-xl font-bold">Dublin Core 메타데이터</h2>

              <div className="grid gap-5 md:grid-cols-2">
                <InputField
                  label="Title (제목) *"
                  value={metadata.title}
                  onChange={(v) => handleChange("title", v)}
                  required
                />
                <InputField
                  label="Creator (제작자)"
                  value={metadata.creator}
                  onChange={(v) => handleChange("creator", v)}
                />
                <InputField
                  label="Subject (주제)"
                  value={metadata.subject}
                  onChange={(v) => handleChange("subject", v)}
                />
                <InputField
                  label="Publisher (발행처)"
                  value={metadata.publisher}
                  onChange={(v) => handleChange("publisher", v)}
                />
                <InputField
                  label="Contributor (기여자)"
                  value={metadata.contributor}
                  onChange={(v) => handleChange("contributor", v)}
                />
                <InputField
                  label="Date (날짜)"
                  value={metadata.date}
                  onChange={(v) => handleChange("date", v)}
                />
                <InputField
                  label="Type"
                  value={metadata.type}
                  onChange={(v) => handleChange("type", v)}
                />
                <InputField
                  label="Format"
                  value={metadata.format}
                  onChange={(v) => handleChange("format", v)}
                />
                <InputField
                  label="Source"
                  value={metadata.source}
                  onChange={(v) => handleChange("source", v)}
                />
                <InputField
                  label="Language"
                  value={metadata.language}
                  onChange={(v) => handleChange("language", v)}
                />
                <InputField
                  label="Relation"
                  value={metadata.relation}
                  onChange={(v) => handleChange("relation", v)}
                />
                <InputField
                  label="Coverage"
                  value={metadata.coverage}
                  onChange={(v) => handleChange("coverage", v)}
                />
                <InputField
                  label="Rights"
                  value={metadata.rights}
                  onChange={(v) => handleChange("rights", v)}
                />
              </div>

              <div className="mt-5">
                <label className="mb-2 block text-sm font-semibold">
                  Description (설명)
                </label>
                <textarea
                  value={metadata.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  rows={5}
                  className="w-full rounded-xl border p-3"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={uploading}
              className="w-full rounded-xl bg-sky-600 p-4 text-lg font-bold text-white hover:bg-sky-700 disabled:bg-gray-400"
            >
              {uploading ? "업로드 중..." : "업로드 시작"}
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