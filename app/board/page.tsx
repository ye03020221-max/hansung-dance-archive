"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import {
  MessageSquare,
  HelpCircle,
  Plus,
  ChevronRight,
  Calendar,
  User,
  Eye,
  Lock,
} from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { supabase } from "@/lib/supabase"

type BoardPost = {
  id: number
  title: string
  author: string
  content: string
  category: string
  views: number
  created_at: string
}

const faqItems = [
  {
    id: 1,
    question: "아카이브에 자료를 업로드하려면 어떻게 해야 하나요?",
    answer:
      "회원가입 후 로그인하시면 상단의 '업로드' 버튼을 통해 자료를 등록할 수 있습니다. 무용학과 재학생, 졸업생, 교수진만 업로드 권한이 부여됩니다.",
    category: "업로드",
  },
  {
    id: 2,
    question: "공연 영상을 다운로드할 수 있나요?",
    answer:
      "저작권 보호를 위해 대부분의 영상은 스트리밍만 가능합니다. 교육 목적으로 다운로드가 필요한 경우, 학과 사무실에 별도 요청해주시기 바랍니다.",
    category: "이용안내",
  },
  {
    id: 3,
    question: "외부인도 아카이브를 열람할 수 있나요?",
    answer:
      "네, 공개된 자료는 누구나 열람 가능합니다. 다만 일부 내부 자료는 학과 관계자만 접근할 수 있습니다.",
    category: "이용안내",
  },
  {
    id: 4,
    question: "자료의 메타데이터는 어떤 기준으로 작성하나요?",
    answer:
      "Dublin Core 표준을 따르고 있습니다. 제목, 제작자, 날짜 등 기본 정보를 정확히 입력해주시면 됩니다. 자세한 안내는 업로드 페이지에서 확인하실 수 있습니다.",
    category: "업로드",
  },
  {
    id: 5,
    question: "과거 졸업생의 작품도 아카이브에서 볼 수 있나요?",
    answer:
      "네, 2000년대 초반부터의 졸업공연, 창작발표회, H-Festa 등 다양한 공연 자료가 보관되어 있습니다. 공연자료 페이지에서 연도별로 검색하실 수 있습니다.",
    category: "이용안내",
  },
]

export default function BoardPage() {
  const [activeTab, setActiveTab] = useState("qna")
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null)
  const [posts, setPosts] = useState<BoardPost[]>([])
  const [loading, setLoading] = useState(true)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  const toggleFaq = (id: number) => {
    setExpandedFaq(expandedFaq === id ? null : id)
  }

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true)

      const { data, error } = await supabase
        .from("board_posts")
        .select("*")
        .order("created_at", { ascending: false })

      if (error) {
        console.error("게시글 불러오기 오류:", error)
        setPosts([])
        setLoading(false)
        return
      }

      setPosts(data || [])
      setLoading(false)
    }

    const checkUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      setIsLoggedIn(!!user)
    }

    fetchPosts()
    checkUser()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session?.user)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const day = String(date.getDate()).padStart(2, "0")
    return `${year}.${month}.${day}`
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1 bg-background">
        <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-navy">학생 게시판</h1>
            <p className="mt-2 text-muted-foreground">
              아카이브 이용에 관한 질문과 답변을 나눠보세요
            </p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <div className="flex items-center justify-between">
              <TabsList className="h-12 bg-muted/50 p-1">
                <TabsTrigger
                  value="qna"
                  className="h-10 gap-2 px-4 data-[state=active]:bg-card data-[state=active]:shadow-sm"
                >
                  <MessageSquare className="h-4 w-4" />
                  Q&A
                </TabsTrigger>

                <TabsTrigger
                  value="faq"
                  className="h-10 gap-2 px-4 data-[state=active]:bg-card data-[state=active]:shadow-sm"
                >
                  <HelpCircle className="h-4 w-4" />
                  FAQ
                </TabsTrigger>
              </TabsList>

              {activeTab === "qna" &&
                (isLoggedIn ? (
                  <Button
                    asChild
                    className="gap-2 bg-gradient-to-r from-sky-dark to-navy text-primary-foreground"
                  >
                    <Link href="/board/write">
                      <Plus className="h-4 w-4" />
                      글쓰기
                    </Link>
                  </Button>
                ) : (
                  <Button
                    asChild
                    variant="outline"
                    className="gap-2 border-primary/30 text-primary hover:bg-primary/5"
                  >
                    <Link href="/login">
                      <Lock className="h-4 w-4" />
                      로그인 후 작성 가능
                    </Link>
                  </Button>
                ))}
            </div>

            <TabsContent value="qna" className="space-y-4">
              <div className="rounded-2xl bg-card shadow-md">
                {loading ? (
                  <div className="p-8 text-center text-muted-foreground">
                    게시글 불러오는 중...
                  </div>
                ) : posts.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground">
                    아직 작성된 게시글이 없어요.
                  </div>
                ) : (
                  posts.map((item, index) => (
                    <Link
                      key={item.id}
                      href={`/board/${item.id}`}
                      className={`flex items-center justify-between p-4 transition-colors hover:bg-muted/50 ${
                        index !== posts.length - 1 ? "border-b border-border" : ""
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="mb-1 flex items-center gap-2">
                          <span className="rounded bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                            {item.category}
                          </span>
                        </div>

                        <h3 className="truncate font-medium text-foreground">
                          {item.title}
                        </h3>

                        <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {item.author}
                          </span>

                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(item.created_at)}
                          </span>

                          <span className="flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            {item.views}
                          </span>
                        </div>
                      </div>

                      <ChevronRight className="ml-4 h-5 w-5 flex-shrink-0 text-muted-foreground" />
                    </Link>
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="faq" className="space-y-4">
              <div className="rounded-2xl bg-card shadow-md">
                {faqItems.map((item, index) => (
                  <div
                    key={item.id}
                    className={index !== faqItems.length - 1 ? "border-b border-border" : ""}
                  >
                    <button
                      onClick={() => toggleFaq(item.id)}
                      className="flex w-full items-center justify-between p-4 text-left transition-colors hover:bg-muted/50"
                    >
                      <div className="flex items-start gap-3 pr-4">
                        <span className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                          Q
                        </span>

                        <div>
                          <span className="mb-1 inline-block rounded bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                            {item.category}
                          </span>
                          <p className="font-medium text-foreground">{item.question}</p>
                        </div>
                      </div>

                      <ChevronRight
                        className={`h-5 w-5 flex-shrink-0 text-muted-foreground transition-transform ${
                          expandedFaq === item.id ? "rotate-90" : ""
                        }`}
                      />
                    </button>

                    {expandedFaq === item.id && (
                      <div className="bg-muted/30 px-4 pb-4 pl-[52px]">
                        <div className="flex items-start gap-3">
                          <span className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-navy/10 text-sm font-semibold text-navy">
                            A
                          </span>
                          <p className="leading-relaxed text-muted-foreground">{item.answer}</p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  )
}