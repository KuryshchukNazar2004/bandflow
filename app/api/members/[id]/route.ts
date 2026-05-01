import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { auth } from "@/auth"

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
    const { name, role, photo } = body

    // Verify ownership
    const member = await prisma.member.findUnique({
      where: { id },
      include: { band: true }
    })

    if (!member) {
      return new NextResponse("Member not found", { status: 404 })
    }

    if (member.band.userId !== userId) {
      return new NextResponse("Forbidden", { status: 403 })
    }

    const updatedMember = await prisma.member.update({
      where: { id },
      data: {
        name,
        role,
        photo
      }
    })

    return NextResponse.json(updatedMember)
  } catch (error) {
    console.error("[MEMBER_UPDATE]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

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

    // Verify ownership
    const member = await prisma.member.findUnique({
      where: { id },
      include: { band: true }
    })

    if (!member) {
      return new NextResponse("Member not found", { status: 404 })
    }

    if (member.band.userId !== userId) {
      return new NextResponse("Forbidden", { status: 403 })
    }

    await prisma.member.delete({
      where: { id }
    })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error("[MEMBER_DELETE]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}
