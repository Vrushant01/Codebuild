import mongoose from "mongoose"
import dotenv from "dotenv"
dotenv.config()

async function main() {
  await mongoose.connect(process.env.MONGODB_URI!)
  console.log("Connected to MongoDB")
  
  const users = await mongoose.connection.db!.collection("users").find({ role: "RECEPTIONIST" }).toArray()
  console.log("Receptionist Users:", users.map(u => ({ id: u._id, name: u.name, email: u.email })))
  
  const receptionists = await mongoose.connection.db!.collection("receptionists").find({}).toArray()
  console.log("Receptionist Docs:", receptionists.map(r => ({ id: r._id, userId: r.userId, orgId: r.organizationId, name: r.name, email: r.email })))
  
  const orgs = await mongoose.connection.db!.collection("organizations").find({}).project({ name: 1, _id: 1 }).toArray()
  console.log("Organizations:", orgs)
  
  const appointments = await mongoose.connection.db!.collection("appointments").find({}).toArray()
  console.log("Total appointments in DB:", appointments.length)
  console.log("Appointments per org:", appointments.map(a => ({ id: a._id, orgId: a.organizationId, docId: a.doctorId, status: a.status, date: a.date })))
  
  process.exit(0)
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
