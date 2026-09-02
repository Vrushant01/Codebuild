import React, { useState, useEffect, useMemo } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { AppointmentTabs } from "../../components/appointments/AppointmentTabs"
import type { AppointmentTab } from "../../components/appointments/AppointmentTabs"
import { AppointmentCard } from "../../components/appointments/AppointmentCard"
import { NextAppointmentWidget } from "../../components/appointments/NextAppointmentWidget"
import { AppointmentDetailPanel } from "../../components/appointments/AppointmentDetailPanel"
import { appointmentService } from "../../lib/booking/appointment-service"
import type { Appointment } from "../../lib/booking/appointment-types"
import { CalendarX2, ArrowRight } from "lucide-react"
import { Button } from "../../components/ui/button"

export default function PatientAppointmentHub() {
  const { appointmentId } = useParams<{ appointmentId: string }>()
  const navigate = useNavigate()
  
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [activeTab, setActiveTab] = useState<AppointmentTab>("Upcoming")
  const [loading, setLoading] = useState(true)

  const loadAppointments = async () => {
    setLoading(true)
    try {
      const data = await appointmentService.getAppointments()
      setAppointments(data)
    } catch (err) {
      console.error("Failed to load appointments", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAppointments()
  }, [])

  // Derived state based on tabs
  const upcoming = useMemo(() => appointments.filter(a => a.status === "ACCEPTED" || a.status === "CONFIRMED").sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()), [appointments])
  const pending = useMemo(() => appointments.filter(a => a.status === "PENDING"), [appointments])
  const completed = useMemo(() => appointments.filter(a => a.status === "COMPLETED"), [appointments])
  const cancelled = useMemo(() => appointments.filter(a => a.status === "CANCELLED" || a.status === "REJECTED"), [appointments])

  const counts = {
    Upcoming: upcoming.length,
    Pending: pending.length,
    Completed: completed.length,
    Cancelled: cancelled.length
  }

  const activeList = activeTab === "Upcoming" ? upcoming 
                   : activeTab === "Pending" ? pending 
                   : activeTab === "Completed" ? completed 
                   : cancelled

  const selectedAppointment = appointments.find(a => a.id === appointmentId)
  const nextAppointment = upcoming.length > 0 ? upcoming[0] : null

  const handleSelectAppointment = (id: string) => {
    const apt = appointments.find(a => a.id === id)
    const isToday = apt && new Date(apt.date).toDateString() === new Date().toDateString()
    
    if (apt?.consultationType === "Online" && isToday && apt?.status === "CONFIRMED") {
      navigate(`/telemedicine/${id}`)
    } else {
      navigate(`/app/patient/appointments/${id}`)
    }
  }

  const handleCloseDetail = () => {
    navigate(`/app/patient/appointments`)
  }

  return (
    <div className="flex h-[calc(100vh-65px)] bg-background lg:bg-muted/30 overflow-hidden">
      
      {/* LEFT COLUMN: List */}
      <div className={`flex flex-col w-full lg:w-[450px] xl:w-[500px] shrink-0 bg-background lg:border-r transition-all duration-300 ${selectedAppointment ? 'hidden lg:flex' : 'flex'}`}>
        
        {/* Header */}
        <div className="p-5 sm:px-6 pt-6 sm:pt-8 pb-4">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-2xl sm:text-3xl font-heading font-bold text-foreground">Appointments</h1>
          </div>
          <p className="text-sm text-muted-foreground mb-6">Keep track of your healthcare visits.</p>
          
          <AppointmentTabs 
            activeTab={activeTab} 
            onTabChange={setActiveTab} 
            counts={counts} 
          />
        </div>

        {/* List Content */}
        <div className="flex-1 overflow-y-auto px-5 sm:px-6 pb-24 lg:pb-8 space-y-4 pt-2">
          
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="w-full h-32 rounded-xl bg-muted animate-pulse" />
              ))}
            </div>
          ) : activeList.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-center p-6 border-2 border-dashed rounded-2xl">
              <CalendarX2 className="w-10 h-10 text-muted-foreground/50 mb-3" />
              <p className="font-semibold text-foreground">No {activeTab.toLowerCase()} appointments</p>
              {activeTab === "Upcoming" && (
                <Button 
                  onClick={() => navigate("/app/patient/map")}
                  variant="link" 
                  className="mt-2 text-primary"
                >
                  Find healthcare <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              )}
            </div>
          ) : (
            <>
              {activeTab === "Upcoming" && nextAppointment && (
                <NextAppointmentWidget 
                  appointment={nextAppointment} 
                  onClick={handleSelectAppointment} 
                />
              )}
              
              <div className="space-y-3">
                {activeList.map(apt => (
                  // Don't show the first upcoming appointment in the normal list if it's already in the widget
                  (activeTab !== "Upcoming" || apt.id !== nextAppointment?.id) && (
                    <AppointmentCard 
                      key={apt.id} 
                      appointment={apt} 
                      isSelected={appointmentId === apt.id}
                      onClick={handleSelectAppointment} 
                    />
                  )
                ))}
              </div>
            </>
          )}

        </div>
      </div>

      {/* RIGHT COLUMN: Details (Desktop) / Fullscreen overlay (Mobile) */}
      <div className={`flex-1 h-full bg-background relative z-20 lg:block ${selectedAppointment ? 'block' : 'hidden'}`}>
        {selectedAppointment ? (
          <AppointmentDetailPanel 
            appointment={selectedAppointment} 
            onClose={handleCloseDetail} 
            onStatusChange={loadAppointments}
          />
        ) : (
          <div className="hidden lg:flex h-full items-center justify-center text-muted-foreground bg-muted/10">
            <div className="text-center">
              <CalendarX2 className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p>Select an appointment to view details</p>
            </div>
          </div>
        )}
      </div>

    </div>
  )
}
