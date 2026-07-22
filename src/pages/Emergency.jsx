import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import API from "../utils/api";

const CATEGORY_ICONS = {
  Security: "🚔",
  Medical: "🏥",
  Support: "🤝",
  Emergency: "🚨",
  "Mental Health": "💙",
};

const CATEGORY_COLORS = {
  Security: "#1d4ed8",
  Medical: "#dc2626",
  Support: "#007A3D",
  Emergency: "#d97706",
  "Mental Health": "#7c3aed",
};

export default function Emergency() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get("/emergency")
      .then((res) => setContacts(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Group by category
  const grouped = contacts.reduce((acc, c) => {
    if (!acc[c.category]) acc[c.category] = [];
    acc[c.category].push(c);
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-3xl mb-2">⏳</div>
          <div className="text-sm" style={{ color: "var(--text-secondary)" }}>Loading emergency contacts...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-4">
      {/* Header */}
      <div className="mb-5">
        <div className="font-extrabold text-xl" style={{ color: "var(--text-primary)" }}>Emergency Contacts 🆘</div>
        <div className="text-sm" style={{ color: "var(--text-secondary)" }}>UNILAG & Lagos emergency numbers</div>
      </div>

      {/* Emergency banner */}
      <div
        className="rounded-2xl p-4 mb-5 flex items-center gap-3"
        style={{ background: "linear-gradient(135deg, #dc2626, #7c3aed)" }}
      >
        <div style={{ fontSize: 32 }}>🚨</div>
        <div>
          <div style={{ color: "#fff", fontWeight: 700, fontSize: 14 }}>In immediate danger?</div>
          <div style={{ color: "rgba(255,255,255,0.8)", fontSize: 12, marginTop: 2 }}>Call 112 (Police) or 767 (Lagos Emergency)</div>
        </div>
        <button
          onClick={() => window.open("tel:112")}
          style={{ marginLeft: "auto", padding: "8px 16px", borderRadius: 20, backgroundColor: "#fff", color: "#dc2626", fontWeight: 700, fontSize: 13, border: "none", cursor: "pointer" }}
        >
          Call Now
        </button>
      </div>

      {/* Contacts by category */}
      {Object.entries(grouped).map(([category, items]) => (
        <div key={category} className="mb-5">
          <div
            className="flex items-center gap-2 mb-3"
          >
            <span style={{ fontSize: 18 }}>{CATEGORY_ICONS[category] || "📞"}</span>
            <div style={{ fontSize: 14, fontWeight: 700, color: CATEGORY_COLORS[category] || "var(--text-primary)" }}>
              {category}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            {items.map((contact, index) => (
              <motion.div
                key={contact.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="rounded-2xl border p-4"
                style={{
                  backgroundColor: "var(--card)",
                  borderColor: "var(--border)",
                  borderLeft: `4px solid ${CATEGORY_COLORS[category] || "#6b7280"}`,
                }}
              >
                <div className="flex items-center justify-between">
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 14, color: "var(--text-primary)", marginBottom: 2 }}>
                      {contact.name}
                    </div>
                    {contact.description && (
                      <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>{contact.description}</div>
                    )}
                  </div>
                  <button
                    onClick={() => window.open(`tel:${contact.phone}`)}
                    style={{
                      padding: "8px 16px", borderRadius: 20, border: "none", cursor: "pointer",
                      fontWeight: 700, fontSize: 13, fontFamily: "inherit",
                      backgroundColor: CATEGORY_COLORS[category] || "#007A3D",
                      color: "#fff",
                    }}
                  >
                    📞 {contact.phone}
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      ))}

      {/* Mental health note */}
      <div
        className="rounded-2xl p-4 mt-4"
        style={{ backgroundColor: "#eff6ff", border: "1px solid #bfdbfe" }}
      >
        <div style={{ fontSize: 14, fontWeight: 700, color: "#1d4ed8", marginBottom: 4 }}>
          💙 Mental Health Support
        </div>
        <div style={{ fontSize: 13, color: "#1e40af", lineHeight: 1.6 }}>
          If you're struggling with stress, anxiety, or any mental health challenges, 
          UNILAG Counseling Center is here for you. You don't have to face it alone.
        </div>
        <button
          onClick={() => window.open("tel:01-545-0280")}
          style={{ marginTop: 12, padding: "8px 20px", borderRadius: 20, border: "none", backgroundColor: "#1d4ed8", color: "#fff", fontWeight: 600, fontSize: 13, cursor: "pointer" }}
        >
          Call Counseling Center
        </button>
      </div>
    </div>
  );
}