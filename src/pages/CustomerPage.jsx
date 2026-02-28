import { useState } from "react"
import { Link } from "react-router-dom"
import WebcamFeed from "../components/WebcamFeed"
import SuggestionPanel from "../components/SuggestionPanel"

export default function CustomerPage() {
  const [bodyType, setBodyType] = useState(null)
  const [occasion, setOccasion] = useState("casual")
  const [season, setSeason] = useState("summer")
  const [gender, setGender] = useState("neutral")

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0a", color: "#f0ece4", display: "flex", flexDirection: "column" }}>

      {/* Header */}
      <header style={{
        padding: "20px 40px", borderBottom: "1px solid #1a1a1a",
        display: "flex", alignItems: "center", gap: "16px",
        background: "linear-gradient(180deg, #0f0f0f 0%, #0a0a0a 100%)"
      }}>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <h1 className="font-display" style={{ fontSize: "28px", fontWeight: 300, letterSpacing: "0.15em", margin: 0 }}>
            STYLE<span className="gold-shimmer" style={{ fontWeight: 600 }}>SENSE</span>
          </h1>
          <span style={{ fontSize: "10px", letterSpacing: "0.3em", color: "#555", textTransform: "uppercase" }}>
            AI Fashion Advisor
          </span>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#d4af5c", boxShadow: "0 0 8px #d4af5c" }} />
            <span style={{ fontSize: "11px", letterSpacing: "0.2em", color: "#555", textTransform: "uppercase" }}>Live Analysis</span>
          </div>
          <Link to="/store/login" style={{
            fontSize: "11px", letterSpacing: "0.15em", color: "#333",
            textDecoration: "none", textTransform: "uppercase",
            border: "1px solid #222", borderRadius: "6px", padding: "6px 12px",
            transition: "all 0.2s"
          }}>
            Store Portal
          </Link>
        </div>
      </header>

      {/* Main */}
      <main style={{ display: "flex", flex: 1, gap: "24px", padding: "24px", overflow: "hidden" }}>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "16px" }}>
          <WebcamFeed onBodyTypeDetected={setBodyType} />
          <div style={{ display: "flex", gap: "12px" }}>
            {[
              { label: "Occasion", value: occasion, setter: setOccasion, options: ["casual","formal","party","work","date"] },
              { label: "Season",   value: season,   setter: setSeason,   options: ["spring","summer","autumn","winter"] },
              { label: "Style",    value: gender,   setter: setGender,   options: ["neutral","feminine","masculine","streetwear","minimalist"] },
            ].map(({ label, value, setter, options }) => (
              <div key={label} style={{ flex: 1 }}>
                <label style={{ display: "block", fontSize: "9px", letterSpacing: "0.25em", color: "#555", textTransform: "uppercase", marginBottom: "6px" }}>
                  {label}
                </label>
                <select value={value} onChange={e => setter(e.target.value)} style={{
                  width: "100%", background: "#111", border: "1px solid #222",
                  borderRadius: "8px", padding: "10px 12px", fontSize: "13px",
                  color: "#f0ece4", cursor: "pointer", outline: "none"
                }}>
                  {options.map(o => (
                    <option key={o} value={o}>{o.charAt(0).toUpperCase() + o.slice(1)}</option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        </div>
        <div style={{ width: "380px" }}>
          <SuggestionPanel bodyType={bodyType} occasion={occasion} season={season} gender={gender} />
        </div>
      </main>
    </div>
  )
}