import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { auth } from "@/auth"

export async function DELETE(
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

    // Verify ownership via band
    const review = await prisma.review.findUnique({
      where: { id },
      include: { band: true }
    })

    if (!review) {
      return new NextResponse("Review not found", { status: 404 })
    }

    if (review.band.userId !== userId) {
      return new NextResponse("Forbidden", { status: 403 })
    }

    await prisma.review.delete({
      where: { id }
    })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error("[REVIEW_DELETE]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}
