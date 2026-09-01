import React, { useState } from "react"
import { StarRating } from "./StarRating"
import { Button } from "../ui/button"

interface ReviewFormProps {
  onSubmit: (rating: number, comment: string) => Promise<void>
}

export function ReviewForm({ onSubmit }: ReviewFormProps) {
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  
  const maxLength = 500

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (rating === 0) {
      setError("Please select a rating.")
      return
    }
    
    setError("")
    setIsSubmitting(true)
    
    try {
      await onSubmit(rating, comment)
    } catch (err) {
      setError("Your review couldn't be submitted. Please try again.")
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      
      <div className="space-y-2">
        <label className="font-semibold block">Overall Rating</label>
        <StarRating rating={rating} onChange={setRating} size="lg" disabled={isSubmitting} />
        {error && <p className="text-destructive text-sm font-medium mt-1">{error}</p>}
      </div>

      <div className="space-y-2">
        <label htmlFor="comment" className="font-semibold block">Tell us about your experience</label>
        <textarea
          id="comment"
          value={comment}
          onChange={(e) => setComment(e.target.value.slice(0, maxLength))}
          disabled={isSubmitting}
          className="w-full min-h-[120px] p-4 rounded-xl border bg-background resize-y outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          placeholder="How was your appointment?"
        />
        <div className="flex justify-between items-center text-xs text-muted-foreground mt-1">
          <p>Please avoid sharing sensitive personal or medical information in your review.</p>
          <span className="shrink-0 ml-4 font-mono">{comment.length} / {maxLength}</span>
        </div>
      </div>

      <Button 
        type="submit" 
        className="w-full sm:w-auto py-6 px-8 rounded-xl font-bold"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Submitting..." : "Submit review"}
      </Button>

    </form>
  )
}
