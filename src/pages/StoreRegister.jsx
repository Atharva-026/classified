import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { apiUrl } from "../utils/api"

export default function StoreRegister() {
  const [form, setForm] = useState({ username: "", password: "", confirmPassword: "", store_name: "" })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  const handleRegister = async () => {
    if (!form.username || !form.password || !form.store_name) {
      return setError("All fields are required")
    }
    if (form.password !== form.confirmPassword) {
      return setError("Passwords do not match")
    }
    if (form.password.length < 6) {
      return setError("Password must be at least 6 characters")
    }

    setLoading(true)
    setError(null)
    try {
      const res = await fetch(apiUrl("/api/staff/register"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: form.username,
          password: form.password,
          store_name: form.store_name
        })
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

  const inputStyle = {
    width: "100%", background: "#161616", border: "1px solid #222",
    borderRadius: "8px", padding: "10px 12px", fontSize: "13px",
    color: "#f0ece4", outline: "none", boxSizing: "border-box"
  }
  const labelStyle = {
    display: "block", fontSize: "9px", letterSpacing: "0.25em",
    color: "#555", textTransform: "uppercase", marginBottom: "6px"
  }

  return (
    <div style={{
      minHeight: "100vh", background: "#0a0a0a",
      display: "flex", alignItems: "center", justifyContent: "center"
    }}>
      <div style={{
        width: "400px", background: "#0f0f0f",
        border: "1px solid #1a1a1a", borderRadius: "16px", padding: "40px"
      }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <h1 className="font-display" style={{ fontSize: "24px", fontWeight: 300, letterSpacing: "0.2em", margin: "0 0 4px" }}>
            STYLE<span className="gold-shimmer" style={{ fontWeight: 600 }}>SENSE</span>
          </h1>
          <p style={{ fontSize: "10px", letterSpacing: "0.3em", color: "#444", textTransform: "uppercase" }}>
            Register Your Store
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Store Name */}
          <div>
            <label style={labelStyle}>Store Name</label>
            <input
              style={inputStyle}
              placeholder="e.g. Zara — MG Road"
              value={form.store_name}
              onChange={e => setForm(f => ({ ...f, store_name: e.target.value }))}
            />
          </div>

          {/* Username */}
          <div>
            <label style={labelStyle}>Username</label>
            <input
              style={inputStyle}
              placeholder="e.g. zara_mgroad"
              value={form.username}
              onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
            />
          </div>

          {/* Password */}
          <div>
            <label style={labelStyle}>Password</label>
            <input
              type="password"
              style={inputStyle}
              placeholder="Min 6 characters"
              value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
            />
          </div>

          {/* Confirm Password */}
          <div>
            <label style={labelStyle}>Confirm Password</label>
            <input
              type="password"
              style={inputStyle}
              placeholder="Repeat password"
              value={form.confirmPassword}
              onChange={e => setForm(f => ({ ...f, confirmPassword: e.target.value }))}
              onKeyDown={e => e.key === "Enter" && handleRegister()}
            />
          </div>

          {error && (
            <p style={{
              fontSize: "12px", color: "#884444", margin: 0,
              background: "#1a0a0a", padding: "8px 12px",
              borderRadius: "6px", border: "1px solid #3a1a1a"
            }}>
              {error}
            </p>
          )}

          <button
            onClick={handleRegister}
            disabled={loading}
            style={{
              width: "100%", padding: "12px",
              background: loading ? "#1a1a1a" : "rgba(212,175,92,0.1)",
              border: "1px solid rgba(212,175,92,0.3)",
              borderRadius: "8px", color: "#d4af5c",
              fontSize: "11px", letterSpacing: "0.2em",
              textTransform: "uppercase",
              cursor: loading ? "not-allowed" : "pointer"
            }}
          >
            {loading ? "Creating Store..." : "Register Store"}
          </button>

          {/* Link to login */}
          <p style={{ textAlign: "center", fontSize: "11px", color: "#333", margin: 0 }}>
            Already have an account?{" "}
            <Link to="/store/login" style={{ color: "#d4af5c", textDecoration: "none" }}>
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
