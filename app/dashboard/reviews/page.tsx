import { auth } from "@/auth"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"
import { ReviewsManager } from "@/components/dashboard/reviews-manager"

export default async function ReviewsPage() {
  const session = await auth()
  const userId = session?.user?.id

  if (!userId) {
    redirect("/")
  }

  const band = await prisma.band.findFirst({
    where: { userId },
    include: { 
      reviews: {
        orderBy: { createdAt: "desc" }
      }
    }
  })

  if (!band) {
    return redirect("/")
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Reviews</h2>
        <p className="text-muted-foreground">
          Manage and monitor feedback from your clients.
        </p>
      </div>
      <ReviewsManager initialReviews={band.reviews} />
    </div>
  )
}
