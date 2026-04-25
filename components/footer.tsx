import Link from "next/link"
import { Instagram, Phone, Mail, MapPin } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t border-border/40 bg-card">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-3">
          {/* Brand */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-navy">한성대학교 무용 아카이브</h3>
            <p className="text-sm text-muted-foreground">
              한성대학교 무용학과의 소중한 공연과 작품들을 기록하고 보존하는 디지털 아카이브입니다.
            </p>
            <div className="flex items-center gap-4">
              <Link
                href="https://instagram.com/hsu_dance_high"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-sky-medium to-sky-dark text-primary-foreground transition-transform hover:scale-110"
              >
                <Instagram className="h-5 w-5" />
                <span className="sr-only">Instagram</span>
              </Link>
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-navy">연락처</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-primary" />
                <span>한국무용 / 현대무용 / 발레: 02-760-4107</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-primary" />
                <span>dance@hansung.ac.kr</span>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                <span>서울특별시 성북구 삼선교로 16길 116</span>
              </li>
            </ul>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-navy">바로가기</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/about" className="text-muted-foreground transition-colors hover:text-primary">
                  아카이브 소개
                </Link>
              </li>
              <li>
                <Link href="/performances" className="text-muted-foreground transition-colors hover:text-primary">
                  공연자료
                </Link>
              </li>
              <li>
                <Link href="/board" className="text-muted-foreground transition-colors hover:text-primary">
                  학생 게시판
                </Link>
              </li>
              <li>
                <Link
                  href="https://www.hansung.ac.kr"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground transition-colors hover:text-primary"
                >
                  한성대학교 홈페이지
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-12 border-t border-border/40 pt-8">
          <p className="text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} 한성대학교 무용학과. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
