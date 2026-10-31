import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import API from "../utils/api";

const REASONS = ["Spam", "Harassment or bullying", "Hate speech", "Inappropriate content", "Misinformation", "Other"];

export default function PostMenu({ post, onBlocked }) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState("menu"); // menu | report | block | done
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [doneMsg, setDoneMsg] = useState("");
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  if (post.author_id === user.id) return null;

  const close = () => { setOpen(false); setMode("menu"); setReason(""); };

  const report = async () => {
    if (!reason) return;
    setLoading(true);
    try {
      await API.post("/reports", { reported_user_id: post.author_id, reported_post_id: post.id, reason });
      setDoneMsg("Thanks. Your report has been submitted.");
      setMode("done");
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const block = async () => {
    setLoading(true);
    try {
      await API.post("/reports/block", { blocked_id: post.author_id });
      setDoneMsg("User blocked. You won't see their posts anymore.");
      setMode("done");
      onBlocked && onBlocked();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const rowStyle = { width: "100%", textAlign: "left", padding: "14px 16px", borderRadius: 12, border: "1px solid var(--border)", backgroundColor: "var(--bg)", color: "var(--text-primary)", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        style={{ background: "none", border: "none", cursor: "pointer", fontSize: 18, color: "var(--text-secondary)", padding: "0 4px" }}
      >
        ⋯
      </button>

      <AnimatePresence>
        {open && (
          <div
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 50, display: "flex", alignItems: "flex-end", justifyContent: "center" }}
            onClick={close}
          >
            <motion.div
              initial={{ y: 300 }} animate={{ y: 0 }} exit={{ y: 300 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              style={{ width: "100%", maxWidth: 480, borderRadius: "20px 20px 0 0", padding: 20, backgroundColor: "var(--card)", display: "flex", flexDirection: "column", gap: 10 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-10 h-1 rounded-full bg-gray-300 mx-auto mb-2" />

              {mode === "menu" && (
                <>
                  <button style={rowStyle} onClick={() => setMode("report")}>🚩 Report this post</button>
                  <button style={{ ...rowStyle, color: "#dc2626" }} onClick={() => setMode("block")}>🚫 Block {post.full_name || post.username}</button>
                </>
              )}

              {mode === "report" && (
                <>
                  <div style={{ fontWeight: 700, color: "var(--text-primary)" }}>Why are you reporting this?</div>
                  {REASONS.map((r) => (
                    <button
                      key={r}
                      onClick={() => setReason(r)}
                      style={{ ...rowStyle, borderColor: reason === r ? "#007A3D" : "var(--border)", backgroundColor: reason === r ? "#ecfdf5" : "var(--bg)", color: reason === r ? "#065f46" : "var(--text-primary)" }}
                    >
                      {reason === r ? "✓ " : ""}{r}
                    </button>
                  ))}
                  <button
                    onClick={report}
                    disabled={!reason || loading}
                    style={{ padding: 14, borderRadius: 12, border: "none", color: "#fff", fontWeight: 700, fontSize: 14, fontFamily: "inherit", cursor: !reason || loading ? "not-allowed" : "pointer", background: !reason || loading ? "#2d3139" : "#dc2626" }}
                  >
                    {loading ? "Submitting..." : "Submit Report"}
                  </button>
                </>
              )}

              {mode === "block" && (
                <>
                  <div style={{ fontWeight: 700, color: "var(--text-primary)" }}>Block {post.full_name || post.username}?</div>
                  <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>
                    You won't see their posts and they won't see yours. You can unblock them later.
                  </div>
                  <button
                    onClick={block}
                    disabled={loading}
                    style={{ padding: 14, borderRadius: 12, border: "none", color: "#fff", fontWeight: 700, fontSize: 14, fontFamily: "inherit", cursor: loading ? "not-allowed" : "pointer", background: loading ? "#2d3139" : "#dc2626" }}
                  >
                    {loading ? "Blocking..." : "Block User"}
                  </button>
                </>
              )}

              {mode === "done" && (
                <div style={{ textAlign: "center", padding: "16px 0" }}>
                  <div style={{ fontSize: 40, marginBottom: 8 }}>✅</div>
                  <div style={{ fontSize: 14, color: "var(--text-primary)", fontWeight: 600 }}>{doneMsg}</div>
                  <button onClick={close} style={{ marginTop: 14, padding: "10px 24px", borderRadius: 20, border: "none", backgroundColor: "#007A3D", color: "#fff", fontWeight: 600, cursor: "pointer" }}>
                    Done
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}