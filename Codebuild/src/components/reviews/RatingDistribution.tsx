import React from "react"
import { Star } from "lucide-react"

interface RatingDistributionProps {
  distribution: {
    "5": number
    "4": number
    "3": number
    "2": number
    "1": number
  }
  totalVerified: number
}

export function RatingDistribution({ distribution, totalVerified }: RatingDistributionProps) {
  const stars = [5, 4, 3, 2, 1] as const

  return (
    <div className="bg-card border rounded-3xl p-6 shadow-sm">
      <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">Rating Distribution</h3>
      
      <div className="space-y-3">
        {stars.map(star => {
          const count = distribution[star.toString() as keyof typeof distribution]
          const percentage = totalVerified > 0 ? (count / totalVerified) * 100 : 0
          
          return (
            <div key={star} className="flex items-center gap-3">
              <div className="flex items-center gap-1 w-8 shrink-0 text-sm font-medium">
                {star} <Star className="w-3.5 h-3.5 text-muted-foreground" />
              </div>
              
              <div className="flex-1 h-2.5 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-amber-400 rounded-full" 
                  style={{ width: `${percentage}%` }}
                />
              </div>
              
              <div className="w-8 text-right text-sm text-muted-foreground font-medium">
                {count}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
