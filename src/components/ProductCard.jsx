export default function ProductCard({ item, reason, delay = 0 }) {
  return (
    <div className="fade-in-up card-lift" style={{
      background: "#111",
      border: "1px solid #1a1a1a",
      borderRadius: "12px",
      overflow: "hidden",
      animationDelay: `${delay}s`,
      opacity: 0,
    }}>
      {/* Product Image */}
      <div style={{ height: "200px", overflow: "hidden", background: "#0a0a0a", position: "relative" }}>
        {item.image_url ? (
          <img
            src={item.image_url}
            alt={item.name}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <div style={{ height: "100%", display: "flex", alignItems: "center",
            justifyContent: "center", color: "#222", fontSize: "40px" }}>◈</div>
        )}
        {/* Price badge */}
        <div style={{
          position: "absolute", top: "10px", right: "10px",
          background: "rgba(0,0,0,0.8)", backdropFilter: "blur(8px)",
          borderRadius: "20px", padding: "4px 10px",
          border: "1px solid rgba(212,175,92,0.3)"
        }}>
          <span style={{ fontSize: "12px", color: "#d4af5c", fontWeight: 500 }}>
            ${item.price}
          </span>
        </div>
      </div>

      {/* Product Info */}
      <div style={{ padding: "14px" }}>
        <div style={{ marginBottom: "8px" }}>
          <p style={{ fontSize: "13px", fontWeight: 500, margin: "0 0 2px", color: "#f0ece4" }}>
            {item.name}
          </p>
          <p style={{ fontSize: "11px", color: "#444", margin: 0, textTransform: "capitalize" }}>
            {item.category}
          </p>
        </div>

        {/* AI Reason */}
        <p style={{
          fontSize: "11px", color: "#666", lineHeight: 1.6,
          margin: "0 0 10px", padding: "8px",
          background: "#0a0a0a", borderRadius: "6px",
          border: "1px solid #1a1a1a", fontStyle: "italic"
        }}>
          ✦ {reason}
        </p>

        {/* Colors */}
        {item.colors?.length > 0 && (
          <div style={{ display: "flex", gap: "4px", flexWrap: "wrap", marginBottom: "8px" }}>
            {item.colors.map((c, i) => (
              <span key={i} style={{
                fontSize: "9px", padding: "2px 8px", borderRadius: "20px",
                background: "#161616", border: "1px solid #222", color: "#666",
                textTransform: "capitalize"
              }}>{c}</span>
            ))}
          </div>
        )}

        {/* Sizes */}
        {item.sizes?.length > 0 && (
          <div style={{ display: "flex", gap: "4px" }}>
            {item.sizes.map((s, i) => (
              <span key={i} style={{
                fontSize: "9px", padding: "3px 8px", borderRadius: "4px",
                background: "#161616", border: "1px solid #222", color: "#555",
                fontWeight: 500
              }}>{s}</span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}