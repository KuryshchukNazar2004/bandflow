"use client"

import { useState, useEffect, useCallback } from "react"
import { Booking } from "@prisma/client"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Check, X, Hourglass, Loader2, MoreHorizontal } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

type StatusFilter = "ALL" | "CONFIRMED" | "PENDING" | "CANCELLED"

const FILTERS: { label: string; value: StatusFilter }[] = [
  { label: "Всі", value: "ALL" },
  { label: "Підтверджені", value: "CONFIRMED" },
  { label: "Очікують", value: "PENDING" },
  { label: "Скасовані", value: "CANCELLED" },
]

export function BookingsTable() {
  const [filter, setFilter] = useState<StatusFilter>("ALL")
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)

  const fetchBookings = useCallback(async (status: StatusFilter) => {
    setLoading(true)
    const params = status !== "ALL" ? `?status=${status}` : ""
    try {
      const res = await fetch(`/api/bookings${params}`)
      if (res.ok) {
        const data: Booking[] = await res.json()
        setBookings(data)
      }
    } catch {
      toast.error("Помилка", { description: "Не вдалося завантажити бронювання." })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchBookings(filter)
  }, [filter, fetchBookings])

  const handleStatusUpdate = async (id: string, status: "CONFIRMED" | "CANCELLED") => {
    try {
      const res = await fetch(`/api/bookings/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })

      if (!res.ok) throw new Error()

      const updated: Booking = await res.json()
      setBookings(prev => prev.map(b => (b.id === id ? updated : b)))

      toast.success("Статус оновлено", {
        description: `Бронювання ${status === "CONFIRMED" ? "підтверджено" : "скасовано"}.`,
      })
    } catch {
      toast.error("Помилка", { description: "Не вдалося оновити статус." })
    }
  }

  const formatPrice = (price: number | null) => {
    if (!price) return "—"
    return new Intl.NumberFormat("uk-UA", {
      style: "currency",
      currency: "UAH",
      maximumFractionDigits: 0,
    })
      .format(price)
      .replace("UAH", "₴")
  }

  const formatDate = (date: Date | string) =>
    new Date(date).toLocaleDateString("uk-UA", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex items-center gap-2">
        {FILTERS.map(f => (
          <Button
            key={f.value}
            variant="ghost"
            onClick={() => setFilter(f.value)}
            className={cn(
              "rounded-lg px-6 py-2 h-auto text-sm font-medium transition-colors",
              filter === f.value
                ? "bg-[#2D1B69] text-white hover:bg-[#2D1B69]/90"
                : "bg-white text-[#6B6B7E] border border-[#E4E1DC] hover:bg-gray-50"
            )}
          >
            {f.label}
          </Button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-[#E4E1DC] overflow-hidden shadow-sm">
        {loading ? (
          <div className="flex h-48 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <Table>
            <TableHeader className="bg-[#F8F7FF] border-b border-[#E4E1DC]">
              <TableRow className="hover:bg-transparent">
                <TableHead className="py-4 pl-6 text-xs font-bold text-[#6B6B7E] uppercase tracking-wider w-[25%]">Клієнт</TableHead>
                <TableHead className="py-4 text-xs font-bold text-[#6B6B7E] uppercase tracking-wider w-[20%]">Захід</TableHead>
                <TableHead className="py-4 text-xs font-bold text-[#6B6B7E] uppercase tracking-wider w-[20%]">Дата та час</TableHead>
                <TableHead className="py-4 text-xs font-bold text-[#6B6B7E] uppercase tracking-wider w-[15%]">Сума</TableHead>
                <TableHead className="py-4 text-xs font-bold text-[#6B6B7E] uppercase tracking-wider w-[15%]">Статус</TableHead>
                <TableHead className="py-4 pr-6 text-xs font-bold text-[#6B6B7E] uppercase tracking-wider text-right w-[5%]">Дії</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bookings.map(booking => (
                <TableRow
                  key={booking.id}
                  className="border-b border-[#F3F4F6] last:border-0 hover:bg-gray-50/50"
                >
                  <TableCell className="py-6 pl-6 align-top">
                    <div className="flex flex-col gap-1">
                      <span className="font-bold text-[#1A1A1A] text-base">{booking.clientName}</span>
                      <span className="text-sm text-[#6B6B7E] font-medium">{booking.clientPhone}</span>
                    </div>
                  </TableCell>
                  <TableCell className="py-6 align-top">
                    <span className="text-[#1A1A1A] font-medium">{booking.eventType}</span>
                  </TableCell>
                  <TableCell className="py-6 align-top">
                    <div className="flex flex-col gap-1">
                      <span className="font-bold text-[#1A1A1A] text-base">{formatDate(booking.date)}</span>
                    </div>
                  </TableCell>
                  <TableCell className="py-6 align-top">
                    <span className="font-bold text-[#1A1A1A] text-base">{formatPrice(booking.price)}</span>
                  </TableCell>
                  <TableCell className="py-6 align-top">
                    {booking.status === "CONFIRMED" && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#ECFDF5] text-[#10B981] text-sm font-bold">
                        <Check size={14} strokeWidth={3} />
                        Підтверджено
                      </span>
                    )}
                    {booking.status === "PENDING" && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FFF7ED] text-[#F97316] text-sm font-bold">
                        <Hourglass size={14} strokeWidth={3} />
                        Очікує
                      </span>
                    )}
                    {booking.status === "CANCELLED" && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FEF2F2] text-[#EF4444] text-sm font-bold">
                        <X size={14} strokeWidth={3} />
                        Скасовано
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="py-6 pr-6 align-top text-right">
                    {booking.status !== "CANCELLED" && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 rounded-lg text-[#6B6B7E] hover:bg-gray-100"
                          >
                            <MoreHorizontal size={18} />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-44">
                          {booking.status === "PENDING" && (
                            <DropdownMenuItem
                              className="gap-2 text-[#10B981] focus:text-[#10B981] focus:bg-[#ECFDF5] cursor-pointer"
                              onClick={() => handleStatusUpdate(booking.id, "CONFIRMED")}
                            >
                              <Check size={15} strokeWidth={2.5} />
                              Підтвердити
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            className="gap-2 text-[#EF4444] focus:text-[#EF4444] focus:bg-[#FEF2F2] cursor-pointer"
                            onClick={() => handleStatusUpdate(booking.id, "CANCELLED")}
                          >
                            <X size={15} strokeWidth={2.5} />
                            Скасувати
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {bookings.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                    Немає бронювань
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  )
}
