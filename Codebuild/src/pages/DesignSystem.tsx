import React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
// Removed unused card imports
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DoctorCard, AppointmentCard } from "@/components/healthcare/cards"
import { StatusBadge, SymptomChip, LocationBadge, ConsultationTypeBadge } from "@/components/healthcare/badges"
// removed auth context

const mockDoctor = {
  id: "doc_1",
  name: "Sarah Chen",
  specialization: "Cardiologist",
  location: "New York Medical Center",
  rating: 4.9,
  reviews: 128,
  availableNext: "Today, 2:00 PM"
}

const mockAppointment = {
  id: "app_1",
  doctor: mockDoctor,
  date: "2026-10-15",
  time: "10:30 AM",
  status: "CONFIRMED",
  type: "TELEMEDICINE" as const
}

export default function DesignSystem() {
  const [role, setRole] = React.useState("PATIENT")
  
  return (
    <div className="space-y-12 pb-12">
      <div>
        <h1 className="text-4xl font-heading font-bold tracking-tight mb-2">Medireach Design System</h1>
        <p className="text-muted-foreground text-lg">A premium, highly accessible component library.</p>
        
        <div className="mt-6 flex items-center gap-4 p-4 bg-muted/50 rounded-xl border border-border">
          <span className="text-sm font-medium">Switch Role view:</span>
          <select 
            className="p-2 rounded-md border border-input bg-background"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="PATIENT">Patient</option>
            <option value="DOCTOR">Doctor</option>
            <option value="RECEPTIONIST">Receptionist</option>
            <option value="ADMIN">Admin</option>
          </select>
        </div>
      </div>

      <section>
        <h2 className="text-2xl font-heading font-semibold border-b pb-2 mb-6">Colors & Brand</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="space-y-2">
            <div className="h-24 rounded-xl bg-primary border border-border shadow-sm"></div>
            <p className="text-sm font-medium">Primary</p>
          </div>
          <div className="space-y-2">
            <div className="h-24 rounded-xl bg-secondary border border-border shadow-sm"></div>
            <p className="text-sm font-medium">Secondary</p>
          </div>
          <div className="space-y-2">
            <div className="h-24 rounded-xl bg-muted border border-border shadow-sm"></div>
            <p className="text-sm font-medium">Muted</p>
          </div>
          <div className="space-y-2">
            <div className="h-24 rounded-xl bg-accent border border-border shadow-sm"></div>
            <p className="text-sm font-medium">Accent</p>
          </div>
          <div className="space-y-2">
            <div className="h-24 rounded-xl bg-background border border-border shadow-sm"></div>
            <p className="text-sm font-medium">Background</p>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-heading font-semibold border-b pb-2 mb-6">Typography</h2>
        <div className="space-y-6">
          <div>
            <h1 className="text-4xl font-heading font-bold">Heading 1 (Outfit)</h1>
            <p className="text-sm text-muted-foreground mt-1">Used for page titles and major sections.</p>
          </div>
          <div>
            <h2 className="text-3xl font-heading font-semibold">Heading 2 (Outfit)</h2>
            <p className="text-sm text-muted-foreground mt-1">Used for sub-sections.</p>
          </div>
          <div>
            <h3 className="text-2xl font-heading font-medium">Heading 3 (Outfit)</h3>
          </div>
          <div>
            <p className="text-base text-foreground font-sans">
              Body text (Inter). This is used for all general paragraph text, descriptions, and long-form content. 
              It prioritizes readability and accessibility in healthcare contexts.
            </p>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-heading font-semibold border-b pb-2 mb-6">Core Components</h2>
        <Tabs defaultValue="buttons" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="buttons">Buttons</TabsTrigger>
            <TabsTrigger value="inputs">Inputs</TabsTrigger>
            <TabsTrigger value="badges">Badges</TabsTrigger>
          </TabsList>
          <TabsContent value="buttons" className="space-y-4">
            <div className="flex flex-wrap gap-4 items-center">
              <Button>Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="destructive">Destructive</Button>
            </div>
            <div className="flex flex-wrap gap-4 items-center">
              <Button size="sm">Small</Button>
              <Button size="default">Default</Button>
              <Button size="lg">Large</Button>
            </div>
          </TabsContent>
          <TabsContent value="inputs" className="space-y-4">
            <div className="max-w-sm space-y-4">
              <Input placeholder="Default input" />
              <Input placeholder="Disabled input" disabled />
              <Input type="email" placeholder="Email address" />
            </div>
          </TabsContent>
          <TabsContent value="badges" className="space-y-4">
            <div className="flex flex-wrap gap-4 items-center">
              <Badge>Default</Badge>
              <Badge variant="secondary">Secondary</Badge>
              <Badge variant="outline">Outline</Badge>
              <Badge variant="destructive">Destructive</Badge>
            </div>
          </TabsContent>
        </Tabs>
      </section>

      <section>
        <h2 className="text-2xl font-heading font-semibold border-b pb-2 mb-6">Healthcare Components</h2>
        
        <div className="space-y-8">
          <div>
            <h3 className="text-lg font-medium mb-4">Domain Chips & Badges</h3>
            <div className="flex flex-wrap gap-4 items-center">
              <StatusBadge status="CONFIRMED" />
              <StatusBadge status="PENDING" />
              <StatusBadge status="CANCELLED" />
              <SymptomChip symptom="Headache" />
              <SymptomChip symptom="Fever" />
              <ConsultationTypeBadge type="TELEMEDICINE" />
              <ConsultationTypeBadge type="IN_PERSON" />
              <LocationBadge location="Downtown Clinic" distance="2.4 mi" />
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-4">Doctor Card</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <DoctorCard doctor={mockDoctor} />
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-4">Appointment Card</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AppointmentCard appointment={mockAppointment} />
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
