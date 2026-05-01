"use client"

import { useState } from "react"
import { Star, Loader2, Send } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

interface ReviewFormProps {
  bandId: string
  onSuccess?: (review: { id: string; author: string; rating: number; text: string; createdAt: string }) => void
}

export function ReviewForm({ bandId, onSuccess }: ReviewFormProps) {
  const [rating, setRating] = useState(0)
  const [hovered, setHovered] = useState(0)
  const [author, setAuthor] = useState("")
  const [text, setText] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!rating) {
      toast.error("Оберіть оцінку")
      return
    }
    if (!author.trim() || !text.trim()) {
      toast.error("Заповніть всі поля")
      return
    }

    setLoading(true)
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bandId, author, rating, text }),
      })

      if (!res.ok) throw new Error()

      const review = await res.json()
      toast.success("Дякуємо за відгук!")
      setRating(0)
      setAuthor("")
      setText("")
      onSuccess?.(review)
    } catch {
      toast.error("Не вдалося надіслати відгук. Спробуйте ще раз.")
    } finally {
      setLoading(false)
    }
  }

  const displayStars = hovered || rating

  return (
    <form onSubmit={handleSubmit} className="border-t border-gray-100 pt-8 space-y-5">
      <h3 className="font-bold text-[#1A1A1A] text-lg">Залишити відгук</h3>

      {/* Star rating */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-gray-700">Ваша оцінка</label>
        <div className="flex items-center gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setRating(i + 1)}
              onMouseEnter={() => setHovered(i + 1)}
              onMouseLeave={() => setHovered(0)}
              className="transition-transform hover:scale-110 focus:outline-none"
            >
              <Star
                className={cn(
                  "h-8 w-8 transition-colors",
                  i < displayStars
                    ? "fill-amber-400 text-amber-400"
                    : "text-gray-200 fill-gray-200"
                )}
              />
            </button>
          ))}
          {displayStars > 0 && (
            <span className="ml-2 text-sm text-gray-500">
              {["", "Погано", "Задовільно", "Добре", "Дуже добре", "Відмінно"][displayStars]}
            </span>
          )}
        </div>
      </div>

      {/* Name */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-gray-700">Ваше ім'я</label>
        <Input
          value={author}
          onChange={e => setAuthor(e.target.value)}
          placeholder="Марія Коваль"
          required
        />
      </div>

      {/* Review text */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-gray-700">Відгук</label>
        <Textarea
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Розкажіть про ваші враження від виступу гурту..."
          className="resize-none min-h-[100px]"
          required
        />
      </div>

      <Button
        type="submit"
        disabled={loading}
        className="bg-[#2D1B69] hover:bg-[#1a0f40] font-semibold px-6"
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Надсилаємо...
          </>
        ) : (
          <>
            <Send className="mr-2 h-4 w-4" />
            Надіслати відгук
          </>
        )}
      </Button>
    </form>
  )
}
