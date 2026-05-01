import { auth } from "@/auth"
import prisma from "@/lib/prisma"
import { redirect } from "next/navigation"
import { BookingsTable } from "@/components/dashboard/bookings-table"

export default async function DashboardBookingsPage() {
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
    <div className="p-8 min-h-screen bg-[#FDFCFB]">
      <div className="mb-8">
        <h2 className="text-4xl font-normal font-serif text-[#1A1A1A] mb-2">Бронювання</h2>
        <p className="text-[#6B6B7E] text-lg">Всі замовлення на виступи</p>
      </div>
      <BookingsTable />
    </div>
  )
}
