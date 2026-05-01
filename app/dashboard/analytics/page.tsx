import { auth } from "@/auth"
import prisma from "@/lib/prisma"
import { redirect } from "next/navigation"
import { AnalyticsDashboard } from "@/components/dashboard/analytics-dashboard"
import { Booking } from "@prisma/client"

const UK_MONTHS = ["Січ","Лют","Бер","Квіт","Тра","Чер","Лип","Сер","Вер","Жов","Лис","Гру"]

function buildMonthlyData(bookings: Booking[]) {
  const now = new Date()
  const result: { name: string; total: number }[] = []

  for (let i = 6; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const year = d.getFullYear()
    const month = d.getMonth()
    const total = bookings.filter(b => {
      const bd = new Date(b.date)
      return bd.getFullYear() === year && bd.getMonth() === month
    }).length
    result.push({ name: UK_MONTHS[month], total })
  }
  return result
}

export default async function DashboardAnalyticsPage() {
  const session = await auth()
  const userId = session?.user?.id

  if (!userId) {
    redirect("/sign-in")
  }

  const band = await prisma.band.findFirst({
    where: { userId },
    include: { bookings: true },
  })

  if (!band) {
    return <div>Band not found</div>
  }

  const monthlyData = buildMonthlyData(band.bookings)

  const confirmedWithPrice = band.bookings.filter(
    b => b.status === "CONFIRMED" && b.price && b.price > 0
  )
  const avgPrice =
    confirmedWithPrice.length > 0
      ? Math.round(
          confirmedWithPrice.reduce((s, b) => s + (b.price ?? 0), 0) /
            confirmedWithPrice.length
        )
      : 0

  const views = band.profileViews ?? 0
  const conversionRate =
    views > 0
      ? parseFloat(((band.bookings.length / views) * 100).toFixed(1))
      : 0

  return (
    <div className="space-y-6 p-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Аналітика</h2>
        <p className="text-muted-foreground">Статистика переглядів та бронювань</p>
      </div>
      <AnalyticsDashboard
        monthlyData={monthlyData}
        views={views}
        conversionRate={conversionRate}
        avgPrice={avgPrice}
      />
    </div>
  )
}
