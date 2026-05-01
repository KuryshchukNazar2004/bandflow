"use client"

import { useState } from "react"
import { Star } from "lucide-react"
import { ReviewForm } from "@/components/review-form"

interface Review {
  id: string
  author: string
  rating: number
  text: string
  createdAt: string
}

interface ReviewsSectionProps {
  bandId: string
  initialReviews: Review[]
  ratingDisplay: string | null
  filledStars: number
}

export function ReviewsSection({ bandId, initialReviews, ratingDisplay, filledStars }: ReviewsSectionProps) {
  const [reviews, setReviews] = useState<Review[]>(initialReviews)

  const handleNewReview = (review: Review) => {
    setReviews(prev => [review, ...prev])
  }

  const currentRating = reviews.length > 0
    ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
    : null
  const currentRatingDisplay = currentRating ? currentRating.toFixed(1) : ratingDisplay
  const currentFilledStars = currentRating ? Math.round(currentRating) : filledStars

  return (
    <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-xl font-bold font-display text-[#1A1A1A]">Відгуки клієнтів</h2>
        {currentRatingDisplay && (
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-[#1A1A1A]">{currentRatingDisplay}</span>
            <div className="flex text-amber-400">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className={`h-5 w-5 ${i < currentFilledStars ? "fill-current" : "text-gray-200"}`} />
              ))}
            </div>
            <span className="text-gray-500 text-sm">({reviews.length})</span>
          </div>
        )}
      </div>

      {reviews.length > 0 ? (
        <div className="space-y-6">
          {reviews.map((review) => (
            <div key={review.id} className="border-b border-gray-100 last:border-0 pb-6 last:pb-0">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-gray-900">{review.author}</h3>
                <span className="text-xs text-gray-400">
                  {new Date(review.createdAt).toLocaleDateString("uk-UA")}
                </span>
              </div>
              <div className="flex text-amber-400 mb-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={`h-3 w-3 ${i < review.rating ? "fill-current" : "text-gray-200"}`} />
                ))}
              </div>
              <p className="text-gray-600 text-sm leading-relaxed">{review.text}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <div className="flex text-gray-200 mb-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className="h-8 w-8 fill-current" />
            ))}
          </div>
          <p className="font-semibold text-gray-500">Поки що немає відгуків</p>
          <p className="text-sm text-gray-400 mt-1">Будьте першим, хто поділиться враженнями</p>
        </div>
      )}

      <ReviewForm bandId={bandId} onSuccess={handleNewReview} />
    </div>
  )
}
