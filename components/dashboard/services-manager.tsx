"use client"

import * as React from "react"
import { Input } from "@/components/ui/input"
import { Service } from "@prisma/client"
import { Plus, X, Loader2, Save } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface ServicesManagerProps {
  initialServices: Service[]
  bandSlug: string
}

type DraftService = Partial<Service> & { _key: string }

let keyCounter = 0
const makeKey = () => `svc-${++keyCounter}`

function toDraft(s: Service): DraftService {
  return { ...s, _key: makeKey() }
}

export function ServicesManager({ initialServices, bandSlug }: ServicesManagerProps) {
  const [services, setServices] = React.useState<DraftService[]>(
    initialServices.map(toDraft)
  )
  const [isDirty, setIsDirty] = React.useState(false)
  const [isSaving, setIsSaving] = React.useState(false)

  const save = React.useCallback(
    async (list: DraftService[]) => {
      setIsSaving(true)
      try {
        const res = await fetch(`/api/bands/${bandSlug}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            services: list.map(s => ({
              name: s.name ?? "",
              price: s.price ?? 0,
              description: s.description ?? "",
            })),
          }),
        })
        if (!res.ok) throw new Error()
        const data = await res.json()
        // Re-sync IDs from server response
        setServices(
          (data.services as Service[]).map((s, i) => ({
            ...s,
            _key: list[i]?._key ?? makeKey(),
          }))
        )
        setIsDirty(false)
        toast.success("Збережено")
      } catch {
        toast.error("Помилка збереження")
      } finally {
        setIsSaving(false)
      }
    },
    [bandSlug]
  )

  const updateService = (key: string, field: keyof Service, value: string | number) => {
    setServices(prev =>
      prev.map(s => (s._key === key ? { ...s, [field]: value } : s))
    )
    setIsDirty(true)
  }

  const addService = async () => {
    const newService: DraftService = { _key: makeKey(), name: "", price: 0, description: "" }
    const next = [...services, newService]
    setServices(next)
    await save(next)
  }

  const removeService = async (key: string) => {
    const next = services.filter(s => s._key !== key)
    setServices(next)
    await save(next)
  }

  const handleSave = () => save(services)

  return (
    <div className="min-h-screen p-8 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-4xl font-bold tracking-tight">Ціни та послуги</h2>
          <p className="text-muted-foreground mt-1">Налаштуй прайс–лист для клієнтів</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {isDirty && (
            <button
              onClick={handleSave}
              disabled={isSaving}
              className={cn(
                "flex items-center gap-2 rounded-lg border border-input bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-muted",
                isSaving && "opacity-60 cursor-not-allowed"
              )}
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Зберегти
            </button>
          )}
          <button
            onClick={addService}
            disabled={isSaving}
            className="flex items-center gap-2 rounded-lg bg-violet-600 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-violet-700 disabled:opacity-60"
          >
            <Plus className="h-4 w-4" />
            Додати послугу
          </button>
        </div>
      </div>

      {/* Service cards */}
      <div className="space-y-4">
        {services.map(service => (
          <div
            key={service._key}
            className="rounded-xl border bg-card p-6 space-y-4"
          >
            {/* Name + Price row */}
            <div className="grid gap-4 sm:grid-cols-[1fr_200px]">
              <div className="space-y-1.5">
                <label className="text-sm text-muted-foreground">Назва послуги</label>
                <Input
                  value={service.name ?? ""}
                  onChange={e => updateService(service._key, "name", e.target.value)}
                  placeholder="Стандартний виступ (3 год)"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm text-muted-foreground">Ціна (₴)</label>
                <Input
                  type="number"
                  min={0}
                  value={service.price ?? 0}
                  onChange={e => updateService(service._key, "price", Number(e.target.value))}
                  placeholder="8000"
                />
              </div>
            </div>

            {/* Description + Delete row */}
            <div className="space-y-1.5">
              <label className="text-sm text-muted-foreground">Опис</label>
              <div className="flex gap-3">
                <Input
                  value={service.description ?? ""}
                  onChange={e => updateService(service._key, "description", e.target.value)}
                  placeholder="3 години живої музики"
                  className="flex-1"
                />
                <button
                  onClick={() => removeService(service._key)}
                  disabled={isSaving}
                  className="flex items-center gap-1.5 rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-500 transition-colors hover:bg-red-50 disabled:opacity-50 flex-shrink-0"
                >
                  <X className="h-3.5 w-3.5" />
                  Видалити
                </button>
              </div>
            </div>
          </div>
        ))}

        {services.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed p-12 text-muted-foreground">
            <p className="text-sm">Немає послуг. Натисни «Додати послугу», щоб розпочати.</p>
          </div>
        )}
      </div>

      {/* Hint */}
      <div className="rounded-xl border bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-800 p-5 text-sm text-muted-foreground">
        <span className="mr-1">💡</span>
        <strong className="text-foreground">Підказка:</strong>{" "}
        Детальний прайс–лист підвищує конверсію на 40%. Додай якомога більше деталей щодо того, що входить в кожну послугу.
      </div>
    </div>
  )
}
