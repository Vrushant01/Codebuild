import React, { createContext, useContext, useEffect, useState } from "react"
import type { ReactNode } from "react"
import type { TelemedicineState, ConsultationStatus } from "./telemedicine-types"
import { telemedicineService } from "./telemedicine-service"

interface TelemedicineContextType extends TelemedicineState {
  joinConsultation: (appointmentId: string, role: 'patient' | 'doctor') => Promise<void>
  leaveConsultation: () => Promise<void>
  toggleCamera: () => Promise<void>
  toggleMicrophone: () => Promise<void>
  toggleSpeaker: () => Promise<void>
  simulateConnectionDrop: () => void
  simulateReconnect: () => void
}

const TelemedicineContext = createContext<TelemedicineContextType | null>(null)

export function TelemedicineProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<TelemedicineState>({
    status: "NOT_STARTED",
    devices: {
      cameraEnabled: true,
      microphoneEnabled: true,
      speakerEnabled: true,
    },
    connectionInfo: {
      status: 'good',
      latencyMs: 0
    },
    durationSeconds: 0,
    doctorReady: true,
    patientReady: true,
    isSimulatedDrop: false
  })

  useEffect(() => {
    const unsubscribe = telemedicineService.onStateChange(newState => {
      setState(newState)
    })
    return () => unsubscribe()
  }, [])

  const joinConsultation = async (appointmentId: string, role: 'patient' | 'doctor') => {
    await telemedicineService.joinConsultation(appointmentId, role)
  }

  const leaveConsultation = async () => {
    await telemedicineService.leaveConsultation()
  }

  const toggleCamera = async () => {
    await telemedicineService.toggleCamera(!state.devices.cameraEnabled)
  }

  const toggleMicrophone = async () => {
    await telemedicineService.toggleMicrophone(!state.devices.microphoneEnabled)
  }

  const toggleSpeaker = async () => {
    await telemedicineService.toggleSpeaker(!state.devices.speakerEnabled)
  }

  const value: TelemedicineContextType = {
    ...state,
    joinConsultation,
    leaveConsultation,
    toggleCamera,
    toggleMicrophone,
    toggleSpeaker,
    simulateConnectionDrop: () => telemedicineService.simulateConnectionDrop(),
    simulateReconnect: () => telemedicineService.simulateReconnect(),
  }

  return (
    <TelemedicineContext.Provider value={value}>
      {children}
    </TelemedicineContext.Provider>
  )
}

export function useTelemedicine() {
  const context = useContext(TelemedicineContext)
  if (!context) {
    throw new Error("useTelemedicine must be used within a TelemedicineProvider")
  }
  return context
}
