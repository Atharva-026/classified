import express from "express"
import cors from "cors"
import https from "https"
import dotenv from "dotenv"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { createClient } from "@supabase/supabase-js"
import multer from "multer"
import AutoFlow from "autoflow-sdk"

dotenv.config()

// ── AutoFlow SDK ─────────────────────────────────────────
const af = new AutoFlow({
  endpoint:    "http://localhost:3000/api/event",
  project:     "stylesense-ai",
  environment: process.env.NODE_ENV || "production",
  debug:       true
})

af.captureUncaughtExceptions()

// ── App setup ────────────────────────────────────────────
const app = express()
app.use(cors())
app.use(express.json())

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
)

const upload = multer({ storage: multer.memoryStorage() })
const JWT_SECRET = process.env.STAFF_JWT_SECRET || "stylesense_secret"

// ── Auth middleware ──────────────────────────────────────
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

// ── Staff Register ───────────────────────────────────────
app.post("/api/staff/register", async (req, res) => {
  const { username, password, store_name } = req.body

  if (!username || !password || !store_name) {
    return res.status(400).json({ error: "All fields required" })
  }
  if (password.length < 6) {
    return res.status(400).json({ error: "Password must be at least 6 characters" })
  }

  const { data: existing } = await supabase
    .from("staff")
    .select("id")
    .eq("username", username)
    .single()

  if (existing) {
    return res.status(409).json({ error: "Username already taken" })
  }

  const password_hash = await bcrypt.hash(password, 10)

  const { data, error } = await supabase
    .from("staff")
    .insert({ username, password_hash, store_name })
    .select()
    .single()

  if (error) {
    await af.reportError(new Error(error.message), {
      source:   "auth-register",
      severity: "high",
      username
    })
    return res.status(500).json({ error: error.message })
  }

  const token = jwt.sign(
    { id: data.id, username: data.username, store: data.store_name },
    JWT_SECRET,
    { expiresIn: "24h" }
  )
  res.json({ token, store: data.store_name })
})

// ── Staff Login ──────────────────────────────────────────
app.post("/api/staff/login", async (req, res) => {
  const { username, password } = req.body

  const { data: staff } = await supabase
    .from("staff")
    .select("*")
    .eq("username", username)
    .single()

  if (!staff) {
    await af.reportEvent("warning", "Failed login attempt", "medium", {
      source: "auth-login",
      username
    })
    return res.status(401).json({ error: "Invalid credentials" })
  }

  const valid = await bcrypt.compare(password, staff.password_hash)
  if (!valid) {
    await af.reportEvent("warning", "Failed login attempt — wrong password", "medium", {
      source: "auth-login",
      username
    })
    return res.status(401).json({ error: "Invalid credentials" })
  }

  const token = jwt.sign(
    { id: staff.id, username: staff.username, store: staff.store_name },
    JWT_SECRET,
    { expiresIn: "24h" }
  )
  res.json({ token, store: staff.store_name })
})

// ── Get all inventory (public) ───────────────────────────
app.get("/api/inventory", async (req, res) => {
  const { body_type, occasion } = req.query
  let query = supabase.from("inventory").select("*").eq("in_stock", true)

  if (body_type) query = query.contains("body_types", [body_type])
  if (occasion)  query = query.contains("occasion", [occasion])

  const { data, error } = await query.order("created_at", { ascending: false })

  if (error) {
    await af.reportError(new Error(error.message), {
      source:   "inventory-fetch",
      severity: "medium"
    })
    return res.status(500).json({ error: error.message })
  }

  res.json(data)
})

// ── Add inventory item (staff only) ─────────────────────
app.post("/api/inventory", authMiddleware, upload.single("image"), async (req, res) => {
  try {
    let image_url = req.body.image_url || null

    if (req.file) {
      const filename = `${Date.now()}-${req.file.originalname}`
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("product-images")
        .upload(filename, req.file.buffer, { contentType: req.file.mimetype })

      if (uploadError) throw uploadError

      const { data: urlData } = supabase.storage
        .from("product-images")
        .getPublicUrl(filename)
      image_url = urlData.publicUrl
    }

    const item = {
      name:        req.body.name,
      category:    req.body.category,
      occasion:    JSON.parse(req.body.occasion),
      body_types:  JSON.parse(req.body.body_types),
      colors:      JSON.parse(req.body.colors),
      price:       parseFloat(req.body.price),
      description: req.body.description,
      sizes:       JSON.parse(req.body.sizes || '["S","M","L","XL"]'),
      image_url,
      in_stock:    true,
      store_name:  req.staff.store,
    }

    const { data, error } = await supabase.from("inventory").insert(item).select().single()
    if (error) throw error

    // Track successful inventory additions
    await af.reportEvent("info", "Inventory item added", "low", {
      source: "inventory-add",
      store:  req.staff.store,
      item:   req.body.name
    })

    res.json(data)
  } catch (err) {
    await af.reportError(err, {
      source:   "inventory-add",
      severity: "high",
      store:    req.staff?.store
    })
    res.status(500).json({ error: err.message })
  }
})

// ── Delete inventory item (staff only) ──────────────────
app.delete("/api/inventory/:id", authMiddleware, async (req, res) => {
  const { error } = await supabase.from("inventory").delete().eq("id", req.params.id)

  if (error) {
    await af.reportError(new Error(error.message), {
      source:   "inventory-delete",
      severity: "medium",
      itemId:   req.params.id
    })
    return res.status(500).json({ error: error.message })
  }

  res.json({ success: true })
})

// ── Toggle stock status (staff only) ────────────────────
app.patch("/api/inventory/:id/stock", authMiddleware, async (req, res) => {
  const { in_stock } = req.body
  const { data, error } = await supabase
    .from("inventory")
    .update({ in_stock })
    .eq("id", req.params.id)
    .select()
    .single()

  if (error) {
    await af.reportError(new Error(error.message), {
      source:   "inventory-stock-toggle",
      severity: "medium",
      itemId:   req.params.id
    })
    return res.status(500).json({ error: error.message })
  }

  res.json(data)
})

// ── AI Fashion suggestions with real inventory ───────────
app.post("/api/fashion", async (req, res) => {
  const { messages, inventory } = req.body
  const apiKey = process.env.GROQ_API_KEY

  if (!apiKey) {
    await af.reportError(new Error("GROQ_API_KEY not configured"), {
      source:   "groq-fashion-api",
      severity: "critical"
    })
    return res.status(500).json({ error: "AI service not configured" })
  }

  const inventoryContext = inventory?.length
    ? `\n\nAVAILABLE STORE INVENTORY (suggest ONLY from these real products):\n${
        inventory.map((item, i) =>
          `${i + 1}. ${item.name} | Category: ${item.category} | Colors: ${item.colors.join(", ")} | Price: $${item.price} | ID: ${item.id}`
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
    proxyRes.on("end", async () => {
      try {
        const parsed = JSON.parse(data)

        if (!parsed.choices) {
          await af.reportEvent("error", "Groq API returned no choices", "high", {
            source:   "groq-fashion-api",
            response: data.slice(0, 200)
          })
          return res.status(500).json({ error: "Groq error" })
        }

        const text = parsed.choices[0].message.content
        console.log("AI Response:", text.slice(0, 500))

        // Track successful AI requests
        await af.reportEvent("info", "Fashion AI request served", "low", {
          source:       "groq-fashion-api",
          messageCount: messages.length
        })

        res.json({ content: [{ text }] })
      } catch (e) {
        await af.reportError(e, {
          source:   "groq-fashion-api",
          severity: "high"
        })
        res.status(500).json({ error: "Parse error" })
      }
    })
  })

  proxyReq.on("error", async (err) => {
    await af.reportError(err, {
      source:   "groq-fashion-api",
      severity: "high"
    })
    res.status(500).json({ error: err.message })
  })

  proxyReq.write(body)
  proxyReq.end()
})

// ── Global error middleware (catches all Express errors) ─
app.use(af.middleware())

// Prevent Render free tier cold start
setInterval(() => {
  https.get("https://classified-stylesense-ai.onrender.com/api/inventory",
    (res) => console.log(`Keep-alive: ${res.statusCode}`)
  ).on("error", () => {})
}, 14 * 60 * 1000)

// ── Start server ─────────────────────────────────────────
app.listen(3001, () => console.log("✅ StyleSense API running on port 3001"))