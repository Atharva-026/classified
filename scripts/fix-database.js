// AutoFlow calls this when database errors are detected
// It tests MongoDB connection

import mongoose from "mongoose"
import dotenv from "dotenv"
dotenv.config()

console.log("🔧 AutoFlow Fix Script: Testing MongoDB connection...")

let attempts = 0
const maxAttempts = 5

async function testMongoDB() {
  attempts++
  console.log(`   Attempt ${attempts}/${maxAttempts}...`)

  try {
    await mongoose.connect(process.env.MONGODB_URI)
    console.log("✅ MongoDB is connected and responding!")
    await mongoose.disconnect()
    process.exit(0) // success

  } catch (err) {
    console.log(`   ❌ Connection failed: ${err.message}`)

    if (attempts < maxAttempts) {
      console.log(`   Retrying in 5 seconds...`)
      setTimeout(testMongoDB, 5000)
    } else {
      console.log("❌ MongoDB did not respond after 5 attempts")
      process.exit(1) // failure
    }
  }
}

testMongoDB()