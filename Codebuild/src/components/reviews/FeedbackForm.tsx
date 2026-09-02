import React, { useState } from "react"
import { Star, X } from "lucide-react"
import { Button } from "../ui/button"

interface FeedbackFormProps {
  onSubmit: (doctorRating: number, orgRating: number, comment: string) => Promise<void>
  onCancel?: () => void
}

function StarRating({ label, value, onChange }: { label: string, value: number, onChange: (val: number) => void }) {
  const [hover, setHover] = useState(0)

  const helpers = ["Poor", "Fair", "Okay", "Good", "Excellent"]
  const currentVal = hover || value

  return (
    <div>
      <label className="block text-sm font-bold text-muted-foreground mb-2">{label}</label>
      <div className="flex items-center gap-4">
        <div 
          className="flex gap-1"
          role="radiogroup"
          aria-label={label}
        >
          {[1, 2, 3, 4, 5].map(star => (
            <button
              key={star}
              type="button"
              role="radio"
              aria-checked={value === star}
              onClick={() => onChange(star)}
              onMouseEnter={() => setHover(star)}
              onMouseLeave={() => setHover(0)}
              className="p-1 focus:outline-none focus:ring-2 focus:ring-primary/50 rounded-lg transition-transform hover:scale-110 active:scale-95"
            >
              <Star 
                className={`w-8 h-8 transition-colors ${
                  star <= currentVal ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30 fill-transparent"
                }`} 
              />
            </button>
          ))}
        </div>
        {currentVal > 0 && (
          <span className="text-sm font-semibold text-muted-foreground animate-in fade-in">
            {currentVal} — {helpers[currentVal - 1]}
          </span>
        )}
      </div>
    </div>
  )
}

export function FeedbackForm({ onSubmit, onCancel }: FeedbackFormProps) {
  const [docRating, setDocRating] = useState(0)
  const [orgRating, setOrgRating] = useState(0)
  const [comment, setComment] = useState("")
  
  const [submitting, setSubmitting] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [error, setError] = useState("")

  const handleSubmitRequest = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    if (docRating === 0 || orgRating === 0) {
      setError("Please provide ratings for both the doctor and the organization.")
      return
    }
    setConfirmOpen(true)
  }

  const confirmSubmit = async () => {
    setSubmitting(true)
    try {
      await onSubmit(docRating, orgRating, comment.trim())
      setConfirmOpen(false)
    } catch (err) {
      setError("Feedback couldn't be submitted. Please try again.")
      setSubmitting(false)
    }
  }

  return (
    <div className="relative">
      <form onSubmit={handleSubmitRequest} className="space-y-8">
        
        {error && (
          <div className="bg-destructive/10 text-destructive p-3 rounded-xl border border-destructive/20 text-sm flex justify-between items-start">
            <span>{error}</span>
            <button type="button" onClick={() => setError("")}><X className="w-4 h-4" /></button>
          </div>
        )}

        <div className="space-y-6">
          <StarRating label="Doctor rating" value={docRating} onChange={setDocRating} />
          <StarRating label="Organization rating" value={orgRating} onChange={setOrgRating} />
        </div>

        <div>
          <div className="flex justify-between items-end mb-2">
            <label className="text-sm font-bold text-muted-foreground">Written feedback (optional)</label>
            <span className={`text-xs font-medium ${comment.length > 500 ? "text-destructive" : "text-muted-foreground"}`}>
              {comment.length} / 500
            </span>
          </div>
          <textarea
            value={comment}
            onChange={e => setComment(e.target.value)}
            maxLength={500}
            placeholder="Share your experience with this appointment..."
            className="w-full bg-background border rounded-2xl p-4 shadow-sm focus:ring-2 focus:ring-primary/20 outline-none resize-none h-32"
          />
        </div>

        <div className="flex gap-3 pt-4 border-t">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel} disabled={submitting} className="flex-1 rounded-xl py-6 text-base">
              Cancel
            </Button>
          )}
          <Button type="submit" disabled={submitting || docRating === 0 || orgRating === 0 || comment.length > 500} className="flex-[2] rounded-xl py-6 text-base shadow-md">
            {submitting ? "Submitting..." : "Submit feedback"}
          </Button>
        </div>
      </form>

      {/* Confirmation Modal */}
      {confirmOpen && (
        <div className="absolute inset-0 z-10 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div className="bg-card border rounded-3xl p-6 shadow-2xl max-w-sm w-full animate-in slide-in-from-bottom-4">
            <h3 className="font-bold text-lg mb-2">Submit this feedback?</h3>
            <p className="text-sm text-muted-foreground mb-6">Your ratings and comments will be shared securely.</p>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setConfirmOpen(false)} disabled={submitting} className="flex-1">Cancel</Button>
              <Button onClick={confirmSubmit} disabled={submitting} className="flex-1">
                {submitting ? "Submitting..." : "Submit feedback"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
