import React from "react"
import { Building, MapPin, Phone, Mail, Globe, Users } from "lucide-react"

export default function ReceptionistOrganizationPage() {
  
  // Using Mock Data directly as receptionist only views
  const organization = {
    id: "ORG-4C82K1",
    name: "CityCare Clinic",
    type: "Multi-specialty Clinic",
    address: "123 Healthcare Avenue, Navrangpura",
    city: "Ahmedabad",
    contact: "+91 79 1234 5678",
    email: "contact@citycareclinic.demo",
    website: "www.citycareclinic.demo",
    description: "CityCare Clinic is a premier multi-specialty healthcare facility dedicated to providing advanced medical care with compassion and excellence."
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto animate-in fade-in space-y-8">
      
      <div>
        <h1 className="text-3xl font-heading font-bold">Facility Profile</h1>
        <p className="text-muted-foreground mt-1">View public information about your organization.</p>
      </div>

      <div className="bg-card border rounded-3xl p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start gap-6">
          <div className="w-24 h-24 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
            <Building className="w-12 h-12 text-primary" />
          </div>
          
          <div className="flex-1 space-y-4">
            <div>
              <h2 className="text-2xl font-bold">{organization.name}</h2>
              <p className="text-primary font-medium">{organization.type}</p>
            </div>
            
            <p className="text-muted-foreground leading-relaxed">{organization.description}</p>
            
            <div className="grid sm:grid-cols-2 gap-4 pt-4 border-t">
              <div className="flex items-center gap-3 text-sm">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                <span>{organization.address}, {organization.city}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Phone className="w-4 h-4 text-muted-foreground" />
                <span>{organization.contact}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <span>{organization.email}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Globe className="w-4 h-4 text-muted-foreground" />
                <a href="#" className="text-primary hover:underline">{organization.website}</a>
              </div>
            </div>
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
