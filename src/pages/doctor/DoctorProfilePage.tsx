import React from "react"
import { Building, ShieldCheck, Mail, Phone, Award } from "lucide-react"
import { DoctorReviews } from "../../components/reviews/DoctorReviews"

export default function DoctorProfilePage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto animate-in fade-in space-y-6">
      
      <div className="mb-4">
        <h1 className="text-3xl font-heading font-bold">Provider Profile</h1>
        <p className="text-muted-foreground mt-1">Manage your public information and credentials.</p>
      </div>

      {/* Main Identity */}
      <div className="bg-card border rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row gap-6 items-center sm:items-start text-center sm:text-left">
        <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-4xl shrink-0">
          AP
        </div>
        <div className="flex-1">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-1">
            <h2 className="text-2xl font-bold">Dr. Aarav Patel</h2>
            <span className="flex items-center justify-center gap-1 text-xs font-bold uppercase tracking-wider bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full w-fit mx-auto sm:mx-0">
              <ShieldCheck className="w-3.5 h-3.5" /> Verified
            </span>
          </div>
          <p className="text-lg font-medium text-primary mb-4">General Physician</p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-2 justify-center sm:justify-start">
              <Building className="w-4 h-4" /> CityCare Clinic, Surat
            </div>
            <div className="flex items-center gap-2 justify-center sm:justify-start">
              <Award className="w-4 h-4" /> 10 Years Experience
            </div>
            <div className="flex items-center gap-2 justify-center sm:justify-start">
              <Mail className="w-4 h-4" /> dr.patel@citycare.example
            </div>
            <div className="flex items-center gap-2 justify-center sm:justify-start">
              <Phone className="w-4 h-4" /> +91 1234567890
            </div>
          </div>
        </div>
      </div>

      <div className="bg-muted/50 p-6 rounded-3xl text-center border border-dashed">
        <p className="text-muted-foreground font-medium">Advanced profile editing will be available in a future update.</p>
      </div>
      
      {/* Doctor Reviews */}
      <div className="pt-4">
        <DoctorReviews doctorId="doctor-1" />
      </div>

    </div>
  )
}
