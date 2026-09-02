import { Server as SocketIOServer, Socket } from "socket.io"
import { Server as HTTPServer } from "http"

let ioInstance: SocketIOServer | null = null

export const initSocketIO = (httpServer: HTTPServer): SocketIOServer => {
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:5173",
      methods: ["GET", "POST"],
      credentials: true
    }
  })

  io.on("connection", (socket: Socket) => {
    console.log(`🔌 Socket client connected: ${socket.id}`)

    // Join user-specific notification room
    socket.on("join-user-channel", (userId: string) => {
      if (userId) {
        socket.join(`user:${userId}`)
        console.log(`👤 User ${userId} joined notification channel`)
      }
    })

    // WebRTC Telemedicine Signaling Room
    socket.on("join-telemedicine-room", ({ roomId, userId, role }: { roomId: string; userId: string; role: string }) => {
      socket.join(`room:${roomId}`)
      console.log(`🏥 ${role} (${userId}) joined Telemedicine Room: ${roomId}`)

      // Notify peer that another participant has joined
      socket.to(`room:${roomId}`).emit("peer-joined", { userId, role, socketId: socket.id })
    })

    // WebRTC SDP Offer
    socket.on("webrtc-offer", ({ roomId, sdp }: { roomId: string; sdp: any }) => {
      socket.to(`room:${roomId}`).emit("webrtc-offer", { sdp, from: socket.id })
    })

    // WebRTC SDP Answer
    socket.on("webrtc-answer", ({ roomId, sdp }: { roomId: string; sdp: any }) => {
      socket.to(`room:${roomId}`).emit("webrtc-answer", { sdp, from: socket.id })
    })

    // ICE Candidate
    socket.on("webrtc-ice-candidate", ({ roomId, candidate }: { roomId: string; candidate: any }) => {
      socket.to(`room:${roomId}`).emit("webrtc-ice-candidate", { candidate, from: socket.id })
    })

    // Media toggles (camera/microphone/screen)
    socket.on("media-toggle", ({ roomId, mediaType, enabled }: { roomId: string; mediaType: string; enabled: boolean }) => {
      socket.to(`room:${roomId}`).emit("peer-media-toggle", { mediaType, enabled, from: socket.id })
    })

    // End consultation call
    socket.on("leave-telemedicine-room", ({ roomId }: { roomId: string }) => {
      socket.leave(`room:${roomId}`)
      socket.to(`room:${roomId}`).emit("peer-left", { socketId: socket.id })
    })

    socket.on("disconnect", () => {
      console.log(`🔌 Socket client disconnected: ${socket.id}`)
    })
  })

  ioInstance = io
  return io
}

export const emitToUser = (userId: string, event: string, payload: any): void => {
  if (ioInstance) {
    ioInstance.to(`user:${userId}`).emit(event, payload)
  }
}

export const getIO = (): SocketIOServer | null => ioInstance
