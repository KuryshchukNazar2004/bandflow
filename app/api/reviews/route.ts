import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { auth } from "@/auth"

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    const userId = session?.user?.id
    
    // Optional: Require auth for reviews
    // if (!userId) {
    //   return new NextResponse("Unauthorized", { status: 401 })
    // }

    const body = await req.json()
    const { bandId, author, rating, text } = body

    if (!bandId || !author || !rating || !text) {
      return new NextResponse("Missing required fields", { status: 400 })
    }

    // Optional: Check if user already reviewed this band
    // if (userId) {
    //   const existingReview = await prisma.review.findFirst({
    //     where: { bandId, userId } // Need userId in Review model
    //   })
    // }

    const review = await prisma.review.create({
      data: {
        bandId,
        author,
        rating: parseInt(rating),
        text,
      }
    })

    return NextResponse.json(review)
  } catch (error) {
    console.error("[REVIEWS_POST]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const bandId = searchParams.get("bandId")

  if (!bandId) {
    return new NextResponse("Band ID required", { status: 400 })
  }

  try {
    const reviews = await prisma.review.findMany({
      where: { bandId },
      orderBy: { createdAt: "desc" }
    })

    return NextResponse.json(reviews)
  } catch (error) {
    console.error("[REVIEWS_GET]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}
