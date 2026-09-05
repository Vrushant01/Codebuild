import React, { useState, useEffect } from "react"
import { Search, Eye, EyeOff } from "lucide-react"
import { adminService } from "../../../lib/admin/admin-service"
import type { OrganizationListing } from "../../../lib/admin/admin-types"
import { toast } from "react-hot-toast"

export default function AdminListingsPage() {
  const [listings, setListings] = useState<OrganizationListing[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  const loadListings = async () => {
    setLoading(true)
    const data = await adminService.getListings()
    setListings(data)
    setLoading(false)
  }

  useEffect(() => {
    loadListings()
  }, [])

  const handleToggleVisibility = async (listing: OrganizationListing) => {
    const newVisibility = listing.visibility === "VISIBLE" ? "HIDDEN" : "VISIBLE"
    
    // Simple confirm for hiding
    if (newVisibility === "HIDDEN" && !window.confirm(`Are you sure you want to hide this listing from the patient discovery view?`)) {
      return
    }

    try {
      await adminService.updateListingVisibility(listing.id, newVisibility)
      toast.success(`Listing visibility updated to ${newVisibility}`)
      loadListings()
    } catch (err) {
      toast.error("Failed to update visibility")
    }
  }

  const filteredListings = listings.filter(l => 
    l.organizationId.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in">
      <div>
        <h1 className="text-3xl font-heading font-bold text-primary">Listings Management</h1>
        <p className="text-muted-foreground mt-1">Control visibility of organizations in the patient discovery portal.</p>
      </div>

      <div className="bg-card border rounded-3xl p-4 shadow-sm relative">
        <Search className="absolute left-7 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input 
          type="text" 
          placeholder="Search listings by organization ID..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-4 py-2 bg-background border rounded-xl text-sm focus:outline-none focus:ring-2 ring-primary transition-all"
        />
      </div>

      {loading ? (
        <div className="space-y-4 animate-pulse">
          {[1,2,3].map(i => <div key={i} className="h-24 bg-muted rounded-2xl" />)}
        </div>
      ) : filteredListings.length === 0 ? (
        <div className="bg-card border border-dashed rounded-3xl p-12 text-center">
          <Eye className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
          <h3 className="text-lg font-bold">No listings found</h3>
        </div>
      ) : (
        <div className="grid lg:grid-cols-2 gap-4">
          {filteredListings.map(listing => (
            <div key={listing.id} className="bg-card border rounded-3xl p-6 shadow-sm flex flex-col sm:flex-row gap-6 justify-between">
              <div>
                <h3 className="font-bold text-lg mb-1">{listing.organizationId}</h3>
                <div className="flex gap-2 text-sm text-muted-foreground mb-4">
                  <span>★ {listing.rating} ({listing.reviewCount})</span>
                  <span>•</span>
                  <span>{listing.doctorIds.length} Doctors</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {listing.specializations.map(spec => (
                    <span key={spec} className="text-xs bg-muted px-2 py-1 rounded-md">
                      {spec}
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="flex sm:flex-col items-center sm:items-end gap-3 justify-between sm:justify-start">
                <span className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full border shadow-xs flex items-center gap-1.5 ${
                  listing.visibility === 'VISIBLE' 
                    ? 'bg-white text-emerald-700 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-700' 
                    : 'bg-white text-slate-600 border-slate-300 dark:bg-slate-900 dark:text-slate-300 dark:border-slate-700'
                }`}>
                  {listing.visibility === 'VISIBLE' ? <Eye className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> : <EyeOff className="w-3.5 h-3.5" />}
                  {listing.visibility}
                </span>
                
                <div className="flex gap-2 mt-auto">
                  <button 
                    onClick={() => alert('Listing Preview (Patient View) opens here.')}
                    className="text-xs font-semibold px-3 py-1.5 border rounded-lg hover:bg-muted transition-colors"
                  >
                    Preview
                  </button>
                  <button 
                    onClick={() => handleToggleVisibility(listing)}
                    className="text-xs font-semibold px-3 py-1.5 border border-primary text-primary rounded-lg hover:bg-primary hover:text-white transition-colors"
                  >
                    {listing.visibility === 'VISIBLE' ? 'Hide Listing' : 'Show Listing'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
