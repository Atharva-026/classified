// AutoFlow calls this when Supabase errors are detected
// It pings Supabase repeatedly to wake it up

import { createClient } from "@supabase/supabase-js"
import dotenv from "dotenv"
dotenv.config({ path: "D:/stylesense-ai/.env" })

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
)

console.log("🔧 AutoFlow Fix Script: Attempting to wake Supabase...")

let attempts = 0
const maxAttempts = 5

async function wakeSupabase() {
  attempts++
  console.log(`   Attempt ${attempts}/${maxAttempts}...`)

  try {
    const { data, error } = await supabase
      .from("inventory")
      .select("id")
      .limit(1)

    if (error) throw new Error(error.message)

    console.log("✅ Supabase is awake and responding!")
    process.exit(0) // success — AutoFlow sees exit code 0 as fixed

  } catch (err) {
    console.log(`   ❌ Still sleeping: ${err.message}`)

    if (attempts < maxAttempts) {
      console.log(`   Retrying in 5 seconds...`)
      setTimeout(wakeSupabase, 5000)
    } else {
      console.log("❌ Supabase did not respond after 5 attempts")
      process.exit(1) // failure — AutoFlow escalates
    }
  }
}

wakeSupabase()