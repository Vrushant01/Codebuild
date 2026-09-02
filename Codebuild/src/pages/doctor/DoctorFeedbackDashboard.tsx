import React, { useState, useMemo } from "react"
import { useReviews } from "../../lib/reviews/ReviewContext"
import { Filter, Star, Search, ArrowDownUp } from "lucide-react"
import { ReviewCard } from "../../components/reviews/ReviewCard"

export default function DoctorFeedbackDashboard() {
  const { doctorReviews, summary, isLoading } = useReviews()
  
  const [filterRating, setFilterRating] = useState<number | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState<"NEWEST" | "OLDEST" | "HIGHEST" | "LOWEST">("NEWEST")

  const filteredAndSortedReviews = useMemo(() => {
    let result = [...doctorReviews]
    
    // Filter by rating
    if (filterRating !== null) {
      result = result.filter(r => r.doctorRating === filterRating)
    }
    
    // Search by comment
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter(r => r.comment.toLowerCase().includes(q))
    }
    
    // Sort
    result.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime()
      const dateB = new Date(b.createdAt).getTime()
      
      switch (sortBy) {
        case "NEWEST": return dateB - dateA
        case "OLDEST": return dateA - dateB
        case "HIGHEST": return b.doctorRating - a.doctorRating || dateB - dateA
        case "LOWEST": return a.doctorRating - b.doctorRating || dateB - dateA
        default: return 0
      }
    })
    
    return result
  }, [doctorReviews, filterRating, searchQuery, sortBy])

  if (isLoading || !summary) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 space-y-8 animate-pulse max-w-7xl mx-auto">
        <div className="h-8 w-64 bg-muted rounded-lg" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-48 bg-muted rounded-3xl" />
          <div className="h-48 bg-muted rounded-3xl col-span-2" />
        </div>
      </div>
    )
  }

  // Distribution chart calculations
  const maxDist = Math.max(...Object.values(summary.distribution), 1)

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-heading font-bold">Patient Feedback</h1>
        <p className="text-muted-foreground mt-1">Understand patient experiences and improve your care.</p>
      </div>

      {/* Top Summary Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Average Rating Hero */}
        <div className="bg-card border rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col items-center justify-center text-center">
          <h2 className="text-muted-foreground font-semibold uppercase tracking-wider text-sm mb-4">Average Rating</h2>
          <div className="flex items-center justify-center gap-2 text-6xl font-black font-heading tracking-tighter">
            {summary.averageRating.toFixed(1)}
            <Star className="w-10 h-10 fill-amber-400 text-amber-400" />
          </div>
          <p className="text-sm text-muted-foreground font-medium mt-4">
            out of 5
          </p>
          <div className="mt-4 px-4 py-2 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 font-bold rounded-xl text-sm border border-emerald-100 dark:border-emerald-900/50">
            {summary.verifiedReviews} verified reviews
          </div>
        </div>
        
        {/* Rating Distribution */}
        <div className="lg:col-span-2 bg-card border rounded-3xl p-6 sm:p-8 shadow-sm">
          <h2 className="text-muted-foreground font-semibold uppercase tracking-wider text-sm mb-6">Rating Distribution</h2>
          <div className="space-y-4">
            {[5, 4, 3, 2, 1].map(star => {
              const count = summary.distribution[star.toString() as keyof typeof summary.distribution]
              const percentage = summary.verifiedReviews > 0 ? Math.round((count / summary.verifiedReviews) * 100) : 0
              const width = Math.round((count / maxDist) * 100)
              
              return (
                <div key={star} className="flex items-center gap-4 text-sm font-medium">
                  <div className="flex items-center gap-1 w-8 shrink-0">
                    {star} <Star className="w-3.5 h-3.5 text-muted-foreground fill-current" />
                  </div>
                  <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-amber-400 rounded-full transition-all duration-1000"
                      style={{ width: `${width}%` }}
                    />
                  </div>
                  <div className="w-12 text-right text-muted-foreground shrink-0">{percentage}%</div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Filters and List */}
      <div className="pt-8 border-t space-y-6">
        
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <h2 className="text-xl font-bold hidden sm:block">Recent Feedback</h2>
          
          <div className="w-full sm:w-auto flex flex-col sm:flex-row items-center gap-3">
            {/* Search */}
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search reviews..."
                className="w-full pl-9 pr-4 py-2 bg-card border rounded-xl text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
              />
            </div>
            
            <div className="flex items-center gap-3 w-full sm:w-auto">
              {/* Sort */}
              <div className="relative flex-1 sm:flex-none">
                <select
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value as any)}
                  className="w-full appearance-none bg-card border rounded-xl pl-4 pr-10 py-2 text-sm font-medium outline-none focus:border-primary transition-all"
                >
                  <option value="NEWEST">Newest</option>
                  <option value="OLDEST">Oldest</option>
                  <option value="HIGHEST">Highest Rating</option>
                  <option value="LOWEST">Lowest Rating</option>
                </select>
                <ArrowDownUp className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              </div>

              {/* Verified Badge Default */}
              <div className="bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 text-xs font-bold px-3 py-2 rounded-xl whitespace-nowrap">
                Verified Only
              </div>
            </div>
          </div>
        </div>

        {/* Star Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 hide-scrollbar">
          <Filter className="w-4 h-4 text-muted-foreground shrink-0" />
          <button
            onClick={() => setFilterRating(null)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${filterRating === null ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80 text-muted-foreground'}`}
          >
            All Ratings
          </button>
          {[5, 4, 3, 2, 1].map(star => (
            <button
              key={star}
              onClick={() => setFilterRating(star)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 ${filterRating === star ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80 text-muted-foreground'}`}
            >
              {star} <Star className={`w-3.5 h-3.5 ${filterRating === star ? 'fill-current text-current' : ''}`} />
            </button>
          ))}
        </div>

        {/* List Content */}
        {filteredAndSortedReviews.length === 0 ? (
          <div className="bg-card border rounded-3xl p-12 text-center border-dashed">
            {searchQuery || filterRating !== null ? (
              <>
                <p className="font-semibold text-lg text-foreground">No feedback matches your criteria.</p>
                <button onClick={() => { setSearchQuery(""); setFilterRating(null) }} className="text-primary mt-2 text-sm font-medium hover:underline">Clear filters</button>
              </>
            ) : (
              <>
                <p className="font-semibold text-lg text-foreground">No patient feedback yet.</p>
                <p className="text-muted-foreground mt-2">Feedback from completed appointments will appear here.</p>
              </>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredAndSortedReviews.map(review => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>
        )}
      </div>

    </div>
  )
}
