"use client"

import * as React from "react"
import { DayPicker, type CalendarDay, type Modifiers } from "react-day-picker"
import { uk } from "date-fns/locale"
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react"
import { getDaysInMonth, startOfMonth, endOfMonth, format } from "date-fns"
import { cn } from "@/lib/utils"

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

interface BandAvailabilityCalendarProps {
  bandSlug: string
}

export function BandAvailabilityCalendar({ bandSlug }: BandAvailabilityCalendarProps) {
  const today = React.useMemo(() => new Date(), [])
  const [month, setMonth] = React.useState<Date>(today)
  const [selected, setSelected] = React.useState<Date | undefined>(undefined)
  const [bookedDates, setBookedDates] = React.useState<Set<string>>(new Set())
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    const from = startOfMonth(month).toISOString()
    const to = endOfMonth(month).toISOString()
    setLoading(true)
    fetch(`/api/bands/${bandSlug}/bookings?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`)
      .then(r => (r.ok ? r.json() : []))
      .then((dates: string[]) => {
        const set = new Set<string>()
        dates.forEach(d => set.add(new Date(d).toDateString()))
        setBookedDates(set)
      })
      .catch(() => setBookedDates(new Set()))
      .finally(() => setLoading(false))
  }, [month, bandSlug])

  const { busyDays, freeDays } = React.useMemo(() => {
    const total = getDaysInMonth(month)
    const start = startOfMonth(month)
    let busy = 0
    for (let i = 0; i < total; i++) {
      if (bookedDates.has(new Date(start.getFullYear(), start.getMonth(), i + 1).toDateString())) busy++
    }
    return { busyDays: busy, freeDays: total - busy }
  }, [month, bookedDates])

  const monthDisplay = React.useMemo(() => {
    const label = format(month, "LLLL yyyy", { locale: uk })
    return label.charAt(0).toUpperCase() + label.slice(1)
  }, [month])

  const prevMonth = () => setMonth(m => new Date(m.getFullYear(), m.getMonth() - 1, 1))
  const nextMonth = () => setMonth(m => new Date(m.getFullYear(), m.getMonth() + 1, 1))

  const isSelectedBooked = selected ? bookedDates.has(selected.toDateString()) : false

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
      const isBooked = bookedDates.has(d.toDateString())
      const dow = d.getDay()
      const isWeekend = dow === 0 || dow === 6

      return (
        <button
          {...rest}
          className={cn(
            "relative flex h-11 w-full items-center justify-center rounded-xl text-sm font-medium transition-colors",
            "outline-none focus:outline-none focus:ring-0 focus-visible:ring-0",
            isSelected ? "ring-2 ring-[#2D1B69] bg-[#F8F7FF]" : "hover:bg-gray-100",
            isWeekend && !isBooked && "text-[#2D1B69]",
            isToday && "font-extrabold",
          )}
        >
          {d.getDate()}
          {isBooked && (
            <span className="absolute bottom-1 left-1/2 -translate-x-1/2 h-1.5 w-1.5 rounded-full bg-[#E8532A]" />
          )}
        </button>
      )
    },
    [selected, bookedDates, today]
  )

  return (
    <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
      {/* Calendar header */}
      <div className="flex items-center justify-between px-8 pt-7 pb-4">
        <h3 className="text-xl font-bold text-[#1A1A1A]">{monthDisplay}</h3>
        <div className="flex items-center gap-1.5">
          <button
            onClick={prevMonth}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 text-gray-500" />
          </button>
          <button
            onClick={nextMonth}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            <ArrowRight className="h-4 w-4 text-gray-500" />
          </button>
        </div>
      </div>

      {/* Calendar grid */}
      <div className="px-8 pb-6">
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
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
              weekdays: "flex w-full mb-2",
              weekday: "flex-1 text-center text-xs font-semibold text-gray-400 select-none py-2 capitalize",
              weeks: "w-full",
              week: "flex w-full mt-1",
              day: "flex-1 min-w-0 p-0.5",
              selected: "",
              today: "",
              outside: "opacity-0 pointer-events-none",
              disabled: "opacity-30 pointer-events-none",
            }}
          />
        )}
      </div>

      {/* Bottom: legend + stats + selected date */}
      <div className="border-t border-gray-100 px-8 py-5 bg-gray-50/60">
        <div className="flex flex-col sm:flex-row sm:items-start gap-4">
          {/* Legend + stats */}
          <div className="flex-1 flex flex-col gap-4">
            {/* Legend */}
            <div className="flex items-center gap-5 text-sm text-gray-500">
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-[#E8532A]" />
                <span>Зайнято</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-4 w-4 rounded-md border border-gray-300 inline-flex" />
                <span>Вільно</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-4 w-4 rounded-md ring-2 ring-[#2D1B69] inline-flex" />
                <span>Вибрано</span>
              </div>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-gray-500">Зайнятих:</span>
                <span className="font-bold text-[#E8532A]">{busyDays}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-500">Вільних:</span>
                <span className="font-bold text-[#2D1B69]">{freeDays}</span>
              </div>
            </div>
          </div>

          {/* Selected date status */}
          <div className="sm:w-56">
            {selected ? (
              <div className={cn(
                "flex items-center gap-3 rounded-xl px-4 py-3 border text-sm font-medium",
                isSelectedBooked
                  ? "bg-red-50 border-red-100 text-red-700"
                  : "bg-green-50 border-green-100 text-green-700"
              )}>
                <span className={cn(
                  "h-2.5 w-2.5 rounded-full flex-shrink-0",
                  isSelectedBooked ? "bg-[#E8532A]" : "bg-green-500"
                )} />
                <div>
                  <div className="font-semibold capitalize">{format(selected, "d MMMM", { locale: uk })}</div>
                  <div className="text-xs font-normal opacity-80 mt-0.5">
                    {isSelectedBooked ? "Дата зайнята" : "Дата вільна — можна бронювати"}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-sm text-gray-400 rounded-xl border border-dashed border-gray-200 px-4 py-3">
                Оберіть дату для перевірки
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
