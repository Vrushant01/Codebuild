import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Building, MapPin, CheckCircle, ArrowLeft } from "lucide-react"
import { Button } from "../../../components/ui/button"
import { Input } from "../../../components/ui/input"
import { toast } from "react-hot-toast"

export default function AddOrganizationPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)

  // Mock Form State
  const [formData, setFormData] = useState({
    name: "",
    type: "Clinic",
    city: "",
    address: "",
    contact: "",
    email: ""
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleNext = () => setStep(s => s + 1)
  const handleBack = () => setStep(s => s - 1)

  const handleSubmit = async () => {
    setLoading(true)
    // Mock save delay
    await new Promise(resolve => setTimeout(resolve, 800))
    setLoading(false)
    toast.success("Organization submitted for review.")
    navigate("/admin/organizations")
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-3xl mx-auto space-y-6 animate-in fade-in">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => navigate("/admin/organizations")}
          className="w-10 h-10 rounded-full bg-card border flex items-center justify-center hover:bg-muted transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold font-heading">Add Organization</h1>
          <p className="text-sm text-muted-foreground">Register a new healthcare facility</p>
        </div>
      </div>

      <div className="flex gap-2 mb-8">
        {[1, 2, 3, 4, 5].map((s) => (
          <div 
            key={s} 
            className={`h-2 flex-1 rounded-full ${s <= step ? 'bg-primary' : 'bg-muted'}`}
          />
        ))}
      </div>

      <div className="bg-card border rounded-3xl p-6 shadow-sm">
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="font-bold text-xl mb-4">Organization Details</h2>
            <div className="space-y-2">
              <label className="text-sm font-medium">Organization Name</label>
              <Input name="name" value={formData.name} onChange={handleChange} placeholder="e.g. CityCare Clinic" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Type</label>
              <select 
                name="type" 
                value={formData.type} 
                onChange={handleChange}
                className="w-full bg-background border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 ring-primary"
              >
                <option value="Clinic">Clinic</option>
                <option value="Hospital">Hospital</option>
                <option value="Healthcare Organization">Healthcare Organization</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">City</label>
              <Input name="city" value={formData.city} onChange={handleChange} placeholder="e.g. Ahmedabad" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Full Address</label>
              <Input name="address" value={formData.address} onChange={handleChange} placeholder="Street address" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Contact Number</label>
              <Input name="contact" value={formData.contact} onChange={handleChange} placeholder="+91" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Email Address</label>
              <Input name="email" value={formData.email} onChange={handleChange} type="email" placeholder="contact@example.com" />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4 text-center py-8">
            <h2 className="font-bold text-xl mb-2">Doctors</h2>
            <p className="text-muted-foreground text-sm mb-6">Would you like to associate doctors with this organization now?</p>
            <div className="bg-muted/50 rounded-2xl p-6 mb-4">
              <p className="text-sm text-muted-foreground">Mock Flow: Skip adding specific doctors.</p>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4 text-center py-8">
            <h2 className="font-bold text-xl mb-2">Schedule & Telemedicine</h2>
            <p className="text-muted-foreground text-sm mb-6">Configure the operating hours and telemedicine capabilities.</p>
            <div className="bg-muted/50 rounded-2xl p-6 mb-4">
              <p className="text-sm text-muted-foreground">Mock Flow: Default 9 AM - 6 PM schedule applied.</p>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4 text-center py-8">
            <h2 className="font-bold text-xl mb-2">Receptionist Configuration</h2>
            <p className="text-muted-foreground text-sm mb-6">Does this organization have a receptionist?</p>
            <div className="bg-muted/50 rounded-2xl p-6 mb-4">
              <p className="text-sm text-muted-foreground">Mock Flow: Receptionist role disabled for now.</p>
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="space-y-6">
            <div className="text-center">
              <CheckCircle className="w-12 h-12 text-primary mx-auto mb-4" />
              <h2 className="font-bold text-xl mb-2">Review & Submit</h2>
              <p className="text-muted-foreground text-sm">Please review the details before submitting. The organization will be set to PENDING status.</p>
            </div>
            
            <div className="bg-muted/30 border rounded-2xl p-4 space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Name</span>
                <span className="font-medium">{formData.name || "-"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Type</span>
                <span className="font-medium">{formData.type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Location</span>
                <span className="font-medium">{formData.city || "-"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Contact</span>
                <span className="font-medium">{formData.contact || "-"}</span>
              </div>
            </div>
          </div>
        )}

        <div className="mt-8 flex justify-between">
          <Button variant="ghost" onClick={step === 1 ? () => navigate("/admin/organizations") : handleBack}>
            {step === 1 ? "Cancel" : "Back"}
          </Button>
          {step < 5 ? (
            <Button onClick={handleNext}>Next Step</Button>
          ) : (
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? "Creating..." : "Create Organization"}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
