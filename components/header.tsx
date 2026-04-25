"use client"

import Link from "next/link"
import Image from "next/image"
import { useEffect, useState } from "react"
import {
  Menu,
  X,
  Upload,
  LogIn,
  LogOut,
  User,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"

const navItems = [
  { href: "/", label: "홈" },
  { href: "/notices", label: "공지사항" },
  { href: "/about", label: "아카이브 소개" },
  { href: "/performances", label: "공연자료" },
  { href: "/board", label: "학생 게시판" },
]

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      setUser(session?.user ?? null)
    }

    checkUser()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    window.location.replace("/")
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-card/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* 로고 */}
        <Link href="/" className="flex items-center">
          <Image
            src="/hsu-logo.pngv=2"
            alt="한성대학교 로고"
            width={220}
            height={55}
            priority
            className="h-10 w-auto object-contain"
          />
        </Link>

        {/* 데스크탑 메뉴 */}
        <nav className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-lg px-4 py-2 text-sm font-medium text-foreground/80 transition-colors hover:bg-secondary hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* 우측 버튼 */}
        <div className="hidden items-center gap-2 md:flex">
          {user ? (
            <>
              <Button
                variant="outline"
                size="sm"
                asChild
                className="gap-2"
              >
                <Link href="/mypage">
                  <User className="h-4 w-4" />
                  마이페이지
                </Link>
              </Button>

              <Button
                variant="outline"
                size="sm"
                asChild
                className="gap-2 border-primary/30 text-primary hover:bg-primary/10"
              >
                <Link href="/upload">
                  <Upload className="h-4 w-4" />
                  업로드
                </Link>
              </Button>

              <Button
                size="sm"
                variant="ghost"
                onClick={handleSignOut}
                className="gap-2 text-foreground/70 hover:text-red-600"
              >
                <LogOut className="h-4 w-4" />
                로그아웃
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                size="sm"
                asChild
                className="gap-2 border-primary/30 text-primary hover:bg-primary/10"
              >
                <Link href="/upload">
                  <Upload className="h-4 w-4" />
                  업로드
                </Link>
              </Button>

              <Button
                size="sm"
                asChild
                className="gap-2 bg-gradient-to-r from-sky-dark to-navy text-primary-foreground hover:opacity-90"
              >
                <Link href="/login">
                  <LogIn className="h-4 w-4" />
                  로그인
                </Link>
              </Button>
            </>
          )}
        </div>

        {/* 모바일 햄버거 */}
        <button
          type="button"
          className="inline-flex items-center justify-center rounded-lg p-2 text-foreground md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
      </div>

      {/* 모바일 메뉴 */}
      {mobileMenuOpen && (
        <div className="border-t border-border/40 bg-card md:hidden">
          <div className="space-y-1 px-4 pb-4 pt-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="block rounded-lg px-3 py-2 text-base font-medium text-foreground/80 hover:bg-secondary hover:text-foreground"
              >
                {item.label}
              </Link>
            ))}

            <div className="mt-3 space-y-2 border-t border-border/40 pt-4">
              {user ? (
                <>
                  <Button
                    variant="outline"
                    asChild
                    className="w-full gap-2"
                  >
                    <Link
                      href="/mypage"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <User className="h-4 w-4" />
                      마이페이지
                    </Link>
                  </Button>

                  <Button
                    variant="outline"
                    asChild
                    className="w-full gap-2 border-primary/30 text-primary"
                  >
                    <Link
                      href="/upload"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Upload className="h-4 w-4" />
                      업로드
                    </Link>
                  </Button>

                  <Button
                    variant="ghost"
                    onClick={() => {
                      handleSignOut()
                      setMobileMenuOpen(false)
                    }}
                    className="w-full gap-2 text-red-600"
                  >
                    <LogOut className="h-4 w-4" />
                    로그아웃
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="outline"
                    asChild
                    className="w-full gap-2 border-primary/30 text-primary"
                  >
                    <Link
                      href="/upload"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Upload className="h-4 w-4" />
                      업로드
                    </Link>
                  </Button>

                  <Button
                    asChild
                    className="w-full gap-2 bg-gradient-to-r from-sky-dark to-navy text-primary-foreground"
                  >
                    <Link
                      href="/login"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <LogIn className="h-4 w-4" />
                      로그인
                    </Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  )
}