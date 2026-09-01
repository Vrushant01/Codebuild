import React, { useEffect, useState } from "react"
import type { Organization, Doctor, Review } from "../../lib/healthcare/types"
import { healthcareService } from "../../lib/healthcare/healthcare-service"
import { X, MapPin, Star, Building2, Stethoscope, Clock, Phone, Navigation } from "lucide-react"
import { DoctorCard } from "./DoctorCard"
import { Button } from "../ui/button"

interface OrganizationDetailSheetProps {
  organizationId: string | null
  onClose: () => void
  onDoctorSelect: (doctorId: string) => void
}

export function OrganizationDetailSheet({ organizationId, onClose, onDoctorSelect }: OrganizationDetailSheetProps) {
  const [org, setOrg] = useState<Organization | null>(null)
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!organizationId) {
      setOrg(null)
      return
    }

    const loadData = async () => {
      setLoading(true)
      const fetchedOrg = await healthcareService.getOrganization(organizationId)
      if (fetchedOrg) {
        setOrg(fetchedOrg)
        const [docs, revs] = await Promise.all([
          healthcareService.getDoctorsByOrganization(organizationId),
          healthcareService.getReviews(organizationId, "organization")
        ])
        setDoctors(docs)
        setReviews(revs)
      }
      setLoading(false)
    }

    loadData()
  }, [organizationId])

  if (!organizationId) return null

  return (
    <div className="absolute inset-0 z-50 bg-background/80 backdrop-blur-sm flex justify-end animate-in fade-in">
      <div className="w-full md:w-[480px] lg:w-[500px] h-full bg-background border-l shadow-2xl flex flex-col animate-in slide-in-from-right-8 duration-300 overflow-hidden">
        
        {/* Header Action */}
        <div className="flex items-center justify-between px-4 py-3 border-b bg-background/95 backdrop-blur z-10">
          <button 
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-muted transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto pb-20">
          {loading ? (
            <div className="p-8 space-y-4">
              <div className="h-8 w-2/3 bg-muted animate-pulse rounded-md" />
              <div className="h-4 w-1/2 bg-muted animate-pulse rounded-md" />
              <div className="h-32 w-full bg-muted animate-pulse rounded-xl mt-8" />
            </div>
          ) : org ? (
            <div className="flex flex-col">
              
              {/* Organization Hero */}
              <div className="px-6 py-8 bg-muted/30 border-b">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-3">
                  {org.type === "Hospital" ? <Building2 className="w-4 h-4" /> : <Stethoscope className="w-4 h-4" />}
                  {org.type}
                </div>
                
                <h2 className="text-2xl sm:text-3xl font-heading font-bold text-foreground leading-tight">
                  {org.name}
                </h2>
                
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1.5 text-foreground">
                    <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                    <span className="font-semibold">{org.rating}</span>
                    <span className="text-muted-foreground underline decoration-dotted underline-offset-4 cursor-help">
                      ({org.reviewCount} reviews)
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4" />
                    {org.address}, {org.city}
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap gap-2">
                  {org.specializations.map(spec => (
                    <span key={spec} className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-semibold">
                      {spec}
                    </span>
                  ))}
                </div>

                <div className="mt-8 flex gap-3">
                  <Button className="flex-1 shadow-sm">Book Appointment</Button>
                  <Button variant="outline" className="px-4">
                    <Navigation className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Doctors Section */}
              <div className="px-6 py-8 border-b">
                <h3 className="text-lg font-heading font-bold mb-4 flex items-center gap-2">
                  <Stethoscope className="w-5 h-5 text-primary" />
                  Doctors ({doctors.length})
                </h3>
                <div className="flex flex-col gap-4">
                  {doctors.map(doc => (
                    <DoctorCard 
                      key={doc.id} 
                      doctor={doc} 
                      onActionClick={() => onDoctorSelect(doc.id)} 
                    />
                  ))}
                </div>
              </div>

              {/* Info & Working Hours */}
              <div className="px-6 py-8">
                <h3 className="text-lg font-heading font-bold mb-4">Information</h3>
                <div className="space-y-4">
                  <div className="flex gap-3 text-sm">
                    <Clock className="w-5 h-5 text-muted-foreground shrink-0" />
                    <div className="flex-1">
                      <div className="font-medium mb-2">Working Hours</div>
                      <div className="grid grid-cols-2 gap-y-2 text-muted-foreground text-xs">
                        {Object.entries(org.workingHours).map(([day, hours]) => (
                          <React.Fragment key={day}>
                            <div>{day}</div>
                            <div className="text-right font-medium text-foreground">{hours}</div>
                          </React.Fragment>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-3 text-sm">
                    <Phone className="w-5 h-5 text-muted-foreground shrink-0" />
                    <div className="flex-1">
                      <div className="font-medium">Contact</div>
                      <div className="text-muted-foreground mt-1">{org.contact}</div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          ) : (
            <div className="p-8 text-center text-muted-foreground">Organization not found.</div>
          )}
        </div>
      </div>
    </div>
  )
}
