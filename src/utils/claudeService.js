import { apiUrl } from "./api"

export async function getFashionSuggestions({
  bodyType,
  occasion,
  season,
  gender = "neutral",
}) {
  // Step 1: Fetch matching inventory from backend
  const inventoryRes = await fetch(
    apiUrl(`/api/inventory?body_type=${encodeURIComponent(bodyType)}&occasion=${encodeURIComponent(occasion)}`)
  )
  const inventory = await inventoryRes.json()

  // Step 2: Send to AI with real inventory context
  const response = await fetch(apiUrl("/api/fashion"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      inventory,
      messages: [
        {
          role: "user",
          content: `You are a professional fashion stylist. Respond ONLY with a JSON object, no markdown, no extra text.

The customer has a ${bodyType} body type.
Occasion: ${occasion}
Season: ${season}
Style preference: ${gender}

Available store inventory (ONLY suggest from these):
${inventory?.length > 0 
  ? inventory.map((item, i) =>
      `${i + 1}. ID: "${item._id || item.id}" | Name: "${item.name}" | Category: ${item.category} | Colors: ${item.colors.join(", ")} | Price: $${item.price} | Description: ${item.description}`
    ).join("\n")
  : "No inventory available - give general advice"
}

Return EXACTLY this JSON structure with EXACTLY these field names:
{
  "bodyTypeDescription": "2 sentence encouraging description of this body type",
  "outfitIdea": "Complete outfit suggestion using items from the store above",
  "recommendedProducts": [
    {
      "id": "exact product ID from inventory above",
      "reason": "why this specifically flatters a ${bodyType} body type"
    }
  ],
  "stylingTips": ["tip 1", "tip 2", "tip 3"],
  "avoid": ["what to avoid and why", "another thing to avoid"]
}

IMPORTANT: The field must be called exactly "stylingTips" not "styling_tips" or "tips".`
        }
      ]
    })
  })

  if (!response.ok) throw new Error(`API error: ${response.status}`)

  const data = await response.json()
  const text = data.content[0].text
  const clean = text.replace(/```json|```/g, "").trim()
  const parsed = JSON.parse(clean)

  // Step 3: Attach full product data to recommendations
  parsed.recommendedProducts = (parsed.recommendedProducts || [])
    .map(rec => ({
      ...rec,
      ...inventory.find(item => (item._id || item.id) === rec.id)
    }))
    .filter(rec => rec.name) // remove any AI hallucinated IDs

  return { ...parsed, inventory }
}
