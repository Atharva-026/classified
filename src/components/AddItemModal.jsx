import { useState } from "react"

const BODY_TYPES = ["hourglass", "pear", "apple", "rectangle", "inverted triangle"]
const OCCASIONS = ["casual", "formal", "party", "work", "date"]
const SIZES = ["XS", "S", "M", "L", "XL", "XXL"]

export default function AddItemModal({ token, onClose, onAdded }) {
  const [form, setForm] = useState({
    name: "", category: "dress", price: "",
    description: "", image_url: "",
    body_types: [], occasion: [], colors: "", sizes: ["S","M","L","XL"]
  })
  const [imageFile, setImageFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const toggle = (field, value) => {
    setForm(f => ({
      ...f,
      [field]: f[field].includes(value)
        ? f[field].filter(v => v !== value)
        : [...f[field], value]
    }))
  }

  const handleSubmit = async () => {
    if (!form.name || !form.price || form.body_types.length === 0 || form.occasion.length === 0) {
      setError("Please fill name, price, body types and occasions")
      return
    }
    setLoading(true)
    setError(null)
    try {
      const fd = new FormData()
      fd.append("name", form.name)
      fd.append("category", form.category)
      fd.append("price", form.price)
      fd.append("description", form.description)
      fd.append("body_types", JSON.stringify(form.body_types))
      fd.append("occasion", JSON.stringify(form.occasion))
      fd.append("colors", JSON.stringify(form.colors.split(",").map(c => c.trim()).filter(Boolean)))
      fd.append("sizes", JSON.stringify(form.sizes))
      if (imageFile) fd.append("image", imageFile)
      else if (form.image_url) fd.append("image_url", form.image_url)

      const res = await fetch("http://localhost:3001/api/inventory", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: fd
      })
      if (!res.ok) throw new Error("Failed to add item")
      onAdded()
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
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 100, backdropFilter: "blur(4px)"
    }}>
      <div style={{
        width: "520px", maxHeight: "85vh", overflowY: "auto",
        background: "#0f0f0f", border: "1px solid #222",
        borderRadius: "16px", padding: "32px"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
          <h2 className="font-display" style={{ fontSize: "20px", fontWeight: 300, letterSpacing: "0.1em", margin: 0 }}>
            Add New Item
          </h2>
          <button onClick={onClose} style={{
            background: "none", border: "none", color: "#555",
            fontSize: "20px", cursor: "pointer"
          }}>✕</button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Name + Category */}
          <div style={{ display: "flex", gap: "12px" }}>
            <div style={{ flex: 2 }}>
              <label style={labelStyle}>Item Name</label>
              <input style={inputStyle} placeholder="e.g. Wrap Midi Dress"
                value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Category</label>
              <select style={inputStyle} value={form.category}
                onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                {["dress","tops","bottoms","outerwear","accessories"].map(c => (
                  <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Price + Colors */}
          <div style={{ display: "flex", gap: "12px" }}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Price ($)</label>
              <input style={inputStyle} type="number" placeholder="89.99"
                value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} />
            </div>
            <div style={{ flex: 2 }}>
              <label style={labelStyle}>Colors (comma separated)</label>
              <input style={inputStyle} placeholder="black, navy, white"
                value={form.colors} onChange={e => setForm(f => ({ ...f, colors: e.target.value }))} />
            </div>
          </div>

          {/* Description */}
          <div>
            <label style={labelStyle}>Description</label>
            <textarea style={{ ...inputStyle, resize: "vertical", minHeight: "70px" }}
              placeholder="Brief description of the item..."
              value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
          </div>

          {/* Image */}
          <div>
            <label style={labelStyle}>Product Image</label>
            <input type="file" accept="image/*"
              onChange={e => setImageFile(e.target.files[0])}
              style={{ ...inputStyle, padding: "8px 12px" }} />
            <p style={{ fontSize: "10px", color: "#333", margin: "4px 0 0" }}>
              Or paste image URL:
            </p>
            <input style={{ ...inputStyle, marginTop: "6px" }}
              placeholder="https://..."
              value={form.image_url}
              onChange={e => setForm(f => ({ ...f, image_url: e.target.value }))} />
          </div>

          {/* Body Types */}
          <div>
            <label style={labelStyle}>Body Types (select all that apply)</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {BODY_TYPES.map(bt => (
                <button key={bt} onClick={() => toggle("body_types", bt)} style={{
                  padding: "6px 14px", borderRadius: "20px", fontSize: "11px",
                  cursor: "pointer", textTransform: "capitalize", letterSpacing: "0.05em",
                  background: form.body_types.includes(bt) ? "rgba(212,175,92,0.15)" : "#161616",
                  border: `1px solid ${form.body_types.includes(bt) ? "rgba(212,175,92,0.4)" : "#222"}`,
                  color: form.body_types.includes(bt) ? "#d4af5c" : "#555",
                  transition: "all 0.15s"
                }}>{bt}</button>
              ))}
            </div>
          </div>

          {/* Occasions */}
          <div>
            <label style={labelStyle}>Occasions (select all that apply)</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {OCCASIONS.map(oc => (
                <button key={oc} onClick={() => toggle("occasion", oc)} style={{
                  padding: "6px 14px", borderRadius: "20px", fontSize: "11px",
                  cursor: "pointer", textTransform: "capitalize", letterSpacing: "0.05em",
                  background: form.occasion.includes(oc) ? "rgba(212,175,92,0.15)" : "#161616",
                  border: `1px solid ${form.occasion.includes(oc) ? "rgba(212,175,92,0.4)" : "#222"}`,
                  color: form.occasion.includes(oc) ? "#d4af5c" : "#555",
                  transition: "all 0.15s"
                }}>{oc.charAt(0).toUpperCase() + oc.slice(1)}</button>
              ))}
            </div>
          </div>

          {/* Sizes */}
          <div>
            <label style={labelStyle}>Available Sizes</label>
            <div style={{ display: "flex", gap: "8px" }}>
              {SIZES.map(sz => (
                <button key={sz} onClick={() => toggle("sizes", sz)} style={{
                  padding: "6px 12px", borderRadius: "6px", fontSize: "11px",
                  cursor: "pointer", fontWeight: 500,
                  background: form.sizes.includes(sz) ? "rgba(212,175,92,0.15)" : "#161616",
                  border: `1px solid ${form.sizes.includes(sz) ? "rgba(212,175,92,0.4)" : "#222"}`,
                  color: form.sizes.includes(sz) ? "#d4af5c" : "#555",
                  transition: "all 0.15s"
                }}>{sz}</button>
              ))}
            </div>
          </div>

          {error && (
            <p style={{ fontSize: "12px", color: "#884444", margin: 0,
              background: "#1a0a0a", padding: "8px 12px", borderRadius: "6px",
              border: "1px solid #3a1a1a" }}>
              {error}
            </p>
          )}

          {/* Submit */}
          <button onClick={handleSubmit} disabled={loading} style={{
            width: "100%", padding: "12px",
            background: loading ? "#1a1a1a" : "rgba(212,175,92,0.1)",
            border: "1px solid rgba(212,175,92,0.3)",
            borderRadius: "8px", color: "#d4af5c",
            fontSize: "11px", letterSpacing: "0.2em",
            textTransform: "uppercase", cursor: loading ? "not-allowed" : "pointer"
          }}>
            {loading ? "Adding..." : "Add to Collection"}
          </button>
        </div>
      </div>
    </div>
  )
}