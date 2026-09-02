import React from "react"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { SpecializationChip, LocationBadge, StatusBadge, ConsultationTypeBadge } from "./badges"
import { Calendar, Clock, Star } from "lucide-react"

export interface Doctor {
  id: string;
  name: string;
  specialization: string;
  location: string;
  rating: number;
  reviews: number;
  imageUrl?: string;
  availableNext?: string;
}

export function DoctorCard({ doctor }: { doctor: Doctor }) {
  return (
    <Card className="hover:soft-shadow transition-all duration-300 overflow-hidden group border-border/50">
      <CardContent className="p-5">
        <div className="flex gap-4">
          <Avatar className="w-16 h-16 border-2 border-primary/10">
            <AvatarImage src={doctor.imageUrl} alt={doctor.name} />
            <AvatarFallback className="bg-primary/5 text-primary text-lg font-semibold">
              {doctor.name.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-1.5">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-heading font-semibold text-lg text-foreground group-hover:text-primary transition-colors">
                  {doctor.name}
                </h3>
                <SpecializationChip spec={doctor.specialization} />
              </div>
              <div className="flex items-center text-sm font-medium">
                <Star className="w-4 h-4 text-warning fill-warning mr-1" />
                {doctor.rating} <span className="text-muted-foreground font-normal ml-1">({doctor.reviews})</span>
              </div>
            </div>
            <LocationBadge location={doctor.location} />
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-4 bg-muted/30 border-t border-border/50 flex justify-between items-center">
        <div className="text-sm">
          <span className="text-muted-foreground">Next available: </span>
          <span className="font-medium text-foreground">{doctor.availableNext || "Today"}</span>
        </div>
        <Button variant="default" size="sm" className="rounded-full px-5">Book</Button>
      </CardFooter>
    </Card>
  )
}

export interface Appointment {
  id: string;
  doctor: Doctor;
  date: string;
  time: string;
  status: string;
  type: "TELEMEDICINE" | "IN_PERSON";
}

export function AppointmentCard({ appointment }: { appointment: Appointment }) {
  return (
    <Card className="border-l-4 border-l-primary hover:soft-shadow transition-shadow">
      <CardContent className="p-5">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-3 rounded-2xl text-primary flex flex-col items-center justify-center min-w-16">
              <span className="text-xs font-semibold uppercase">{new Date(appointment.date).toLocaleString('default', { month: 'short' })}</span>
              <span className="text-xl font-heading font-bold leading-none">{new Date(appointment.date).getDate()}</span>
            </div>
            <div>
              <h4 className="font-medium text-foreground">Dr. {appointment.doctor.name}</h4>
              <p className="text-sm text-muted-foreground">{appointment.doctor.specialization}</p>
            </div>
          </div>
          <StatusBadge status={appointment.status} />
        </div>
        
        <div className="grid grid-cols-2 gap-3 pt-4 border-t border-border/60">
          <div className="flex items-center text-sm text-muted-foreground">
            <Clock className="w-4 h-4 mr-2 text-primary/70" />
            {appointment.time}
          </div>
          <ConsultationTypeBadge type={appointment.type} />
        </div>
      </CardContent>
      
      {appointment.status === "PENDING" || appointment.status === "CONFIRMED" ? (
        <CardFooter className="p-4 pt-0 flex gap-3">
          <Button variant="outline" className="w-full">Reschedule</Button>
          <Button variant="default" className="w-full">Join Call</Button>
        </CardFooter>
      ) : null}
    </Card>
  )
}
