import express from "express"
import cors from "cors"
import https from "https"
import dotenv from "dotenv"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import mongoose from "mongoose"
import multer from "multer"
import { v2 as cloudinary } from "cloudinary"
import { CloudinaryStorage } from "multer-storage-cloudinary"
import Staff from "./models/Staff.js"
import Inventory from "./models/Inventory.js"

dotenv.config()

const app = express()
app.use(cors())
app.use(express.json())

// ── MongoDB Connection ────────────────────────────────────
const mongodbUri = process.env.MONGODB_URI
if (!mongodbUri) {
  console.warn("⚠️ MONGODB_URI not set - database operations will fail")
} else {
  mongoose.connect(mongodbUri, {
    connectTimeoutMS: 5000,
    serverSelectionTimeoutMS: 5000
  })
    .then(() => console.log("✅ MongoDB connected"))
    .catch(err => console.error("❌ MongoDB error:", err.message))
}

// ── Cloudinary Config ─────────────────────────────────────
if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY) {
  console.warn("⚠️ Cloudinary credentials not set - image upload will fail")
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

// ── Multer + Cloudinary Storage ───────────────────────────
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "stylesense-products",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    transformation: [{ width: 800, height: 800, crop: "limit" }]
  }
})
const upload = multer({ storage })

const JWT_SECRET = process.env.STAFF_JWT_SECRET || "stylesense_secret"

// ── Auth Middleware ───────────────────────────────────────
function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.replace("Bearer ", "")
  if (!token) return res.status(401).json({ error: "No token" })
  try {
    req.staff = jwt.verify(token, JWT_SECRET)
    next()
  } catch {
    res.status(401).json({ error: "Invalid token" })
  }
}

// ── Staff Register ────────────────────────────────────────
app.post("/api/staff/register", async (req, res) => {
  try {
    const { username, password, store_name } = req.body

    if (!username || !password || !store_name)
      return res.status(400).json({ error: "All fields required" })

    if (password.length < 6)
      return res.status(400).json({ error: "Password must be at least 6 characters" })

    const existing = await Staff.findOne({ username: username.toLowerCase() })
    if (existing)
      return res.status(409).json({ error: "Username already taken" })

    const password_hash = await bcrypt.hash(password, 10)
    const staff = await Staff.create({ username, password_hash, store_name })

    const token = jwt.sign(
      { id: staff._id, username: staff.username, store: staff.store_name },
      JWT_SECRET,
      { expiresIn: "24h" }
    )
    res.json({ token, store: staff.store_name })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ── Staff Login ───────────────────────────────────────────
app.post("/api/staff/login", async (req, res) => {
  try {
    const { username, password } = req.body

    const staff = await Staff.findOne({ username: username.toLowerCase() })
    if (!staff)
      return res.status(401).json({ error: "Invalid credentials" })

    const valid = await bcrypt.compare(password, staff.password_hash)
    if (!valid)
      return res.status(401).json({ error: "Invalid credentials" })

    const token = jwt.sign(
      { id: staff._id, username: staff.username, store: staff.store_name },
      JWT_SECRET,
      { expiresIn: "24h" }
    )
    res.json({ token, store: staff.store_name })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ── Get Inventory (public) ────────────────────────────────
app.get("/api/inventory", async (req, res) => {
  try {
    const { body_type, occasion } = req.query
    const filter = { in_stock: true }

    if (body_type) filter.body_types = body_type
    if (occasion)  filter.occasion = occasion

    const items = await Inventory.find(filter).sort({ created_at: -1 })
    res.json(items)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ── Add Inventory Item (staff only) ──────────────────────
app.post("/api/inventory", authMiddleware, upload.single("image"), async (req, res) => {
  try {
    const image_url = req.file?.path || req.body.image_url || null

    const item = await Inventory.create({
      name:        req.body.name,
      category:    req.body.category,
      occasion:    JSON.parse(req.body.occasion),
      body_types:  JSON.parse(req.body.body_types),
      colors:      JSON.parse(req.body.colors),
      price:       parseFloat(req.body.price),
      description: req.body.description || "",
      sizes:       JSON.parse(req.body.sizes || '["S","M","L","XL"]'),
      image_url,
      in_stock:    true,
      store_name:  req.staff.store,
    })

    res.json(item)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ── Delete Inventory Item (staff only) ───────────────────
app.delete("/api/inventory/:id", authMiddleware, async (req, res) => {
  try {
    await Inventory.findByIdAndDelete(req.params.id)
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ── Toggle Stock Status (staff only) ─────────────────────
app.patch("/api/inventory/:id/stock", authMiddleware, async (req, res) => {
  try {
    const item = await Inventory.findByIdAndUpdate(
      req.params.id,
      { in_stock: req.body.in_stock },
      { new: true }
    )
    res.json(item)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ── AI Fashion Suggestions ────────────────────────────────
app.post("/api/fashion", async (req, res) => {
  const { messages, inventory } = req.body
  const apiKey = process.env.GROQ_API_KEY

  if (!apiKey)
    return res.status(500).json({ error: "AI service not configured" })

  const inventoryContext = inventory?.length
    ? `\n\nAVAILABLE STORE INVENTORY (suggest ONLY from these real products):\n${
        inventory.map((item, i) =>
          `${i + 1}. ${item.name} | Category: ${item.category} | Colors: ${item.colors.join(", ")} | Price: $${item.price} | ID: ${item._id || item.id}`
        ).join("\n")
      }\n\nReturn product IDs in your suggestions so we can show real images.`
    : ""

  const systemMessage = {
    role:    "system",
    content: `You are a professional fashion stylist working with a specific store's inventory.${inventoryContext}`
  }

  const body = JSON.stringify({
    model:      "llama-3.3-70b-versatile",
    max_tokens: 1500,
    messages:   [systemMessage, ...messages]
  })

  const options = {
    hostname: "api.groq.com",
    path:     "/openai/v1/chat/completions",
    method:   "POST",
    headers: {
      "Content-Type":   "application/json",
      "Authorization":  `Bearer ${apiKey}`,
      "Content-Length": Buffer.byteLength(body),
    },
  }

  const proxyReq = https.request(options, (proxyRes) => {
    let data = ""
    proxyRes.on("data", chunk => data += chunk)
    proxyRes.on("end", () => {
      try {
        const parsed = JSON.parse(data)
        if (!parsed.choices) {
          console.error("Groq error:", data)
          return res.status(500).json({ error: "Groq error" })
        }
        const text = parsed.choices[0].message.content
        console.log("AI Response:", text.slice(0, 300))
        res.json({ content: [{ text }] })
      } catch (e) {
        res.status(500).json({ error: "Parse error" })
      }
    })
  })

  proxyReq.on("error", err => res.status(500).json({ error: err.message }))
  proxyReq.write(body)
  proxyReq.end()
})

// ── Keep Render Alive ─────────────────────────────────────
setInterval(() => {
  https.get("https://classified-stylesense-ai.onrender.com/api/inventory",
    (res) => console.log(`Keep-alive: ${res.statusCode}`)
  ).on("error", () => {})
}, 14 * 60 * 1000)

// ── Start Server ──────────────────────────────────────────
app.listen(3001, () => console.log("✅ StyleSense API running on port 3001"))