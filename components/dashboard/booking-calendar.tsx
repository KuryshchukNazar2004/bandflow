"use client"

import * as React from "react"
import { DayPicker, type CalendarDay, type Modifiers } from "react-day-picker"
import { uk } from "date-fns/locale"
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react"
import { Booking, BookingStatus } from "@prisma/client"
import { getDaysInMonth, startOfMonth, endOfMonth, format } from "date-fns"
import { cn } from "@/lib/utils"

const STATUS_LABEL: Record<BookingStatus, string> = {
  PENDING: "Очікує",
  CONFIRMED: "Підтверджено",
  CANCELLED: "Скасовано",
}

const STATUS_COLOR: Record<BookingStatus, string> = {
  PENDING: "text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20",
  CONFIRMED: "text-green-600 bg-green-50 dark:bg-green-900/20",
  CANCELLED: "text-red-500 bg-red-50 dark:bg-red-900/20",
}

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

export function BookingCalendar() {
  const today = React.useMemo(() => new Date(), [])
  const [month, setMonth] = React.useState<Date>(today)
  const [selected, setSelected] = React.useState<Date | undefined>(undefined)
  const [bookings, setBookings] = React.useState<Booking[]>([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    const from = startOfMonth(month).toISOString()
    const to = endOfMonth(month).toISOString()
    setLoading(true)
    fetch(`/api/bookings?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`)
      .then(r => (r.ok ? r.json() : []))
      .then((data: Booking[]) => setBookings(data))
      .catch(() => setBookings([]))
      .finally(() => setLoading(false))
  }, [month])

  const bookedDatesSet = React.useMemo(() => {
    const set = new Set<string>()
    bookings.forEach(b => set.add(new Date(b.date).toDateString()))
    return set
  }, [bookings])

  const { busyDays, freeDays } = React.useMemo(() => {
    const daysInMonth = getDaysInMonth(month)
    const start = startOfMonth(month)
    let busy = 0
    for (let i = 0; i < daysInMonth; i++) {
      if (bookedDatesSet.has(new Date(start.getFullYear(), start.getMonth(), i + 1).toDateString())) busy++
    }
    return { busyDays: busy, freeDays: daysInMonth - busy }
  }, [month, bookedDatesSet])

  const selectedDateBookings = React.useMemo(() => {
    if (!selected) return []
    return bookings.filter(b => isSameDay(new Date(b.date), selected))
  }, [selected, bookings])

  const monthDisplay = React.useMemo(() => {
    const label = format(month, "LLLL yyyy", { locale: uk })
    return label.charAt(0).toUpperCase() + label.slice(1)
  }, [month])

  const prevMonth = () => setMonth(m => new Date(m.getFullYear(), m.getMonth() - 1, 1))
  const nextMonth = () => setMonth(m => new Date(m.getFullYear(), m.getMonth() + 1, 1))

  const CustomDayButton = React.useCallback(
    function DayBtn({
      day,
      modifiers: _m,
      children: _c,
      className: _cls,
      ...rest
    }: React.ComponentPropsWithoutRef<"button"> & {
      day: CalendarDay
      modifiers: Modifiers
    }) {
      const d = day.date
      const isSelected = selected ? isSameDay(d, selected) : false
      const isToday = isSameDay(d, today)
      const isBooked = bookedDatesSet.has(d.toDateString())
      const dow = d.getDay()
      const isWeekend = dow === 0 || dow === 6

      return (
        <button
          {...rest}
          className={cn(
            "relative flex h-11 w-full items-center justify-center rounded-lg text-sm transition-colors",
            "outline-none focus:outline-none focus:ring-0 focus-visible:ring-0",
            isSelected
              ? "ring-2 ring-violet-600"
              : "hover:bg-muted/60",
            isWeekend && "text-purple-600 dark:text-purple-400",
            isToday && "font-bold"
          )}
        >
          {d.getDate()}
          {isBooked && (
            <span className="absolute bottom-1.5 left-1/2 -translate-x-1/2 h-1.5 w-1.5 rounded-full bg-purple-600" />
          )}
        </button>
      )
    },
    [selected, bookedDatesSet, today]
  )

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_300px]">
      {/* Calendar Card */}
      <div className="rounded-xl border bg-card p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold">{monthDisplay}</h3>
          <div className="flex items-center gap-1">
            <button
              onClick={prevMonth}
              className="flex h-8 w-8 items-center justify-center rounded-md border border-input hover:bg-muted transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <button
              onClick={nextMonth}
              className="flex h-8 w-8 items-center justify-center rounded-md border border-input hover:bg-muted transition-colors"
            >
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <DayPicker
            mode="single"
            selected={selected}
            onSelect={setSelected}
            month={month}
            onMonthChange={setMonth}
            locale={uk}
            weekStartsOn={1}
            showOutsideDays={false}
            modifiers={{
              booked: (date) => bookedDatesSet.has(date.toDateString()),
            }}
            components={{
              Nav: () => <></>,
              MonthCaption: () => <></>,
              DayButton: CustomDayButton as (
                props: { day: CalendarDay; modifiers: Modifiers } & React.ButtonHTMLAttributes<HTMLButtonElement>
              ) => React.ReactElement,
            }}
            classNames={{
              root: "w-full",
              months: "w-full",
              month: "w-full",
              month_caption: "hidden",
              month_grid: "w-full",
              nav: "hidden",
              weekdays: "flex w-full mb-1",
              weekday: "flex-1 text-center text-xs font-medium text-muted-foreground select-none py-2 capitalize",
              weeks: "w-full",
              week: "flex w-full mt-1",
              day: "flex-1 min-w-0 p-0.5",
              selected: "",
              today: "",
              outside: "opacity-0 pointer-events-none",
              disabled: "opacity-40 pointer-events-none",
            }}
          />
        )}

        {/* Footer */}
        <div className="mt-4 pt-4 border-t flex items-center gap-8 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-purple-600" />
            <span>Заброньовано</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="flex h-4 w-4 rounded border border-muted-foreground/40" />
            <span>Вільно</span>
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex flex-col gap-4">
        {/* Legend */}
        <div className="rounded-xl border bg-card p-5">
          <h3 className="font-semibold mb-4">Легенда</h3>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-3">
              <span className="mt-0.5 h-3 w-3 flex-shrink-0 rounded-full bg-purple-600" />
              <span>Заброньовано — дата зайнята</span>
            </div>
            <div className="flex items-start gap-3">
              <span className="mt-0.5 h-3 w-3 flex-shrink-0 rounded-full bg-gray-300 dark:bg-gray-600" />
              <span>Вільно — можна бронювати</span>
            </div>
            <div className="flex items-start gap-3">
              <span className="mt-0.5 h-3 w-3 flex-shrink-0 rounded-full bg-violet-600" />
              <span>Вибрано — поточний вибір</span>
            </div>
          </div>
        </div>

        {/* Month stats */}
        <div className="rounded-xl border bg-card p-5">
          <h3 className="font-semibold mb-4">{monthDisplay}</h3>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>
              Зайнятих днів:{" "}
              <span className="font-bold text-foreground">{busyDays}</span>
            </p>
            <p>
              Вільних днів:{" "}
              <span className="font-bold text-foreground">{freeDays}</span>
            </p>
          </div>
        </div>

        {/* Selected day bookings */}
        {selected && (
          <div className="rounded-xl border bg-card p-5">
            <h3 className="font-semibold mb-3 capitalize">
              {format(selected, "d MMMM", { locale: uk })}
            </h3>
            {selectedDateBookings.length === 0 ? (
              <p className="text-sm text-muted-foreground">Немає бронювань</p>
            ) : (
              <div className="space-y-2">
                {selectedDateBookings.map(booking => (
                  <div key={booking.id} className="rounded-lg border p-3 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-medium truncate">{booking.eventType}</span>
                      <span
                        className={cn(
                          "flex-shrink-0 text-xs px-2 py-0.5 rounded-full font-medium",
                          STATUS_COLOR[booking.status]
                        )}
                      >
                        {STATUS_LABEL[booking.status]}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">{booking.clientName}</p>
                    {booking.price != null && (
                      <p className="text-xs text-muted-foreground">
                        {booking.price.toLocaleString()} грн
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
