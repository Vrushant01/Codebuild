import { Socket } from "socket.io-client"
import { getSocketClient } from "../socket/socket-client"
import type { 
  ConsultationStatus, 
  TelemedicineState, 
  ITelemedicineService 
} from "./telemedicine-types"

const ICE_SERVERS: RTCConfiguration = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
    { urls: "stun:stun2.l.google.com:19302" }
  ]
}

class TelemedicineService implements ITelemedicineService {
  private state: TelemedicineState = {
    status: "NOT_STARTED",
    devices: {
      cameraEnabled: true,
      microphoneEnabled: true,
      speakerEnabled: true,
    },
    connectionInfo: {
      status: 'good',
      latencyMs: 24
    },
    durationSeconds: 0,
    doctorReady: true,
    patientReady: true,
    isSimulatedDrop: false
  }

  private socket: Socket | null = null
  private listeners: Set<(state: TelemedicineState) => void> = new Set()
  private streamListeners: Set<(local: MediaStream | null, remote: MediaStream | null) => void> = new Set()
  private timerInterval: any = null
  private currentRoomId: string | null = null
  private currentAppointmentId: string | null = null
  
  public localStream: MediaStream | null = null
  public remoteStream: MediaStream | null = null
  private peerConnection: RTCPeerConnection | null = null

  private notifyListeners() {
    this.listeners.forEach(listener => listener({ ...this.state }))
  }

  private notifyStreamListeners() {
    this.streamListeners.forEach(l => l(this.localStream, this.remoteStream))
  }

  public onStreamChange(cb: (local: MediaStream | null, remote: MediaStream | null) => void): () => void {
    this.streamListeners.add(cb)
    cb(this.localStream, this.remoteStream)
    return () => this.streamListeners.delete(cb)
  }

  public onStateChange(cb: (state: TelemedicineState) => void): () => void {
    this.listeners.add(cb)
    cb({ ...this.state })
    return () => this.listeners.delete(cb)
  }

  private startTimer() {
    if (this.timerInterval) clearInterval(this.timerInterval)
    this.timerInterval = setInterval(() => {
      this.state.durationSeconds += 1
      this.state.connectionInfo.latencyMs = 20 + Math.floor(Math.random() * 15)
      this.notifyListeners()
    }, 1000)
  }

  private stopTimer() {
    if (this.timerInterval) clearInterval(this.timerInterval)
  }

  private initSocket(): Socket {
    if (!this.socket) {
      this.socket = getSocketClient()

      this.socket.on("peer-joined", async ({ userId, role }) => {
        console.log(`🏥 Remote peer joined consultation: ${userId} (${role})`)
        this.state.connectionInfo.status = "good"
        this.notifyListeners()

        if (this.peerConnection && this.localStream) {
          try {
            const offer = await this.peerConnection.createOffer()
            await this.peerConnection.setLocalDescription(offer)
            this.socket?.emit("webrtc-offer", { roomId: this.currentRoomId, sdp: offer })
          } catch (e) {
            console.warn("Offer creation error:", e)
          }
        }
      })

      this.socket.on("webrtc-offer", async ({ sdp }) => {
        if (!this.peerConnection) this.setupPeerConnection()
        try {
          await this.peerConnection?.setRemoteDescription(new RTCSessionDescription(sdp))
          const answer = await this.peerConnection?.createAnswer()
          if (answer) {
            await this.peerConnection?.setLocalDescription(answer)
            this.socket?.emit("webrtc-answer", { roomId: this.currentRoomId, sdp: answer })
          }
        } catch (e) {
          console.warn("Error handling WebRTC offer:", e)
        }
      })

      this.socket.on("webrtc-answer", async ({ sdp }) => {
        try {
          if (this.peerConnection && this.peerConnection.signalingState !== "stable") {
            await this.peerConnection.setRemoteDescription(new RTCSessionDescription(sdp))
          }
        } catch (e) {
          console.warn("Error handling WebRTC answer:", e)
        }
      })

      this.socket.on("webrtc-ice-candidate", async ({ candidate }) => {
        try {
          if (this.peerConnection && candidate) {
            await this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate))
          }
        } catch (e) {
          console.warn("Error adding ICE candidate:", e)
        }
      })

      this.socket.on("media-toggle", ({ mediaType, enabled }) => {
        if (mediaType === "camera") {
          // Remote video toggled
        }
        this.notifyListeners()
      })

      this.socket.on("peer-left", () => {
        this.state.connectionInfo.status = "disconnected"
        this.notifyListeners()
      })
    }
    return this.socket
  }

  private setupPeerConnection() {
    try {
      this.peerConnection = new RTCPeerConnection(ICE_SERVERS)

      this.peerConnection.onicecandidate = (event) => {
        if (event.candidate && this.currentRoomId && this.socket) {
          this.socket.emit("webrtc-ice-candidate", {
            roomId: this.currentRoomId,
            candidate: event.candidate
          })
        }
      }

      this.peerConnection.ontrack = (event) => {
        if (event.streams && event.streams[0]) {
          this.remoteStream = event.streams[0]
          this.notifyStreamListeners()
        }
      }

      if (this.localStream) {
        this.localStream.getTracks().forEach(track => {
          this.peerConnection?.addTrack(track, this.localStream!)
        })
      }
    } catch (err) {
      console.warn("WebRTC PeerConnection setup error:", err)
    }
  }

  private async acquireMediaStream(): Promise<MediaStream | null> {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: "user" },
          audio: { echoCancellation: true, noiseSuppression: true }
        })
        this.localStream = stream
        this.notifyStreamListeners()
        return stream
      }
    } catch (err) {
      console.warn("⚠️ Local camera/mic access not granted, using simulated canvas stream:", err)
      // Create virtual fallback canvas stream so video element renders cleanly
      const canvas = document.createElement("canvas")
      canvas.width = 640
      canvas.height = 480
      const ctx = canvas.getContext("2d")
      if (ctx) {
        ctx.fillStyle = "#0f172a"
        ctx.fillRect(0, 0, 640, 480)
        ctx.fillStyle = "#0d9488"
        ctx.font = "24px sans-serif"
        ctx.fillText("HD Camera Stream", 220, 240)
      }
      const virtualStream = (canvas as any).captureStream ? (canvas as any).captureStream(30) : null
      this.localStream = virtualStream
      this.notifyStreamListeners()
      return virtualStream
    }
    return null
  }

  async joinConsultation(appointmentId: string, role: 'patient' | 'doctor'): Promise<void> {
    const socket = this.initSocket()
    this.currentAppointmentId = appointmentId
    this.currentRoomId = `room_tele_${appointmentId}`

    await this.acquireMediaStream()
    this.setupPeerConnection()

    this.state.status = "WAITING"
    this.notifyListeners()

    const user = JSON.parse(localStorage.getItem("currentUser") || "{}")
    socket.emit("join-telemedicine-room", {
      roomId: this.currentRoomId,
      userId: user.id || user._id || "anonymous",
      role
    })

    // Notify doctor of calling signal
    if (role === 'patient') {
      socket.emit("incoming-consultation-call", {
        appointmentId,
        patientName: user.name || "Patient",
        roomId: this.currentRoomId
      })
    }

    setTimeout(() => {
      this.state.status = "CONNECTED"
      this.startTimer()
      this.notifyListeners()
    }, 1200)
  }

  async leaveConsultation(): Promise<void> {
    this.stopTimer()
    if (this.socket && this.currentRoomId) {
      this.socket.emit("leave-telemedicine-room", { roomId: this.currentRoomId })
    }

    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop())
      this.localStream = null
    }
    if (this.peerConnection) {
      this.peerConnection.close()
      this.peerConnection = null
    }

    this.state.status = "ENDED"
    this.notifyListeners()
    this.notifyStreamListeners()
  }

  async toggleCamera(enabled: boolean): Promise<void> {
    this.state.devices.cameraEnabled = enabled
    if (this.localStream) {
      this.localStream.getVideoTracks().forEach(t => { t.enabled = enabled })
    }
    if (this.socket && this.currentRoomId) {
      this.socket.emit("media-toggle", { roomId: this.currentRoomId, mediaType: "camera", enabled })
    }
    this.notifyListeners()
  }

  async toggleMicrophone(enabled: boolean): Promise<void> {
    this.state.devices.microphoneEnabled = enabled
    if (this.localStream) {
      this.localStream.getAudioTracks().forEach(t => { t.enabled = enabled })
    }
    if (this.socket && this.currentRoomId) {
      this.socket.emit("media-toggle", { roomId: this.currentRoomId, mediaType: "microphone", enabled })
    }
    this.notifyListeners()
  }

  async toggleSpeaker(enabled: boolean): Promise<void> {
    this.state.devices.speakerEnabled = enabled
    this.notifyListeners()
  }

  simulateConnectionDrop() {
    this.state.status = "RECONNECTING"
    this.state.connectionInfo.status = "poor"
    this.notifyListeners()
  }

  simulateReconnect() {
    this.state.status = "CONNECTED"
    this.state.connectionInfo.status = "good"
    this.notifyListeners()
  }
}

export const telemedicineService = new TelemedicineService()
