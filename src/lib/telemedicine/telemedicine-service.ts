import type { 
  ConsultationStatus, 
  TelemedicineState, 
  ITelemedicineService 
} from "./telemedicine-types"

class MockTelemedicineService implements ITelemedicineService {
  private state: TelemedicineState = {
    status: "NOT_STARTED",
    devices: {
      cameraEnabled: true,
      microphoneEnabled: true,
      speakerEnabled: true,
    },
    connectionInfo: {
      status: 'good',
      latencyMs: 45
    },
    durationSeconds: 0,
    doctorReady: true,
    patientReady: true,
    isSimulatedDrop: false
  }

  private listeners: Set<(state: TelemedicineState) => void> = new Set()
  private timerInterval: any = null

  private notifyListeners() {
    this.listeners.forEach(listener => listener({ ...this.state }))
  }

  private startTimer() {
    if (this.timerInterval) clearInterval(this.timerInterval)
    this.timerInterval = setInterval(() => {
      this.state.durationSeconds += 1
      // Simulate slight latency variations
      this.state.connectionInfo.latencyMs = 30 + Math.floor(Math.random() * 40)
      this.notifyListeners()
    }, 1000)
  }

  private stopTimer() {
    if (this.timerInterval) clearInterval(this.timerInterval)
  }

  async joinConsultation(appointmentId: string, role: 'patient' | 'doctor'): Promise<void> {
    this.state.status = "WAITING"
    this.notifyListeners()

    // Simulate connection delay
    await new Promise(resolve => setTimeout(resolve, 1500))

    this.state.status = "CONNECTING"
    this.notifyListeners()

    await new Promise(resolve => setTimeout(resolve, 1000))

    this.state.status = "CONNECTED"
    this.startTimer()
    this.notifyListeners()
  }

  async leaveConsultation(): Promise<void> {
    this.stopTimer()
    this.state.status = "ENDED"
    this.notifyListeners()
  }

  async toggleCamera(enabled: boolean): Promise<void> {
    this.state.devices.cameraEnabled = enabled
    this.notifyListeners()
  }

  async toggleMicrophone(enabled: boolean): Promise<void> {
    this.state.devices.microphoneEnabled = enabled
    this.notifyListeners()
  }

  async toggleSpeaker(enabled: boolean): Promise<void> {
    this.state.devices.speakerEnabled = enabled
    this.notifyListeners()
  }

  simulateConnectionDrop(): void {
    if (this.state.status !== "CONNECTED") return
    this.state.isSimulatedDrop = true
    this.state.status = "RECONNECTING"
    this.state.connectionInfo.status = 'disconnected'
    this.stopTimer()
    this.notifyListeners()

    // Automatically reconnect after 4 seconds
    setTimeout(() => {
      if (this.state.isSimulatedDrop) {
        this.simulateReconnect()
      }
    }, 4000)
  }

  simulateReconnect(): void {
    if (this.state.status !== "RECONNECTING") return
    this.state.isSimulatedDrop = false
    this.state.status = "CONNECTED"
    this.state.connectionInfo.status = 'good'
    this.startTimer()
    this.notifyListeners()
  }

  onStateChange(listener: (state: TelemedicineState) => void): () => void {
    this.listeners.add(listener)
    // Immediately notify with current state
    listener({ ...this.state })
    return () => this.listeners.delete(listener)
  }
}

export const telemedicineService = new MockTelemedicineService()
