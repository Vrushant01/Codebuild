import { io, Socket } from "socket.io-client"

let globalSocket: Socket | null = null

export function getSocketClient(): Socket {
  if (!globalSocket) {
    globalSocket = io({
      path: "/socket.io",
      transports: ["websocket", "polling"],
      withCredentials: true,
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 20,
      reconnectionDelay: 1000
    })

    globalSocket.on("connect", () => {
      console.log("🟢 MediReach Live WebSocket connected:", globalSocket?.id)
      syncUserSocket()
    })

    globalSocket.on("disconnect", (reason) => {
      console.log("🟡 MediReach WebSocket disconnected:", reason)
    })
  }

  return globalSocket
}

export function syncUserSocket(explicitUser?: any): void {
  if (!globalSocket || !globalSocket.connected) return

  try {
    const user = explicitUser || JSON.parse(localStorage.getItem("currentUser") || "{}")
    const userId = user.id || user._id
    if (userId) {
      globalSocket.emit("join-user-channel", userId)
    }
    if (user.doctorId && user.doctorId !== userId) {
      globalSocket.emit("join-user-channel", user.doctorId)
    }
    if (user.organizationId && user.organizationId !== userId) {
      globalSocket.emit("join-user-channel", user.organizationId)
    }
  } catch (err) {
    console.error("Error syncing user socket channel:", err)
  }
}
