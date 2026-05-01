import { auth } from "@/auth"
import prisma from "@/lib/prisma"
import { redirect } from "next/navigation"
import { BookingCalendar } from "@/components/dashboard/booking-calendar"

export default async function DashboardCalendarPage() {
  const session = await auth()
  const userId = session?.user?.id

  if (!userId) {
    redirect("/sign-in")
  }

  const band = await prisma.band.findFirst({ where: { userId } })

  if (!band) {
    return <div>Band not found</div>
  }

  return (
    <div className="space-y-6 p-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Календар</h2>
        <p className="text-muted-foreground">Керуй своїм розкладом та доступністю</p>
      </div>
      <BookingCalendar />
    </div>
  )
}
