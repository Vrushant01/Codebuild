import React, { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { healthcareService } from "../../lib/healthcare/healthcare-service"
import { appointmentService, AppointmentError } from "../../lib/booking/appointment-service"
import type { Doctor, Organization } from "../../lib/healthcare/types"
import type { ConsultationType, PatientType, DailyAvailability, Appointment } from "../../lib/booking/appointment-types"

import { ConsultationTypeSelector } from "../../components/booking/ConsultationTypeSelector"
import { DateSelector } from "../../components/booking/DateSelector"
import { TimeSlotGrid } from "../../components/booking/TimeSlotGrid"
import { AppointmentForSelector } from "../../components/booking/AppointmentForSelector"
import { AppointmentSummary } from "../../components/booking/AppointmentSummary"
import { BookingSuccessState } from "../../components/booking/BookingSuccessState"
import { BookingProgressIndicator } from "../../components/booking/BookingProgressIndicator"
import type { BookingStep } from "../../components/booking/BookingProgressIndicator"

import { Button } from "../../components/ui/button"
import { ChevronLeft, Star, MapPin, Building2, Stethoscope, AlertCircle } from "lucide-react"
import { cn } from "../../lib/utils"

export default function PatientBookingPage() {
  const { doctorId } = useParams<{ doctorId: string }>()
  const navigate = useNavigate()

  // Context State
  const [doctor, setDoctor] = useState<Doctor | null>(null)
  const [organization, setOrganization] = useState<Organization | null>(null)
  const [loadingContext, setLoadingContext] = useState(true)

  // Form State
  const [consultationType, setConsultationType] = useState<ConsultationType | null>(null)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [patientType, setPatientType] = useState<PatientType>("Myself")
  const [familyMemberName, setFamilyMemberName] = useState("")
  const [relationship, setRelationship] = useState("")

  // Availability State
  const [availability, setAvailability] = useState<DailyAvailability[]>([])
  const [loadingAvailability, setLoadingAvailability] = useState(false)

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successAppointment, setSuccessAppointment] = useState<Appointment | null>(null)

  // Load Context
  useEffect(() => {
    const loadContext = async () => {
      if (!doctorId) return
      setLoadingContext(true)
      const doc = await healthcareService.getDoctor(doctorId)
      if (doc) {
        setDoctor(doc)
        const org = await healthcareService.getOrganization(doc.organizationId)
        setOrganization(org || null)
        
        // Auto-select consultation type if only 1 is supported
        if (doc.consultationTypes.length === 1) {
          setConsultationType(doc.consultationTypes[0])
        }
      }
      setLoadingContext(false)
    }
    loadContext()
  }, [doctorId])

  // Load Availability when Date changes (in real app, we load a month at a time, here we load a week from today)
  useEffect(() => {
    const loadAvailability = async () => {
      if (!doctor || !consultationType) return
      setLoadingAvailability(true)
      
      const today = new Date().toISOString().split("T")[0]
      const results = await appointmentService.getAvailability(doctor.id, today, consultationType)
      
      setAvailability(results)
      
      // Auto-select first available date if nothing is selected
      if (!selectedDate && results.length > 0) {
        const firstAvailable = results.find(d => d.isAvailable)
        if (firstAvailable) {
          setSelectedDate(firstAvailable.date)
        }
      }

      setLoadingAvailability(false)
    }

    loadAvailability()
  }, [doctor, consultationType]) // Intentionally not depending on selectedDate to avoid infinite loops

  const currentDaySlots = availability.find(d => d.date === selectedDate)?.slots || []

  // Reset time when date or consultation type changes
  useEffect(() => {
    setSelectedTime(null)
  }, [selectedDate, consultationType])

  const handleConsultationTypeChange = (type: ConsultationType) => {
    setConsultationType(type)
  }

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  const handleSubmit = async () => {
    if (!doctor || !organization || !consultationType || !selectedDate || !selectedTime) return
    
    setIsSubmitting(true)
    setError(null)

    try {
      const appt = await appointmentService.submitAppointmentRequest({
        doctorId: doctor.id,
        organizationId: organization.id,
        consultationType,
        date: selectedDate,
        timeStr: selectedTime,
        appointmentFor: patientType,
        familyMemberName: patientType === "Family member" ? familyMemberName : undefined,
        relationship: patientType === "Family member" ? relationship : undefined
      })

      // We'd typically dispatch this to a global state store here.
      // For now, local state handles success UI.
      setSuccessAppointment(appt)
    } catch (err: any) {
      if (err instanceof AppointmentError) {
        setError(err.message)
        // If conflict, refresh availability silently
        if (err.code === "SLOT_CONFLICT") {
           const today = new Date().toISOString().split("T")[0]
           const refreshed = await appointmentService.getAvailability(doctor.id, today, consultationType)
           setAvailability(refreshed)
           setSelectedTime(null)
        }
      } else {
        setError("An unexpected error occurred. Please try again.")
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const isPatientInfoComplete = patientType === "Myself" || (familyMemberName.trim() !== "" && relationship.trim() !== "")
  const isFormComplete = consultationType && selectedDate && selectedTime && isPatientInfoComplete

  const completedSteps: BookingStep[] = []
  if (consultationType) completedSteps.push(1)
  if (selectedDate && selectedTime) completedSteps.push(2)
  if (isPatientInfoComplete) completedSteps.push(3)
  if (isFormComplete) completedSteps.push(4)

  const currentStep: BookingStep = !consultationType ? 1 : (!selectedTime ? 2 : (!isFormComplete ? 3 : 4))

  if (successAppointment) {
    return (
      <div className="min-h-[calc(100vh-65px)] bg-background flex items-center justify-center p-4">
        <BookingSuccessState appointment={successAppointment} />
      </div>
    )
  }

  if (loadingContext) {
    return <div className="p-12 text-center text-muted-foreground animate-pulse">Loading context...</div>
  }

  if (!doctor || !organization) {
    return <div className="p-12 text-center text-destructive">Doctor or Organization not found.</div>
  }

  const supportsOnline = doctor.consultationTypes.includes("Online")
  const supportsPhysical = doctor.consultationTypes.includes("Physical")

  return (
    <div className="min-h-[calc(100vh-65px)] bg-[#f8fafc] dark:bg-background pb-32 lg:pb-0">
      
      {/* Mobile Header (Back) */}
      <div className="lg:hidden sticky top-0 z-40 bg-background/90 backdrop-blur border-b px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-1.5 hover:bg-muted rounded-full">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <span className="font-semibold">Book Appointment</span>
      </div>

      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row min-h-[calc(100vh-65px)]">
        
        {/* LEFT COLUMN: Booking Flow (Was Right Column) */}
        <div className="flex-1 overflow-y-auto lg:border-r">
          <div className="max-w-2xl mx-auto p-5 lg:p-10 space-y-10 lg:space-y-12">
            
            <div className="space-y-6">
              <h1 className="text-3xl font-heading font-bold text-foreground">Book Appointment</h1>
              <BookingProgressIndicator 
                currentStep={currentStep} 
                completedSteps={completedSteps} 
                onStepClick={(step) => {
                  if (step === 1) scrollToSection('consultationType')
                  if (step === 2) scrollToSection('date')
                  if (step === 3) scrollToSection('patient')
                }} 
              />
            </div>

            {/* Step 1: Consultation Type */}
            <section id="consultationType" className="space-y-4">
              <ConsultationTypeSelector 
                selected={consultationType!} 
                onChange={handleConsultationTypeChange}
                supportsOnline={supportsOnline}
              />
            </section>

            {/* Step 2: Date & Time */}
            <section id="date" className={cn("space-y-8 transition-opacity duration-300", !consultationType && "opacity-40 pointer-events-none")}>
              <div className="space-y-4">
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-foreground">Select a date</h3>
                  <DateSelector 
                    availability={availability} 
                    selectedDate={selectedDate} 
                    onDateSelect={setSelectedDate}
                    isLoading={loadingAvailability}
                  />
                </div>
              </div>

              {selectedDate && (
                <div className="space-y-2 animate-in slide-in-from-top-4 fade-in duration-300">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-foreground">Select a time slot</h3>
                    <span className="text-xs text-muted-foreground">Timezone: Local</span>
                  </div>
                  <TimeSlotGrid 
                    slots={currentDaySlots}
                    selectedSlot={selectedTime}
                    onSlotSelect={setSelectedTime}
                    isLoading={loadingAvailability}
                  />
                </div>
              )}
            </section>

            {/* Step 3: Patient Info */}
            <section id="patient" className={cn("space-y-4 transition-opacity duration-300", !selectedTime && "opacity-40 pointer-events-none")}>
              <div className="flex items-center gap-3 mb-4">
                <h2 className="text-xl font-heading font-bold">Patient Details</h2>
              </div>
              <AppointmentForSelector 
                patientType={patientType}
                onTypeChange={setPatientType}
                familyMemberName={familyMemberName}
                onNameChange={setFamilyMemberName}
                relationship={relationship}
                onRelationshipChange={setRelationship}
              />
            </section>

            {/* Error Banner */}
            {error && (
              <div className="bg-destructive/10 border-l-4 border-destructive p-4 rounded-r-lg flex gap-3 animate-in fade-in">
                <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                <div className="text-sm text-destructive-foreground">
                  <p className="font-semibold text-destructive">Booking Error</p>
                  <p>{error}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Context & Summary (Was Left Column) */}
        <div className="lg:w-[400px] xl:w-[480px] shrink-0 bg-background lg:bg-[#f8fafc] dark:lg:bg-background relative z-10 lg:shadow-[-10px_0_30px_rgba(0,0,0,0.02)]">
          <div className="lg:sticky lg:top-0 p-5 lg:p-8 flex flex-col gap-6 lg:h-[calc(100vh-65px)] lg:overflow-y-auto">
            
            <button onClick={() => navigate(-1)} className="hidden lg:flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors w-fit -ml-2 p-2 rounded-lg">
              <ChevronLeft className="w-4 h-4" /> Back to map
            </button>

            {/* Context Card */}
            <div className="p-5 bg-background border rounded-2xl space-y-5 shadow-sm">
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Stethoscope className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-foreground leading-none mb-1">{doctor.name}</h3>
                  <p className="text-primary font-medium text-sm">{doctor.specialization}</p>
                  
                  <div className="flex items-center gap-1 mt-2 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 w-fit px-2 py-0.5 rounded text-xs font-semibold">
                    <Star className="w-3 h-3 fill-current" />
                    {doctor.rating} <span className="text-amber-600/70 dark:text-amber-400/70 font-normal">({doctor.reviewCount} revs)</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-dashed flex gap-3">
                <Building2 className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-sm text-foreground">{organization.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{organization.address}, {organization.city}</p>
                </div>
              </div>
            </div>

            {/* Sticky Summary */}
            <div className={cn("transition-opacity duration-300 flex-1 flex flex-col", !consultationType && "opacity-50")}>
              <AppointmentSummary 
                doctor={doctor}
                organization={organization}
                consultationType={consultationType!}
                date={selectedDate}
                timeStr={selectedTime}
                patientType={patientType}
                familyMemberName={familyMemberName}
                relationship={relationship}
                onEditSection={scrollToSection}
              />
              
              <div className="mt-auto pt-6">
                <Button 
                  onClick={handleSubmit}
                  disabled={!isFormComplete || isSubmitting}
                  className="w-full py-6 text-base font-semibold shadow-xl shadow-primary/20"
                >
                  {isSubmitting ? "Sending request..." : "Request Appointment"}
                </Button>
                <p className="text-center text-xs text-muted-foreground mt-3">
                  By requesting, you agree to wait for the clinic's confirmation.
                </p>
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* Mobile Sticky CTA */}
      <div className="lg:hidden fixed bottom-[65px] inset-x-0 p-4 bg-background/90 backdrop-blur border-t shadow-[0_-10px_40px_rgba(0,0,0,0.1)] z-40">
        <Button 
          onClick={handleSubmit}
          disabled={!isFormComplete || isSubmitting}
          className="w-full py-6 text-base font-semibold shadow-xl shadow-primary/20"
        >
          {isSubmitting ? "Sending request..." : "Request Appointment"}
        </Button>
      </div>

    </div>
  )
}
