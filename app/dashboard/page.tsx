import { auth } from "@/auth"
import prisma from "@/lib/prisma"
import { redirect } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Calendar, Check, Eye, Star, Clock, CheckCircle2, Circle } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import Link from "next/link"

export default async function DashboardPage() {
  const session = await auth()
  const userId = session?.user?.id

  if (!userId) {
    redirect("/sign-in")
  }

  let band = await prisma.band.findFirst({
    where: { userId },
    include: {
      bookings: true,
      reviews: true,
      photos: true,
      members: true,
      services: true,
    }
  })

  if (!band) {
    const bandName = session?.user?.name || "My New Band"

    try {
        band = await prisma.band.create({
            data: {
                userId,
                name: bandName,
                slug: bandName.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Math.random().toString(36).substring(2, 7),
                genre: "Не вказано",
                city: "Не вказано",
                price: 0,
            },
            include: {
                bookings: true,
                reviews: true,
                photos: true,
                members: true,
                services: true,
            }
        })
    } catch (error) {
        console.error("Failed to create band:", error)
    }
  }

  if (!band) {
    return <div>Помилка завантаження даних гурту. Спробуйте оновити сторінку.</div>
  }

  const now = new Date()
  const thisMonth = now.getMonth()
  const thisYear = now.getFullYear()
  const lastMonth = thisMonth === 0 ? 11 : thisMonth - 1
  const lastMonthYear = thisMonth === 0 ? thisYear - 1 : thisYear

  const bookingsThisMonth = band.bookings.filter(b => {
    const d = new Date(b.date)
    return d.getMonth() === thisMonth && d.getFullYear() === thisYear
  }).length

  const bookingsLastMonth = band.bookings.filter(b => {
    const d = new Date(b.date)
    return d.getMonth() === lastMonth && d.getFullYear() === lastMonthYear
  }).length

  const bookingsDiff = bookingsThisMonth - bookingsLastMonth

  const confirmedBookings = band.bookings.filter(b => b.status === "CONFIRMED").length
  const confirmedPercent = band.bookings.length > 0
    ? Math.round((confirmedBookings / band.bookings.length) * 100)
    : 0

  const averageRating = band.reviews.length > 0
    ? (band.reviews.reduce((acc, r) => acc + r.rating, 0) / band.reviews.length).toFixed(1)
    : null

  // Profile completion
  const checks = {
    basicInfo: !!(band.name && band.genre !== "Не вказано" && band.city !== "Не вказано"),
    photos: band.photos.length > 0,
    pricing: !!(band.price > 0 || band.services.length > 0),
    video: false,
  }
  const totalSteps = 4
  const completedSteps = Object.values(checks).filter(Boolean).length
  const completionPercentage = Math.round((completedSteps / totalSteps) * 100)

  // Upcoming bookings: future dates sorted ascending
  const upcomingBookings = band.bookings
    .filter(b => new Date(b.date) >= now)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  return (
    <div className="p-8 space-y-8 bg-[#FDFCFB] min-h-screen">
      <div className="space-y-2">
        <h2 className="text-4xl font-normal font-serif text-[#1A1A1A]">
          Вітаємо, {band.name}! 👋
        </h2>
        <p className="text-[#6B6B7E] text-lg">Ось що відбувається у вашому акаунті</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Bookings */}
        <Card className="border border-[#E4E1DC] shadow-sm rounded-xl overflow-hidden hover:shadow-md transition-shadow duration-200">
          <CardContent className="p-6">
            <div className="w-10 h-10 rounded-xl bg-[#F3E8FF] flex items-center justify-center text-[#7C3AED] mb-4">
              <Calendar size={20} />
            </div>
            <div className="space-y-1">
              <div className="text-3xl font-serif text-[#1A1A1A]">{bookingsThisMonth}</div>
              <p className="text-sm font-medium text-[#6B6B7E]">Бронювань цього місяця</p>
              <p className="text-xs font-bold text-[#7C3AED] mt-1">
                {bookingsDiff > 0 ? `+${bookingsDiff} з минулого` : bookingsDiff < 0 ? `${bookingsDiff} з минулого` : "так само як минулого"}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Confirmed */}
        <Card className="border border-[#E4E1DC] shadow-sm rounded-xl overflow-hidden hover:shadow-md transition-shadow duration-200">
          <CardContent className="p-6">
            <div className="w-10 h-10 rounded-xl bg-[#ECFDF5] flex items-center justify-center text-[#10B981] mb-4">
              <Check size={20} />
            </div>
            <div className="space-y-1">
              <div className="text-3xl font-serif text-[#1A1A1A]">{confirmedBookings}</div>
              <p className="text-sm font-medium text-[#6B6B7E]">Підтверджених</p>
              <p className="text-xs font-bold text-[#10B981] mt-1">{confirmedPercent}% прийнято</p>
            </div>
          </CardContent>
        </Card>

        {/* Card 3: Views */}
        <Card className="border border-[#E4E1DC] shadow-sm rounded-xl overflow-hidden hover:shadow-md transition-shadow duration-200">
          <CardContent className="p-6">
            <div className="w-10 h-10 rounded-xl bg-[#FFF7ED] flex items-center justify-center text-[#F97316] mb-4">
              <Eye size={20} />
            </div>
            <div className="space-y-1">
              <div className="text-3xl font-serif text-[#1A1A1A]">{band.profileViews}</div>
              <p className="text-sm font-medium text-[#6B6B7E]">Переглядів профілю</p>
              <p className="text-xs font-bold text-[#F97316] mt-1">з публічної сторінки</p>
            </div>
          </CardContent>
        </Card>

        {/* Card 4: Rating */}
        <Card className="border border-[#E4E1DC] shadow-sm rounded-xl overflow-hidden hover:shadow-md transition-shadow duration-200">
          <CardContent className="p-6">
            <div className="w-10 h-10 rounded-xl bg-[#FEF2F2] flex items-center justify-center text-[#EF4444] mb-4">
              <Star size={20} fill="currentColor" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-1 text-3xl font-serif text-[#1A1A1A]">
                {averageRating ?? "—"} {averageRating && <span className="text-xl">★</span>}
              </div>
              <p className="text-sm font-medium text-[#6B6B7E]">Оцінка профілю</p>
              <p className="text-xs font-bold text-[#EF4444] mt-1">{band.reviews.length} відгуків</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Left Section: Upcoming Bookings */}
        <Card className="lg:col-span-3 border border-[#E4E1DC] shadow-sm rounded-xl overflow-hidden">
          <CardContent className="p-8">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-lg font-bold text-[#1A1A1A]">Найближчі виступи</h3>
              <Link href="/dashboard/bookings" className="text-sm font-medium text-[#7C3AED] hover:underline">
                {upcomingBookings.length} заплановано
              </Link>
            </div>

            <div className="space-y-6">
              {upcomingBookings.length > 0 ? upcomingBookings.slice(0, 3).map((booking) => {
                const bookingDate = new Date(booking.date)
                const day = bookingDate.getDate()
                const month = bookingDate.toLocaleString('uk-UA', { month: 'short' }).replace('.', '')

                return (
                  <div key={booking.id} className="flex items-center gap-4 pb-6 border-b border-[#F3F4F6] last:border-0 last:pb-0">
                    <div className="flex flex-col items-center justify-center w-14 h-14 rounded-xl bg-[#F8F7FF] text-[#2D1B69] border border-[#E4E1DC]">
                      <span className="text-lg font-bold leading-none">{day}</span>
                      <span className="text-xs font-medium uppercase">{month}</span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-base font-bold text-[#1A1A1A] truncate">{booking.clientName}</p>
                      <p className="text-sm text-[#6B6B7E] truncate">{booking.eventType}</p>
                    </div>

                    <div className="flex-shrink-0">
                      {booking.status === 'CONFIRMED' ? (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-[#ECFDF5] text-[#10B981]">
                          <Check size={12} className="mr-1.5" strokeWidth={3} />
                          Підтверджено
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-[#FFF7ED] text-[#F97316]">
                          <Clock size={12} className="mr-1.5" strokeWidth={3} />
                          Очікує
                        </span>
                      )}
                    </div>
                  </div>
                )
              }) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Calendar size={36} className="text-[#E4E1DC] mb-3" />
                  <p className="text-sm font-medium text-[#6B6B7E]">Немає запланованих виступів</p>
                  <p className="text-xs text-[#9CA3AF] mt-1">Бронювання з'являться тут після підтвердження</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Right Section: Profile Completion */}
        <Card className="lg:col-span-2 bg-[#6D28D9] text-white shadow-lg rounded-xl overflow-hidden border-0 relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
          <CardContent className="p-8 flex flex-col h-full justify-between relative z-10">
            <div>
              <h3 className="text-xl font-bold mb-2">Заповни профіль</h3>
              <p className="text-sm text-white/80 mb-8">Повний профіль отримує в 3× більше переглядів</p>

              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-3">
                  {checks.basicInfo ? <CheckCircle2 className="text-white" size={20} /> : <Circle className="text-white/40" size={20} />}
                  <span className={checks.basicInfo ? "text-white font-medium" : "text-white/60"}>Основна інформація</span>
                </div>
                <div className="flex items-center gap-3">
                  {checks.photos ? <CheckCircle2 className="text-white" size={20} /> : <Circle className="text-white/40" size={20} />}
                  <span className={checks.photos ? "text-white font-medium" : "text-white/60"}>Фото-галерея</span>
                </div>
                <div className="flex items-center gap-3">
                  {checks.pricing ? <CheckCircle2 className="text-white" size={20} /> : <Circle className="text-white/40" size={20} />}
                  <span className={checks.pricing ? "text-white font-medium" : "text-white/60"}>Прайс-лист</span>
                </div>
                <div className="flex items-center gap-3">
                  {checks.video ? <CheckCircle2 className="text-white" size={20} /> : <Circle className="text-white/40" size={20} />}
                  <span className={checks.video ? "text-white font-medium" : "text-white/60"}>Відео виступу</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Progress value={completionPercentage} className="h-1.5 bg-white/20 [&>*]:bg-white" />
              <p className="text-xs text-white/60">{completionPercentage}% завершено</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
