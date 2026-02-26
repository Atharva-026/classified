import { useEffect, useState, useRef } from "react"
import { getFashionSuggestions } from "../utils/claudeService"

const BODY_TYPE_EMOJI = {
  hourglass: "⌛",
  pear: "🍐",
  apple: "🍎",
  rectangle: "▭",
  "inverted triangle": "🔺",
}

export default function SuggestionPanel({ bodyType, occasion, season }) {
  const [suggestions, setSuggestions] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const debounceRef = useRef(null)
  const lastFetchRef = useRef("")

  useEffect(() => {
    if (!bodyType) {
      setSuggestions(null)
      return
    }

    // Avoid refetching same combination
    const key = `${bodyType}-${occasion}-${season}`
    if (key === lastFetchRef.current) return

    // Debounce — wait 2s after body type stabilizes before calling Claude
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      lastFetchRef.current = key
      setLoading(true)
      setError(null)
      try {
        const data = await getFashionSuggestions({ bodyType, occasion, season })
        setSuggestions(data)
      } catch (err) {
        setError("Couldn't load suggestions. Check your API key.")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }, 2000)

    return () => clearTimeout(debounceRef.current)
  }, [bodyType, occasion, season])

  return (
    <div className="h-full bg-gray-900 rounded-2xl border border-gray-800 p-5 flex flex-col gap-4 overflow-y-auto">
      <h2 className="font-semibold text-lg shrink-0">✨ Style Suggestions</h2>

      {/* No body detected */}
      {!bodyType && (
        <div className="flex-1 flex flex-col items-center justify-center text-center gap-3">
          <span className="text-5xl">🕵️</span>
          <p className="text-gray-400 text-sm">
            Stand in front of the camera so your full body is visible.
            StyleSense AI will analyze your body type and suggest outfits.
          </p>
        </div>
      )}

      {/* Loading */}
      {bodyType && loading && (
        <div className="flex-1 flex flex-col items-center justify-center gap-4">
          <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400 text-sm">
            Analyzing your {bodyType} body type...
          </p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-900/30 border border-red-700 rounded-xl p-3 text-red-300 text-sm">
          {error}
        </div>
      )}

      {/* Suggestions */}
      {suggestions && !loading && (
        <div className="flex flex-col gap-4">

          {/* Body type badge */}
          <div className="bg-purple-900/40 border border-purple-700 rounded-xl px-4 py-3">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xl">
                {BODY_TYPE_EMOJI[bodyType] || "👤"}
              </span>
              <span className="font-bold capitalize text-purple-300">
                {bodyType} Body Type
              </span>
            </div>
            <p className="text-gray-300 text-xs leading-relaxed">
              {suggestions.bodyTypeDescription}
            </p>
          </div>

          {/* Outfit idea */}
          <div className="bg-gray-800 rounded-xl px-4 py-3">
            <p className="text-xs text-gray-400 mb-1">🎯 Outfit Idea for {occasion}</p>
            <p className="text-sm text-white leading-relaxed">
              {suggestions.outfitIdea}
            </p>
          </div>

          {/* Top picks */}
          <div>
            <p className="text-xs text-gray-400 mb-2">👗 Top Picks</p>
            <div className="flex flex-col gap-2">
              {suggestions.topPicks.map((pick, i) => (
                <div key={i} className="bg-gray-800 rounded-xl px-4 py-3">
                  <p className="text-sm font-medium text-white">{pick.item}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{pick.reason}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Fabrics + Colors */}
          <div className="flex gap-3">
            <div className="flex-1 bg-gray-800 rounded-xl px-4 py-3">
              <p className="text-xs text-gray-400 mb-2">🧵 Fabrics</p>
              <div className="flex flex-wrap gap-1">
                {suggestions.fabrics.map((f, i) => (
                  <span key={i}
                    className="text-xs bg-gray-700 rounded-full px-2 py-0.5 text-gray-200">
                    {f}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex-1 bg-gray-800 rounded-xl px-4 py-3">
              <p className="text-xs text-gray-400 mb-2">🎨 Colors</p>
              <div className="flex flex-wrap gap-1">
                {suggestions.colors.map((c, i) => (
                  <span key={i}
                    className="text-xs bg-gray-700 rounded-full px-2 py-0.5 text-gray-200">
                    {c}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Avoid */}
          <div className="bg-red-900/20 border border-red-900 rounded-xl px-4 py-3">
            <p className="text-xs text-red-400 mb-2">❌ What to Avoid</p>
            <ul className="flex flex-col gap-1">
              {suggestions.avoid.map((a, i) => (
                <li key={i} className="text-xs text-gray-300">• {a}</li>
              ))}
            </ul>
          </div>

          {/* Refresh button */}
          <button
            onClick={() => {
              lastFetchRef.current = ""
              setSuggestions(null)
            }}
            className="w-full py-2 rounded-xl bg-purple-700 hover:bg-purple-600 
                       transition text-sm font-medium"
          >
            🔄 Refresh Suggestions
          </button>
        </div>
      )}
    </div>
  )
}