import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { auth } from "@/auth"
import { BookingStatus } from "@prisma/client"

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    const userId = session?.user?.id
    const { id } = await params

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const body = await req.json()
    const { status, price, paymentStatus } = body

    if (status && !Object.values(BookingStatus).includes(status as BookingStatus)) {
      return new NextResponse("Invalid status", { status: 400 })
    }

    // Verify ownership via band
    const booking = await prisma.booking.findUnique({
      where: { id },
      include: { band: true }
    })

    if (!booking) {
      return new NextResponse("Booking not found", { status: 404 })
    }

    if (booking.band.userId !== userId) {
      return new NextResponse("Forbidden", { status: 403 })
    }

    const updateData: any = {}
    if (status) updateData.status = status
    if (price !== undefined) updateData.price = Number(price)
    if (paymentStatus) updateData.paymentStatus = paymentStatus

    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: updateData
    })

    return NextResponse.json(updatedBooking)
  } catch (error) {
    console.error("[BOOKING_UPDATE]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}
