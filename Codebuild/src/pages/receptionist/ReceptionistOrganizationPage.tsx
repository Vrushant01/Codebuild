import React, { useState, useEffect } from "react"
import { Building, MapPin, Phone, Mail, Globe, Users, Stethoscope, UserCheck } from "lucide-react"
import { organizationService } from "../../lib/organization/organization-service"
import { apiClient } from "../../lib/api/apiClient"

export default function ReceptionistOrganizationPage() {
  const [organization, setOrganization] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadOrg = async () => {
      setLoading(true)
      try {
        const res = await apiClient.get<{ success: boolean; data: any }>("/organizations/me")
        if (res && res.data) {
          setOrganization(res.data)
        } else {
          const fallback = await organizationService.getOrganization()
          setOrganization(fallback)
        }
      } catch {
        const fallback = await organizationService.getOrganization()
        setOrganization(fallback)
      } finally {
        setLoading(false)
      }
    }
    loadOrg()
  }, [])

  if (loading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto animate-pulse space-y-6">
        <div className="h-10 w-48 bg-muted rounded-xl" />
        <div className="h-64 bg-muted rounded-3xl" />
      </div>
    )
  }

  const org = organization || {
    name: "Ahmedabad Multi-Specialty Hospital",
    type: "Hospital",
    address: "12 University Road, Navrangpura",
    city: "Ahmedabad",
    contact: { phone: "+91 79 2630 1100", email: "info@ahmedabadhospital.org" },
    website: "www.medireach.health",
    description: "Multi-specialty healthcare facility connected with MEDIREACH healthcare network."
  }

  const phoneStr = typeof org.contact === 'object' ? org.contact?.phone : (org.contact || org.phone || "+91 79 2630 1100")
  const emailStr = typeof org.contact === 'object' ? org.contact?.email : (org.email || "info@hospital.org")

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto animate-in fade-in space-y-8">
      
      <div>
        <h1 className="text-3xl font-heading font-bold">Facility Profile</h1>
        <p className="text-muted-foreground mt-1">Live information about your assigned healthcare facility.</p>
      </div>

      <div className="bg-card border rounded-3xl p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start gap-6">
          <div className="w-24 h-24 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
            <Building className="w-12 h-12 text-primary" />
          </div>
          
          <div className="flex-1 space-y-4">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-2xl font-bold">{org.name}</h2>
                <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 text-xs font-bold rounded-full">
                  {org.listingStatus || "ACTIVE"}
                </span>
              </div>
              <p className="text-primary font-medium mt-0.5">{org.type || "Multi-specialty Hospital"}</p>
            </div>
            
            <p className="text-muted-foreground leading-relaxed text-sm">
              {org.description || "Premier healthcare center dedicated to patient care and clinical excellence."}
            </p>
            
            <div className="grid sm:grid-cols-2 gap-4 pt-4 border-t">
              <div className="flex items-center gap-3 text-sm">
                <MapPin className="w-4 h-4 text-muted-foreground shrink-0" />
                <span>{org.address ? `${org.address}, ${org.city}` : org.city || "Ahmedabad"}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Phone className="w-4 h-4 text-primary shrink-0" />
                <span>{phoneStr}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Mail className="w-4 h-4 text-primary shrink-0" />
                <span>{emailStr}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Globe className="w-4 h-4 text-muted-foreground shrink-0" />
                <span className="text-primary">{org.website || "www.medireach.health"}</span>
              </div>
            </div>

            {/* Doctors & Staff Highlights */}
            {org.doctors && org.doctors.length > 0 && (
              <div className="pt-4 border-t space-y-2">
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Stethoscope className="w-3.5 h-3.5 text-primary" /> Active Doctors in Facility ({org.doctors.length})
                </p>
                <div className="flex flex-wrap gap-2">
                  {org.doctors.map((doc: any) => (
                    <span key={doc.id || doc._id} className="px-3 py-1 bg-muted rounded-xl text-xs font-semibold">
                      {doc.name} • {doc.specialization}
                    </span>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>
      </div>

      <div className="bg-muted/50 border rounded-3xl p-6 text-center text-sm text-muted-foreground">
        <Users className="w-6 h-6 mx-auto mb-2 opacity-50" />
        <p>Organization administration (adding doctors, updating credentials, billing) is handled by the facility Administrator.</p>
      </div>

    </div>
  )
}
