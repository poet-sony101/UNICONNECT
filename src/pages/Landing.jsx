import { motion } from "framer-motion";

const styles = `
  @keyframes float {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-10px); }
  }
  .float { animation: float 3s ease-in-out infinite; }
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(30px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .fade-in { animation: fadeIn 0.6s ease forwards; }
  .fade-in-2 { animation: fadeIn 0.6s ease 0.2s forwards; opacity: 0; }
  .fade-in-3 { animation: fadeIn 0.6s ease 0.4s forwards; opacity: 0; }
  .fade-in-4 { animation: fadeIn 0.6s ease 0.6s forwards; opacity: 0; }
`;

const FEATURES = [
  { icon: "🎓", title: "Verified Students", desc: "Only real UNILAG students with verified admission letters" },
  { icon: "👥", title: "Department Groups", desc: "Connect with coursemates in your exact department" },
  { icon: "💬", title: "Real-time Chat", desc: "Group chats and DMs with live messaging" },
  { icon: "📅", title: "Campus Events", desc: "Discover and create events happening on campus" },
  { icon: "🤫", title: "Confessions", desc: "Share anonymously with your fellow students" },
  { icon: "📊", title: "Polls", desc: "Vote on what matters to UNILAG students" },
];

const STATS = [
  { value: "19", label: "Faculties" },
  { value: "100+", label: "Departments" },
  { value: "Real-time", label: "Messaging" },
  { value: "100%", label: "UNILAG" },
];

export default function Landing({ onLogin, onSignup }) {
  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#0f1117", fontFamily: "inherit" }}>
      <style>{styles}</style>

      {/* Nav */}
      <div style={{ padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #2d3139", position: "sticky", top: 0, backgroundColor: "#0f1117", zIndex: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: "#007A3D", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ color: "#fff", fontWeight: 800, fontSize: 18 }}>U</span>
          </div>
          <div>
            <div style={{ color: "#fff", fontWeight: 800, fontSize: 18, letterSpacing: -0.5 }}>UniConnect</div>
            <div style={{ color: "#6b7280", fontSize: 10, fontWeight: 500 }}>UNILAG</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={onLogin}
            style={{ padding: "8px 18px", borderRadius: 20, border: "1.5px solid #2d3139", backgroundColor: "transparent", color: "#fff", fontWeight: 600, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}
          >
            Log In
          </button>
          <button
            onClick={onSignup}
            style={{ padding: "8px 18px", borderRadius: 20, border: "none", background: "linear-gradient(135deg, #007A3D, #4c1d95)", color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}
          >
            Sign Up
          </button>
        </div>
      </div>

      {/* Hero */}
      <div style={{ padding: "60px 24px 40px", textAlign: "center", maxWidth: 600, margin: "0 auto" }}>
        <div className="float" style={{ fontSize: 64, marginBottom: 24 }}>🎓</div>
        <h1 className="fade-in" style={{ fontSize: 36, fontWeight: 800, color: "#fff", lineHeight: 1.2, marginBottom: 16, letterSpacing: -1 }}>
          Your UNILAG Community,{" "}
          <span style={{ background: "linear-gradient(135deg, #007A3D, #7c3aed)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            Connected
          </span>
        </h1>
        <p className="fade-in-2" style={{ fontSize: 16, color: "#9ca3af", lineHeight: 1.7, marginBottom: 32 }}>
          UniConnect is the social platform built exclusively for University of Lagos students.
          Connect with coursemates, join department groups, and never miss a campus moment.
        </p>
        <div className="fade-in-3" style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <button
            onClick={onSignup}
            style={{ padding: "14px 32px", borderRadius: 25, border: "none", background: "linear-gradient(135deg, #007A3D, #4c1d95)", color: "#fff", fontWeight: 700, fontSize: 15, cursor: "pointer", fontFamily: "inherit" }}
          >
            Get Started — It's Free 🚀
          </button>
          <button
            onClick={onLogin}
            style={{ padding: "14px 32px", borderRadius: 25, border: "1.5px solid #2d3139", backgroundColor: "transparent", color: "#fff", fontWeight: 600, fontSize: 15, cursor: "pointer", fontFamily: "inherit" }}
          >
            Log In
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="fade-in-4" style={{ padding: "0 24px 40px", maxWidth: 600, margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
          {STATS.map((stat) => (
            <div
              key={stat.label}
              style={{ backgroundColor: "#1c1f26", borderRadius: 16, padding: "16px 8px", textAlign: "center", border: "1px solid #2d3139" }}
            >
              <div style={{ fontSize: 20, fontWeight: 800, color: "#007A3D" }}>{stat.value}</div>
              <div style={{ fontSize: 11, color: "#6b7280", marginTop: 4 }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Features */}
      <div style={{ padding: "0 24px 60px", maxWidth: 600, margin: "0 auto" }}>
        <h2 style={{ fontSize: 24, fontWeight: 800, color: "#fff", textAlign: "center", marginBottom: 24 }}>
          Everything you need 🔥
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>
          {FEATURES.map((f, index) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              style={{ backgroundColor: "#1c1f26", borderRadius: 16, padding: 20, border: "1px solid #2d3139" }}
            >
              <div style={{ fontSize: 28, marginBottom: 10 }}>{f.icon}</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#fff", marginBottom: 6 }}>{f.title}</div>
              <div style={{ fontSize: 12, color: "#6b7280", lineHeight: 1.5 }}>{f.desc}</div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div style={{ padding: "40px 24px 60px", textAlign: "center", borderTop: "1px solid #2d3139" }}>
        <h2 style={{ fontSize: 24, fontWeight: 800, color: "#fff", marginBottom: 12 }}>
          Ready to connect? 🤝
        </h2>
        <p style={{ color: "#6b7280", fontSize: 14, marginBottom: 24 }}>
          Join thousands of UNILAG students already on UniConnect
        </p>
        <button
          onClick={onSignup}
          style={{ padding: "14px 40px", borderRadius: 25, border: "none", background: "linear-gradient(135deg, #007A3D, #4c1d95)", color: "#fff", fontWeight: 700, fontSize: 15, cursor: "pointer", fontFamily: "inherit" }}
        >
          Join UniConnect 🚀
        </button>
        <div style={{ marginTop: 20, fontSize: 12, color: "#4b5563" }}>
          Free forever · UNILAG students only · No spam
        </div>
      </div>
    </div>
  );
}