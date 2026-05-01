"use client"

import { useState, useCallback } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { DayPicker, type CalendarDay, type Modifiers } from "react-day-picker"
import { uk } from "date-fns/locale"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react"
import { toast } from "sonner"

const formSchema = z.object({
  clientName: z.string().min(2, "Введіть ім'я"),
  clientEmail: z.string().email("Невірний email"),
  clientPhone: z.string().min(10, "Номер телефону занадто короткий"),
  eventType: z.string().min(2, "Вкажіть тип події"),
  date: z.date({ required_error: "Оберіть дату" }),
  note: z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

export function BookingModal({
  bandId,
  price,
  trigger,
}: {
  bandId: string
  price: number
  trigger?: React.ReactNode
}) {
  const [open, setOpen] = useState(false)
  const [month, setMonth] = useState(new Date())
  const [isSubmitting, setIsSubmitting] = useState(false)

  const today = new Date()

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
  })

  const selectedDate = form.watch("date")

  const monthDisplay = (() => {
    const label = format(month, "LLLL yyyy", { locale: uk })
    return label.charAt(0).toUpperCase() + label.slice(1)
  })()

  const prevMonth = () => setMonth(m => new Date(m.getFullYear(), m.getMonth() - 1, 1))
  const nextMonth = () => setMonth(m => new Date(m.getFullYear(), m.getMonth() + 1, 1))

  const CustomDayButton = useCallback(
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
      const isSelected = selectedDate ? isSameDay(d, selectedDate) : false
      const isToday = isSameDay(d, today)
      const isPast = d < new Date(today.getFullYear(), today.getMonth(), today.getDate())

      return (
        <button
          {...rest}
          disabled={isPast}
          className={cn(
            "relative flex h-9 w-full items-center justify-center rounded-lg text-sm transition-colors",
            "outline-none focus:outline-none focus:ring-0 focus-visible:ring-0",
            isPast && "opacity-30 cursor-not-allowed pointer-events-none",
            isSelected
              ? "bg-[#2D1B69] text-white font-semibold"
              : "hover:bg-[#F3E8FF] hover:text-[#2D1B69]",
            isToday && !isSelected && "font-bold text-[#2D1B69]",
          )}
        >
          {d.getDate()}
        </button>
      )
    },
    [selectedDate, today]
  )

  async function onSubmit(values: FormValues) {
    setIsSubmitting(true)
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, bandId, price }),
      })

      if (res.ok) {
        setOpen(false)
        form.reset()
        toast.success("Заявку надіслано!", {
          description: "Гурт розгляне ваш запит найближчим часом.",
        })
      } else {
        const err = await res.json().catch(() => ({}))
        toast.error("Помилка", {
          description: err.error || "Не вдалося надіслати заявку. Спробуйте ще раз.",
        })
      }
    } catch {
      toast.error("Помилка мережі", {
        description: "Перевірте з'єднання та спробуйте ще раз.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button size="lg" className="w-full font-bold bg-[#2D1B69] hover:bg-[#1a0f40]">
            Забронювати зараз
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="sm:max-w-[520px] p-0 overflow-hidden gap-0">
        {/* Header */}
        <DialogHeader className="px-8 pt-8 pb-5 border-b border-gray-100">
          <DialogTitle className="text-2xl font-bold text-[#1A1A1A]">Забронювати гурт</DialogTitle>
          <p className="text-sm text-gray-500 mt-1">
            Заповніть форму — гурт отримає сповіщення та підтвердить дату
          </p>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="px-8 py-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Name + Phone */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Ваше ім'я</label>
              <Input
                {...form.register("clientName")}
                placeholder="Марія Коваль"
                className={cn(form.formState.errors.clientName && "border-red-300")}
              />
              {form.formState.errors.clientName && (
                <p className="text-xs text-red-500">{form.formState.errors.clientName.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Телефон</label>
              <Input
                {...form.register("clientPhone")}
                placeholder="+380 97 000 0000"
                className={cn(form.formState.errors.clientPhone && "border-red-300")}
              />
              {form.formState.errors.clientPhone && (
                <p className="text-xs text-red-500">{form.formState.errors.clientPhone.message}</p>
              )}
            </div>
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">Email</label>
            <Input
              {...form.register("clientEmail")}
              type="email"
              placeholder="maria@example.com"
              className={cn(form.formState.errors.clientEmail && "border-red-300")}
            />
            {form.formState.errors.clientEmail && (
              <p className="text-xs text-red-500">{form.formState.errors.clientEmail.message}</p>
            )}
          </div>

          {/* Event Type */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">Тип події</label>
            <Input
              {...form.register("eventType")}
              placeholder="Весілля, корпоратив, день народження..."
              className={cn(form.formState.errors.eventType && "border-red-300")}
            />
            {form.formState.errors.eventType && (
              <p className="text-xs text-red-500">{form.formState.errors.eventType.message}</p>
            )}
          </div>

          {/* Inline calendar */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">
              Дата виступу
              {selectedDate && (
                <span className="ml-2 font-semibold text-[#2D1B69]">
                  — {format(selectedDate, "d MMMM yyyy", { locale: uk })}
                </span>
              )}
            </label>

            <div className={cn(
              "rounded-xl border bg-[#FAFAFA] p-4",
              form.formState.errors.date ? "border-red-300" : "border-gray-200"
            )}>
              {/* Calendar nav */}
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-[#1A1A1A]">{monthDisplay}</span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={prevMonth}
                    className="flex h-7 w-7 items-center justify-center rounded-lg border border-gray-200 bg-white hover:bg-gray-50 transition-colors"
                  >
                    <ArrowLeft className="h-3.5 w-3.5 text-gray-500" />
                  </button>
                  <button
                    type="button"
                    onClick={nextMonth}
                    className="flex h-7 w-7 items-center justify-center rounded-lg border border-gray-200 bg-white hover:bg-gray-50 transition-colors"
                  >
                    <ArrowRight className="h-3.5 w-3.5 text-gray-500" />
                  </button>
                </div>
              </div>

              <DayPicker
                mode="single"
                selected={selectedDate}
                onSelect={(date) => {
                  if (date) form.setValue("date", date, { shouldValidate: true })
                }}
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
                  weekdays: "flex w-full mb-1",
                  weekday: "flex-1 text-center text-xs font-medium text-gray-400 py-1 capitalize",
                  weeks: "w-full",
                  week: "flex w-full mt-0.5",
                  day: "flex-1 min-w-0 p-0.5",
                  selected: "",
                  today: "",
                  outside: "opacity-0 pointer-events-none",
                  disabled: "opacity-30 pointer-events-none",
                }}
              />
            </div>

            {form.formState.errors.date && (
              <p className="text-xs text-red-500">{form.formState.errors.date.message}</p>
            )}
          </div>

          {/* Note */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">
              Побажання <span className="text-gray-400 font-normal">(необов'язково)</span>
            </label>
            <Textarea
              {...form.register("note")}
              placeholder="Особливі побажання, деталі заходу..."
              className="resize-none min-h-[72px]"
            />
          </div>

          {/* Price */}
          {price > 0 && (
            <div className="flex items-center justify-between rounded-xl bg-[#F8F7FF] border border-[#E9E5FF] px-4 py-3 text-sm">
              <span className="text-gray-500">Вартість від</span>
              <span className="font-bold text-[#2D1B69] text-base">
                {price.toLocaleString("uk-UA")} ₴
              </span>
            </div>
          )}

          {/* Submit */}
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-11 bg-[#2D1B69] hover:bg-[#1a0f40] font-semibold text-base"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Надсилаємо...
              </>
            ) : (
              "Надіслати заявку"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
