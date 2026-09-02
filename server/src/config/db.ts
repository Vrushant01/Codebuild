import mongoose from "mongoose"
import { MongoMemoryServer } from "mongodb-memory-server"

let mongoServer: MongoMemoryServer | null = null

export const connectDB = async (): Promise<boolean> => {
  let uri = process.env.MONGODB_URI

  // If user provided a custom Atlas or remote URI, try connecting to it first
  if (uri && !uri.includes("127.0.0.1") && !uri.includes("localhost")) {
    let finalUri = uri.trim()
    if (!finalUri.includes("medireach")) {
      finalUri = finalUri.replace(/\/?$/, "/medireach?retryWrites=true&w=majority")
    }
    
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        console.log(`🔌 [Attempt ${attempt}/3] Connecting to MongoDB Atlas (${finalUri.replace(/:([^:@]{4})[^:@]*@/, ":****@")})...`)
        const conn = await mongoose.connect(finalUri, {
          serverSelectionTimeoutMS: 20000,
          connectTimeoutMS: 20000,
        })
        console.log(`✅ MongoDB Atlas Connected! Host: ${conn.connection.host}, DB: ${conn.connection.name}`)
        return true
      } catch (error: any) {
        console.warn(`⚠️ Atlas connection attempt ${attempt} failed: ${error.message}`)
        if (attempt < 3) {
          await new Promise(r => setTimeout(r, 2000))
        }
      }
    }
  }

  // Try local MongoDB
  try {
    const localUri = "mongodb://127.0.0.1:27017/medireach"
    console.log(`🔌 Attempting connection to local MongoDB: ${localUri}...`)
    const conn = await mongoose.connect(localUri, {
      serverSelectionTimeoutMS: 2000,
    })
    console.log(`✅ MongoDB Local Connected! Host: ${conn.connection.host}, DB: ${conn.connection.name}`)
    return true
  } catch (error: any) {
    console.log(`ℹ️ Local MongoDB not running on 27017. Initializing In-Memory MongoDB Server for instant demo...`)
  }

  // Fallback to In-Memory MongoDB
  try {
    mongoServer = await MongoMemoryServer.create()
    const memoryUri = mongoServer.getUri()
    console.log(`🌱 In-Memory MongoDB Server started at: ${memoryUri}`)
    const conn = await mongoose.connect(memoryUri)
    console.log(`✅ In-Memory MongoDB Connected! Database: ${conn.connection.name}`)
    return true
  } catch (memError: any) {
    console.error(`❌ Failed to initialize MongoDB: ${memError.message}`)
    return false
  }
}

export const disconnectDB = async () => {
  await mongoose.disconnect()
  if (mongoServer) {
    await mongoServer.stop()
  }
}
