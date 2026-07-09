import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import API from "../utils/api";

const styles = `
  @keyframes bounceHeart {
    0% { transform: scale(1); }
    30% { transform: scale(1.5); }
    60% { transform: scale(0.9); }
    100% { transform: scale(1); }
  }
  .heart-bounce { animation: bounceHeart 0.4s ease forwards; }
  .overlay {
    position: fixed; inset: 0; background: rgba(0,0,0,0.5);
    z-index: 40; display: flex; align-items: flex-end; justify-content: center;
  }
  .sheet {
    width: 100%; max-width: 480px; border-radius: 20px 20px 0 0;
    padding: 24px 20px; max-height: 70vh; overflow-y: auto;
    display: flex; flex-direction: column; gap: 14px;
  }
`;

function timeAgo(dateStr) {
  const now = new Date();
  const date = new Date(dateStr);
  const diff = Math.floor((now - date) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function CreateConfessionSheet({ onClose, onCreated }) {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!content.trim()) return;
    setLoading(true);
    try {
      const res = await API.post("/confessions", { content });
      onCreated(res.data);
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
        initial={{ y: 400 }}
        animate={{ y: 0 }}
        exit={{ y: 400 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-10 h-1 rounded-full bg-gray-300 mx-auto" />
        <div style={{ fontSize: 18, fontWeight: 700, color: "var(--text-primary)" }}>🤫 Anonymous Confession</div>
        <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>
          Your identity is completely hidden. No one will know it's you.
        </div>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Confess something... 👀"
          rows={5}
          style={{
            width: "100%", padding: "12px 16px", borderRadius: 12,
            border: "1.5px solid var(--border)", background: "var(--bg)",
            color: "var(--text-primary)", fontSize: 14, outline: "none",
            fontFamily: "inherit", resize: "none",
          }}
        />
        <button
          onClick={submit}
          disabled={loading || !content.trim()}
          style={{
            width: "100%", padding: 14, borderRadius: 12, border: "none",
            color: "#fff", fontWeight: 700, fontSize: 14,
            cursor: loading || !content.trim() ? "not-allowed" : "pointer",
            fontFamily: "inherit",
            background: loading || !content.trim() ? "#2d3139" : "linear-gradient(135deg, #7c3aed, #4c1d95)",
          }}
        >
          {loading ? "Posting..." : "Post Anonymously 🤫"}
        </button>
      </motion.div>
    </div>
  );
}

export default function Confessions() {
  const [confessions, setConfessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => {
    API.get("/confessions")
      .then((res) => setConfessions(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const toggleLike = async (id) => {
    try {
      await API.post(`/confessions/${id}/like`);
      setConfessions((prev) =>
        prev.map((c) =>
          c.id === id
            ? { ...c, liked: !c.liked, like_count: c.liked ? c.like_count - 1 : c.like_count + 1 }
            : c
        )
      );
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-3xl mb-2">⏳</div>
          <div className="text-sm" style={{ color: "var(--text-secondary)" }}>Loading confessions...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-4">
      <style>{styles}</style>

      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="font-extrabold text-xl" style={{ color: "var(--text-primary)" }}>Confessions 🤫</div>
          <div className="text-sm" style={{ color: "var(--text-secondary)" }}>100% anonymous</div>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          style={{ padding: "8px 16px", borderRadius: 20, background: "linear-gradient(135deg, #7c3aed, #4c1d95)", color: "#fff", fontWeight: 700, fontSize: 13, border: "none", cursor: "pointer" }}
        >
          + Confess
        </button>
      </div>

      {confessions.length === 0 ? (
        <div className="text-center py-16" style={{ color: "var(--text-secondary)" }}>
          <div className="text-4xl mb-3">🤫</div>
          <div className="font-bold text-base mb-1" style={{ color: "var(--text-primary)" }}>No confessions yet</div>
          <div className="text-sm">Be the first to confess anonymously!</div>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {confessions.map((c, index) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="rounded-2xl p-4 border shadow-sm"
              style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}
            >
              <div className="flex items-center gap-2 mb-3">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                  style={{ background: "linear-gradient(135deg, #7c3aed, #4c1d95)", color: "#fff" }}
                >
                  🤫
                </div>
                <div>
                  <div className="text-xs font-bold" style={{ color: "var(--text-primary)" }}>Anonymous</div>
                  <div className="text-[10px]" style={{ color: "var(--text-secondary)" }}>{timeAgo(c.created_at)}</div>
                </div>
              </div>

              <p className="text-sm leading-relaxed mb-4" style={{ color: "var(--text-primary)" }}>{c.content}</p>

              <div className="flex gap-5 pt-3 border-t" style={{ borderColor: "var(--border)" }}>
                <button
                  onClick={() => {
                    toggleLike(c.id);
                    const el = document.getElementById(`confession-heart-${c.id}`);
                    if (el) {
                      el.classList.remove("heart-bounce");
                      void el.offsetWidth;
                      el.classList.add("heart-bounce");
                    }
                  }}
                  className="flex items-center gap-1.5 text-sm font-semibold"
                  style={{ color: c.liked ? "#7c3aed" : "var(--text-secondary)", background: "none", border: "none", cursor: "pointer" }}
                >
                  <span id={`confession-heart-${c.id}`}>{c.liked ? "💜" : "🤍"}</span>
                  {c.like_count}
                </button>
                <button
                  className="flex items-center gap-1.5 text-sm font-semibold"
                  style={{ color: "var(--text-secondary)", background: "none", border: "none", cursor: "pointer" }}
                >
                  💬 {c.comment_count}
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {showCreate && (
          <CreateConfessionSheet
            onClose={() => setShowCreate(false)}
            onCreated={(c) => setConfessions((prev) => [{ ...c, liked: false }, ...prev])}
          />
        )}
      </AnimatePresence>
    </div>
  );
}