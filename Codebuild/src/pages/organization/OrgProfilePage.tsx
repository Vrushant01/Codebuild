import React, { useState, useEffect } from "react"
import { organizationService } from "../../lib/organization/organization-service"
import { OrganizationIdentityCard } from "../../components/organization/OrganizationIdentityCard"
import { Button } from "../../components/ui/button"
import type { OrganizationType } from "../../lib/healthcare/types"
import { Eye, Save, MapPin, Building, Phone, Mail, Globe, Clock, ShieldCheck, Activity, Stethoscope, Navigation } from "lucide-react"
import { OrganizationReviews } from "../../components/reviews/OrganizationReviews"

export default function OrgProfilePage() {
  const [org, setOrg] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  
  // Public Preview mode state
  const [previewMode, setPreviewMode] = useState(false)

  // Edit form state
  const [editForm, setEditForm] = useState({
    name: "",
    type: "Clinic" as OrganizationType,
    description: "",
    address: "",
    city: "",
    contact: "",
    email: "",
    website: "",
    lat: "23.0225",
    lng: "72.5714"
  })

  const [detectingLocation, setDetectingLocation] = useState(false)

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.")
      return
    }
    setDetectingLocation(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const detectedLat = (Math.round(pos.coords.latitude * 10000) / 10000).toString()
        const detectedLng = (Math.round(pos.coords.longitude * 10000) / 10000).toString()
        setEditForm(prev => ({
          ...prev,
          lat: detectedLat,
          lng: detectedLng
        }))
        setDetectingLocation(false)
      },
      (err) => {
        setDetectingLocation(false)
        alert("Unable to retrieve GPS location: " + err.message)
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  const loadData = async () => {
    setLoading(true)
    const data = await organizationService.getOrganization()
    setOrg(data)
    const contactPhone = typeof data.contact === 'object' ? data.contact?.phone || "" : (typeof data.contact === 'string' ? data.contact : "")
    const contactEmail = typeof data.contact === 'object' ? data.contact?.email || "" : (data.email || "")
    setEditForm({
      name: data.name || "",
      type: data.type || "Clinic",
      description: data.description || "",
      address: data.address || "",
      city: data.city || "",
      contact: contactPhone,
      email: contactEmail,
      website: data.website || "",
      lat: String(data.location?.lat || 23.0225),
      lng: String(data.location?.lng || 72.5714)
    })
    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [])

  const [savedSuccess, setSavedSuccess] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    setSavedSuccess(false)
    try {
      await organizationService.updateOrganization({
        ...editForm,
        lat: Number(editForm.lat) || 23.0225,
        lng: Number(editForm.lng) || 72.5714
      })
      await loadData()
      setSavedSuccess(true)
      setTimeout(() => setSavedSuccess(false), 4000)
    } finally {
      setSaving(false)
    }
  }

  if (loading || !org) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 space-y-8 animate-pulse">
        <div className="h-40 bg-muted rounded-3xl" />
        <div className="h-[400px] bg-muted rounded-3xl" />
      </div>
    )
  }

  const defaultWorkingHours = {
    "Monday - Friday": "08:00 AM - 08:00 PM",
    "Saturday": "09:00 AM - 05:00 PM",
    "Sunday": "Emergency Only"
  }
  const workingHours = org.workingHours && typeof org.workingHours === 'object' ? org.workingHours : defaultWorkingHours
  const specializations = Array.isArray(org.specializations) ? org.specializations : ["General Medicine"]
  const doctorCount = Array.isArray(org.doctorIds) ? org.doctorIds.length : (Array.isArray(org.doctors) ? org.doctors.length : 0)
  const phoneDisplay = typeof org.contact === 'object' ? org.contact?.phone || "Phone not provided" : org.contact || "Phone not provided"

  if (previewMode) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto animate-in fade-in space-y-8">
        
        {/* Preview Header Banner */}
        <div className="bg-primary/10 border border-primary/20 p-4 flex items-center justify-between rounded-2xl sticky top-4 z-10 backdrop-blur-md">
          <div className="flex items-center gap-2 text-primary font-bold">
            <Eye className="w-5 h-5" /> Patient View Preview
          </div>
          <Button variant="outline" size="sm" onClick={() => setPreviewMode(false)} className="bg-background">
            Exit Preview
          </Button>
        </div>

        <div className="bg-background border rounded-[2rem] p-6 sm:p-10 shadow-lg relative overflow-hidden">
          
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-bl-full pointer-events-none" />

          {/* Identity */}
          <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start text-center sm:text-left mb-8 border-b pb-8">
            <div className="w-32 h-32 rounded-3xl bg-primary/10 text-primary flex items-center justify-center font-heading font-bold text-5xl shrink-0 shadow-inner">
              {org.name ? org.name.substring(0, 2).toUpperCase() : "ORG"}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 justify-center sm:justify-start mb-2">
                <h1 className="text-3xl sm:text-4xl font-heading font-bold">{org.name}</h1>
                {org.verificationStatus === "Verified" && <ShieldCheck className="w-6 h-6 text-emerald-500" />}
              </div>
              <p className="text-xl font-medium text-primary mb-4">{org.type}</p>
              
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 text-sm text-muted-foreground font-medium">
                <div className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-primary shrink-0" /> {org.address}, {org.city}</div>
                <div className="flex items-center gap-1.5"><Phone className="w-4 h-4 text-primary shrink-0" /> {phoneDisplay}</div>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-8">
              
              <section>
                <h3 className="text-xl font-bold mb-3">About Us</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {org.description || "A premier healthcare facility dedicated to providing excellent patient care."}
                </p>
              </section>

              <section>
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-primary" /> Services Offered
                </h3>
                <div className="flex flex-wrap gap-2">
                  {specializations.map((spec: string) => (
                    <span key={spec} className="bg-muted px-4 py-2 rounded-xl text-sm font-semibold">
                      {spec}
                    </span>
                  ))}
                </div>
              </section>

              <section>
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Stethoscope className="w-5 h-5 text-emerald-500" /> Medical Specialists
                </h3>
                <div className="bg-muted/30 border border-dashed rounded-2xl p-6 text-center">
                  <p className="text-muted-foreground font-medium">{doctorCount} Doctors Available</p>
                  <Button variant="outline" className="mt-4 bg-background">View Doctors</Button>
                </div>
              </section>

            </div>
            
            <div className="space-y-6">
              
              <div className="bg-primary/5 border border-primary/10 rounded-3xl p-6">
                <div className="text-center mb-6">
                  <span className="text-4xl font-heading font-bold text-primary">{org.rating || 4.8}</span>
                  <span className="text-muted-foreground font-medium"> / 5.0</span>
                  <p className="text-sm text-muted-foreground mt-1">Based on {org.reviewCount || 0} reviews</p>
                </div>
                <Button className="w-full py-6 rounded-2xl text-lg font-bold shadow-lg shadow-primary/20">
                  Book Appointment
                </Button>
              </div>

              <div className="bg-card border rounded-3xl p-6">
                <h4 className="font-bold mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-muted-foreground" /> Working Hours
                </h4>
                <div className="space-y-2 text-sm">
                  {Object.entries(workingHours).map(([day, hours]) => (
                    <div key={day} className="flex justify-between">
                      <span className="text-muted-foreground">{day}</span>
                      <span className="font-medium">{hours as string}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
          
          <div className="mt-8 border-t pt-8">
            <OrganizationReviews organizationId={org.id} />
          </div>

        </div>
      </div>
    )
  }

  // Edit Mode
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-8 animate-in fade-in">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold">Organization Profile</h1>
          <p className="text-muted-foreground mt-1">Manage your facility's public identity.</p>
        </div>
        <Button variant="outline" onClick={() => setPreviewMode(true)} className="rounded-xl border-primary text-primary hover:bg-primary/5">
          <Eye className="w-4 h-4 mr-2" /> Public Preview
        </Button>
      </div>

      <OrganizationIdentityCard organization={org} />

      <div className="bg-card border rounded-3xl p-6 sm:p-8 shadow-sm">
        <h2 className="text-xl font-bold mb-6">Basic Information</h2>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="text-sm font-semibold text-muted-foreground mb-1 block">Organization Name</label>
            <input 
              value={editForm.name}
              onChange={e => setEditForm({...editForm, name: e.target.value})}
              className="w-full bg-background border rounded-xl px-4 py-2.5 font-medium"
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-muted-foreground mb-1 block">Facility Type</label>
            <select 
              value={editForm.type}
              onChange={e => setEditForm({...editForm, type: e.target.value as OrganizationType})}
              className="w-full bg-background border rounded-xl px-4 py-2.5 font-medium"
            >
              <option value="Clinic">Clinic</option>
              <option value="Hospital">Hospital</option>
              <option value="Healthcare Organization">Healthcare Organization</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="text-sm font-semibold text-muted-foreground mb-1 block">About Organization</label>
            <textarea 
              value={editForm.description}
              onChange={e => setEditForm({...editForm, description: e.target.value})}
              className="w-full bg-background border rounded-xl px-4 py-3 min-h-[100px] resize-none font-medium"
            />
          </div>

          <div className="md:col-span-2 border-t pt-6 mt-2">
            <h2 className="text-xl font-bold mb-6">Location & Contact</h2>
          </div>

          <div>
            <label className="text-sm font-semibold text-muted-foreground mb-1 block">Street Address</label>
            <input 
              value={editForm.address}
              onChange={e => setEditForm({...editForm, address: e.target.value})}
              className="w-full bg-background border rounded-xl px-4 py-2.5 font-medium"
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-muted-foreground mb-1 block">City</label>
            <input 
              value={editForm.city}
              onChange={e => setEditForm({...editForm, city: e.target.value})}
              className="w-full bg-background border rounded-xl px-4 py-2.5 font-medium"
            />
          </div>

          <div className="md:col-span-2 bg-muted/30 border border-dashed rounded-2xl p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <p className="font-bold text-sm flex items-center gap-2">
                  <Navigation className="w-4 h-4 text-primary" /> Facility GPS Location Coordinates
                </p>
                <p className="text-xs text-muted-foreground">Used for calculating nearest distance to patients during search.</p>
              </div>
              <Button 
                type="button" 
                variant="outline" 
                size="sm" 
                onClick={handleUseCurrentLocation}
                disabled={detectingLocation}
                className="bg-background font-bold text-xs gap-1.5 self-start sm:self-center"
              >
                <Navigation className="w-3.5 h-3.5 text-emerald-500" />
                {detectingLocation ? "Detecting GPS..." : "📍 Use Current Location"}
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1 block">Latitude</label>
                <input 
                  value={editForm.lat}
                  onChange={e => setEditForm({...editForm, lat: e.target.value})}
                  placeholder="e.g. 23.0225"
                  className="w-full bg-background border rounded-xl px-3 py-2 text-sm font-medium"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1 block">Longitude</label>
                <input 
                  value={editForm.lng}
                  onChange={e => setEditForm({...editForm, lng: e.target.value})}
                  placeholder="e.g. 72.5714"
                  className="w-full bg-background border rounded-xl px-3 py-2 text-sm font-medium"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold text-muted-foreground mb-1 block">Contact Phone</label>
            <div className="flex items-center gap-2 relative">
              <Phone className="w-4 h-4 text-muted-foreground absolute left-4" />
              <input 
                value={editForm.contact}
                onChange={e => setEditForm({...editForm, contact: e.target.value})}
                className="w-full bg-background border rounded-xl pl-10 pr-4 py-2.5 font-medium"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold text-muted-foreground mb-1 block">Contact Email</label>
            <div className="flex items-center gap-2 relative">
              <Mail className="w-4 h-4 text-muted-foreground absolute left-4" />
              <input 
                value={editForm.email}
                onChange={e => setEditForm({...editForm, email: e.target.value})}
                className="w-full bg-background border rounded-xl pl-10 pr-4 py-2.5 font-medium"
              />
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="text-sm font-semibold text-muted-foreground mb-1 block">Website</label>
            <div className="flex items-center gap-2 relative">
              <Globe className="w-4 h-4 text-muted-foreground absolute left-4" />
              <input 
                value={editForm.website}
                onChange={e => setEditForm({...editForm, website: e.target.value})}
                className="w-full bg-background border rounded-xl pl-10 pr-4 py-2.5 font-medium"
              />
            </div>
          </div>
          
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 mt-6 border-t">
          {savedSuccess ? (
            <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 px-4 py-2.5 rounded-xl text-sm font-bold animate-in fade-in">
              <ShieldCheck className="w-4 h-4" /> Profile saved successfully!
            </div>
          ) : <div />}
          <Button onClick={handleSave} disabled={saving} className="px-8 py-6 rounded-2xl text-lg font-bold shadow-md w-full sm:w-auto">
            {saving ? "Saving..." : "Save Profile"} <Save className="w-5 h-5 ml-2" />
          </Button>
        </div>

      </div>

    </div>
  )
}
