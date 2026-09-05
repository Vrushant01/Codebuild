import React, { useState, useEffect, useMemo, useRef } from "react"
import { useNavigate, Link } from "react-router-dom"
import { motion } from "framer-motion"
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from "react-leaflet"
import L from "leaflet"
import { 
  Building2, 
  MapPin, 
  LocateFixed, 
  Mail, 
  Phone, 
  Lock, 
  Globe, 
  Stethoscope, 
  Clock, 
  CheckCircle2, 
  ArrowLeft, 
  ArrowRight, 
  Sparkles, 
  ShieldCheck, 
  Video, 
  Users, 
  Loader2,
  Navigation
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/lib/auth/AuthContext"
import { toast } from "react-hot-toast"

const POPULAR_SPECIALTIES = [
  "General Medicine",
  "Cardiology",
  "Pediatrics",
  "Dermatology",
  "Orthopedics",
  "Neurology",
  "Gynecology & Obstetrics",
  "ENT",
  "Ophthalmology",
  "Emergency & Trauma",
  "Pulmonology",
  "Dental Surgery"
]

const CITY_COORDINATES: Record<string, [number, number]> = {
  "Surat": [21.1702, 72.8311],
  "Ahmedabad": [23.0225, 72.5714],
  "Vadodara": [22.3072, 73.1812],
  "Rajkot": [22.3039, 70.8022],
  "Mumbai": [19.0760, 72.8777],
  "Delhi": [28.6139, 77.2090],
  "Bengaluru": [12.9716, 77.5946],
  "Pune": [18.5204, 73.8567]
}

// Custom Pin Icon for interactive map
const createPinIcon = (name: string) => {
  const html = `
    <div class="relative flex flex-col items-center justify-center animate-bounce">
      <div class="mb-1 px-2.5 py-1 rounded-md text-[11px] font-bold shadow-lg border bg-primary text-primary-foreground border-primary whitespace-nowrap">
        ${name || "Your Facility Pin"}
      </div>
      <div class="w-10 h-10 rounded-full bg-primary flex items-center justify-center shadow-xl border-2 border-white text-white">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a8 8 0 0 0-8 8c0 5.25 8 12 8 12s8-6.75 8-12a8 8 0 0 0-8-8z"/><circle cx="12" cy="10" r="3"/></svg>
      </div>
      <div class="w-2.5 h-2.5 rounded-sm rotate-45 -mt-1.5 border-r-2 border-b-2 shadow-sm bg-primary border-primary"></div>
    </div>
  `
  return L.divIcon({
    html,
    className: "custom-facility-pin",
    iconSize: [44, 60],
    iconAnchor: [22, 58]
  })
}

// Map Click & Drag Controller
function LocationPickerEvents({ 
  position, 
  setPosition 
}: { 
  position: [number, number]
  setPosition: (pos: [number, number]) => void 
}) {
  const map = useMap()

  useMapEvents({
    click(e) {
      const newPos: [number, number] = [
        Math.round(e.latlng.lat * 10000) / 10000,
        Math.round(e.latlng.lng * 10000) / 10000
      ]
      setPosition(newPos)
      map.flyTo(newPos, map.getZoom(), { animate: true, duration: 0.6 })
    }
  })

  return null
}

function MapCenterController({ center }: { center: [number, number] }) {
  const map = useMap()
  useEffect(() => {
    map.flyTo(center, 14, { animate: true, duration: 1.0 })
  }, [center, map])
  return null
}

export default function JoinOrganizationPage() {
  const navigate = useNavigate()
  const { registerOrganization } = useAuth()

  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [submitting, setSubmitting] = useState(false)
  const [isLocating, setIsLocating] = useState(false)
  const [submittedPending, setSubmittedPending] = useState(false)
  const [countdown, setCountdown] = useState(10)

  // Countdown timer when submitted
  useEffect(() => {
    if (!submittedPending) return
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          navigate("/")
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [submittedPending, navigate])

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    type: "Hospital" as "Hospital" | "Clinic" | "Healthcare Center" | "Specialty Clinic",
    city: "Surat",
    state: "Gujarat",
    address: "",
    pincode: "",
    email: "",
    phone: "",
    password: "",
    website: "",
    lat: 21.1702,
    lng: 72.8311,
    specializations: ["General Medicine", "Cardiology"],
    receptionistEnabled: true,
    telemedicineEnabled: true,
    workingHours: {
      open: "08:00 AM",
      close: "08:00 PM",
      days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
    }
  })

  const [customSpec, setCustomSpec] = useState("")
  const [locationSource, setLocationSource] = useState<"default" | "gps" | "map">("default")

  // Marker reference for dragging
  const markerRef = useRef<any>(null)

  const mapCenter: [number, number] = useMemo(() => {
    return [formData.lat, formData.lng]
  }, [formData.lat, formData.lng])

  // Handle City Change
  const handleCityChange = (newCity: string) => {
    const coords = CITY_COORDINATES[newCity] || CITY_COORDINATES["Surat"]
    setFormData(prev => ({
      ...prev,
      city: newCity,
      lat: coords[0],
      lng: coords[1]
    }))
  }

  // Handle Real-Time GPS Detection
  const handleDetectGPSLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser.")
      return
    }

    setIsLocating(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const liveLat = Math.round(pos.coords.latitude * 10000) / 10000
        const liveLng = Math.round(pos.coords.longitude * 10000) / 10000
        setFormData(prev => ({
          ...prev,
          lat: liveLat,
          lng: liveLng
        }))
        setLocationSource("gps")
        setIsLocating(false)
        toast.success(`📍 Real-time GPS location detected: (${liveLat}, ${liveLng})`, {
          icon: "🎯"
        })
      },
      (err) => {
        setIsLocating(false)
        toast.error(`Location access denied or unavailable: ${err.message}. You can click anywhere on the map to set location.`)
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    )
  }

  const handleToggleSpecialty = (spec: string) => {
    setFormData(prev => {
      const exists = prev.specializations.includes(spec)
      return {
        ...prev,
        specializations: exists
          ? prev.specializations.filter(s => s !== spec)
          : [...prev.specializations, spec]
      }
    })
  }

  const handleAddCustomSpec = () => {
    if (customSpec.trim() && !formData.specializations.includes(customSpec.trim())) {
      setFormData(prev => ({
        ...prev,
        specializations: [...prev.specializations, customSpec.trim()]
      }))
      setCustomSpec("")
    }
  }

  const handleRemoveSpec = (spec: string) => {
    setFormData(prev => ({
      ...prev,
      specializations: prev.specializations.filter(s => s !== spec)
    }))
  }

  // Validate current step
  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault()
    if (step === 1) {
      if (!formData.name.trim()) {
        toast.error("Please enter your organization/hospital name.")
        return
      }
      if (!formData.city.trim()) {
        toast.error("Please specify your city.")
        return
      }
      if (!formData.address.trim()) {
        toast.error("Please enter your facility street address.")
        return
      }
      setStep(2)
    } else if (step === 2) {
      if (!formData.email.trim() || !formData.email.includes("@")) {
        toast.error("Please enter a valid administrator contact email.")
        return
      }
      if (!formData.password || formData.password.length < 6) {
        toast.error("Password must be at least 6 characters.")
        return
      }
      if (!formData.phone.trim()) {
        toast.error("Please enter an official phone number.")
        return
      }
      setStep(3)
    }
  }

  // Final Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name.trim() || !formData.email.trim()) {
      toast.error("Please fill in all required fields.")
      return
    }

    setSubmitting(true)
    try {
      const payload = {
        name: formData.name.trim(),
        type: formData.type,
        city: formData.city.trim(),
        state: formData.state.trim(),
        address: formData.address.trim(),
        pincode: formData.pincode.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim(),
        password: formData.password,
        website: formData.website.trim(),
        location: {
          lat: formData.lat,
          lng: formData.lng
        },
        specializations: formData.specializations,
        receptionistEnabled: formData.receptionistEnabled,
        telemedicineEnabled: formData.telemedicineEnabled,
        workingHours: formData.workingHours
      }

      const res = await registerOrganization(payload)

      if (res.pendingApproval) {
        setSubmittedPending(true)
        setCountdown(10)
        toast.success("Registration request submitted to Admin for approval!", {
          icon: "⏳",
          duration: 5000
        })
      } else {
        toast.success("Organization registered successfully!", { duration: 4000 })
        setTimeout(() => {
          navigate("/app/organization")
        }, 800)
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to register organization. Please check details and try again.")
      setSubmitting(false)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-foreground py-10 px-4 sm:px-6 lg:px-8">
      
      {/* PENDING APPROVAL CONFIRMATION MODAL */}
      {submittedPending && (
        <div className="fixed inset-0 z-50 bg-background/85 backdrop-blur-md flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-card border border-border shadow-2xl rounded-3xl p-6 sm:p-8 max-w-lg w-full text-center space-y-6"
          >
            <div className="w-16 h-16 rounded-3xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto shadow-inner border border-amber-500/20">
              <Clock className="w-8 h-8 animate-pulse" />
            </div>

            <div className="space-y-2">
              <span className="inline-flex items-center gap-1.5 bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/30 px-3.5 py-1 rounded-full text-xs font-bold">
                ⏳ Application Sent to Admin for Approval
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold font-heading">
                Request Submitted Successfully!
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Your organization registration request for <strong className="text-foreground font-semibold">{formData.name}</strong> has been sent to the platform Admin.
              </p>
            </div>

            <div className="bg-muted/40 border rounded-2xl p-4 text-left space-y-2.5 text-xs">
              <div className="flex items-start gap-2 text-foreground font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>Facility details & real-time GPS coordinates saved in database</span>
              </div>
              <div className="flex items-start gap-2 text-foreground font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>Admin review request dispatched to platform dashboard</span>
              </div>
              <div className="flex items-start gap-2 text-muted-foreground">
                <ShieldCheck className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <span>Once the Admin accepts and approves your request, your facility will go live on the patient discovery map and you can log in with <span className="font-mono text-foreground font-bold">{formData.email}</span>.</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button 
                size="lg" 
                className="w-full rounded-2xl font-bold h-12 shadow-lg"
                onClick={() => navigate("/")}
              >
                Return to Home Page ({countdown}s)
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="w-full rounded-2xl font-bold h-12"
                onClick={() => navigate("/login")}
              >
                Go to Login
              </Button>
            </div>
          </motion.div>
        </div>
      )}
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Navigation & Header */}
        <div className="flex items-center justify-between">
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Medireach
          </Link>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold border border-primary/20">
              <Sparkles className="w-3.5 h-3.5" /> For Healthcare Providers
            </span>
          </div>
        </div>

        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-primary to-emerald-500 text-white flex items-center justify-center mx-auto shadow-xl shadow-primary/20">
            <Building2 className="w-7 h-7" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold font-heading tracking-tight">
            Register Your Healthcare Organization
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            List your hospital or clinic on the live patient discovery map, receive instant verified bookings, and manage doctors & queues effortlessly.
          </p>
        </div>

        {/* Step Indicator */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4 max-w-2xl mx-auto">
          {[
            { num: 1, title: "Facility & Location" },
            { num: 2, title: "Admin & Contact" },
            { num: 3, title: "Services & Launch" }
          ].map((s) => (
            <div 
              key={s.num} 
              className={`p-3 rounded-2xl border text-center transition-all ${
                step === s.num 
                  ? "bg-primary text-primary-foreground border-primary shadow-md" 
                  : step > s.num 
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
                  : "bg-card border-border text-muted-foreground"
              }`}
            >
              <div className="text-xs font-bold uppercase tracking-wider">Step 0{s.num}</div>
              <div className="text-xs sm:text-sm font-semibold truncate">{s.title}</div>
            </div>
          ))}
        </div>

        {/* Registration Container */}
        <div className="bg-card border border-border/80 shadow-2xl rounded-3xl p-6 sm:p-10">
          <form onSubmit={step === 3 ? handleSubmit : handleNextStep} className="space-y-8">
            
            {/* ================= STEP 1: FACILITY PROFILE & REAL-TIME MAP ================= */}
            {step === 1 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="text-xl font-bold font-heading flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-primary" /> Facility Profile & Live Geolocation
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Provide your facility details and pinpoint your exact location on the patient discovery map.
                  </p>
                </div>

                <div className="grid sm:grid-cols-2 gap-5">
                  <div className="sm:col-span-2 space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Hospital / Clinic Name *
                    </label>
                    <Input
                      placeholder="e.g. Apollo Multi-Specialty Hospital, City Care Clinic"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="h-12 rounded-xl"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Facility Type
                    </label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                      className="w-full h-12 bg-background border rounded-xl px-3 text-sm font-medium focus:outline-none focus:ring-2 ring-primary"
                    >
                      <option value="Hospital">Hospital</option>
                      <option value="Clinic">Clinic</option>
                      <option value="Specialty Clinic">Specialty Clinic</option>
                      <option value="Healthcare Center">Healthcare Center</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      City *
                    </label>
                    <div className="flex gap-2">
                      <select
                        value={formData.city}
                        onChange={(e) => handleCityChange(e.target.value)}
                        className="h-12 bg-background border rounded-xl px-3 text-sm font-medium focus:outline-none focus:ring-2 ring-primary flex-1"
                      >
                        {Object.keys(CITY_COORDINATES).map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                      <Input
                        placeholder="Custom City"
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        className="h-12 rounded-xl w-36"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-2 space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Full Street Address *
                    </label>
                    <Input
                      placeholder="e.g. Ring Road, Near Majura Gate, Opp. Civil Hospital"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="h-12 rounded-xl"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Pincode / Postal Code
                    </label>
                    <Input
                      placeholder="e.g. 395002"
                      value={formData.pincode}
                      onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                      className="h-12 rounded-xl"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      State
                    </label>
                    <Input
                      placeholder="e.g. Gujarat"
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      className="h-12 rounded-xl"
                    />
                  </div>
                </div>

                {/* REAL-TIME GEOLOCATION & MAP PIN DROPPER */}
                <div className="border border-primary/20 bg-primary/5 rounded-3xl p-5 sm:p-6 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h4 className="font-bold text-sm sm:text-base flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-primary" /> Live Location & Map Placement
                      </h4>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Click on the map or drag the pin to set your hospital's exact entrance coordinates.
                      </p>
                    </div>

                    <Button
                      type="button"
                      onClick={handleDetectGPSLocation}
                      disabled={isLocating}
                      className="rounded-xl shadow-md font-bold text-xs gap-2 shrink-0 bg-primary hover:bg-primary/90 text-primary-foreground"
                    >
                      {isLocating ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <LocateFixed className="w-4 h-4" />
                      )}
                      {isLocating ? "Detecting GPS..." : "Detect Live GPS Location"}
                    </Button>
                  </div>

                  {/* Coordinates Badges */}
                  <div className="flex flex-wrap items-center gap-3 text-xs">
                    <span className="bg-background border px-3 py-1.5 rounded-xl font-mono font-bold flex items-center gap-1.5 shadow-sm">
                      <Navigation className="w-3.5 h-3.5 text-primary" /> Lat: {formData.lat.toFixed(4)}, Lng: {formData.lng.toFixed(4)}
                    </span>
                    <span className={`px-3 py-1.5 rounded-xl font-semibold text-xs border ${
                      locationSource === "gps" 
                        ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
                        : "bg-blue-500/10 border-blue-500/30 text-blue-600 dark:text-blue-400"
                    }`}>
                      {locationSource === "gps" ? "✓ Real-Time GPS Active" : "📍 Interactive Pin Placement"}
                    </span>
                  </div>

                  {/* Interactive Leaflet Map */}
                  <div className="w-full h-72 sm:h-80 rounded-2xl overflow-hidden border border-border shadow-inner relative z-0">
                    <MapContainer
                      center={mapCenter}
                      zoom={14}
                      style={{ width: "100%", height: "100%" }}
                      zoomControl={false}
                    >
                      <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      />
                      <MapCenterController center={mapCenter} />
                      <LocationPickerEvents
                        position={mapCenter}
                        setPosition={(pos) => {
                          setFormData(prev => ({ ...prev, lat: pos[0], lng: pos[1] }))
                          setLocationSource("map")
                        }}
                      />
                      <Marker
                        position={mapCenter}
                        icon={createPinIcon(formData.name)}
                        draggable={true}
                        ref={markerRef}
                        eventHandlers={{
                          dragend() {
                            const marker = markerRef.current
                            if (marker != null) {
                              const latLng = marker.getLatLng()
                              setFormData(prev => ({
                                ...prev,
                                lat: Math.round(latLng.lat * 10000) / 10000,
                                lng: Math.round(latLng.lng * 10000) / 10000
                              }))
                              setLocationSource("map")
                            }
                          }
                        }}
                      />
                    </MapContainer>
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <Button type="submit" size="lg" className="rounded-2xl px-8 font-bold gap-2 shadow-lg">
                    Continue to Admin & Credentials <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </motion.div>
            )}

            {/* ================= STEP 2: ADMIN CREDENTIALS & CONTACT ================= */}
            {step === 2 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="text-xl font-bold font-heading flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-emerald-500" /> Administrator Account & Contact Info
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Set up your secure administrator login credentials to access the organization dashboard.
                  </p>
                </div>

                <div className="grid sm:grid-cols-2 gap-5">
                  <div className="sm:col-span-2 space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Admin / Official Email (Used for Login) *
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <Input
                        type="email"
                        placeholder="admin@yourhospital.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="pl-10 h-12 rounded-xl"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Create Password *
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <Input
                        type="password"
                        placeholder="At least 6 characters"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="pl-10 h-12 rounded-xl"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Official Contact Phone *
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <Input
                        placeholder="+91 98765 43210"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="pl-10 h-12 rounded-xl"
                        required
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-2 space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Official Website (Optional)
                    </label>
                    <div className="relative">
                      <Globe className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <Input
                        placeholder="https://www.yourhospital.org"
                        value={formData.website}
                        onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                        className="pl-10 h-12 rounded-xl"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4">
                  <Button 
                    type="button" 
                    variant="ghost" 
                    onClick={() => setStep(1)}
                    className="rounded-xl"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back
                  </Button>
                  <Button type="submit" size="lg" className="rounded-2xl px-8 font-bold gap-2 shadow-lg">
                    Continue to Clinical Services <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </motion.div>
            )}

            {/* ================= STEP 3: SPECIALTIES & LAUNCH ================= */}
            {step === 3 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="text-xl font-bold font-heading flex items-center gap-2">
                    <Stethoscope className="w-5 h-5 text-primary" /> Clinical Specialties & Modules
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Select the departments and clinical modules offered by your organization.
                  </p>
                </div>

                {/* Specialties Selector */}
                <div className="space-y-3">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Clinical Departments & Specializations
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {POPULAR_SPECIALTIES.map((spec) => {
                      const isSelected = formData.specializations.includes(spec)
                      return (
                        <button
                          key={spec}
                          type="button"
                          onClick={() => handleToggleSpecialty(spec)}
                          className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all ${
                            isSelected
                              ? "bg-primary text-primary-foreground border-primary shadow-sm"
                              : "bg-background text-foreground border-border hover:border-primary/50"
                          }`}
                        >
                          {isSelected ? "✓ " : "+ "} {spec}
                        </button>
                      )
                    })}
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Input
                      placeholder="Add another custom specialization (e.g. Ayurvedic, Urology)"
                      value={customSpec}
                      onChange={(e) => setCustomSpec(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault()
                          handleAddCustomSpec()
                        }
                      }}
                      className="h-11 rounded-xl text-sm"
                    />
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={handleAddCustomSpec}
                      className="rounded-xl font-bold text-xs px-4"
                    >
                      Add
                    </Button>
                  </div>

                  {formData.specializations.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-2">
                      {formData.specializations.map((spec) => (
                        <span key={spec} className="inline-flex items-center gap-1.5 bg-primary/10 text-primary px-3 py-1 rounded-xl text-xs font-bold border border-primary/20">
                          {spec}
                          <button
                            type="button"
                            onClick={() => handleRemoveSpec(spec)}
                            className="hover:text-destructive font-bold ml-1 text-sm leading-none"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Modules Toggles */}
                <div className="grid sm:grid-cols-2 gap-4 pt-4 border-t">
                  <label className="flex items-center gap-3 p-4 bg-background border rounded-2xl cursor-pointer hover:border-primary/50 transition-colors shadow-sm">
                    <input
                      type="checkbox"
                      checked={formData.receptionistEnabled}
                      onChange={(e) => setFormData({ ...formData, receptionistEnabled: e.target.checked })}
                      className="w-5 h-5 accent-primary rounded cursor-pointer"
                    />
                    <div>
                      <p className="font-bold text-sm flex items-center gap-1.5">
                        <Users className="w-4 h-4 text-blue-500" /> Receptionist Desk Module
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Manage front-desk staff, token queues, and walk-in check-ins.
                      </p>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-4 bg-background border rounded-2xl cursor-pointer hover:border-primary/50 transition-colors shadow-sm">
                    <input
                      type="checkbox"
                      checked={formData.telemedicineEnabled}
                      onChange={(e) => setFormData({ ...formData, telemedicineEnabled: e.target.checked })}
                      className="w-5 h-5 accent-primary rounded cursor-pointer"
                    />
                    <div>
                      <p className="font-bold text-sm flex items-center gap-1.5">
                        <Video className="w-4 h-4 text-emerald-500" /> Telemedicine & Video Calls
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Allow online video appointments and remote digital triage.
                      </p>
                    </div>
                  </label>
                </div>

                {/* Working Hours */}
                <div className="bg-muted/40 border rounded-2xl p-4 space-y-3">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-primary" /> Operating Hours
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-muted-foreground">Opening Time</label>
                      <Input
                        value={formData.workingHours.open}
                        onChange={(e) => setFormData({
                          ...formData,
                          workingHours: { ...formData.workingHours, open: e.target.value }
                        })}
                        className="h-10 rounded-xl text-xs font-semibold"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground">Closing Time</label>
                      <Input
                        value={formData.workingHours.close}
                        onChange={(e) => setFormData({
                          ...formData,
                          workingHours: { ...formData.workingHours, close: e.target.value }
                        })}
                        className="h-10 rounded-xl text-xs font-semibold"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4">
                  <Button 
                    type="button" 
                    variant="ghost" 
                    onClick={() => setStep(2)}
                    className="rounded-xl"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back
                  </Button>
                  <Button 
                    type="submit" 
                    size="lg" 
                    disabled={submitting}
                    className="rounded-2xl px-10 py-6 text-base font-bold gap-2 shadow-xl bg-gradient-to-r from-primary to-emerald-600 hover:from-primary/90 hover:to-emerald-600/90 text-white"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" /> Registering & Saving to Database...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-5 h-5" /> Complete Registration & Open Dashboard
                      </>
                    )}
                  </Button>
                </div>
              </motion.div>
            )}

          </form>
        </div>

        {/* Value Proposition Highlights */}
        <div className="grid md:grid-cols-3 gap-6 pt-4">
          <div className="bg-card border rounded-2xl p-5 shadow-sm space-y-2">
            <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
              📍
            </div>
            <h4 className="font-bold text-sm">Real-time Map Discovery</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Patients in your city and surrounding regions instantly find your facility via GPS proximity mapping.
            </p>
          </div>

          <div className="bg-card border rounded-2xl p-5 shadow-sm space-y-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold">
              👨‍⚕️
            </div>
            <h4 className="font-bold text-sm">Doctor & Staff Partitioning</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Add multiple specialists, assign receptionist desks, and track schedules from your organization portal.
            </p>
          </div>

          <div className="bg-card border rounded-2xl p-5 shadow-sm space-y-2">
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center font-bold">
              ⚡
            </div>
            <h4 className="font-bold text-sm">Instant Verified Bookings</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Accept both physical clinic visits and telemedicine video appointments with automated patient notifications.
            </p>
          </div>
        </div>

      </div>
    </div>
  )
}
