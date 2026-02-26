import express from "express"
import cors from "cors"
import https from "https"
import dotenv from "dotenv"

dotenv.config()

const app = express()
app.use(cors())
app.use(express.json())

app.post("/api/fashion", (req, res) => {
  const apiKey = process.env.GROQ_API_KEY
  const { messages } = req.body

  const body = JSON.stringify({
    model: "llama-3.3-70b-versatile",
    max_tokens: 1024,
    messages: messages
  })

  const options = {
    hostname: "api.groq.com",
    path: "/openai/v1/chat/completions",
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
      "Content-Length": Buffer.byteLength(body),
    },
  }

  const proxyReq = https.request(options, (proxyRes) => {
    let data = ""
    proxyRes.on("data", (chunk) => (data += chunk))
    proxyRes.on("end", () => {
      try {
        const parsed = JSON.parse(data)
        if (!parsed.choices) {
          console.log("Groq error:", data)
          return res.status(500).json({ error: "Groq error" })
        }
        const text = parsed.choices[0].message.content
        // Return in same format as Claude so claudeService.js needs no changes
        res.json({ content: [{ text }] })
      } catch (e) {
        console.log("Parse error:", data)
        res.status(500).json({ error: "Failed to parse response" })
      }
    })
  })

  proxyReq.on("error", (err) => res.status(500).json({ error: err.message }))
  proxyReq.write(body)
  proxyReq.end()
})

app.listen(3001, () => console.log("✅ API server running on port 3001"))