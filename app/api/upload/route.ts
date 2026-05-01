import { NextRequest, NextResponse } from "next/server"
import { v2 as cloudinary } from "cloudinary"

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get("file") as File
    
    if (!file) {
      return new NextResponse("No file uploaded", { status: 400 })
    }

    const buffer = await file.arrayBuffer()
    const bytes = Buffer.from(buffer)

    // Upload to Cloudinary using a promise wrapper
    const result = await new Promise<any>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: "bandflow" },
        (error, result) => {
          if (error) reject(error)
          else resolve(result)
        }
      )
      
      // Write buffer to stream
      const { Readable } = require("stream")
      const stream = new Readable()
      stream.push(bytes)
      stream.push(null)
      stream.pipe(uploadStream)
    })

    return NextResponse.json({ url: result.secure_url })
  } catch (error) {
    console.error("[UPLOAD_ERROR]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}
