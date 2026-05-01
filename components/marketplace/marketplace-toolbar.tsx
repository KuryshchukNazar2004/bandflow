"use client"

import { Input } from "@/components/ui/input"
import { Search, MapPin, Music2, ChevronDown, X } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { useDebouncedCallback } from "use-debounce"
import { useState, useRef, useEffect } from "react"
import { cn } from "@/lib/utils"

function FilterDropdown({
  icon: Icon,
  placeholder,
  options,
  value,
  onChange,
}: {
  icon: React.ElementType
  placeholder: string
  options: string[]
  value: string
  onChange: (v: string) => void
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  const selected = value && value !== "all" ? value : null

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className={cn(
          "flex h-12 w-full md:w-52 items-center gap-2.5 rounded-xl border bg-white px-4 text-sm transition-all",
          "hover:border-[#2D1B69]/30 focus:outline-none",
          open ? "border-[#2D1B69] ring-2 ring-[#2D1B69]/10" : "border-gray-200",
          selected ? "text-[#2D1B69] font-medium" : "text-gray-500"
        )}
      >
        <Icon className={cn("h-4 w-4 shrink-0", selected ? "text-[#2D1B69]" : "text-gray-400")} />
        <span className="flex-1 text-left truncate">{selected || placeholder}</span>
        {selected ? (
          <X
            className="h-3.5 w-3.5 shrink-0 text-gray-400 hover:text-gray-600"
            onClick={e => { e.stopPropagation(); onChange("all") }}
          />
        ) : (
          <ChevronDown className={cn("h-4 w-4 shrink-0 text-gray-400 transition-transform", open && "rotate-180")} />
        )}
      </button>

      {open && (
        <div className="absolute top-[calc(100%+6px)] left-0 z-50 w-full min-w-[180px] rounded-xl border border-gray-100 bg-white shadow-lg overflow-hidden">
          <div className="p-1">
            <button
              type="button"
              onClick={() => { onChange("all"); setOpen(false) }}
              className={cn(
                "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors text-left",
                !selected ? "bg-[#F3E8FF] text-[#2D1B69] font-medium" : "text-gray-600 hover:bg-gray-50"
              )}
            >
              {placeholder}
            </button>
            {options.map(opt => (
              <button
                key={opt}
                type="button"
                onClick={() => { onChange(opt); setOpen(false) }}
                className={cn(
                  "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors text-left",
                  selected === opt ? "bg-[#F3E8FF] text-[#2D1B69] font-medium" : "text-gray-600 hover:bg-gray-50"
                )}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export function MarketplaceToolbar({ genres, cities }: { genres: string[]; cities: string[] }) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleSearch = useDebouncedCallback((term: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (term) params.set("q", term)
    else params.delete("q")
    router.push(`/marketplace?${params.toString()}`)
  }, 300)

  const handleFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value && value !== "all") params.set(key, value)
    else params.delete(key)
    router.push(`/marketplace?${params.toString()}`)
  }

  return (
    <div className="flex flex-col md:flex-row gap-3 w-full">
      {/* Search */}
      <div className="relative flex-1">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Пошук за назвою або жанром..."
          className="h-12 pl-11 pr-4 rounded-xl border-gray-200 bg-white text-sm focus-visible:ring-[#2D1B69]/20 focus-visible:border-[#2D1B69] transition-all"
          defaultValue={searchParams.get("q") ?? ""}
          onChange={e => handleSearch(e.target.value)}
        />
      </div>

      {/* City filter */}
      <FilterDropdown
        icon={MapPin}
        placeholder="Всі міста"
        options={cities}
        value={searchParams.get("city") ?? ""}
        onChange={v => handleFilter("city", v)}
      />

      {/* Genre filter */}
      <FilterDropdown
        icon={Music2}
        placeholder="Всі жанри"
        options={genres}
        value={searchParams.get("genre") ?? ""}
        onChange={v => handleFilter("genre", v)}
      />
    </div>
  )
}
