import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Avatar from "../components/layout/Avatar";
import API from "../utils/api";

const BG_COLORS = [
  "linear-gradient(135deg, #008744, #10b981)",
  "linear-gradient(135deg, #6366f1, #a855f7)",
  "linear-gradient(135deg, #ec4899, #f43f5e)",
  "linear-gradient(135deg, #f59e0b, #ef4444)",
  "linear-gradient(135deg, #06b6d4, #3b82f6)",
  "linear-gradient(135deg, #10b981, #059669)",
];

export default function Stories() {
  const [stories, setStories] = useState([]);
  const [activeStory, setActiveStory] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [content, setContent] = useState("");
  const [bgColor, setBgColor] = useState(BG_COLORS[0]);
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
    <div className="pt-2 pb-3 px-4">
      {/* Stories horizontal carousel */}
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none items-center">
        {/* Add story button */}
        <motion.div
          whileTap={{ scale: 0.92 }}
          onClick={() => setShowCreate(true)}
          className="shrink-0 flex flex-col items-center gap-1.5 cursor-pointer group"
        >
          <div className="relative">
            <div className="w-16 h-16 rounded-full p-0.5 border-2 border-dashed border-emerald-500/60 dark:border-emerald-400/50 flex items-center justify-center transition-all group-hover:border-emerald-500">
              <div className="w-full h-full rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-200">
                <span className="text-xl">📸</span>
              </div>
            </div>
            <span className="absolute bottom-0 right-0 w-5 h-5 rounded-full bg-emerald-500 text-white font-bold text-xs flex items-center justify-center border-2 border-white dark:border-slate-900 shadow-md">
              +
            </span>
          </div>
          <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300">Your Story</span>
        </motion.div>

        {/* User Stories */}
        {storyGroups.map((group) => {
          const isViewed = group.stories.every((s) => s.viewed);
          return (
            <motion.div
              key={group.user.user_id}
              whileTap={{ scale: 0.92 }}
              onClick={() => setActiveStory(group.stories[0])}
              className="shrink-0 flex flex-col items-center gap-1.5 cursor-pointer group"
            >
              <div
                className={`w-16 h-16 rounded-full p-0.5 transition-transform group-hover:scale-105 ${
                  isViewed ? "border-2 border-slate-300 dark:border-slate-700" : "story-ring-active"
                }`}
              >
                <div className="w-full h-full rounded-full overflow-hidden border-2 border-white dark:border-slate-900 flex items-center justify-center bg-slate-200 dark:bg-slate-800">
                  {group.user.avatar_url ? (
                    <img src={group.user.avatar_url} alt="avatar" className="w-full h-full object-cover" />
                  ) : (
                    <Avatar
                      initials={(group.user.full_name || group.user.username || "U").slice(0, 2).toUpperCase()}
                      size={60}
                    />
                  )}
                </div>
              </div>
              <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 max-w-[64px] truncate text-center">
                {group.user.full_name?.split(" ")[0] || group.user.username}
              </span>
            </motion.div>
          );
        })}
      </div>

      {/* Story Viewer Modal */}
      <AnimatePresence>
        {activeStory && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md"
            onClick={() => { clearInterval(progressRef.current); setActiveStory(null); }}
          >
            <div
              className="w-full max-w-md h-full sm:h-[88vh] sm:rounded-3xl flex flex-col relative overflow-hidden shadow-2xl"
              style={{ background: activeStory.background_color || BG_COLORS[0] }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Progress bar */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-white/25 z-20">
                <div
                  className="h-full bg-white transition-all duration-100 ease-linear rounded-r-full"
                  style={{ width: `${progress}%` }}
                />
              </div>

              {/* Story Header */}
              <div className="p-4 pt-5 flex items-center justify-between z-20 bg-gradient-to-b from-black/40 to-transparent">
                <div className="flex items-center gap-2.5">
                  <Avatar
                    initials={(activeStory.full_name || activeStory.username || "U").slice(0, 2).toUpperCase()}
                    size={38}
                  />
                  <div>
                    <div className="text-white font-black text-sm drop-shadow-sm">
                      {activeStory.full_name || activeStory.username}
                    </div>
                    <div className="text-white/80 text-xs font-medium">
                      👁️ {activeStory.views || 0} campus views
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => { clearInterval(progressRef.current); setActiveStory(null); }}
                  className="w-8 h-8 rounded-full bg-black/40 text-white font-bold flex items-center justify-center backdrop-blur-sm hover:bg-black/60 transition-colors"
                >
                  ✕
                </button>
              </div>

              {/* Story Content */}
              <div className="flex-1 flex items-center justify-center p-8 text-center">
                <p className="text-white font-black text-2xl leading-relaxed drop-shadow-md select-none break-words">
                  "{activeStory.content}"
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Story Creator Modal */}
      <AnimatePresence>
        {showCreate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setShowCreate(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm rounded-3xl p-5 shadow-2xl glass-panel flex flex-col gap-4 border border-slate-700"
              style={{ background: "var(--card)" }}
            >
              <div className="flex items-center justify-between">
                <h3 className="font-black text-base" style={{ color: "var(--text-primary)" }}>
                  Create Campus Story ✨
                </h3>
                <button
                  onClick={() => setShowCreate(false)}
                  className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs font-bold"
                >
                  ✕
                </button>
              </div>

              {/* Story preview card */}
              <div
                className="w-full h-44 rounded-2xl p-4 flex items-center justify-center shadow-inner relative"
                style={{ background: bgColor }}
              >
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="What's happening on campus right now? 🎒"
                  maxLength={180}
                  className="w-full h-full bg-transparent text-white placeholder-white/70 text-center font-bold text-base outline-none resize-none flex items-center justify-center"
                />
              </div>

              {/* Background color picker */}
              <div className="flex items-center justify-between gap-2 px-1">
                {BG_COLORS.map((bg, idx) => (
                  <button
                    key={idx}
                    onClick={() => setBgColor(bg)}
                    className={`w-7 h-7 rounded-full transition-transform ${bgColor === bg ? "scale-125 ring-2 ring-emerald-400" : ""}`}
                    style={{ background: bg }}
                  />
                ))}
              </div>

              {/* Post button */}
              <button
                onClick={createStory}
                disabled={creating || !content.trim()}
                className="w-full py-3 rounded-2xl campus-gradient-bg text-white font-extrabold text-sm shadow-lg shadow-emerald-500/25 active:scale-95 disabled:opacity-50 transition-all"
              >
                {creating ? "Sharing Story..." : "Share to Campus 🚀"}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
