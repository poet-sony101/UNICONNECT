import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Avatar from "../components/layout/Avatar";
import API from "../utils/api";

const BG_COLORS = ["#007A3D", "#4c1d95", "#1d4ed8", "#dc2626", "#d97706", "#0891b2", "#be185d", "#064e3b"];

export default function Stories() {
  const [stories, setStories] = useState([]);
  const [activeStory, setActiveStory] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [content, setContent] = useState("");
  const [bgColor, setBgColor] = useState("#007A3D");
  const [creating, setCreating] = useState(false);
  const [progress, setProgress] = useState(0);
  const progressRef = useRef(null);
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    API.get("/stories")
      .then((res) => setStories(res.data))
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (activeStory) {
      API.post(`/stories/${activeStory.id}/view`).catch(console.error);
      setProgress(0);
      progressRef.current = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(progressRef.current);
            setActiveStory(null);
            return 0;
          }
          return prev + 2;
        });
      }, 100);
      return () => clearInterval(progressRef.current);
    }
  }, [activeStory]);

  const createStory = async () => {
    if (!content.trim()) return;
    setCreating(true);
    try {
      const res = await API.post("/stories", { content, background_color: bgColor, media_type: "text" });
      setStories((prev) => [{ ...res.data, username: user.username, full_name: user.full_name, avatar_color: user.avatar_color }, ...prev]);
      setShowCreate(false);
      setContent("");
    } catch (err) {
      console.error(err);
    } finally {
      setCreating(false);
    }
  };

  // Group stories by user
  const grouped = stories.reduce((acc, s) => {
    const key = s.user_id;
    if (!acc[key]) acc[key] = { user: s, stories: [] };
    acc[key].stories.push(s);
    return acc;
  }, {});

  const storyGroups = Object.values(grouped);

  return (
    <>
      {/* Stories row */}
      <div style={{ display: "flex", gap: 12, overflowX: "auto", paddingBottom: 8, marginBottom: 16 }}>
        {/* Add story */}
        <div
          onClick={() => setShowCreate(true)}
          style={{ flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 6, cursor: "pointer" }}
        >
          <div style={{ width: 60, height: 60, borderRadius: "50%", background: "linear-gradient(135deg, #007A3D, #4c1d95)", display: "flex", alignItems: "center", justifyContent: "center", border: "3px solid var(--border)" }}>
            <span style={{ color: "#fff", fontSize: 24, fontWeight: 700 }}>+</span>
          </div>
          <span style={{ fontSize: 11, color: "var(--text-secondary)", fontWeight: 600 }}>Your Story</span>
        </div>

        {/* Other stories */}
        {storyGroups.map((group) => (
          <div
            key={group.user.user_id}
            onClick={() => setActiveStory(group.stories[0])}
            style={{ flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 6, cursor: "pointer" }}
          >
            <div style={{
              width: 60, height: 60, borderRadius: "50%", padding: 2,
              background: group.stories[0].viewed ? "var(--border)" : "linear-gradient(135deg, #007A3D, #4c1d95)",
            }}>
              {group.user.avatar_url ? (
                <img src={group.user.avatar_url} alt="avatar" style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover", border: "2px solid var(--bg)" }} />
              ) : (
                <div style={{ width: "100%", height: "100%", borderRadius: "50%", backgroundColor: group.user.avatar_color || "#007A3D", display: "flex", alignItems: "center", justifyContent: "center", border: "2px solid var(--bg)" }}>
                  <span style={{ color: "#fff", fontWeight: 700, fontSize: 18 }}>
                    {(group.user.full_name || group.user.username || "U").slice(0, 1).toUpperCase()}
                  </span>
                </div>
              )}
            </div>
            <span style={{ fontSize: 11, color: "var(--text-secondary)", fontWeight: 600, maxWidth: 60, textAlign: "center", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {group.user.full_name || group.user.username}
            </span>
          </div>
        ))}
      </div>

      {/* Story viewer */}
      <AnimatePresence>
        {activeStory && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#000" }}
            onClick={() => { clearInterval(progressRef.current); setActiveStory(null); }}
          >
            <div style={{ width: "100%", maxWidth: 480, height: "100vh", backgroundColor: activeStory.background_color || "#007A3D", display: "flex", flexDirection: "column", position: "relative" }}>
              {/* Progress bar */}
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, backgroundColor: "rgba(255,255,255,0.3)" }}>
                <div style={{ height: "100%", width: `${progress}%`, backgroundColor: "#fff", transition: "width 0.1s linear" }} />
              </div>

              {/* Header */}
              <div style={{ padding: "20px 16px 0", display: "flex", alignItems: "center", gap: 10 }}>
                <Avatar
                  initials={(activeStory.full_name || activeStory.username || "U").slice(0, 2).toUpperCase()}
                  color="rgba(255,255,255,0.3)"
                  size={36}
                />
                <div>
                  <div style={{ color: "#fff", fontWeight: 700, fontSize: 14 }}>{activeStory.full_name || activeStory.username}</div>
                  <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 11 }}>{activeStory.views} views</div>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); clearInterval(progressRef.current); setActiveStory(null); }}
                  style={{ marginLeft: "auto", background: "none", border: "none", color: "#fff", fontSize: 24, cursor: "pointer" }}
                >
                  ✕
                </button>
              </div>

              {/* Content */}
              <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
                {activeStory.media_url ? (
                  <img src={activeStory.media_url} alt="story" style={{ maxWidth: "100%", maxHeight: "70vh", borderRadius: 12, objectFit: "contain" }} />
                ) : (
                  <div style={{ fontSize: 24, fontWeight: 700, color: "#fff", textAlign: "center", lineHeight: 1.5 }}>
                    {activeStory.content}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create story */}
      <AnimatePresence>
        {showCreate && (
          <div
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", zIndex: 50, display: "flex", alignItems: "flex-end", justifyContent: "center" }}
            onClick={() => setShowCreate(false)}
          >
            <motion.div
              initial={{ y: 400 }} animate={{ y: 0 }} exit={{ y: 400 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              style={{ width: "100%", maxWidth: 480, borderRadius: "20px 20px 0 0", padding: 24, backgroundColor: "var(--card)", display: "flex", flexDirection: "column", gap: 16 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-10 h-1 rounded-full bg-gray-300 mx-auto" />
              <div style={{ fontSize: 18, fontWeight: 700, color: "var(--text-primary)" }}>📸 Create Story</div>

              {/* Preview */}
              <div style={{ height: 160, borderRadius: 16, backgroundColor: bgColor, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
                <div style={{ color: "#fff", fontSize: 18, fontWeight: 700, textAlign: "center" }}>
                  {content || "Your story preview..."}
                </div>
              </div>

              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="What's on your mind?"
                rows={3}
                style={{ width: "100%", padding: "12px 16px", borderRadius: 12, border: "1.5px solid var(--border)", background: "var(--bg)", color: "var(--text-primary)", fontSize: 14, outline: "none", fontFamily: "inherit", resize: "none" }}
              />

              {/* Color picker */}
              <div>
                <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 8 }}>Background Color</div>
                <div style={{ display: "flex", gap: 8 }}>
                  {BG_COLORS.map((c) => (
                    <button
                      key={c}
                      onClick={() => setBgColor(c)}
                      style={{ width: 28, height: 28, borderRadius: "50%", backgroundColor: c, border: bgColor === c ? "3px solid #fff" : "3px solid transparent", cursor: "pointer", outline: bgColor === c ? `2px solid ${c}` : "none" }}
                    />
                  ))}
                </div>
              </div>

              <button
                onClick={createStory}
                disabled={creating || !content.trim()}
                style={{ width: "100%", padding: 14, borderRadius: 12, border: "none", color: "#fff", fontWeight: 700, fontSize: 14, fontFamily: "inherit", cursor: creating ? "not-allowed" : "pointer", background: creating ? "#2d3139" : "linear-gradient(135deg, #007A3D, #4c1d95)" }}
              >
                {creating ? "Posting..." : "Share Story 🚀"}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}