import React, { useState, useEffect } from "react"
import { organizationService } from "../../lib/organization/organization-service"
import type { Doctor } from "../../lib/healthcare/types"
import { Clock, Calendar, ShieldAlert } from "lucide-react"

export default function ReceptionistSchedulePage() {
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadDoctors = async () => {
      setLoading(true)
      const docs = await organizationService.getDoctors()
      setDoctors(docs)
      setLoading(false)
    }
    loadDoctors()
  }, [])

  if (loading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 space-y-4 animate-pulse">
        <div className="h-20 bg-muted rounded-3xl mb-8" />
        {[1,2,3].map(i => <div key={i} className="h-48 bg-muted rounded-3xl" />)}
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto animate-in fade-in">
      
      <div className="mb-8">
        <h1 className="text-3xl font-heading font-bold">Doctor Availability</h1>
        <p className="text-muted-foreground mt-1">View the schedule of providers in your facility.</p>
        
        <div className="mt-4 p-4 bg-muted/50 border rounded-2xl flex gap-3 text-sm text-muted-foreground">
          <ShieldAlert className="w-5 h-5 shrink-0" />
          <p>
            <strong>Note:</strong> Frontend availability shown here is for visualization purposes only. 
            The system backend will definitively verify slot availability during booking to prevent double-booking.
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {doctors.map(doctor => (
          <div key={doctor.id} className="bg-card border rounded-3xl overflow-hidden shadow-sm">
            <div className="bg-muted/30 p-6 border-b flex flex-col sm:flex-row justify-between sm:items-center gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full overflow-hidden bg-primary/10">
                  {doctor.image ? (
                    <img src={doctor.image} alt={doctor.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center font-bold text-primary text-xl">
                      {doctor.name.charAt(0)}
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-lg">{doctor.name}</h3>
                  <p className="text-sm text-muted-foreground">{doctor.specialization}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <p className="text-xs font-bold uppercase text-muted-foreground mb-1">Status</p>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                    doctor.availability.status === 'available' ? 'bg-emerald-100 text-emerald-700' :
                    doctor.availability.status === 'limited' ? 'bg-amber-100 text-amber-700' :
                    'bg-destructive/10 text-destructive'
                  }`}>
                    {doctor.availability.status}
                  </span>
                </div>
                <div className="text-center">
                  <p className="text-xs font-bold uppercase text-muted-foreground mb-1">Next Slot</p>
                  <p className="text-sm font-semibold">{doctor.availability.nextAvailable}</p>
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="flex items-center gap-2 mb-4 text-sm font-bold">
                <Calendar className="w-4 h-4 text-primary" /> Today's Schedule Overview
              </div>
              <div className="flex flex-wrap gap-3">
                {/* Mocking some slots for demonstration */}
                <div className="px-3 py-2 rounded-xl text-sm font-medium border bg-muted/20 text-muted-foreground line-through">09:00 AM (Booked)</div>
                <div className="px-3 py-2 rounded-xl text-sm font-medium border bg-primary/10 border-primary/20 text-primary">09:30 AM (Available)</div>
                <div className="px-3 py-2 rounded-xl text-sm font-medium border bg-muted/20 text-muted-foreground line-through">10:00 AM (Booked)</div>
                <div className="px-3 py-2 rounded-xl text-sm font-medium border bg-primary/10 border-primary/20 text-primary">10:30 AM (Available)</div>
                <div className="px-3 py-2 rounded-xl text-sm font-medium border bg-amber-50 border-amber-200 text-amber-700">11:00 AM (Break)</div>
                <div className="px-3 py-2 rounded-xl text-sm font-medium border bg-primary/10 border-primary/20 text-primary">11:30 AM (Available)</div>
                <div className="px-3 py-2 rounded-xl text-sm font-medium border bg-muted/20 text-muted-foreground line-through">12:00 PM (Booked)</div>
              </div>
            </div>
          </div>
        ))}
      </div>

    </div>
  )
}
