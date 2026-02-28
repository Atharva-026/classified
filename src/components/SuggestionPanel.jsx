import { useEffect, useState, useRef } from "react"
import { getFashionSuggestions } from "../utils/claudeService"
import ProductCard from "./ProductCard"

const BODY_TYPE_SHAPES = {
  hourglass: "⌛", pear: "🍐", apple: "🍎",
  rectangle: "▬", "inverted triangle": "🔺"
}

function Label({ children }) {
  return (
    <p style={{
      fontSize: "9px", letterSpacing: "0.25em", color: "#444",
      textTransform: "uppercase", margin: "0 0 8px"
    }}>
      {children}
    </p>
  )
}

function Card({ children, delay = 0, gold = false }) {
  return (
    <div className="fade-in-up" style={{
      background: "#111",
      border: `1px solid ${gold ? "rgba(212,175,92,0.2)" : "#1a1a1a"}`,
      borderRadius: "12px", padding: "16px",
      animationDelay: `${delay}s`, opacity: 0,
    }}>
      {children}
    </div>
  )
}

export default function SuggestionPanel({ bodyType, occasion, season, gender }) {
  const [suggestions, setSuggestions] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [tab, setTab] = useState("products") // "products" | "tips"
  const debounceRef = useRef(null)
  const lastFetchRef = useRef("")

  useEffect(() => {
    if (!bodyType) { setSuggestions(null); return }

    const key = `${bodyType}-${occasion}-${season}-${gender}`
    if (key === lastFetchRef.current) return

    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      lastFetchRef.current = key
      setLoading(true)
      setError(null)
      try {
        const data = await getFashionSuggestions({ bodyType, occasion, season, gender })
        setSuggestions(data)
        setTab("products")
      } catch (err) {
        setError("Could not load suggestions.")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }, 2000)

    return () => clearTimeout(debounceRef.current)
  }, [bodyType, occasion, season, gender])

  return (
    <div style={{
      height: "100%", background: "#0d0d0d",
      borderRadius: "16px", border: "1px solid #1a1a1a",
      padding: "20px", display: "flex", flexDirection: "column",
      gap: "12px", overflowY: "auto"
    }}>
      {/* Header */}
      <div style={{ borderBottom: "1px solid #1a1a1a", paddingBottom: "12px" }}>
        <h2 className="font-display" style={{
          fontSize: "20px", fontWeight: 300,
          letterSpacing: "0.1em", margin: "0 0 2px"
        }}>
          Your Edit
        </h2>
        <p style={{ fontSize: "11px", color: "#333", margin: 0, letterSpacing: "0.1em" }}>
          {bodyType ? `${occasion} · ${season} · ${bodyType}` : "Awaiting analysis"}
        </p>
      </div>

      {/* Empty state */}
      {!bodyType && !loading && (
        <div style={{ flex: 1, display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center", gap: "16px", textAlign: "center" }}>
          <div style={{ fontSize: "48px", opacity: 0.15 }}>◈</div>
          <div>
            <p className="font-display" style={{ fontSize: "18px", fontWeight: 300,
              color: "#333", letterSpacing: "0.1em", margin: "0 0 4px" }}>
              Step into the frame
            </p>
            <p style={{ fontSize: "11px", color: "#2a2a2a", letterSpacing: "0.05em" }}>
              Full body · Good lighting · 1.5m distance
            </p>
          </div>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div style={{ flex: 1, display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center", gap: "16px" }}>
          <div style={{
            width: "32px", height: "32px",
            border: "1px solid #d4af5c",
            borderTopColor: "transparent",
            borderRadius: "50%",
            animation: "spin 1s linear infinite"
          }} />
          <p style={{ fontSize: "11px", letterSpacing: "0.2em", color: "#444", textTransform: "uppercase" }}>
            Curating your edit
          </p>
          <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
        </div>
      )}

      {/* Error */}
      {error && (
        <div style={{ padding: "12px", background: "#1a0a0a",
          border: "1px solid #3a1a1a", borderRadius: "8px",
          fontSize: "12px", color: "#884444" }}>
          {error}
        </div>
      )}

      {/* Results */}
      {suggestions && !loading && (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>

          {/* Body type card */}
          <Card delay={0} gold>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ fontSize: "24px" }}>{BODY_TYPE_SHAPES[bodyType] || "◈"}</span>
              <div>
                <Label>Detected Silhouette</Label>
                <p className="gold-shimmer font-display" style={{
                  fontSize: "20px", fontWeight: 400,
                  letterSpacing: "0.1em", margin: 0, textTransform: "capitalize"
                }}>
                  {bodyType}
                </p>
              </div>
            </div>
            <p style={{ fontSize: "12px", color: "#666", marginTop: "10px",
              lineHeight: 1.6, borderTop: "1px solid #1a1a1a", paddingTop: "10px" }}>
              {suggestions.bodyTypeDescription}
            </p>
          </Card>

          {/* Outfit idea */}
          <Card delay={0.1}>
            <Label>✦ Curated Outfit</Label>
            <p style={{ fontSize: "13px", color: "#c8c0b4", lineHeight: 1.7, margin: 0 }}>
              {suggestions.outfitIdea}
            </p>
          </Card>

          {/* Tabs */}
          <div style={{ display: "flex", gap: "8px", borderBottom: "1px solid #1a1a1a", paddingBottom: "12px" }}>
            {["products", "tips"].map(t => (
              <button key={t} onClick={() => setTab(t)} style={{
                padding: "6px 16px", borderRadius: "20px", fontSize: "10px",
                letterSpacing: "0.15em", textTransform: "uppercase", cursor: "pointer",
                background: tab === t ? "rgba(212,175,92,0.1)" : "transparent",
                border: `1px solid ${tab === t ? "rgba(212,175,92,0.3)" : "#222"}`,
                color: tab === t ? "#d4af5c" : "#444",
                transition: "all 0.2s"
              }}>
                {t === "products" ? `Shop (${suggestions.recommendedProducts?.length || 0})` : "Style Tips"}
              </button>
            ))}
          </div>

          {/* Products tab */}
          {tab === "products" && (
            <div key="products-tab" style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {suggestions.recommendedProducts?.length > 0 ? (
                suggestions.recommendedProducts.map((product, i) => (
                  <ProductCard key={product.id} item={product} reason={product.reason} delay={i * 0.1} />
                ))
              ) : (
                <div style={{ textAlign: "center", padding: "32px", color: "#333" }}>
                  <p style={{ fontSize: "13px" }}>No matching items in store for this occasion.</p>
                  <p style={{ fontSize: "11px", marginTop: "4px" }}>Try changing occasion or season.</p>
                </div>
              )}
            </div>
          )}

          {/* Tips tab */}
          {tab === "tips" && (
            <div key="tips-tab" style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <Card delay={0}>
                <Label>✦ Styling Tips</Label>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {suggestions.stylingTips?.length > 0
                    ? suggestions.stylingTips.map((tip, i) => (
                        <p key={i} style={{
                          fontSize: "12px", color: "#888", margin: 0,
                          lineHeight: 1.6, paddingLeft: "10px",
                          borderLeft: "1px solid rgba(212,175,92,0.3)"
                        }}>
                          {tip}
                        </p>
                      ))
                    : <p style={{ fontSize: "12px", color: "#444" }}>No tips available</p>
                  }
                </div>
              </Card>
              <Card delay={0.1}>
                <Label>⊘ Avoid</Label>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  {suggestions.avoid?.length > 0
                    ? suggestions.avoid.map((a, i) => (
                        <p key={i} style={{
                          fontSize: "11px", color: "#553333", margin: 0,
                          paddingLeft: "8px", borderLeft: "1px solid #3a1a1a", lineHeight: 1.5
                        }}>
                          {a}
                        </p>
                      ))
                    : <p style={{ fontSize: "12px", color: "#444" }}>No items to avoid</p>
                  }
                </div>
              </Card>
            </div>
          )}

          {/* Refresh */}
          <button
            onClick={() => { lastFetchRef.current = ""; setSuggestions(null) }}
            style={{
              width: "100%", padding: "10px", background: "transparent",
              border: "1px solid #222", borderRadius: "8px", color: "#444",
              fontSize: "11px", letterSpacing: "0.2em", textTransform: "uppercase",
              cursor: "pointer", transition: "all 0.2s"
            }}
            onMouseEnter={e => { e.target.style.borderColor = "#d4af5c"; e.target.style.color = "#d4af5c" }}
            onMouseLeave={e => { e.target.style.borderColor = "#222"; e.target.style.color = "#444" }}
          >
            Refresh Edit
          </button>
        </div>
      )}
    </div>
  )
}