import React, { useState, useEffect } from "react"
import { Star, Filter, Search, ArrowDownUp, CheckCircle, MessageSquare } from "lucide-react"
import { apiClient } from "../../lib/api/apiClient"
import { ReviewCard } from "../../components/reviews/ReviewCard"
import type { Review } from "../../lib/reviews/review-types"

export default function OrgFeedbackPage() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterRating, setFilterRating] = useState<number | null>(null)
  const [sortBy, setSortBy] = useState<"NEWEST" | "OLDEST" | "HIGHEST" | "LOWEST">("NEWEST")

  useEffect(() => {
    const fetchFeedback = async () => {
      setLoading(true)
      try {
        const res = await apiClient.get<{ success: boolean; data: any[] }>("/organizations/me/feedback")
        if (res && res.data) {
          setReviews(res.data.map((r: any) => ({
            id: r._id || r.id,
            doctorId: r.doctorId || "doc_1",
            patientId: r.patientId || "pat_1",
            organizationId: r.organizationId || "org_1",
            appointmentId: r.appointmentId || "apt_1",
            displayName: r.patientName || r.displayName || "Verified Patient",
            organizationRating: r.organizationRating || r.rating || 5,
            doctorRating: r.doctorRating || r.rating || 5,
            comment: r.comment || "",
            status: (r.status || "VERIFIED") as any,
            appointmentType: r.appointmentType || "Physical",
            createdAt: r.createdAt || new Date().toISOString()
          })))
        }
      } catch (err) {
        console.warn("Could not load organization feedback:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchFeedback()
  }, [])

  const averageRating = reviews.length > 0
    ? (reviews.reduce((acc, r) => acc + (r.organizationRating || 5), 0) / reviews.length).toFixed(1)
    : "0.0"

  const distribution = [5, 4, 3, 2, 1].map(star => {
    const count = reviews.filter(r => Math.round(r.organizationRating || 5) === star).length
    const pct = reviews.length > 0 ? Math.round((count / reviews.length) * 100) : 0
    return { star, count, pct }
  })

  const filteredReviews = reviews
    .filter(r => {
      const matchesSearch = !searchQuery || 
        r.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (r.comment && r.comment.toLowerCase().includes(searchQuery.toLowerCase()))
      const matchesRating = filterRating === null || Math.round(r.organizationRating || 5) === filterRating
      return matchesSearch && matchesRating
    })
    .sort((a, b) => {
      if (sortBy === "NEWEST") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      if (sortBy === "OLDEST") return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      if (sortBy === "HIGHEST") return (b.organizationRating || 5) - (a.organizationRating || 5)
      if (sortBy === "LOWEST") return (a.organizationRating || 5) - (b.organizationRating || 5)
      return 0
    })

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in">
      
      <div>
        <h1 className="text-3xl font-heading font-bold text-foreground">Clinic Feedback & Ratings</h1>
        <p className="text-muted-foreground mt-1">Patient satisfaction and verified appointment reviews.</p>
      </div>

      {/* Ratings Summary Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        <div className="bg-card border rounded-3xl p-6 sm:p-8 flex flex-col items-center justify-center text-center shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Overall Satisfaction</span>
          <div className="flex items-center gap-2 text-5xl font-bold text-foreground">
            {averageRating}
            <Star className="w-10 h-10 text-amber-400 fill-amber-400" />
          </div>
          <span className="text-xs text-muted-foreground mt-1">out of 5 stars</span>
          <div className="mt-4 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5">
            <CheckCircle className="w-3.5 h-3.5" /> {reviews.length} Verified Reviews
          </div>
        </div>

        {/* Star Distribution */}
        <div className="md:col-span-2 bg-card border rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col justify-center space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Rating Distribution</span>
          {distribution.map(({ star, count, pct }) => (
            <div key={star} className="flex items-center gap-3 text-xs font-medium">
              <span className="w-6 flex items-center gap-1 font-bold text-muted-foreground">
                {star} <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
              </span>
              <div className="flex-1 h-2.5 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-amber-400 rounded-full transition-all duration-500" 
                  style={{ width: `${pct}%` }} 
                />
              </div>
              <span className="w-10 text-right text-muted-foreground font-semibold">{pct}%</span>
            </div>
          ))}
        </div>

      </div>

      {/* Toolbar & Filters */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search feedback comments..."
              className="w-full bg-card border rounded-2xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value as any)}
                className="appearance-none bg-card border rounded-2xl pl-4 pr-10 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                <option value="NEWEST">Newest First</option>
                <option value="OLDEST">Oldest First</option>
                <option value="HIGHEST">Highest Rated</option>
                <option value="LOWEST">Lowest Rated</option>
              </select>
              <ArrowDownUp className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Rating Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          <Filter className="w-4 h-4 text-muted-foreground shrink-0" />
          <button
            onClick={() => setFilterRating(null)}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
              filterRating === null 
                ? "bg-primary text-primary-foreground shadow-sm" 
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            All Ratings
          </button>
          {[5, 4, 3, 2, 1].map(star => (
            <button
              key={star}
              onClick={() => setFilterRating(star)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1 ${
                filterRating === star 
                  ? "bg-primary text-primary-foreground shadow-sm" 
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {star} <Star className={`w-3 h-3 ${filterRating === star ? 'fill-current' : 'text-amber-400 fill-amber-400'}`} />
            </button>
          ))}
        </div>
      </div>

      {/* Review List */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-pulse">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-44 bg-muted rounded-3xl" />)}
        </div>
      ) : filteredReviews.length === 0 ? (
        <div className="bg-card border rounded-3xl p-12 text-center border-dashed">
          <MessageSquare className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
          <h3 className="text-lg font-bold">No feedback found</h3>
          <p className="text-muted-foreground text-sm mt-1">Patient reviews from completed visits will appear here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredReviews.map(review => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>
      )}

    </div>
  )
}
