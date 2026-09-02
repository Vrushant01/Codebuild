import express from "express"
import http from "http"
import cors from "cors"
import cookieParser from "cookie-parser"
import morgan from "morgan"
import helmet from "helmet"
import dotenv from "dotenv"
import mongoose from "mongoose"

import { connectDB } from "./config/db.js"
import { initSocketIO } from "./services/socketService.js"
import { errorHandler } from "./middleware/errorHandler.js"

// Route imports
import authRoutes from "./routes/authRoutes.js"
import organizationRoutes from "./routes/organizationRoutes.js"
import doctorRoutes from "./routes/doctorRoutes.js"
import appointmentRoutes from "./routes/appointmentRoutes.js"
import patientRoutes from "./routes/patientRoutes.js"
import medicineRoutes from "./routes/medicineRoutes.js"
import allergyRoutes from "./routes/allergyRoutes.js"
import medicalCaseRoutes from "./routes/medicalCaseRoutes.js"
import reviewRoutes from "./routes/reviewRoutes.js"
import chatRoutes from "./routes/chatRoutes.js"
import notificationRoutes from "./routes/notificationRoutes.js"
import scheduleRoutes from "./routes/scheduleRoutes.js"
import receptionistRoutes from "./routes/receptionistRoutes.js"
import adminRoutes from "./routes/adminRoutes.js"
import billingRoutes from "./routes/billingRoutes.js"

// Load env
dotenv.config()

const app = express()
const server = http.createServer(app)

// Initialize Socket.IO
initSocketIO(server)

// Security & Parsing Middlewares
app.use(helmet({ contentSecurityPolicy: false }))
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"]
  })
)
app.use(express.json({ limit: "10mb" }))
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())
if (process.env.NODE_ENV !== "test") {
  app.use(morgan("dev"))
}

// Health Check
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    service: "Healthcare Accessibility API",
    timestamp: new Date().toISOString(),
    databaseConnected: mongoose.connection.readyState === 1
  })
})

// Register Main API Route Groups
app.use("/api/auth", authRoutes)
app.use("/api/organizations", organizationRoutes)
app.use("/api/doctors", doctorRoutes)
app.use("/api/appointments", appointmentRoutes)
app.use("/api/patients", patientRoutes)
app.use("/api/medicines", medicineRoutes)
app.use("/api/allergies", allergyRoutes)
app.use("/api/medical-cases", medicalCaseRoutes)
app.use("/api/reviews", reviewRoutes)
app.use("/api/chat", chatRoutes)
app.use("/api/notifications", notificationRoutes)
app.use("/api/schedules", scheduleRoutes)
app.use("/api/receptionists", receptionistRoutes)
app.use("/api/admin", adminRoutes)
app.use("/api/billing", billingRoutes)

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: `API route not found: ${req.method} ${req.originalUrl}` })
})

// Global Error Handler
app.use(errorHandler)

const PORT = process.env.PORT || 5000

import { seedDatabase } from "./seed.js"

const startServer = async () => {
  const isConnected = await connectDB()
  if (isConnected) {
    await seedDatabase()
  }

  server.listen(PORT, () => {
    console.log(`\n======================================================`)
    console.log(`🚀 Healthcare API Server running on http://localhost:${PORT}`)
    console.log(`📡 Socket.IO Real-time & WebRTC Signaling active`)
    console.log(`🩺 Mode: ${process.env.NODE_ENV || "development"}`)
    console.log(`======================================================\n`)
  })
}

startServer()

export default app
