import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Building, MapPin, CheckCircle, ArrowLeft, KeyRound, Phone, Mail, Stethoscope, Video, Users } from "lucide-react"
import { Button } from "../../../components/ui/button"
import { Input } from "../../../components/ui/input"
import { adminService } from "../../../lib/admin/admin-service"
import { toast } from "react-hot-toast"

export default function AddOrganizationPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState({
    name: "",
    type: "Hospital",
    city: "Ahmedabad",
    address: "",
    contact: "",
    email: "",
    password: "password123",
    receptionistEnabled: true,
    telemedicineEnabled: true,
    specializations: ["General Medicine", "Cardiology"]
  })

  const [specInput, setSpecInput] = useState("")

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement
    if (type === "checkbox") {
      setFormData(prev => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }))
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
  }

  const handleAddSpec = () => {
    if (specInput.trim() && !formData.specializations.includes(specInput.trim())) {
      setFormData(prev => ({ ...prev, specializations: [...prev.specializations, specInput.trim()] }))
      setSpecInput("")
    }
  }

  const handleRemoveSpec = (spec: string) => {
    setFormData(prev => ({ ...prev, specializations: prev.specializations.filter(s => s !== spec) }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim()) {
      toast.error("Organization Name is required")
      return
    }
    if (!formData.email.trim()) {
      toast.error("Contact Email (for login) is required")
      return
    }

    setLoading(true)
    try {
      await adminService.createOrganization({
        name: formData.name.trim(),
        type: formData.type,
        city: formData.city.trim(),
        address: formData.address.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.contact.trim(),
        password: formData.password || "password123",
        receptionistEnabled: formData.receptionistEnabled,
        telemedicineEnabled: formData.telemedicineEnabled,
        specializations: formData.specializations
      })
      toast.success("Organization created successfully! Login active with " + formData.email)
      navigate("/admin/organizations")
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || "Failed to create organization")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-6 animate-in fade-in">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => navigate("/admin/organizations")}
          className="w-10 h-10 rounded-full bg-card border flex items-center justify-center hover:bg-muted transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-3xl font-bold font-heading">Add Healthcare Organization</h1>
          <p className="text-sm text-muted-foreground">Register facility, create organization login, and partition data.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Facility Info */}
        <div className="bg-card border rounded-3xl p-6 sm:p-8 shadow-sm space-y-5">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Building className="w-5 h-5 text-primary" /> Facility Profile
          </h2>

          <div className="grid md:grid-cols-2 gap-5">
            <div className="md:col-span-2 space-y-1.5">
              <label className="text-sm font-semibold text-muted-foreground">Organization / Hospital Name *</label>
              <Input 
                name="name" 
                value={formData.name} 
                onChange={handleChange} 
                placeholder="e.g. Shalby Multi-Specialty Hospital" 
                required 
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-muted-foreground">Facility Type</label>
              <select 
                name="type" 
                value={formData.type} 
                onChange={handleChange}
                className="w-full bg-background border rounded-xl px-3 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 ring-primary"
              >
                <option value="Hospital">Hospital</option>
                <option value="Clinic">Clinic</option>
                <option value="Healthcare Center">Healthcare Center</option>
                <option value="Specialty Clinic">Specialty Clinic</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-muted-foreground">City *</label>
              <Input 
                name="city" 
                value={formData.city} 
                onChange={handleChange} 
                placeholder="e.g. Ahmedabad" 
                required 
              />
            </div>

            <div className="md:col-span-2 space-y-1.5">
              <label className="text-sm font-semibold text-muted-foreground">Street Address</label>
              <Input 
                name="address" 
                value={formData.address} 
                onChange={handleChange} 
                placeholder="e.g. Opp. Karnavati Club, SG Highway" 
              />
            </div>

            <div className="md:col-span-2 bg-muted/40 border border-dashed rounded-2xl p-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-muted-foreground">GPS Coordinates (Auto-calculated / Current Location)</span>
                <button
                  type="button"
                  onClick={() => {
                    if (navigator.geolocation) {
                      navigator.geolocation.getCurrentPosition(
                        (pos) => {
                          const lat = Math.round(pos.coords.latitude * 10000) / 10000
                          const lng = Math.round(pos.coords.longitude * 10000) / 10000
                          setFormData(prev => ({ ...prev, lat, lng } as any))
                          toast.success(`Location set: ${lat}, ${lng}`)
                        },
                        (err) => toast.error("Could not fetch GPS: " + err.message)
                      )
                    }
                  }}
                  className="text-xs font-bold text-primary hover:underline"
                >
                  📍 Detect Current Location
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Login & Contact Credentials */}
        <div className="bg-card border rounded-3xl p-6 sm:p-8 shadow-sm space-y-5">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-emerald-500" /> Organization Login Credentials
          </h2>
          <p className="text-xs text-muted-foreground">The organization will use this email and password to log in at /login.</p>

          <div className="grid md:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-muted-foreground">Login / Contact Email *</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
                <Input 
                  name="email" 
                  type="email"
                  value={formData.email} 
                  onChange={handleChange} 
                  placeholder="contact@hospital.org" 
                  className="pl-10"
                  required 
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-muted-foreground">Login Password</label>
              <Input 
                name="password" 
                type="text"
                value={formData.password} 
                onChange={handleChange} 
                placeholder="password123" 
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-muted-foreground">Contact Phone</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
                <Input 
                  name="contact" 
                  value={formData.contact} 
                  onChange={handleChange} 
                  placeholder="+91 79 2630 1100" 
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Specializations & Features */}
        <div className="bg-card border rounded-3xl p-6 sm:p-8 shadow-sm space-y-5">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Stethoscope className="w-5 h-5 text-primary" /> Specializations & Modules
          </h2>

          <div className="space-y-3">
            <label className="text-sm font-semibold text-muted-foreground">Clinical Departments</label>
            <div className="flex gap-2">
              <Input 
                value={specInput}
                onChange={e => setSpecInput(e.target.value)}
                placeholder="e.g. Neurology, Oncology, Orthopedics"
                onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); handleAddSpec() } }}
              />
              <Button type="button" variant="outline" onClick={handleAddSpec}>Add</Button>
            </div>
            <div className="flex flex-wrap gap-2 pt-2">
              {formData.specializations.map(spec => (
                <span key={spec} className="inline-flex items-center gap-1.5 bg-primary/10 text-primary px-3 py-1 rounded-xl text-xs font-bold">
                  {spec}
                  <button type="button" onClick={() => handleRemoveSpec(spec)} className="hover:text-destructive text-sm leading-none font-bold">×</button>
                </span>
              ))}
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 pt-4 border-t">
            <label className="flex items-center gap-3 p-4 bg-background border rounded-2xl cursor-pointer hover:border-primary/50 transition-colors">
              <input 
                type="checkbox"
                name="receptionistEnabled"
                checked={formData.receptionistEnabled}
                onChange={handleChange}
                className="w-5 h-5 accent-primary rounded"
              />
              <div>
                <p className="font-bold text-sm">Receptionist Desk</p>
                <p className="text-xs text-muted-foreground">Enable front-desk staff management.</p>
              </div>
            </label>

            <label className="flex items-center gap-3 p-4 bg-background border rounded-2xl cursor-pointer hover:border-primary/50 transition-colors">
              <input 
                type="checkbox"
                name="telemedicineEnabled"
                checked={formData.telemedicineEnabled}
                onChange={handleChange}
                className="w-5 h-5 accent-primary rounded"
              />
              <div>
                <p className="font-bold text-sm">Telemedicine Consultations</p>
                <p className="text-xs text-muted-foreground">Allow video/online appointments.</p>
              </div>
            </label>
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="ghost" onClick={() => navigate("/admin/organizations")}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading} className="px-8 py-6 rounded-2xl text-lg font-bold shadow-md">
            {loading ? "Creating Organization..." : "Create & Activate Organization"}
          </Button>
        </div>
      </form>
    </div>
  )
}
