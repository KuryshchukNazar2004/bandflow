"use client"

import { useState } from "react"
import { Review } from "@prisma/client"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Star, Trash2 } from "lucide-react"

interface ReviewsManagerProps {
  initialReviews: Review[]
}

export function ReviewsManager({ initialReviews }: ReviewsManagerProps) {
  const router = useRouter()
  const [reviews, setReviews] = useState<Review[]>(initialReviews)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this review?")) return

    try {
      setIsDeleting(id)
      const res = await fetch(`/api/reviews/${id}`, {
        method: "DELETE",
      })

      if (!res.ok) throw new Error("Failed to delete review")

      setReviews(reviews.filter((r) => r.id !== id))
      toast.success("Review deleted")
      router.refresh()
    } catch (error) {
      toast.error("Error deleting review")
    } finally {
      setIsDeleting(null)
    }
  }

  return (
    <div className="space-y-4">
      {reviews.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10 text-center">
            <Star className="h-10 w-10 text-muted-foreground mb-4 opacity-50" />
            <h3 className="text-lg font-semibold">No reviews yet</h3>
            <p className="text-muted-foreground max-w-sm mt-2">
              Reviews from your clients will appear here. Encourage your clients to leave feedback after events!
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {reviews.map((review) => (
            <Card key={review.id} className="relative group">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-base font-semibold">{review.author}</CardTitle>
                    <CardDescription className="text-xs">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </CardDescription>
                  </div>
                  <div className="flex text-amber-400">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${i < review.rating ? "fill-current" : "text-muted-foreground/30"}`}
                      />
                    ))}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{review.text}</p>
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => handleDelete(review.id)}
                    disabled={isDeleting === review.id}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
