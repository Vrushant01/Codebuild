import React from "react"
import { Lightbulb } from "lucide-react"

interface FeedbackInsightCardProps {
  averageRating: number
  totalVerified: number
}

export function FeedbackInsightCard({ averageRating, totalVerified }: FeedbackInsightCardProps) {
  let insight = "Patients consistently rate their experience highly."
  
  if (totalVerified === 0) {
    insight = "Completed appointments can generate verified reviews. Your insights will appear here."
  } else if (averageRating >= 4.5) {
    insight = "Patients consistently rate their experience very positively."
  } else if (averageRating >= 4.0) {
    insight = "Patient feedback is generally positive."
  } else {
    insight = "Patient feedback suggests opportunities to improve the experience."
  }

  return (
    <div className="bg-primary/5 border border-primary/20 rounded-3xl p-6 shadow-sm">
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
          <Lightbulb className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="font-bold text-primary mb-1">Feedback Insight</h3>
          <p className="text-primary/80 font-medium leading-relaxed">
            {insight}
          </p>
        </div>
      </div>
    </div>
  )
}
