export async function getFashionSuggestions({
  bodyType,
  occasion,
  season,
  gender = "neutral",
}) {
  const response = await fetch("http://localhost:3001/api/fashion", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: `You are a professional fashion stylist. Respond ONLY with a JSON object, no markdown, no extra text.

The user has a ${bodyType} body type.
Occasion: ${occasion}
Season: ${season}
Style preference: ${gender}

Return this exact JSON structure:
{
  "bodyTypeDescription": "2 sentence encouraging description of this body type",
  "topPicks": [
    { "item": "specific clothing item", "reason": "why it works for this body type" },
    { "item": "specific clothing item", "reason": "why it works for this body type" },
    { "item": "specific clothing item", "reason": "why it works for this body type" }
  ],
  "fabrics": ["fabric1", "fabric2", "fabric3"],
  "colors": ["color1", "color2", "color3"],
  "avoid": ["item to avoid with brief reason", "item to avoid with brief reason"],
  "outfitIdea": "One complete outfit suggestion for the occasion and season"
}`,
        },
      ],
    }),
  })

  if (!response.ok) throw new Error(`API error: ${response.status}`)

  const data = await response.json()
  const text = data.content[0].text
  const clean = text.replace(/```json|```/g, "").trim()
  return JSON.parse(clean)
}