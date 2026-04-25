"use client"

import React, { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { supabase } from "@/lib/supabase"

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      // 1. Supabase 로그인 시도
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      })

      if (error) {
        alert(`로그인 실패: ${error.message}`)
        return
      }

      // 2. 세션이 정상적으로 생성되었는지 확인
      if (data.session) {
        alert("로그인 성공!")
        // 3. window.location.replace를 사용하여 메인으로 이동 (세션 저장 안정성)
        window.location.replace("/")
      }
    } catch (err) {
      console.error("로그인 중 에러 발생:", err)
      alert("알 수 없는 오류가 발생했습니다.")
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-sky-50 px-4 py-12">
      <div className="w-full max-w-[420px]">
        <div className="rounded-2xl bg-white p-8 shadow-xl">
          {/* 로고 영역 */}
          <div className="mb-6 flex justify-center">
            <Image
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/%E1%84%8B%E1%85%B5%E1%84%86%E1%85%B5%E1%84%8C%E1%85%B5%201-Z3b4BAQSXe0bpYZtIYEsZ5DhVQc8Fx.jpeg"
              alt="한성대학교 로고"
              width={160}
              height={50}
              className="h-10 w-auto object-contain"
            />
          </div>

          <h1 className="mb-6 text-center text-2xl font-bold text-slate-800">로그인</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">이메일</Label>
              <Input
                id="email"
                type="email"
                placeholder="이메일을 입력하세요"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
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
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
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
              className="h-12 w-full rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-700 transition-colors"
            >
              로그인
            </button>
          </form>

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