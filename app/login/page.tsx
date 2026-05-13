"use client"

import React, { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Eye, EyeOff } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { supabase } from "@/lib/supabase"

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [resetEmail, setResetEmail] = useState("")
  const [showFindBox, setShowFindBox] = useState(false)

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      })

      if (error) {
        alert(`로그인 실패: ${error.message}`)
        return
      }

      if (data.session) {
        alert("로그인 성공!")
        window.location.replace("/")
      }
    } catch (err) {
      console.error("로그인 중 에러 발생:", err)
      alert("알 수 없는 오류가 발생했습니다.")
    }
  }

  const handleResetPassword = async () => {
    const email = resetEmail.trim() || formData.email.trim()

    if (!email) {
      alert("비밀번호 재설정 메일을 받을 이메일을 입력해주세요.")
      return
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/login`,
    })

    if (error) {
      alert(`비밀번호 찾기 실패: ${error.message}`)
      return
    }

    alert("비밀번호 재설정 메일을 발송했습니다. 이메일을 확인해주세요.")
  }

  const handleFindId = () => {
    alert(
      "이 사이트의 아이디는 가입할 때 사용한 이메일입니다. 기억나지 않으시면 자주 사용하는 이메일로 비밀번호 찾기를 시도해주세요."
    )
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

          <h1 className="mb-6 text-center text-2xl font-bold text-slate-800">
            로그인
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">이메일</Label>
              <Input
                id="email"
                type="email"
                placeholder="이메일을 입력하세요"
                required
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">비밀번호</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="비밀번호를 입력하세요"
                  required
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
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

            <button
              type="submit"
              className="h-12 w-full rounded-lg bg-blue-600 font-bold text-white transition-colors hover:bg-blue-700"
            >
              로그인
            </button>
          </form>

          <div className="mt-4 flex justify-center gap-3 text-sm text-slate-500">
            <button
              type="button"
              onClick={handleFindId}
              className="hover:text-blue-600 hover:underline"
            >
              아이디 찾기
            </button>
            <span>|</span>
            <button
              type="button"
              onClick={() => setShowFindBox(!showFindBox)}
              className="hover:text-blue-600 hover:underline"
            >
              비밀번호 찾기
            </button>
          </div>

          {showFindBox && (
            <div className="mt-5 rounded-xl border bg-slate-50 p-4">
              <Label htmlFor="resetEmail">비밀번호 재설정 이메일</Label>
              <Input
                id="resetEmail"
                type="email"
                placeholder="가입한 이메일을 입력하세요"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                className="mt-2"
              />

              <button
                type="button"
                onClick={handleResetPassword}
                className="mt-3 h-10 w-full rounded-lg bg-sky-500 text-sm font-bold text-white hover:bg-sky-600"
              >
                재설정 메일 보내기
              </button>
            </div>
          )}

          <div className="mt-6 text-center text-sm">
            <Link href="/signup" className="text-blue-600 hover:underline">
              회원가입
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}