import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { auth } from "@/auth"
import { sendBookingCreatedEmail } from "@/lib/mail"

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    const userId = session?.user?.id
    const { searchParams } = new URL(req.url)
    const status = searchParams.get("status")
    const from = searchParams.get("from")
    const to = searchParams.get("to")

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const where: any = {}
    
    if (status && status !== "ALL") {
      where.status = status
    }
    
    if (from || to) {
      where.date = {}
      if (from) where.date.gte = new Date(from)
      if (to) where.date.lte = new Date(to)
    }

    // Get bookings for the user's band
    const band = await prisma.band.findFirst({
      where: { userId },
      include: { 
        bookings: {
          where,
          orderBy: { date: 'asc' }
        }
      }
    })

    if (!band) {
      return new NextResponse("Band not found", { status: 404 })
    }

    return NextResponse.json(band.bookings)
  } catch (error) {
    console.error("[BOOKINGS_GET]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { bandId, clientName, clientEmail, clientPhone, eventType, date, note, price } = body

    if (!bandId || !clientName || !clientEmail || !date) {
      return new NextResponse("Missing required fields", { status: 400 })
    }

    const booking = await prisma.booking.create({
      data: {
        bandId,
        clientName,
        clientEmail,
        clientPhone,
        eventType,
        date: new Date(date),
        note,
        price: price ? Number(price) : undefined,
        status: "PENDING",
      }
    })

    // Send email notification to band owner
    try {
      const band = await prisma.band.findUnique({
        where: { id: bandId },
        include: { user: true }
      })

      if (band && band.user && band.user.email) {
        await sendBookingCreatedEmail(
          band.user.email,
          clientName,
          band.name,
          new Date(date)
        )
      }
    } catch (emailError) {
      console.error("[EMAIL_ERROR]", emailError)
      // Don't fail the request if email fails
    }

    return NextResponse.json(booking)
  } catch (error) {
    console.error("[BOOKINGS_POST]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}
