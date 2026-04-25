"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { Pencil, UploadCloud } from "lucide-react"

export default function AdminEditButton() {
  const [isAdmin, setIsAdmin] = useState(false)

  const ADMIN_EMAIL = "admin@hansung.ac.kr"

  useEffect(() => {
    const checkAdmin = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user?.email === ADMIN_EMAIL) {
        setIsAdmin(true)
      }
    }

    checkAdmin()
  }, [])

  if (!isAdmin) return null

  return (
    <div className="mb-6 flex justify-end">
      <Link
        href="/admin/about"
        className="inline-flex items-center gap-2 rounded-2xl border border-sky-200 bg-white px-5 py-3 text-sm font-semibold text-sky-700 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-sky-50 hover:shadow-md"
      >
        <Pencil className="h-4 w-4" />
        소개 페이지 수정
      </Link>
    </div>
  )
}