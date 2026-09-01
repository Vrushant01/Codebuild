import React, { useState } from "react"
import { Star } from "lucide-react"
import { cn } from "../../lib/utils"

interface StarRatingProps {
  rating: number
  onChange?: (rating: number) => void
  disabled?: boolean
  size?: "sm" | "md" | "lg"
}

export function StarRating({ rating, onChange, disabled = false, size = "md" }: StarRatingProps) {
  const [hoverRating, setHoverRating] = useState(0)

  const stars = [1, 2, 3, 4, 5]

  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8"
  }

  const labels = ["Poor", "Fair", "Good", "Very good", "Excellent"]

  return (
    <div 
      className="flex flex-col gap-2"
      role="radiogroup" 
      aria-label="Rating"
    >
      <div className="flex items-center gap-1">
        {stars.map((star) => {
          const isFilled = (hoverRating || rating) >= star
          return (
            <button
              key={star}
              type="button"
              role="radio"
              aria-checked={rating === star}
              aria-label={`${star} stars — ${labels[star - 1]}`}
              disabled={disabled}
              className={cn(
                "p-1 rounded-full transition-colors outline-none focus-visible:ring-2 focus-visible:ring-primary",
                disabled ? "cursor-default" : "cursor-pointer hover:scale-110",
                isFilled ? "text-amber-400" : "text-muted-foreground/30"
              )}
              onClick={() => onChange?.(star)}
              onMouseEnter={() => !disabled && setHoverRating(star)}
              onMouseLeave={() => !disabled && setHoverRating(0)}
              onKeyDown={(e) => {
                if (disabled || !onChange) return
                if (e.key === "ArrowRight" && rating < 5) onChange(rating + 1)
                if (e.key === "ArrowLeft" && rating > 1) onChange(rating - 1)
              }}
            >
              <Star className={cn(sizeClasses[size], isFilled ? "fill-current" : "")} />
            </button>
          )
        })}
      </div>
      
      {/* Label Helper (only if interactive) */}
      {!disabled && (
        <span className="text-sm font-medium text-muted-foreground h-5">
          {hoverRating > 0 ? labels[hoverRating - 1] : rating > 0 ? labels[rating - 1] : "Select rating"}
        </span>
      )}
    </div>
  )
}
