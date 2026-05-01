import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { auth } from "@/auth"

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    const userId = session?.user?.id

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const band = await prisma.band.findFirst({
      where: { userId },
      include: { members: true }
    })

    if (!band) {
      return new NextResponse("Band not found", { status: 404 })
    }

    return NextResponse.json(band.members)
  } catch (error) {
    console.error("[MEMBERS_GET]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    const userId = session?.user?.id

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const band = await prisma.band.findFirst({
      where: { userId }
    })

    if (!band) {
      return new NextResponse("Band not found", { status: 404 })
    }

    const body = await req.json()
    const { name, role, photo } = body

    if (!name || !role) {
      return new NextResponse("Missing required fields", { status: 400 })
    }

    const member = await prisma.member.create({
      data: {
        bandId: band.id,
        name,
        role,
        photo
      }
    })

    return NextResponse.json(member)
  } catch (error) {
    console.error("[MEMBERS_POST]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}
