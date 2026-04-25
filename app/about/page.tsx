import Image from "next/image"
import { BookOpen, Users, Archive, Target, Heart } from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { createClient } from "@supabase/supabase-js"
import AdminEditButton from "./admin-edit-button"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default async function AboutPage() {
  const { data } = await supabase
    .from("about_content")
    .select("*")
    .eq("id", 1)
    .single()

  const content = data ?? {
    hero_title: "아카이브 소개",
    hero_subtitle: "한성대학교 무용학과의 역사와 예술을 기록하고 보존합니다",

    mission_badge: "Our Mission",
    mission_title: "소중한 예술적 유산을 보존합니다",
    mission_text_1:
      "한성대학교 무용 아카이브는 학과의 풍부한 공연 역사를 디지털로 보존하고 공유하기 위해 만들어졌습니다.",
    mission_text_2:
      "졸업공연, 창작발표회, H-Festa 등 다양한 무대에서 펼쳐진 학생들의 열정과 예술성을 기록하여, 현재와 미래의 무용인들이 영감을 얻을 수 있는 자료로 활용하고자 합니다.",
    mission_text_3:
      "Dublin Core 메타데이터 표준을 적용하여 체계적으로 자료를 관리하며, 누구나 쉽게 검색하고 열람할 수 있는 열린 아카이브를 지향합니다.",

    main_image_url:
      "https://images.unsplash.com/photo-1518834107812-67b0b7c58434?w=800&h=600&fit=crop",

    archive_count: "500+",
    archive_count_label: "아카이브 자료",

    feature_1_title: "디지털 보존",
    feature_1_desc: "소중한 공연 자료를 디지털화하여 영구적으로 보존합니다.",

    feature_2_title: "열린 공유",
    feature_2_desc: "학과 구성원 모두가 자료를 업로드하고 공유할 수 있습니다.",

    feature_3_title: "표준화된 메타데이터",
    feature_3_desc: "Dublin Core 표준을 기반으로 체계적으로 자료를 관리합니다.",

    feature_4_title: "쉬운 검색",
    feature_4_desc: "연도, 장르, 공연 유형별로 원하는 자료를 빠르게 찾을 수 있습니다.",

    timeline_title: "학과 연혁",
    timeline_subtitle: "한성대학교 무용학과의 발자취를 따라갑니다",

    year_1: "2003",
    event_1: "한성대학교 무용학과 설립",
    year_2: "2005",
    event_2: "첫 졸업공연 개최",
    year_3: "2010",
    event_3: "창작발표회 정기화",
    year_4: "2015",
    event_4: "H-Festa 시작",
    year_5: "2020",
    event_5: "비대면 공연 도입",
    year_6: "2024",
    event_6: "무용 아카이브 시스템 구축",

    contact_title: "문의하기",
    contact_subtitle: "아카이브에 대한 문의사항이 있으시면 연락주세요",
    contact_phone: "02-760-4107",
    contact_email: "dance@hansung.ac.kr",
  }

  const features = [
    {
      icon: Archive,
      title: content.feature_1_title,
      description: content.feature_1_desc,
    },
    {
      icon: Users,
      title: content.feature_2_title,
      description: content.feature_2_desc,
    },
    {
      icon: BookOpen,
      title: content.feature_3_title,
      description: content.feature_3_desc,
    },
    {
      icon: Target,
      title: content.feature_4_title,
      description: content.feature_4_desc,
    },
  ]

  const timeline = [
    { year: content.year_1, event: content.event_1 },
    { year: content.year_2, event: content.event_2 },
    { year: content.year_3, event: content.event_3 },
    { year: content.year_4, event: content.event_4 },
    { year: content.year_5, event: content.event_5 },
    { year: content.year_6, event: content.event_6 },
  ]

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero */}
        <section className="relative bg-gradient-sky py-16 md:py-24">
          <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
            <AdminEditButton />

            <h1 className="mb-4 text-3xl font-bold text-navy md:text-4xl">
              {content.hero_title}
            </h1>

            <p className="text-lg text-muted-foreground">
              {content.hero_subtitle}
            </p>
          </div>
        </section>

        {/* Mission */}
        <section className="py-16 md:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid items-center gap-12 lg:grid-cols-2">
              <div>
                <span className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
                  <Heart className="h-4 w-4" />
                  {content.mission_badge}
                </span>

                <h2 className="mb-6 text-2xl font-bold text-navy md:text-3xl">
                  {content.mission_title}
                </h2>

                <div className="space-y-4 text-muted-foreground">
                  <p>{content.mission_text_1}</p>
                  <p>{content.mission_text_2}</p>
                  <p>{content.mission_text_3}</p>
                </div>
              </div>

              <div className="relative">
                <div className="overflow-hidden rounded-2xl shadow-2xl">
                  <Image
                    src={content.main_image_url}
                    alt="무용 공연"
                    width={800}
                    height={600}
                    className="h-auto w-full object-cover"
                  />
                </div>

                <div className="absolute -bottom-6 -left-6 hidden rounded-xl bg-card p-4 shadow-lg md:block">
                  <p className="text-3xl font-bold text-primary">
                    {content.archive_count}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {content.archive_count_label}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="bg-muted/30 py-16 md:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12 text-center">
              <h2 className="mb-4 text-2xl font-bold text-navy md:text-3xl">
                주요 기능
              </h2>
              <p className="text-muted-foreground">
                아카이브의 핵심 기능을 소개합니다
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {features.map((feature) => (
                <div
                  key={feature.title}
                  className="rounded-2xl bg-card p-6 shadow-md transition-all hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>

                  <h3 className="mb-2 font-semibold text-foreground">
                    {feature.title}
                  </h3>

                  <p className="text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Timeline */}
        <section className="py-16 md:py-24">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12 text-center">
              <h2 className="mb-4 text-2xl font-bold text-navy md:text-3xl">
                {content.timeline_title}
              </h2>

              <p className="text-muted-foreground">
                {content.timeline_subtitle}
              </p>
            </div>

            <div className="relative">
              <div className="absolute left-4 top-0 h-full w-0.5 bg-gradient-to-b from-primary via-primary/50 to-transparent md:left-1/2 md:-ml-px" />

              <div className="space-y-8">
                {timeline.map((item, index) => (
                  <div
                    key={`${item.year}-${index}`}
                    className={`relative flex items-center gap-6 ${
                      index % 2 === 0
                        ? "md:flex-row"
                        : "md:flex-row-reverse"
                    }`}
                  >
                    <div className="absolute left-4 z-10 flex h-4 w-4 items-center justify-center md:left-1/2 md:-ml-2">
                      <div className="h-4 w-4 rounded-full border-4 border-primary bg-card" />
                    </div>

                    <div
                      className={`ml-12 flex-1 md:ml-0 ${
                        index % 2 === 0
                          ? "md:pr-8 md:text-right"
                          : "md:pl-8 md:text-left"
                      }`}
                    >
                      <div className="inline-block rounded-xl bg-card p-4 shadow-md">
                        <span className="text-lg font-bold text-primary">
                          {item.year}
                        </span>

                        <p className="mt-1 text-muted-foreground">
                          {item.event}
                        </p>
                      </div>
                    </div>

                    <div className="hidden flex-1 md:block" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Contact */}
        <section className="bg-gradient-sky-vertical py-16 md:py-24">
          <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
            <h2 className="mb-4 text-2xl font-bold text-navy md:text-3xl">
              {content.contact_title}
            </h2>

            <p className="mb-8 text-muted-foreground">
              {content.contact_subtitle}
            </p>

            <div className="inline-flex flex-col items-center rounded-2xl bg-card p-8 shadow-lg sm:flex-row sm:gap-12">
              <div className="mb-6 text-center sm:mb-0">
                <p className="text-sm text-muted-foreground">전화번호</p>
                <p className="text-lg font-semibold text-foreground">
                  {content.contact_phone}
                </p>
              </div>

              <div className="hidden h-12 w-px bg-border sm:block" />

              <div className="text-center">
                <p className="text-sm text-muted-foreground">이메일</p>
                <p className="text-lg font-semibold text-foreground">
                  {content.contact_email}
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}