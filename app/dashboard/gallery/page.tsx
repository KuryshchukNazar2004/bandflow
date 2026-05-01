import { auth } from "@/auth"
import prisma from "@/lib/prisma"
import { redirect } from "next/navigation"
import { GalleryManager } from "@/components/dashboard/gallery-manager"

export default async function DashboardGalleryPage() {
  const session = await auth()
  const userId = session?.user?.id
  
  if (!userId) {
    redirect("/sign-in")
  }

  const band = await prisma.band.findFirst({
    where: { userId },
    include: {
      photos: true,
    }
  })

  if (!band) {
    return <div>Band not found</div>
  }

  return (
    <div className="p-8 min-h-screen bg-[#FDFCFB]">
      <GalleryManager initialPhotos={band.photos} bandSlug={band.slug} />
    </div>
  )
}
