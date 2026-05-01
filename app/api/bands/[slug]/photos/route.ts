import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { auth } from "@/auth"

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await auth()
    const userId = session?.user?.id
    const { slug } = await params

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const body = await req.json()
    const { url, caption } = body

    if (!url) {
      return new NextResponse("Missing URL", { status: 400 })
    }

    const band = await prisma.band.findUnique({
      where: { slug },
    })

    if (!band) {
      return new NextResponse("Band not found", { status: 404 })
    }

    if (band.userId !== userId) {
      return new NextResponse("Forbidden", { status: 403 })
    }

    const photo = await prisma.photo.create({
      data: {
        bandId: band.id,
        url,
        caption,
      }
    })

    return NextResponse.json(photo)
  } catch (error) {
    console.error("[PHOTOS_POST]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

