import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { auth } from "@/auth"

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const query = searchParams.get("q")
  const genre = searchParams.get("genre")
  const city = searchParams.get("city")
  
  const where: any = {}

  if (query) {
    where.name = { contains: query, mode: "insensitive" }
  }

  if (genre && genre !== "all") {
    where.genre = { equals: genre, mode: "insensitive" }
  }

  if (city && city !== "all") {
    where.city = { equals: city, mode: "insensitive" }
  }

  try {
    const bands = await prisma.band.findMany({
      where,
      include: {
        photos: true,
        reviews: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json(bands)
  } catch (error) {
    console.error("[BANDS_GET]", error)
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

    const body = await req.json()
    const { name, genre, city, price, bio } = body

    if (!name || !genre || !city || !price) {
      return new NextResponse("Missing required fields", { status: 400 })
    }

    // Create a slug from name
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") + "-" + Math.random().toString(36).substring(2, 7)

    const band = await prisma.band.create({
      data: {
        userId,
        name,
        slug,
        genre,
        city,
        price: parseFloat(price),
        bio,
      }
    })

    return NextResponse.json(band)
  } catch (error) {
    console.error("[BANDS_POST]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}
