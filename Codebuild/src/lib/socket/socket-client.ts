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
      reconnectionAttempts: 10,
      reconnectionDelay: 1000
    })

    globalSocket.on("connect", () => {
      console.log("🟢 MediReach Live WebSocket connected:", globalSocket?.id)
      const user = JSON.parse(localStorage.getItem("currentUser") || "{}")
      if (user.id || user._id) {
        globalSocket?.emit("join-user-channel", user.id || user._id)
      }
    })

    globalSocket.on("disconnect", (reason) => {
      console.log("🟡 MediReach WebSocket disconnected:", reason)
    })
  }

  return globalSocket
}
