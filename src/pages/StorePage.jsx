import { useState, useEffect, useCallback } from "react"
import { useNavigate, Link } from "react-router-dom"
import AddItemModal from "../components/AddItemModal"
import { apiUrl } from "../utils/api"

export default function StorePage() {
  const [inventory, setInventory] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const navigate = useNavigate()
  const token = localStorage.getItem("staff_token")
  const storeName = localStorage.getItem("store_name")

  const fetchInventory = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(apiUrl("/api/staff/inventory"), {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      setInventory(data)
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchInventory()
    }, 0)

    return () => clearTimeout(timeoutId)
  }, [fetchInventory])

  const handleDelete = async (id) => {
    if (!confirm("Delete this item?")) return
    await fetch(apiUrl(`/api/inventory/${id}`), {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` }
    })
    fetchInventory()
  }

  const handleToggleStock = async (id, current) => {
    await fetch(apiUrl(`/api/inventory/${id}/stock`), {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ in_stock: !current })
    })
    fetchInventory()
  }

  const handleLogout = () => {
    localStorage.removeItem("staff_token")
    localStorage.removeItem("store_name")
    navigate("/store/login")
  }

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0a", color: "#f0ece4" }}>

      {/* Header */}
      <header style={{
        padding: "20px 40px", borderBottom: "1px solid #1a1a1a",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        background: "#0f0f0f"
      }}>
        <div>
          <h1 className="font-display" style={{ fontSize: "22px", fontWeight: 300, letterSpacing: "0.15em", margin: "0 0 2px" }}>
            STYLE<span className="gold-shimmer" style={{ fontWeight: 600 }}>SENSE</span>
          </h1>
          <p style={{ fontSize: "10px", letterSpacing: "0.25em", color: "#444", margin: 0, textTransform: "uppercase" }}>
            {storeName} · Store Portal
          </p>
        </div>
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <Link to="/" style={{
            fontSize: "11px", color: "#555", textDecoration: "none",
            letterSpacing: "0.1em", textTransform: "uppercase"
          }}>
            ← Customer View
          </Link>
          <button
            onClick={() => setShowModal(true)}
            style={{
              padding: "8px 20px", background: "rgba(212,175,92,0.1)",
              border: "1px solid rgba(212,175,92,0.3)", borderRadius: "8px",
              color: "#d4af5c", fontSize: "11px", letterSpacing: "0.15em",
              textTransform: "uppercase", cursor: "pointer"
            }}
          >
            + Add Item
          </button>
          <button onClick={handleLogout} style={{
            padding: "8px 16px", background: "transparent",
            border: "1px solid #222", borderRadius: "8px",
            color: "#444", fontSize: "11px", letterSpacing: "0.15em",
            textTransform: "uppercase", cursor: "pointer"
          }}>
            Logout
          </button>
        </div>
      </header>

      {/* Stats bar */}
      <div style={{
        padding: "16px 40px", borderBottom: "1px solid #111",
        display: "flex", gap: "32px"
      }}>
        {[
          { label: "Total Items", value: inventory.length },
          { label: "In Stock", value: inventory.filter(i => i.in_stock).length },
          { label: "Out of Stock", value: inventory.filter(i => !i.in_stock).length },
        ].map(({ label, value }) => (
          <div key={label}>
            <p style={{ fontSize: "9px", letterSpacing: "0.25em", color: "#444", textTransform: "uppercase", margin: "0 0 2px" }}>{label}</p>
            <p className="font-display" style={{ fontSize: "24px", fontWeight: 300, color: "#d4af5c", margin: 0 }}>{value}</p>
          </div>
        ))}
      </div>

      {/* Inventory grid */}
      <div style={{ padding: "24px 40px" }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: "60px", color: "#333" }}>Loading inventory...</div>
        ) : (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
            gap: "16px"
          }}>
            {inventory.map(item => (
              <div key={item._id || item.id} style={{
                background: "#0f0f0f", border: `1px solid ${item.in_stock ? "#1a1a1a" : "#2a1a1a"}`,
                borderRadius: "12px", overflow: "hidden",
                opacity: item.in_stock ? 1 : 0.6
              }}>
                {/* Image */}
                <div style={{ height: "180px", overflow: "hidden", background: "#111" }}>
                  {item.image_url ? (
                    <img src={item.image_url} alt={item.name}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    <div style={{ height: "100%", display: "flex", alignItems: "center",
                      justifyContent: "center", color: "#222", fontSize: "32px" }}>◈</div>
                  )}
                </div>

                {/* Info */}
                <div style={{ padding: "14px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "6px" }}>
                    <p style={{ fontSize: "13px", fontWeight: 500, margin: 0, color: "#f0ece4" }}>{item.name}</p>
                    <span style={{ fontSize: "13px", color: "#d4af5c", fontWeight: 500 }}>${item.price}</span>
                  </div>
                  <p style={{ fontSize: "11px", color: "#444", margin: "0 0 8px", textTransform: "capitalize" }}>
                    {item.category}
                  </p>

                  {/* Body types */}
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", marginBottom: "10px" }}>
                    {item.body_types.map(bt => (
                      <span key={bt} style={{
                        fontSize: "9px", padding: "2px 8px", borderRadius: "20px",
                        background: "rgba(212,175,92,0.1)", border: "1px solid rgba(212,175,92,0.2)",
                        color: "#d4af5c", textTransform: "capitalize", letterSpacing: "0.05em"
                      }}>{bt}</span>
                    ))}
                  </div>

                  {/* Actions */}
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button
                      onClick={() => handleToggleStock(item._id || item.id, item.in_stock)}
                      style={{
                        flex: 1, padding: "6px", fontSize: "10px",
                        letterSpacing: "0.1em", textTransform: "uppercase",
                        background: item.in_stock ? "#161616" : "rgba(212,175,92,0.1)",
                        border: `1px solid ${item.in_stock ? "#222" : "rgba(212,175,92,0.3)"}`,
                        borderRadius: "6px",
                        color: item.in_stock ? "#555" : "#d4af5c",
                        cursor: "pointer"
                      }}
                    >
                      {item.in_stock ? "Mark Out" : "Mark In"}
                    </button>
                    <button
                      onClick={() => handleDelete(item._id || item.id)}
                      style={{
                        padding: "6px 12px", fontSize: "10px",
                        background: "transparent", border: "1px solid #2a1a1a",
                        borderRadius: "6px", color: "#553333", cursor: "pointer"
                      }}
                    >
                      ✕
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Item Modal */}
      {showModal && (
        <AddItemModal
          token={token}
          onClose={() => setShowModal(false)}
          onAdded={() => { setShowModal(false); fetchInventory() }}
        />
      )}
    </div>
  )
}
