import { auth } from "@/auth"
import prisma from "@/lib/prisma"
import { redirect } from "next/navigation"
import { BandProfileForm } from "@/components/dashboard/band-profile-form"

export default async function DashboardProfilePage() {
  const session = await auth()
  const userId = session?.user?.id
  
  if (!userId) {
    redirect("/sign-in")
  }

  const band = await prisma.band.findFirst({
    where: { userId },
    include: {
      instruments: true,
      photos: true,
      members: true,
    }
  })

  if (!band) {
    return <div>Band not found</div>
  }

  return (
    <div className="p-8 min-h-screen bg-[#FDFCFB]">
      <BandProfileForm band={band} />
    </div>
  )
}
