import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { auth } from "@/auth"

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const band = await prisma.band.findUnique({
      where: { slug },
      include: {
        photos: true,
        members: true,
        services: true,
        reviews: true,
        instruments: true,
      },
    })

    if (!band) {
      return new NextResponse("Not Found", { status: 404 })
    }

    return NextResponse.json(band)
  } catch (error) {
    console.error("[BAND_GET]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

export async function PUT(
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
    // Destructure body to allow partial updates
    const { name, genre, city, price, bio, instruments, services, photos, members } = body

    // Check if the user owns the band
    const existingBand = await prisma.band.findUnique({
      where: { slug },
    })

    if (!existingBand) {
      return new NextResponse("Not Found", { status: 404 })
    }

    if (existingBand.userId !== userId) {
      return new NextResponse("Forbidden", { status: 403 })
    }

    // Prepare update data
    const updateData: any = {
      name,
      genre,
      city,
      bio,
    }
    
    if (price !== undefined) updateData.price = parseFloat(price)

    // Handle relations if provided
    // For instruments (tags), we replace them
    if (instruments && Array.isArray(instruments)) {
      // First delete existing instruments? Or better, use connect/create/disconnect logic
      // But for simplicity with simple tag strings, delete all and recreate is easier but ID changes
      // Prisma `set` logic might be tricky for non-unique relation unless we manage IDs
      // Actually, Instrument model: id, bandId, name
      // So we can deleteMany where bandId and create new ones
      await prisma.instrument.deleteMany({ where: { bandId: existingBand.id } })
      updateData.instruments = {
        create: instruments.map((inst: string) => ({ name: inst }))
      }
    }

    // For services, we usually manage them individually in UI, but if passed as array here:
    if (services && Array.isArray(services)) {
      // We might want to upsert or replace. For simplicity, let's assume complete replacement or partial update logic
      // But the dashboard pricing page uses this endpoint to save all services.
      // So let's delete existing and create new
      await prisma.service.deleteMany({ where: { bandId: existingBand.id } })
      updateData.services = {
        create: services.map((s: any) => ({
          name: s.name,
          price: parseFloat(s.price),
          description: s.description
        }))
      }
    }

    // For photos, if we pass photo URL as `photo` (avatar), we might want to add it to photos
    if (body.photo) {
       // Check if this photo exists? Or just add it
       // If it's the avatar, we might want to flag it or just prepend
       // Since we don't have avatar field, we just ensure it's in photos.
       // But if we want to "set" avatar, maybe we clear photos? No that's destructive.
       // Let's assume `photo` field update means adding a new photo if not exists.
       const photoExists = await prisma.photo.findFirst({
         where: { bandId: existingBand.id, url: body.photo }
       })
       
       if (!photoExists) {
         await prisma.photo.create({
           data: {
             bandId: existingBand.id,
             url: body.photo,
             caption: "Avatar"
           }
         })
       }
    }

    // Handle members
    if (members && Array.isArray(members)) {
      await prisma.member.deleteMany({ where: { bandId: existingBand.id } })
      
      if (members.length > 0) {
        await prisma.member.createMany({
          data: members.map((m: any) => ({
            bandId: existingBand.id,
            name: m.name,
            role: m.role,
            photo: m.photo || null
          }))
        })
      }
    }

    const band = await prisma.band.update({
      where: { slug },
      data: updateData,
      include: {
        instruments: true,
        services: true,
        photos: true
      }
    })

    return NextResponse.json(band)
  } catch (error) {
    console.error("[BAND_PUT]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

export async function DELETE(
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

    const band = await prisma.band.findUnique({
      where: { slug },
    })

    if (!band) {
      return new NextResponse("Not Found", { status: 404 })
    }

    if (band.userId !== userId) {
      return new NextResponse("Forbidden", { status: 403 })
    }

    await prisma.band.delete({
      where: { slug },
    })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error("[BAND_DELETE]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}
