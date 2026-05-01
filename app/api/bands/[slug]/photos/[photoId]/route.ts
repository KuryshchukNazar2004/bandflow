import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { auth } from "@/auth"

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string; photoId: string }> }
) {
  try {
    const session = await auth()
    const userId = session?.user?.id
    const { slug, photoId } = await params

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 })
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

    // Verify photo belongs to band
    const photo = await prisma.photo.findUnique({
      where: { id: photoId },
    })

    if (!photo || photo.bandId !== band.id) {
      return new NextResponse("Photo not found", { status: 404 })
    }

    await prisma.photo.delete({
      where: { id: photoId },
    })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error("[PHOTOS_DELETE]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}
