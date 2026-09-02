import dotenv from "dotenv"
import mongoose from "mongoose"
import { connectDB } from "../config/db.js"
import { Doctor } from "../models/Doctor.js"
import { Organization } from "../models/Organization.js"
import { User } from "../models/User.js"

dotenv.config()

async function run() {
  await connectDB()
  const doctors = await Doctor.find().populate("organizationId", "name contact").lean()
  console.log("=== ALL DOCTORS IN MONGODB ===")
  for (const d of doctors) {
    const org = d.organizationId as any
    console.log(`Doctor: "${d.name}" | Specialty: "${d.specialization}" | Org: "${org?.name}" (${org?._id}) | Doctor ID: ${d._id}`)
  }

  // Delete Dr. Sarah Smith if present
  const sarah = await Doctor.find({ name: /Sarah Smith/i })
  if (sarah.length > 0) {
    console.log("Deleting fake Dr. Sarah Smith...")
    const userIds = sarah.map(s => s.userId).filter(Boolean)
    await Doctor.deleteMany({ name: /Sarah Smith/i })
    await User.deleteMany({ _id: { $in: userIds } })
    console.log("Dr. Sarah Smith deleted!")
  }

  const orgs = await Organization.find().lean()
  console.log("\n=== ALL ORGANIZATIONS IN MONGODB ===")
  for (const o of orgs) {
    const docCount = await Doctor.countDocuments({ organizationId: o._id })
    console.log(`Org: "${o.name}" | Email: "${o.contact?.email}" | ID: ${o._id} | Doctors: ${docCount}`)
  }

  process.exit(0)
}

run().catch(err => {
  console.error(err)
  process.exit(1)
})
