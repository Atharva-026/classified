import { useEffect, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"

export default function LandingPage() {
  const navigate = useNavigate()
  const heroRef = useRef(null)
  const [scrollY, setScrollY] = useState(0)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    const handleMouse = (e) => setMousePos({ x: e.clientX, y: e.clientY })
    window.addEventListener("scroll", handleScroll)
    window.addEventListener("mousemove", handleMouse)
    return () => {
      window.removeEventListener("scroll", handleScroll)
      window.removeEventListener("mousemove", handleMouse)
    }
  }, [])

  return (
    <div style={{ background: "#080808", color: "#f0ece4", overflowX: "hidden" }}>

      {/* ── Cursor glow effect ── */}
      <div style={{
        position: "fixed", zIndex: 0, pointerEvents: "none",
        width: "600px", height: "600px", borderRadius: "50%",
        background: "radial-gradient(circle, rgba(212,175,92,0.04) 0%, transparent 70%)",
        transform: `translate(${mousePos.x - 300}px, ${mousePos.y - 300}px)`,
        transition: "transform 0.1s ease",
      }} />

      {/* ── Navbar ── */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        padding: "20px 60px", display: "flex", alignItems: "center",
        background: scrollY > 50 ? "rgba(8,8,8,0.95)" : "transparent",
        backdropFilter: scrollY > 50 ? "blur(20px)" : "none",
        borderBottom: scrollY > 50 ? "1px solid #1a1a1a" : "none",
        transition: "all 0.4s ease"
      }}>
        <div>
          <h1 className="font-display" style={{
            fontSize: "22px", fontWeight: 300,
            letterSpacing: "0.2em", margin: 0
          }}>
            STYLE<span className="gold-shimmer" style={{ fontWeight: 600 }}>SENSE</span>
          </h1>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: "32px", alignItems: "center" }}>
          {["How It Works", "Features", "For Stores"].map(item => (
            <a key={item} href={`#${item.toLowerCase().replace(/ /g, "-")}`} style={{
              fontSize: "11px", letterSpacing: "0.2em", color: "#666",
              textDecoration: "none", textTransform: "uppercase",
              transition: "color 0.2s"
            }}
            onMouseEnter={e => e.target.style.color = "#d4af5c"}
            onMouseLeave={e => e.target.style.color = "#666"}
            >{item}</a>
          ))}
          <button onClick={() => navigate("/store/login")} style={{
            padding: "8px 20px", background: "transparent",
            border: "1px solid #333", borderRadius: "4px",
            color: "#888", fontSize: "11px", letterSpacing: "0.2em",
            textTransform: "uppercase", cursor: "pointer",
            transition: "all 0.2s"
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = "#d4af5c"; e.currentTarget.style.color = "#d4af5c" }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = "#333"; e.currentTarget.style.color = "#888" }}
          >
            Store Login
          </button>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section ref={heroRef} style={{
        minHeight: "100vh", display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center", textAlign: "center",
        padding: "120px 40px 80px", position: "relative", overflow: "hidden"
      }}>
        {/* Background grid */}
        <div style={{
          position: "absolute", inset: 0, zIndex: 0,
          backgroundImage: `
            linear-gradient(rgba(212,175,92,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(212,175,92,0.03) 1px, transparent 1px)
          `,
          backgroundSize: "80px 80px",
          transform: `translateY(${scrollY * 0.3}px)`
        }} />

        {/* Gradient orbs */}
        <div style={{
          position: "absolute", top: "20%", left: "10%", zIndex: 0,
          width: "400px", height: "400px", borderRadius: "50%",
          background: "radial-gradient(circle, rgba(212,175,92,0.06) 0%, transparent 70%)",
          filter: "blur(40px)"
        }} />
        <div style={{
          position: "absolute", bottom: "20%", right: "10%", zIndex: 0,
          width: "300px", height: "300px", borderRadius: "50%",
          background: "radial-gradient(circle, rgba(180,120,60,0.05) 0%, transparent 70%)",
          filter: "blur(40px)"
        }} />

        <div style={{ position: "relative", zIndex: 1, maxWidth: "900px" }}>
          {/* Eyebrow */}
          <div style={{
            display: "inline-flex", alignItems: "center", gap: "12px",
            marginBottom: "32px", padding: "8px 20px",
            border: "1px solid rgba(212,175,92,0.2)", borderRadius: "40px",
            background: "rgba(212,175,92,0.05)"
          }}>
            <div style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#d4af5c", boxShadow: "0 0 8px #d4af5c" }} />
            <span style={{ fontSize: "10px", letterSpacing: "0.3em", color: "#d4af5c", textTransform: "uppercase" }}>
              AI-Powered Fashion Intelligence
            </span>
          </div>

          {/* Main headline */}
          <h2 className="font-display" style={{
            fontSize: "clamp(52px, 8vw, 100px)",
            fontWeight: 300, lineHeight: 1.05,
            letterSpacing: "-0.01em", margin: "0 0 8px",
            color: "#f0ece4"
          }}>
            Dress for your
          </h2>
          <h2 className="font-display" style={{
            fontSize: "clamp(52px, 8vw, 100px)",
            fontWeight: 600, lineHeight: 1.05,
            letterSpacing: "-0.01em", margin: "0 0 32px",
            fontStyle: "italic"
          }}>
            <span className="gold-shimmer">perfect body.</span>
          </h2>

          <p style={{
            fontSize: "clamp(14px, 2vw, 18px)", color: "#555",
            maxWidth: "560px", margin: "0 auto 48px",
            lineHeight: 1.8, letterSpacing: "0.02em"
          }}>
            Real-time AI analyzes your body type through your camera and recommends
            outfits from your local store's actual inventory. Fashion intelligence, personalized.
          </p>

          {/* CTAs */}
          <div style={{ display: "flex", gap: "16px", justifyContent: "center", flexWrap: "wrap" }}>
            <button onClick={() => navigate("/customer")} style={{
              padding: "16px 40px",
              background: "linear-gradient(135deg, #d4af5c, #b8860b)",
              border: "none", borderRadius: "4px",
              color: "#080808", fontSize: "12px",
              letterSpacing: "0.2em", textTransform: "uppercase",
              fontWeight: 700, cursor: "pointer",
              boxShadow: "0 8px 32px rgba(212,175,92,0.3)",
              transition: "all 0.3s ease"
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 16px 48px rgba(212,175,92,0.4)" }}
            onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 8px 32px rgba(212,175,92,0.3)" }}
            >
              Try It Now — Free
            </button>
            <button onClick={() => navigate("/store/login")} style={{
              padding: "16px 40px", background: "transparent",
              border: "1px solid #2a2a2a", borderRadius: "4px",
              color: "#666", fontSize: "12px",
              letterSpacing: "0.2em", textTransform: "uppercase",
              cursor: "pointer", transition: "all 0.3s ease"
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "#444"; e.currentTarget.style.color = "#f0ece4" }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "#2a2a2a"; e.currentTarget.style.color = "#666" }}
            >
              For Store Owners →
            </button>
          </div>
        </div>

        {/* Scroll indicator */}
        <div style={{
          position: "absolute", bottom: "40px", left: "50%",
          transform: "translateX(-50%)",
          display: "flex", flexDirection: "column", alignItems: "center", gap: "8px"
        }}>
          <span style={{ fontSize: "9px", letterSpacing: "0.3em", color: "#333", textTransform: "uppercase" }}>Scroll</span>
          <div style={{
            width: "1px", height: "40px",
            background: "linear-gradient(to bottom, #333, transparent)"
          }} />
        </div>
      </section>

      {/* ── How It Works ── */}
      <section id="how-it-works" style={{ padding: "120px 60px", maxWidth: "1200px", margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "80px" }}>
          <p style={{ fontSize: "10px", letterSpacing: "0.3em", color: "#d4af5c", textTransform: "uppercase", marginBottom: "16px" }}>
            The Process
          </p>
          <h3 className="font-display" style={{ fontSize: "clamp(36px, 5vw, 60px)", fontWeight: 300, margin: 0, letterSpacing: "-0.01em" }}>
            Three steps to your
            <span className="gold-shimmer" style={{ fontStyle: "italic" }}> perfect outfit</span>
          </h3>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "2px" }}>
          {[
            { num: "01", title: "Step into Frame", desc: "Stand in front of your camera. Our Vision AI detects 33 body landmarks in real-time with sub-30ms latency.", icon: "◎" },
            { num: "02", title: "AI Analyzes You", desc: "MediaPipe maps your proportions. Our classifier identifies your unique body silhouette from 5 archetypes.", icon: "◈" },
            { num: "03", title: "Shop Your Edit", desc: "Real products from your local store, curated by AI specifically for your body type and occasion.", icon: "✦" },
          ].map((step, i) => (
            <div key={i}
              style={{
                padding: "48px 40px", background: "#0d0d0d",
                border: "1px solid #141414", position: "relative",
                transition: "all 0.3s ease", cursor: "default"
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = "#111"
                e.currentTarget.style.borderColor = "rgba(212,175,92,0.2)"
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = "#0d0d0d"
                e.currentTarget.style.borderColor = "#141414"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "32px" }}>
                <span style={{ fontSize: "11px", letterSpacing: "0.3em", color: "#2a2a2a" }}>{step.num}</span>
                <span style={{ fontSize: "28px", color: "#d4af5c", opacity: 0.6 }}>{step.icon}</span>
              </div>
              <h4 className="font-display" style={{ fontSize: "28px", fontWeight: 300, margin: "0 0 16px", letterSpacing: "0.02em" }}>
                {step.title}
              </h4>
              <p style={{ fontSize: "13px", color: "#555", lineHeight: 1.8, margin: 0 }}>
                {step.desc}
              </p>
              {/* Bottom gold line on hover */}
              <div style={{
                position: "absolute", bottom: 0, left: 0, right: 0,
                height: "1px", background: "linear-gradient(90deg, transparent, #d4af5c, transparent)",
                opacity: 0, transition: "opacity 0.3s ease"
              }} />
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" style={{ padding: "120px 60px", background: "#050505" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "80px", alignItems: "center" }}>
            <div>
              <p style={{ fontSize: "10px", letterSpacing: "0.3em", color: "#d4af5c", textTransform: "uppercase", marginBottom: "16px" }}>
                Why StyleSense
              </p>
              <h3 className="font-display" style={{ fontSize: "clamp(36px, 4vw, 56px)", fontWeight: 300, margin: "0 0 24px", lineHeight: 1.1 }}>
                Fashion that knows
                <br />
                <span className="gold-shimmer" style={{ fontStyle: "italic" }}>who you are</span>
              </h3>
              <p style={{ fontSize: "14px", color: "#555", lineHeight: 1.9, marginBottom: "40px" }}>
                No more guesswork. No more trying on ten things that don't fit your shape.
                StyleSense reads your body in real-time and matches you with clothes
                that were made for you — from inventory that actually exists in your local store.
              </p>
              <button onClick={() => navigate("/customer")} style={{
                padding: "14px 32px", background: "transparent",
                border: "1px solid rgba(212,175,92,0.4)", borderRadius: "4px",
                color: "#d4af5c", fontSize: "11px", letterSpacing: "0.2em",
                textTransform: "uppercase", cursor: "pointer", transition: "all 0.3s"
              }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(212,175,92,0.1)" }}
              onMouseLeave={e => { e.currentTarget.style.background = "transparent" }}
              >
                Experience It →
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
              {[
                { icon: "⚡", title: "Real-Time Detection", desc: "30ms latency body analysis. Faster than you can blink." },
                { icon: "🎯", title: "Hyper-Personalized", desc: "5 body archetypes × occasions × seasons = your unique edit." },
                { icon: "🏪", title: "Real Store Inventory", desc: "AI picks from actual products available in your store today." },
                { icon: "🔒", title: "100% Private", desc: "All analysis happens in your browser. Zero video stored, ever." },
              ].map((feat, i) => (
                <div key={i} style={{
                  display: "flex", gap: "20px", padding: "24px",
                  background: "#0a0a0a", border: "1px solid #141414",
                  transition: "all 0.2s ease", cursor: "default"
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(212,175,92,0.15)"; e.currentTarget.style.background = "#0f0f0f" }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "#141414"; e.currentTarget.style.background = "#0a0a0a" }}
                >
                  <span style={{ fontSize: "20px", flexShrink: 0 }}>{feat.icon}</span>
                  <div>
                    <p style={{ fontSize: "13px", fontWeight: 500, margin: "0 0 4px", color: "#f0ece4" }}>{feat.title}</p>
                    <p style={{ fontSize: "12px", color: "#444", margin: 0, lineHeight: 1.6 }}>{feat.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Body Types ── */}
      <section style={{ padding: "120px 60px", maxWidth: "1200px", margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "64px" }}>
          <p style={{ fontSize: "10px", letterSpacing: "0.3em", color: "#d4af5c", textTransform: "uppercase", marginBottom: "16px" }}>
            Intelligence
          </p>
          <h3 className="font-display" style={{ fontSize: "clamp(32px, 4vw, 52px)", fontWeight: 300, margin: 0 }}>
            Every body. Every style.
          </h3>
        </div>
        <div style={{ display: "flex", gap: "2px", justifyContent: "center" }}>
          {[
            { shape: "⌛", name: "Hourglass", desc: "Balanced proportions" },
            { shape: "🍐", name: "Pear", desc: "Fuller lower half" },
            { shape: "🍎", name: "Apple", desc: "Fuller midsection" },
            { shape: "▬", name: "Rectangle", desc: "Athletic and straight" },
            { shape: "🔺", name: "Inv. Triangle", desc: "Broader shoulders" },
          ].map((type, i) => (
            <div key={i} style={{
              flex: 1, padding: "32px 20px", textAlign: "center",
              background: "#0d0d0d", border: "1px solid #141414",
              transition: "all 0.3s ease", cursor: "default"
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = "#111"
              e.currentTarget.style.borderColor = "rgba(212,175,92,0.3)"
              e.currentTarget.style.transform = "translateY(-4px)"
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = "#0d0d0d"
              e.currentTarget.style.borderColor = "#141414"
              e.currentTarget.style.transform = "translateY(0)"
            }}
            >
              <div style={{ fontSize: "32px", marginBottom: "16px" }}>{type.shape}</div>
              <p className="font-display" style={{ fontSize: "18px", fontWeight: 300, margin: "0 0 6px", letterSpacing: "0.05em" }}>{type.name}</p>
              <p style={{ fontSize: "10px", color: "#444", margin: 0, letterSpacing: "0.1em", textTransform: "uppercase" }}>{type.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── For Stores CTA ── */}
      <section id="for-stores" style={{ padding: "120px 60px", background: "#050505" }}>
        <div style={{
          maxWidth: "900px", margin: "0 auto", textAlign: "center",
          padding: "80px 60px",
          border: "1px solid rgba(212,175,92,0.15)",
          background: "linear-gradient(135deg, rgba(212,175,92,0.03), transparent)",
          position: "relative", overflow: "hidden"
        }}>
          {/* Corner accents */}
          {["top-left","top-right","bottom-left","bottom-right"].map(pos => (
            <div key={pos} style={{
              position: "absolute",
              top: pos.includes("top") ? 0 : "auto",
              bottom: pos.includes("bottom") ? 0 : "auto",
              left: pos.includes("left") ? 0 : "auto",
              right: pos.includes("right") ? 0 : "auto",
              width: "20px", height: "20px",
              borderTop: pos.includes("top") ? "1px solid #d4af5c" : "none",
              borderBottom: pos.includes("bottom") ? "1px solid #d4af5c" : "none",
              borderLeft: pos.includes("left") ? "1px solid #d4af5c" : "none",
              borderRight: pos.includes("right") ? "1px solid #d4af5c" : "none",
            }} />
          ))}

          <p style={{ fontSize: "10px", letterSpacing: "0.3em", color: "#d4af5c", textTransform: "uppercase", marginBottom: "24px" }}>
            For Store Owners
          </p>
          <h3 className="font-display" style={{ fontSize: "clamp(32px, 4vw, 52px)", fontWeight: 300, margin: "0 0 20px", lineHeight: 1.1 }}>
            Put your inventory in front of the
            <span className="gold-shimmer" style={{ fontStyle: "italic" }}> right customers</span>
          </h3>
          <p style={{ fontSize: "14px", color: "#555", lineHeight: 1.8, marginBottom: "40px", maxWidth: "560px", margin: "0 auto 40px" }}>
            Upload your collection. Our AI matches each piece to customers based on their actual body type.
            No ads. No algorithms. Pure style intelligence.
          </p>
          <button onClick={() => navigate("/store/login")} style={{
            padding: "16px 48px",
            background: "linear-gradient(135deg, #d4af5c, #b8860b)",
            border: "none", borderRadius: "4px",
            color: "#080808", fontSize: "12px",
            letterSpacing: "0.2em", textTransform: "uppercase",
            fontWeight: 700, cursor: "pointer",
            boxShadow: "0 8px 32px rgba(212,175,92,0.25)",
            transition: "all 0.3s ease"
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 16px 48px rgba(212,175,92,0.4)" }}
          onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 8px 32px rgba(212,175,92,0.25)" }}
          >
            List Your Store →
          </button>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{
        padding: "40px 60px", borderTop: "1px solid #111",
        display: "flex", alignItems: "center", justifyContent: "space-between"
      }}>
        <div>
          <h4 className="font-display" style={{ fontSize: "16px", fontWeight: 300, letterSpacing: "0.2em", margin: "0 0 4px" }}>
            STYLE<span className="gold-shimmer" style={{ fontWeight: 600 }}>SENSE</span>
          </h4>
          <p style={{ fontSize: "10px", color: "#2a2a2a", margin: 0, letterSpacing: "0.1em" }}>
            AI Fashion Intelligence · 2026
          </p>
        </div>
        <div style={{ display: "flex", gap: "32px" }}>
          {["Privacy", "Terms", "Contact"].map(link => (
            <a key={link} href="#" style={{
              fontSize: "10px", letterSpacing: "0.2em", color: "#333",
              textDecoration: "none", textTransform: "uppercase",
              transition: "color 0.2s"
            }}
            onMouseEnter={e => e.target.style.color = "#d4af5c"}
            onMouseLeave={e => e.target.style.color = "#333"}
            >{link}</a>
          ))}
        </div>
      </footer>
    </div>
  )
}