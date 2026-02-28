import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Link } from "react-router-dom"

export default function StoreLogin() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  const handleLogin = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("http://localhost:3001/api/staff/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      localStorage.setItem("staff_token", data.token)
      localStorage.setItem("store_name", data.store)
      navigate("/store")
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: "100vh", background: "#0a0a0a",
      display: "flex", alignItems: "center", justifyContent: "center"
    }}>
      <div style={{
        width: "360px", background: "#0f0f0f",
        border: "1px solid #1a1a1a", borderRadius: "16px", padding: "40px"
      }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <h1 className="font-display" style={{ fontSize: "24px", fontWeight: 300, letterSpacing: "0.2em", margin: "0 0 4px" }}>
            STYLE<span className="gold-shimmer" style={{ fontWeight: 600 }}>SENSE</span>
          </h1>
          <p style={{ fontSize: "10px", letterSpacing: "0.3em", color: "#444", textTransform: "uppercase" }}>
            Store Portal
          </p>
        </div>

        {/* Form */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div>
            <label style={{ display: "block", fontSize: "9px", letterSpacing: "0.25em", color: "#555", textTransform: "uppercase", marginBottom: "6px" }}>
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="admin"
              style={{
                width: "100%", background: "#161616", border: "1px solid #222",
                borderRadius: "8px", padding: "10px 12px", fontSize: "13px",
                color: "#f0ece4", outline: "none", boxSizing: "border-box"
              }}
            />
          </div>
          <div>
            <label style={{ display: "block", fontSize: "9px", letterSpacing: "0.25em", color: "#555", textTransform: "uppercase", marginBottom: "6px" }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              onKeyDown={e => e.key === "Enter" && handleLogin()}
              style={{
                width: "100%", background: "#161616", border: "1px solid #222",
                borderRadius: "8px", padding: "10px 12px", fontSize: "13px",
                color: "#f0ece4", outline: "none", boxSizing: "border-box"
              }}
            />
          </div>

          {error && (
            <p style={{ fontSize: "12px", color: "#884444", margin: 0,
              background: "#1a0a0a", padding: "8px 12px", borderRadius: "6px",
              border: "1px solid #3a1a1a" }}>
              {error}
            </p>
          )}

          <button
            onClick={handleLogin}
            disabled={loading}
            style={{
              width: "100%", padding: "12px",
              background: loading ? "#1a1a1a" : "rgba(212,175,92,0.1)",
              border: "1px solid rgba(212,175,92,0.3)",
              borderRadius: "8px", color: "#d4af5c",
              fontSize: "11px", letterSpacing: "0.2em",
              textTransform: "uppercase", cursor: loading ? "not-allowed" : "pointer",
              transition: "all 0.2s"
            }}
          >
            {loading ? "Signing in..." : "Enter Store"}
          </button>
        </div>

        <div style={{ textAlign: "center", marginTop: "24px", display: "flex", flexDirection: "column", gap: "8px" }}>
          <p style={{ fontSize: "10px", color: "#2a2a2a", margin: 0 }}>
            Default: admin / stylesense123
          </p>
          <p style={{ fontSize: "11px", color: "#333", margin: 0 }}>
            New store?{" "}
            <Link to="/store/register" style={{ color: "#d4af5c", textDecoration: "none", letterSpacing: "0.05em" }}>
              Register here
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}