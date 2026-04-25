import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { createCanvas } from "@napi-rs/canvas"
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs"
import crypto from "crypto"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  try {
    const { fileUrl } = await req.json()

    if (!fileUrl) {
      return NextResponse.json(
        { error: "fileUrl이 필요해." },
        { status: 400 }
      )
    }

    const fileResponse = await fetch(fileUrl)

    if (!fileResponse.ok) {
      return NextResponse.json(
        { error: "PDF 파일을 가져오지 못했어." },
        { status: 400 }
      )
    }

    const pdfData = new Uint8Array(await fileResponse.arrayBuffer())

    const pdf = await (pdfjsLib as any).getDocument({
  data: pdfData,
  disableWorker: true,
}).promise

    const page = await pdf.getPage(1)
    const viewport = page.getViewport({ scale: 1.5 })

    const width = Math.ceil(viewport.width)
    const height = Math.ceil(viewport.height)

    const canvas = createCanvas(width, height)
    const context = canvas.getContext("2d")

    context.fillStyle = "#ffffff"
    context.fillRect(0, 0, width, height)

    const renderTask = (page as any).render({
      canvasContext: context,
      viewport,
    })

    await renderTask.promise

    const pngBuffer = canvas.toBuffer("image/png")
    const thumbPath = `thumbnail/thumb-${Date.now()}-${crypto.randomUUID()}.png`

    const { error: uploadError } = await supabaseAdmin.storage
      .from("performances")
      .upload(thumbPath, pngBuffer, {
        contentType: "image/png",
        upsert: true,
      })

    if (uploadError) {
      return NextResponse.json(
        { error: uploadError.message },
        { status: 500 }
      )
    }

    const { data } = supabaseAdmin.storage
      .from("performances")
      .getPublicUrl(thumbPath)

    return NextResponse.json({
      thumbnailUrl: data.publicUrl,
    })
  } catch (error: any) {
    console.error("pdf thumbnail route error:", error)
    return NextResponse.json(
      { error: error?.message || "썸네일 생성 실패" },
      { status: 500 }
    )
  }
}