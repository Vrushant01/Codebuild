export const ConsultationStatus = {
  NOT_STARTED: "NOT_STARTED",
  WAITING: "WAITING",
  READY: "READY",
  CONNECTING: "CONNECTING",
  CONNECTED: "CONNECTED",
  RECONNECTING: "RECONNECTING",
  ENDED: "ENDED",
} as const;

export type ConsultationStatus = typeof ConsultationStatus[keyof typeof ConsultationStatus];

export interface DeviceSettings {
  cameraEnabled: boolean;
  microphoneEnabled: boolean;
  speakerEnabled: boolean;
  selectedCamera?: string;
  selectedMicrophone?: string;
  selectedSpeaker?: string;
}

export interface ConnectionInfo {
  status: 'good' | 'fair' | 'poor' | 'disconnected';
  latencyMs: number;
}

export interface TelemedicineState {
  status: ConsultationStatus;
  devices: DeviceSettings;
  connectionInfo: ConnectionInfo;
  durationSeconds: number;
  doctorReady: boolean;
  patientReady: boolean;
  isSimulatedDrop: boolean;
}

export interface ConsultationNotes {
  symptoms: string;
  diagnosis: string;
  treatment: string;
  additionalNotes: string;
}

// Service abstraction to allow future WebRTC implementation
export interface ITelemedicineService {
  joinConsultation(appointmentId: string, role: 'patient' | 'doctor'): Promise<void>;
  leaveConsultation(): Promise<void>;
  toggleCamera(enabled: boolean): Promise<void>;
  toggleMicrophone(enabled: boolean): Promise<void>;
  toggleSpeaker(enabled: boolean): Promise<void>;
  simulateConnectionDrop(): void;
  simulateReconnect(): void;
  onStateChange(listener: (state: TelemedicineState) => void): () => void;
}
