import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const { searchParams } = new URL(req.url)
    const from = searchParams.get("from")
    const to = searchParams.get("to")

    const band = await prisma.band.findUnique({ where: { slug } })
    if (!band) return new NextResponse("Not Found", { status: 404 })

    const bookings = await prisma.booking.findMany({
      where: {
        bandId: band.id,
        status: "CONFIRMED",
        ...(from && to
          ? { date: { gte: new Date(from), lte: new Date(to) } }
          : {}),
      },
      select: { date: true },
    })

    return NextResponse.json(bookings.map(b => b.date))
  } catch {
    return new NextResponse("Internal Error", { status: 500 })
  }
}
