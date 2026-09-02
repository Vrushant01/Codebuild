import dotenv from "dotenv"
import mongoose from "mongoose"
import { connectDB } from "../config/db.js"
import "../models/User.js"
import "../models/Patient.js"
import "../models/Doctor.js"
import "../models/Organization.js"
import { Appointment } from "../models/Appointment.js"

dotenv.config()

async function run() {
  await connectDB()
  const appointments = await Appointment.find()
    .populate("doctorId")
    .populate("organizationId")
    .populate("patientUserId")
    .lean()
  console.log(`=== TOTAL APPOINTMENTS: ${appointments.length} ===`)
  for (const apt of appointments) {
    const doc = apt.doctorId as any
    const org = apt.organizationId as any
    const pat = apt.patientUserId as any
    console.log(`ID: ${apt._id} | Date: ${apt.date} | Time: ${apt.startTime} | Patient: ${apt.patientName || pat?.name} | Doctor: ${doc?.name} (Org: ${doc?.organizationId}) | Org: ${org?.name} (${apt.organizationId}) | Status: ${apt.status}`)
  }
  process.exit(0)
}

run().catch(err => {
  console.error(err)
  process.exit(1)
})
