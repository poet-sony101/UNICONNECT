import { useState, useEffect, useRef } from "react";
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

const CATEGORIES = ["Textbook", "Notes", "Equipment", "Stationery", "Electronics", "Other"];
const CONDITIONS = ["New", "Like New", "Good", "Fair", "Poor"];

function timeAgo(dateStr) {
  const now = new Date();
  const date = new Date(dateStr);
  const diff = Math.floor((now - date) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function ListItemSheet({ onClose, onListed }) {
  const [form, setForm] = useState({ title: "", description: "", price: "", condition: "Good", category: "Textbook", course_code: "" });
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const fileRef = useRef(null);

  const inputStyle = { width: "100%", padding: "12px 16px", borderRadius: 12, border: "1.5px solid var(--border)", background: "var(--bg)", color: "var(--text-primary)", fontSize: 14, outline: "none", fontFamily: "inherit" };
  const labelStyle = { fontSize: 11, fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: 6 };

  const submit = async () => {
    if (!form.title || !form.price) return;
    setLoading(true);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([k, v]) => formData.append(k, v));
      files.forEach((f) => formData.append("images", f));
      const res = await API.post("/marketplace", formData, { headers: { "Content-Type": "multipart/form-data" } });
      onListed(res.data);
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
        <div style={{ fontSize: 18, fontWeight: 700, color: "var(--text-primary)" }}>🛒 List an Item</div>

        <div><label style={labelStyle}>Title *</label><input value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} placeholder="e.g. Engineering Mathematics Textbook" style={inputStyle} /></div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <div><label style={labelStyle}>Price (₦) *</label><input type="number" value={form.price} onChange={(e) => setForm((p) => ({ ...p, price: e.target.value }))} placeholder="5000" style={inputStyle} /></div>
          <div>
            <label style={labelStyle}>Condition</label>
            <select value={form.condition} onChange={(e) => setForm((p) => ({ ...p, condition: e.target.value }))} style={inputStyle}>
              {CONDITIONS.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <div>
            <label style={labelStyle}>Category</label>
            <select value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))} style={inputStyle}>
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div><label style={labelStyle}>Course Code</label><input value={form.course_code} onChange={(e) => setForm((p) => ({ ...p, course_code: e.target.value }))} placeholder="CSC301" style={inputStyle} /></div>
        </div>
        <div><label style={labelStyle}>Description</label><textarea value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} placeholder="Describe the item..." rows={3} style={{ ...inputStyle, resize: "none" }} /></div>

        {/* Image upload */}
        <div
          onClick={() => fileRef.current?.click()}
          style={{ border: "2px dashed var(--border)", borderRadius: 12, padding: "16px", textAlign: "center", cursor: "pointer" }}
        >
          {files.length > 0 ? (
            <div style={{ color: "#007A3D", fontWeight: 600, fontSize: 14 }}>✅ {files.length} image(s) selected</div>
          ) : (
            <>
              <div style={{ fontSize: 28, marginBottom: 6 }}>📸</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>Add Photos (max 3)</div>
            </>
          )}
          <input ref={fileRef} type="file" accept="image/*" multiple style={{ display: "none" }} onChange={(e) => setFiles(Array.from(e.target.files).slice(0, 3))} />
        </div>

        <button
          onClick={submit}
          disabled={loading || !form.title || !form.price}
          style={{ width: "100%", padding: 14, borderRadius: 12, border: "none", color: "#fff", fontWeight: 700, fontSize: 14, fontFamily: "inherit", cursor: loading ? "not-allowed" : "pointer", background: loading ? "#2d3139" : "linear-gradient(135deg, #007A3D, #4c1d95)" }}
        >
          {loading ? "Listing..." : "List Item"}
        </button>
      </motion.div>
    </div>
  );
}

export default function Marketplace() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showList, setShowList] = useState(false);
  const [activeCategory, setActiveCategory] = useState("All");
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    API.get("/marketplace")
      .then((res) => setItems(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = activeCategory === "All" ? items : items.filter((i) => i.category === activeCategory);

  const markSold = async (id) => {
    try {
      await API.put(`/marketplace/${id}/sold`);
      setItems((prev) => prev.filter((i) => i.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-3xl mb-2">⏳</div>
          <div className="text-sm" style={{ color: "var(--text-secondary)" }}>Loading marketplace...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-4">
      <style>{styles}</style>

      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="font-extrabold text-xl" style={{ color: "var(--text-primary)" }}>Marketplace 🛒</div>
          <div className="text-sm" style={{ color: "var(--text-secondary)" }}>Buy & sell with coursemates</div>
        </div>
        <button
          onClick={() => setShowList(true)}
          style={{ padding: "8px 16px", borderRadius: 20, background: "linear-gradient(135deg, #007A3D, #4c1d95)", color: "#fff", fontWeight: 700, fontSize: 13, border: "none", cursor: "pointer" }}
        >
          + Sell
        </button>
      </div>

      {/* Category filter */}
      <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 8, marginBottom: 16 }}>
        {["All", ...CATEGORIES].map((c) => (
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
          <div className="text-4xl mb-3">🛒</div>
          <div className="font-bold text-base mb-1" style={{ color: "var(--text-primary)" }}>Nothing for sale yet</div>
          <div className="text-sm">List something you want to sell!</div>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {filtered.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="rounded-2xl border shadow-sm overflow-hidden"
              style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}
            >
              {/* Image */}
              {item.images && item.images.length > 0 ? (
                <img src={item.images[0]} alt={item.title} style={{ width: "100%", height: 120, objectFit: "cover" }} />
              ) : (
                <div style={{ width: "100%", height: 120, background: "linear-gradient(135deg, #064e3b, #4c1d95)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36 }}>
                  📦
                </div>
              )}

              <div style={{ padding: 12 }}>
                <div style={{ fontWeight: 700, fontSize: 13, color: "var(--text-primary)", marginBottom: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {item.title}
                </div>
                <div style={{ fontWeight: 800, fontSize: 16, color: "#007A3D", marginBottom: 6 }}>
                  ₦{parseInt(item.price).toLocaleString()}
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 10, color: "var(--text-secondary)", backgroundColor: "var(--bg)", padding: "2px 8px", borderRadius: 20 }}>
                    {item.condition}
                  </span>
                  {item.seller_id === user.id ? (
                    <button
                      onClick={() => markSold(item.id)}
                      style={{ fontSize: 10, color: "#dc2626", background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}
                    >
                      Mark Sold
                    </button>
                  ) : (
                    <span style={{ fontSize: 10, color: "var(--text-secondary)" }}>{timeAgo(item.created_at)}</span>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {showList && (
          <ListItemSheet
            onClose={() => setShowList(false)}
            onListed={(i) => setItems((prev) => [i, ...prev])}
          />
        )}
      </AnimatePresence>
    </div>
  );
}