"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { supabase } from "@/lib/supabase"

export default function SignupPage() {
  const router = useRouter()

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [signingUp, setSigningUp] = useState(false)

  const [formData, setFormData] = useState({
    name: "",
    username: "",
    password: "",
    confirmPassword: "",
    affiliation: "",
    email: "",
    agreeTerms: false,
    agreePrivacy: false,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name.trim()) {
      alert("이름을 입력해주세요.")
      return
    }

    if (!formData.username.trim()) {
      alert("아이디를 입력해주세요.")
      return
    }

    if (!formData.email.trim()) {
      alert("이메일을 입력해주세요.")
      return
    }

    if (!formData.password.trim()) {
      alert("비밀번호를 입력해주세요.")
      return
    }

    if (formData.password.length < 6) {
      alert("비밀번호는 6자 이상이어야 해요.")
      return
    }

    if (formData.password !== formData.confirmPassword) {
      alert("비밀번호 확인이 일치하지 않습니다.")
      return
    }

    if (!formData.affiliation) {
      alert("소속을 선택해주세요.")
      return
    }

    if (!formData.agreeTerms || !formData.agreePrivacy) {
      alert("이용약관과 개인정보 수집 및 이용에 동의해주세요.")
      return
    }

    setSigningUp(true)

    try {
      const { data, error } = await supabase.auth.signUp({
        email: formData.email.trim(),
        password: formData.password,
        options: {
          data: {
            name: formData.name,
            username: formData.username,
            affiliation: formData.affiliation,
          },
        },
      })

      console.log("signUp data:", data)
      console.log("signUp error:", error)

      if (error) {
        throw error
      }

      alert("회원가입이 완료되었어요. 이제 로그인해주세요.")
      router.push("/login")
    } catch (err: any) {
      console.error("회원가입 오류:", err)
      alert(err.message || "회원가입 중 오류가 발생했어요.")
    } finally {
      setSigningUp(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-sky-vertical px-4 py-12">
      <div className="w-full max-w-[520px] animate-fade-in-up">
        <div className="rounded-2xl bg-card p-8 shadow-xl">
          <h1 className="mb-2 text-center text-2xl font-bold text-navy">회원가입</h1>
          <p className="mb-8 text-center text-sm text-muted-foreground">
            한성대학교 무용 아카이브 이용을 위해 정보를 입력해주세요.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">이름</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="이름을 입력하세요"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="h-12 rounded-lg border-border bg-input focus:border-primary focus:ring-primary"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="username">아이디</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="아이디를 입력하세요"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="h-12 rounded-lg border-border bg-input focus:border-primary focus:ring-primary"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">비밀번호</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="비밀번호를 입력하세요"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="h-12 rounded-lg border-border bg-input pr-12 focus:border-primary focus:ring-primary"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">비밀번호 확인</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="비밀번호를 다시 입력하세요"
                    value={formData.confirmPassword}
                    onChange={(e) =>
                      setFormData({ ...formData, confirmPassword: e.target.value })
                    }
                    className="h-12 rounded-lg border-border bg-input pr-12 focus:border-primary focus:ring-primary"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="affiliation">소속</Label>
                <Select
                  value={formData.affiliation}
                  onValueChange={(value) => setFormData({ ...formData, affiliation: value })}
                >
                  <SelectTrigger className="h-12 rounded-lg border-border bg-input focus:border-primary focus:ring-primary">
                    <SelectValue placeholder="소속을 선택하세요" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="student">무용학과 재학생</SelectItem>
                    <SelectItem value="graduate">졸업생</SelectItem>
                    <SelectItem value="faculty">교수 / 조교</SelectItem>
                    <SelectItem value="external">외부 이용자</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">이메일</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="이메일을 입력하세요"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="h-12 rounded-lg border-border bg-input focus:border-primary focus:ring-primary"
                />
              </div>
            </div>

            <div className="space-y-4 rounded-lg bg-muted/50 p-4">
              <div className="flex items-start gap-3">
                <Checkbox
                  id="agreeTerms"
                  checked={formData.agreeTerms}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, agreeTerms: checked === true })
                  }
                  className="mt-0.5"
                />
                <Label htmlFor="agreeTerms" className="text-sm leading-relaxed">
                  <Link href="#" className="text-primary hover:underline">
                    이용약관
                  </Link>
                  에 동의합니다
                </Label>
              </div>

              <div className="flex items-start gap-3">
                <Checkbox
                  id="agreePrivacy"
                  checked={formData.agreePrivacy}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, agreePrivacy: checked === true })
                  }
                  className="mt-0.5"
                />
                <Label htmlFor="agreePrivacy" className="text-sm leading-relaxed">
                  <Link href="#" className="text-primary hover:underline">
                    개인정보 수집 및 이용
                  </Link>
                  에 동의합니다
                </Label>
              </div>
            </div>

            <Button
              type="submit"
              disabled={signingUp}
              className="h-12 w-full rounded-lg bg-navy text-primary-foreground transition-all duration-200 hover:bg-navy/90 hover:shadow-lg disabled:opacity-60"
            >
              {signingUp ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  가입 중...
                </span>
              ) : (
                "회원가입 완료"
              )}
            </Button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm text-muted-foreground">
              이미 계정이 있으신가요?{" "}
              <Link
                href="/login"
                className="font-medium text-primary transition-colors hover:text-primary/80 hover:underline"
              >
                로그인
              </Link>
            </p>
          </div>
        </div>

        <div className="mt-6 text-center">
          <Link
            href="/"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            홈으로 돌아가기
          </Link>
        </div>
      </div>
    </div>
  )
}