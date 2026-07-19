import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Avatar from "../components/layout/Avatar";
import API from "../utils/api";

const styles = `
  .overlay {
    position: fixed; inset: 0; background: rgba(0,0,0,0.5);
    z-index: 40; display: flex; align-items: flex-end; justify-content: center;
  }
  .sheet {
    width: 100%; max-width: 480px; border-radius: 20px 20px 0 0;
    padding: 24px 20px; max-height: 85vh; overflow-y: auto;
    display: flex; flex-direction: column; gap: 14px;
  }
`;

const SKILL_CATEGORIES = ["Academic", "Tech", "Creative", "Language", "Music", "Sports", "Business", "Other"];

function timeAgo(dateStr) {
  const now = new Date();
  const date = new Date(dateStr);
  const diff = Math.floor((now - date) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function AddSkillSheet({ onClose, onAdded }) {
  const [form, setForm] = useState({ offering: "", seeking: "", description: "", category: "Academic" });
  const [loading, setLoading] = useState(false);

  const inputStyle = { width: "100%", padding: "12px 16px", borderRadius: 12, border: "1.5px solid var(--border)", background: "var(--bg)", color: "var(--text-primary)", fontSize: 14, outline: "none", fontFamily: "inherit" };
  const labelStyle = { fontSize: 11, fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: 6 };

  const submit = async () => {
    if (!form.offering || !form.seeking) return;
    setLoading(true);
    try {
      const res = await API.post("/skills", form);
      onAdded(res.data);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="overlay" onClick={onClose}>
      <motion.div
        className="sheet"
        style={{ backgroundColor: "var(--card)" }}
        initial={{ y: 400 }} animate={{ y: 0 }} exit={{ y: 400 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-10 h-1 rounded-full bg-gray-300 mx-auto" />
        <div style={{ fontSize: 18, fontWeight: 700, color: "var(--text-primary)" }}>🔄 Offer a Skill Exchange</div>
        <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>
          Teach what you know, learn what you need
        </div>

        <div><label style={labelStyle}>I can teach / offer *</label><input value={form.offering} onChange={(e) => setForm((p) => ({ ...p, offering: e.target.value }))} placeholder="e.g. Python programming, Guitar lessons" style={inputStyle} /></div>
        <div><label style={labelStyle}>I want to learn / seeking *</label><input value={form.seeking} onChange={(e) => setForm((p) => ({ ...p, seeking: e.target.value }))} placeholder="e.g. UI Design, French language" style={inputStyle} /></div>
        <div><label style={labelStyle}>Description</label><textarea value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} placeholder="Tell us more about what you're offering and what you need..." rows={3} style={{ ...inputStyle, resize: "none" }} /></div>
        <div>
          <label style={labelStyle}>Category</label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {SKILL_CATEGORIES.map((c) => (
              <button
                key={c}
                onClick={() => setForm((p) => ({ ...p, category: c }))}
                style={{
                  padding: "6px 12px", borderRadius: 20, fontSize: 12, fontWeight: 600,
                  border: "1.5px solid", cursor: "pointer", fontFamily: "inherit",
                  backgroundColor: form.category === c ? "#007A3D" : "var(--bg)",
                  color: form.category === c ? "#fff" : "var(--text-secondary)",
                  borderColor: form.category === c ? "#007A3D" : "var(--border)",
                }}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={submit}
          disabled={loading || !form.offering || !form.seeking}
          style={{ width: "100%", padding: 14, borderRadius: 12, border: "none", color: "#fff", fontWeight: 700, fontSize: 14, fontFamily: "inherit", cursor: loading ? "not-allowed" : "pointer", background: loading ? "#2d3139" : "linear-gradient(135deg, #007A3D, #4c1d95)" }}
        >
          {loading ? "Posting..." : "Post Skill Exchange"}
        </button>
      </motion.div>
    </div>
  );
}

export default function Skills() {
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [activeCategory, setActiveCategory] = useState("All");
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    API.get("/skills")
      .then((res) => setSkills(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = activeCategory === "All" ? skills : skills.filter((s) => s.category === activeCategory);

  const toggleAvailability = async (id) => {
    try {
      const res = await API.put(`/skills/${id}/toggle`);
      setSkills((prev) => prev.map((s) => s.id === id ? { ...s, is_available: res.data.is_available } : s));
    } catch (err) {
      console.error(err);
    }
  };

  const CATEGORY_COLORS = {
    Academic: "#1d4ed8", Tech: "#007A3D", Creative: "#7c3aed",
    Language: "#0891b2", Music: "#d97706", Sports: "#dc2626",
    Business: "#047857", Other: "#6b7280",
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-3xl mb-2">⏳</div>
          <div className="text-sm" style={{ color: "var(--text-secondary)" }}>Loading skills...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-4">
      <style>{styles}</style>

      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="font-extrabold text-xl" style={{ color: "var(--text-primary)" }}>Skills Exchange 🔄</div>
          <div className="text-sm" style={{ color: "var(--text-secondary)" }}>Teach & learn with coursemates</div>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          style={{ padding: "8px 16px", borderRadius: 20, background: "linear-gradient(135deg, #007A3D, #4c1d95)", color: "#fff", fontWeight: 700, fontSize: 13, border: "none", cursor: "pointer" }}
        >
          + Offer
        </button>
      </div>

      {/* Category filter */}
      <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 8, marginBottom: 16 }}>
        {["All", ...SKILL_CATEGORIES].map((c) => (
          <button
            key={c}
            onClick={() => setActiveCategory(c)}
            style={{
              flexShrink: 0, padding: "6px 12px", borderRadius: 20, fontSize: 11, fontWeight: 600,
              border: "1.5px solid", cursor: "pointer", fontFamily: "inherit",
              backgroundColor: activeCategory === c ? "#007A3D" : "var(--bg)",
              color: activeCategory === c ? "#fff" : "var(--text-secondary)",
              borderColor: activeCategory === c ? "#007A3D" : "var(--border)",
            }}
          >
            {c}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16" style={{ color: "var(--text-secondary)" }}>
          <div className="text-4xl mb-3">🔄</div>
          <div className="font-bold text-base mb-1" style={{ color: "var(--text-primary)" }}>No skill exchanges yet</div>
          <div className="text-sm">Be the first to offer a skill!</div>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((skill, index) => (
            <motion.div
              key={skill.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="rounded-2xl border shadow-sm overflow-hidden"
              style={{ backgroundColor: "var(--card)", borderColor: "var(--border)", opacity: skill.is_available ? 1 : 0.6 }}
            >
              <div style={{ height: 4, backgroundColor: CATEGORY_COLORS[skill.category] || "#6b7280" }} />
              <div style={{ padding: 16 }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 12 }}>
                  <span style={{ fontSize: 11, padding: "3px 10px", borderRadius: 20, fontWeight: 600, backgroundColor: (CATEGORY_COLORS[skill.category] || "#6b7280") + "22", color: CATEGORY_COLORS[skill.category] || "#6b7280" }}>
                    {skill.category}
                  </span>
                  {!skill.is_available && (
                    <span style={{ fontSize: 11, color: "#6b7280", fontWeight: 600 }}>Unavailable</span>
                  )}
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: 8, alignItems: "center", marginBottom: 12 }}>
                  <div style={{ backgroundColor: "#ecfdf5", borderRadius: 10, padding: "10px 12px" }}>
                    <div style={{ fontSize: 10, fontWeight: 600, color: "#047857", marginBottom: 3 }}>OFFERING</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#065f46" }}>{skill.offering}</div>
                  </div>
                  <div style={{ fontSize: 20 }}>⇄</div>
                  <div style={{ backgroundColor: "#eff6ff", borderRadius: 10, padding: "10px 12px" }}>
                    <div style={{ fontSize: 10, fontWeight: 600, color: "#1d4ed8", marginBottom: 3 }}>SEEKING</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#1e40af" }}>{skill.seeking}</div>
                  </div>
                </div>

                {skill.description && (
                  <p style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.5, marginBottom: 12 }}>{skill.description}</p>
                )}

                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 12, borderTop: "1px solid var(--border)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <Avatar initials={(skill.full_name || skill.username || "U").slice(0, 2).toUpperCase()} color={skill.avatar_color || "#007A3D"} size={24} />
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-primary)" }}>{skill.full_name || skill.username}</div>
                      <div style={{ fontSize: 10, color: "var(--text-secondary)" }}>{skill.department_name} · {timeAgo(skill.created_at)}</div>
                    </div>
                  </div>
                  {skill.user_id === user.id ? (
                    <button
                      onClick={() => toggleAvailability(skill.id)}
                      style={{ fontSize: 11, padding: "5px 12px", borderRadius: 20, fontWeight: 600, border: "1.5px solid", cursor: "pointer", fontFamily: "inherit", backgroundColor: skill.is_available ? "#fef2f2" : "#ecfdf5", color: skill.is_available ? "#dc2626" : "#007A3D", borderColor: skill.is_available ? "#fca5a5" : "#bbf7d0" }}
                    >
                      {skill.is_available ? "Mark Unavailable" : "Mark Available"}
                    </button>
                  ) : (
                    <button
                      style={{ fontSize: 11, padding: "5px 12px", borderRadius: 20, fontWeight: 600, border: "none", cursor: "pointer", fontFamily: "inherit", background: "linear-gradient(135deg, #007A3D, #4c1d95)", color: "#fff" }}
                    >
                      Connect
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {showAdd && (
          <AddSkillSheet
            onClose={() => setShowAdd(false)}
            onAdded={(s) => setSkills((prev) => [{ ...s, is_available: true }, ...prev])}
          />
        )}
      </AnimatePresence>
    </div>
  );
}