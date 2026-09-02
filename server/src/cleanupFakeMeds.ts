import dotenv from "dotenv"
dotenv.config()
import mongoose from "mongoose"
import { MedicineSchedule } from "./models/MedicineSchedule.js"

async function run() {
  const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/healthcare_db"
  console.log("Connecting to MongoDB...")
  await mongoose.connect(uri)

  const res = await MedicineSchedule.deleteMany({
    medicineName: { $in: ["Metformin", "Atorvastatin", "metformin", "atorvastatin"] }
  })

  console.log(`✅ Deleted ${res.deletedCount} fake seeded medicine records (Metformin/Atorvastatin)!`)
  process.exit(0)
}

run().catch(err => {
  console.error(err)
  process.exit(1)
})
