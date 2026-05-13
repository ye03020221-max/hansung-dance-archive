"use client"

import React, { useState } from "react"
import { Eye, EyeOff } from "lucide-react"
import Image from "next/image"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { supabase } from "@/lib/supabase"

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("")
  const [passwordConfirm, setPasswordConfirm] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()

    if (password.length < 6) {
      alert("비밀번호는 최소 6자 이상 입력해주세요.")
      return
    }

    if (password !== passwordConfirm) {
      alert("비밀번호가 서로 일치하지 않습니다.")
      return
    }

    setLoading(true)

    const { error } = await supabase.auth.updateUser({
      password,
    })

    setLoading(false)

    if (error) {
      alert(`비밀번호 변경 실패: ${error.message}`)
      return
    }

    alert("비밀번호가 변경되었습니다. 다시 로그인해주세요.")
    window.location.replace("/login")
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-sky-50 px-4 py-12">
      <div className="w-full max-w-[420px]">
        <div className="rounded-2xl bg-white p-8 shadow-xl">
          <div className="mb-6 flex justify-center">
            <Image
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/%E1%84%8B%E1%85%B5%E1%84%86%E1%85%B5%E1%84%8C%E1%85%B5%201-Z3b4BAQSXe0bpYZtIYEsZ5DhVQc8Fx.jpeg"
              alt="한성대학교 로고"
              width={160}
              height={50}
              className="h-10 w-auto object-contain"
            />
          </div>

          <h1 className="mb-2 text-center text-2xl font-bold text-slate-800">
            비밀번호 재설정
          </h1>

          <p className="mb-6 text-center text-sm text-slate-500">
            새 비밀번호를 입력해주세요.
          </p>

          <form onSubmit={handleResetPassword} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="password">새 비밀번호</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="새 비밀번호를 입력하세요"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="passwordConfirm">새 비밀번호 확인</Label>
              <Input
                id="passwordConfirm"
                type={showPassword ? "text" : "password"}
                placeholder="새 비밀번호를 다시 입력하세요"
                required
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="h-12 w-full rounded-lg bg-blue-600 font-bold text-white transition-colors hover:bg-blue-700 disabled:bg-blue-300"
            >
              {loading ? "변경 중..." : "비밀번호 변경"}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}