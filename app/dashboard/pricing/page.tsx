import { auth } from "@/auth"
import prisma from "@/lib/prisma"
import { redirect } from "next/navigation"
import { ServicesManager } from "@/components/dashboard/services-manager"

export default async function DashboardPricingPage() {
  const session = await auth()
  const userId = session?.user?.id

  if (!userId) {
    redirect("/sign-in")
  }

  const band = await prisma.band.findFirst({
    where: { userId },
    include: { services: true },
  })

  if (!band) {
    return <div>Band not found</div>
  }

  return (
    <ServicesManager initialServices={band.services} bandSlug={band.slug} />
  )
}
