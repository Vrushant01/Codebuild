import dotenv from "dotenv"
import mongoose from "mongoose"
import { connectDB } from "../config/db.js"
import { Appointment } from "../models/Appointment.js"
import { Patient } from "../models/Patient.js"
import { User } from "../models/User.js"
import { Review } from "../models/Review.js"
import { MedicalCase } from "../models/MedicalCase.js"

dotenv.config()

async function run() {
  await connectDB()
  console.log("Connected to MongoDB Atlas")

  // Find Alex Johnson users/patients
  const alexUsers = await User.find({ $or: [{ name: /Alex Johnson/i }, { email: /patient@medireach.demo/i }] })
  console.log("Found Alex Users:", alexUsers.map(u => ({ id: u._id, name: u.name, email: u.email })))

  const userIds = alexUsers.map(u => u._id)

  const alexPatients = await Patient.find({ $or: [{ name: /Alex Johnson/i }, { userId: { $in: userIds } }] })
  console.log("Found Alex Patients:", alexPatients.map(p => ({ id: p._id, name: p.name, patientId: p.patientId })))

  const patientIds = alexPatients.map(p => p._id)

  // Delete appointments where patientName matches Alex Johnson or patientUserId is in userIds
  const deletedAppointments = await Appointment.deleteMany({
    $or: [
      { patientName: /Alex Johnson/i },
      { patientUserId: { $in: userIds } },
      { patientId: { $in: patientIds } }
    ]
  })
  console.log("Deleted Appointments:", deletedAppointments.deletedCount)

  // Delete Reviews by Alex
  const deletedReviews = await Review.deleteMany({
    $or: [
      { patientName: /Alex Johnson/i },
      { displayName: /Alex Johnson/i },
      { patientId: { $in: userIds.concat(patientIds as any) } }
    ]
  })
  console.log("Deleted Reviews:", deletedReviews.deletedCount)

  // Delete MedicalCases
  const deletedCases = await MedicalCase.deleteMany({
    $or: [
      { patientUserId: { $in: userIds } },
      { patientId: { $in: patientIds } }
    ]
  })
  console.log("Deleted Medical Cases:", deletedCases.deletedCount)

  // Delete Patients
  const deletedPats = await Patient.deleteMany({
    _id: { $in: patientIds }
  })
  console.log("Deleted Patients:", deletedPats.deletedCount)

  // Delete Users
  const deletedUsers = await User.deleteMany({
    _id: { $in: userIds }
  })
  console.log("Deleted Users:", deletedUsers.deletedCount)

  console.log("Cleanup complete!")
  process.exit(0)
}

run().catch(err => {
  console.error(err)
  process.exit(1)
})
