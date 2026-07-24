import { useState } from "react";
import Avatar from "../components/layout/Avatar";
import Tag from "../components/layout/Tag";
import { useUser } from "../context/UserContext";
import { motion, AnimatePresence } from "framer-motion";
import useFeed from "../hooks/useFeed";
import API from "../utils/api";
import Stories from "./Stories";

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
    padding: 20px; max-height: 70vh; display: flex; flex-direction: column;
  }
  .comment-input {
    flex: 1; padding: 10px 16px; border-radius: 22px;
    border: 1.5px solid var(--border); background: var(--bg);
    color: var(--text-primary); font-size: 14px; outline: none; font-family: inherit;
  }
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  .spin { animation: spin 1s linear infinite; }
`;

const TAGS = ["All", "Admissions", "Department News", "Campus Life"];

function timeAgo(dateStr) {
  const now = new Date();
  const date = new Date(dateStr);
  const diff = Math.floor((now - date) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function CommentsSheet({ post, onClose, fetchComments, addComment }) {
  const [comments, setComments] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);

  useState(() => {
    fetchComments(post.id).then((data) => {
      setComments(data);
      setLoading(false);
    });
  }, [post.id]);

  const submit = async () => {
    if (!input.trim()) return;
    await addComment(post.id, input);
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    setComments((prev) => [
      ...prev,
      { id: Date.now(), full_name: user.full_name || user.username, username: user.username, content: input },
    ]);
    setInput("");
  };

  return (
    <div className="overlay" onClick={onClose}>
      <motion.div
        className="sheet"
        style={{ backgroundColor: "var(--card)" }}
        initial={{ y: 300 }} animate={{ y: 0 }} exit={{ y: 300 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-10 h-1 rounded-full bg-gray-300 mx-auto mb-4" />
        <div className="font-bold text-base mb-4" style={{ color: "var(--text-primary)" }}>
          Comments ({comments.length})
        </div>
        <div className="flex-1 overflow-y-auto flex flex-col gap-4 mb-4">
          {loading && <div className="text-center py-8" style={{ color: "var(--text-secondary)" }}>Loading...</div>}
          {!loading && comments.length === 0 && (
            <div className="text-center py-8" style={{ color: "var(--text-secondary)" }}>
              <div className="text-3xl mb-2">💬</div>
              <div className="text-sm">No comments yet. Be the first!</div>
            </div>
          )}
          {comments.map((c) => (
            <div key={c.id} className="flex gap-3">
              <Avatar initials={(c.username || "U").slice(0, 2).toUpperCase()} color="#6366f1" size={32} />
              <div>
                <div className="text-xs font-bold mb-0.5" style={{ color: "var(--text-primary)" }}>
                  {c.full_name || c.username}
                </div>
                <div className="text-sm" style={{ color: "var(--text-secondary)" }}>{c.content}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="flex gap-2 items-center pt-3 border-t" style={{ borderColor: "var(--border)" }}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            placeholder="Write a comment..."
            className="comment-input"
          />
          <button
            onClick={submit}
            className="w-9 h-9 rounded-full bg-emerald-700 text-white flex items-center justify-center text-base font-bold"
          >↑</button>
        </div>
      </motion.div>
    </div>
  );
}

function ShareSheet({ post, onClose }) {
  const url = `https://uniconnect-sony.vercel.app`;
  const text = `Check this out on UniConnect: "${post.content.slice(0, 60)}..."`;
  const platforms = [
    { name: "WhatsApp", icon: "💬", color: "#25D366", action: () => window.open(`https://wa.me/?text=${encodeURIComponent(text + " " + url)}`) },
    { name: "Twitter / X", icon: "🐦", color: "#1DA1F2", action: () => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`) },
    { name: "Facebook", icon: "📘", color: "#1877F2", action: () => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`) },
    { name: "Copy Link", icon: "🔗", color: "#6b7280", action: () => { navigator.clipboard.writeText(url); onClose(); } },
  ];

  return (
    <div className="overlay" onClick={onClose}>
      <motion.div
        className="sheet"
        style={{ backgroundColor: "var(--card)" }}
        initial={{ y: 300 }} animate={{ y: 0 }} exit={{ y: 300 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-10 h-1 rounded-full bg-gray-300 mx-auto mb-4" />
        <div className="font-bold text-base mb-5" style={{ color: "var(--text-primary)" }}>Share Post</div>
        <div className="grid grid-cols-4 gap-3">
          {platforms.map((p) => (
            <button key={p.name} onClick={p.action} className="flex flex-col items-center gap-2" style={{ background: "none", border: "none", cursor: "pointer" }}>
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl" style={{ backgroundColor: p.color + "22", border: `1.5px solid ${p.color}33` }}>
                {p.icon}
              </div>
              <span className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>{p.name}</span>
            </button>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

function CreatePostSheet({ onClose, onPost }) {
  const [content, setContent] = useState("");
  const [tag, setTag] = useState("Campus Life");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!content.trim()) return;
    setLoading(true);
    try {
      const res = await API.post("/posts", { content, tag });
      onPost(res.data);
      onClose();
    } catch (err) {
      console.error("Post error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="overlay" onClick={onClose}>
      <motion.div
        className="sheet"
        style={{ backgroundColor: "var(--card)" }}
        initial={{ y: 300 }} animate={{ y: 0 }} exit={{ y: 300 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-10 h-1 rounded-full bg-gray-300 mx-auto mb-4" />
        <div className="font-bold text-base mb-4" style={{ color: "var(--text-primary)" }}>Create Post</div>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="What's on your mind?"
          rows={4}
          className="w-full rounded-2xl p-4 text-sm outline-none border transition-colors duration-300 mb-3"
          style={{ backgroundColor: "var(--bg)", borderColor: "var(--border)", color: "var(--text-primary)", resize: "none", fontFamily: "inherit" }}
        />
        <div className="flex gap-2 mb-4 flex-wrap">
          {["Admissions", "Department News", "Campus Life"].map((t) => (
            <button
              key={t}
              onClick={() => setTag(t)}
              className="px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors duration-300"
              style={{
                backgroundColor: tag === t ? "#007A3D" : "var(--bg)",
                color: tag === t ? "#fff" : "var(--text-secondary)",
                borderColor: tag === t ? "#007A3D" : "var(--border)",
                cursor: "pointer",
              }}
            >
              {t}
            </button>
          ))}
        </div>
        <button
          onClick={submit}
          disabled={loading || !content.trim()}
          className="w-full py-3.5 rounded-xl font-bold text-sm text-white"
          style={{
            background: loading || !content.trim() ? "#2d3139" : "linear-gradient(135deg, #007A3D, #4c1d95)",
            cursor: loading || !content.trim() ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "Posting..." : "Post"}
        </button>
      </motion.div>
    </div>
  );
}

export default function Feed() {
  const [createPost, setCreatePost] = useState(false);
  const [activeComments, setActiveComments] = useState(null);
  const [activeShare, setActiveShare] = useState(null);
  const { department } = useUser();
  const {
    posts, loading, refreshing, hasMore,
    activeTag, setActiveTag,
    refresh, loadMore,
    toggleLike, deletePost,
    addComment, fetchComments,
  } = useFeed();

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-3xl mb-2">⏳</div>
          <div className="text-sm" style={{ color: "var(--text-secondary)" }}>Loading feed...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 pt-4 pb-28">
      <style>{styles}</style>

      {/* Stories */}
      <Stories />

      {/* Department badge */}
      <div
        className="rounded-2xl px-4 py-3.5 flex items-center gap-3 mb-4 shadow-sm"
        style={{ background: "linear-gradient(135deg, #064e3b, #4c1d95)" }}
      >
        <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-xl">🎓</div>
        <div>
          <div className="text-sm font-bold text-white">{department} — 100L</div>
          <div className="text-xs text-white/60">UNILAG · Verified Student</div>
        </div>
        <div className="ml-auto">
          <span className="text-xs bg-white/10 text-white/80 px-2 py-1 rounded-full font-medium">✓ Verified</span>
        </div>
      </div>

      {/* Tag filter */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
        {TAGS.map((t) => (
          <button
            key={t}
            onClick={() => setActiveTag(t === "All" ? null : t)}
            className="flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold border transition-colors duration-200"
            style={{
              backgroundColor: (t === "All" && !activeTag) || activeTag === t ? "#007A3D" : "var(--card)",
              color: (t === "All" && !activeTag) || activeTag === t ? "#fff" : "var(--text-secondary)",
              borderColor: (t === "All" && !activeTag) || activeTag === t ? "#007A3D" : "var(--border)",
              cursor: "pointer",
            }}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Create post box */}
      <div
        className="rounded-2xl p-4 border mb-4 shadow-sm transition-colors duration-300"
        style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}
      >
        <div className="flex items-center gap-3">
          {user.avatar_url ? (
            <img src={user.avatar_url} alt="avatar" className="w-10 h-10 rounded-full object-cover" />
          ) : (
            <Avatar initials={(user.username || "ME").slice(0, 2).toUpperCase()} color="#7c3aed" size={38} />
          )}
          <button
            onClick={() => setCreatePost(true)}
            className="flex-1 text-left px-4 py-2.5 rounded-full text-sm transition-colors duration-300"
            style={{ backgroundColor: "var(--bg)", color: "var(--text-secondary)" }}
          >
            What's on your mind?
          </button>
        </div>
      </div>

      {/* Posts */}
      {posts.length === 0 ? (
        <div className="text-center py-16" style={{ color: "var(--text-secondary)" }}>
          <div className="text-4xl mb-3">📭</div>
          <div className="font-bold text-base mb-1" style={{ color: "var(--text-primary)" }}>No posts yet</div>
          <div className="text-sm">{activeTag ? `No ${activeTag} posts yet` : "Be the first to post something!"}</div>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {posts.map((post, index) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05, duration: 0.3, ease: "easeOut" }}
              className="rounded-2xl p-4 shadow-sm border transition-colors duration-300"
              style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}
            >
              <div className="flex items-center gap-3 mb-3">
                {post.avatar_url ? (
                  <img src={post.avatar_url} alt="avatar" className="w-10 h-10 rounded-full object-cover" />
                ) : (
                  <Avatar
                    initials={(post.full_name || post.username || "U").slice(0, 2).toUpperCase()}
                    color={post.avatar_color || "#007A3D"}
                    size={40}
                  />
                )}
                <div className="flex-1">
                  <div className="font-bold text-sm" style={{ color: "var(--text-primary)" }}>
                    {post.full_name || post.username}
                  </div>
                  <div className="text-xs" style={{ color: "var(--text-secondary)" }}>
                    {timeAgo(post.created_at)}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {post.tag && <Tag label={post.tag} />}
                  {post.author_id === user.id && (
                    <button
                      onClick={() => deletePost(post.id)}
                      disabled={post.deleting}
                      className="text-xs px-2 py-1 rounded-lg transition-all"
                      style={{
                        color: post.deleting ? "#9ca3af" : "#ef4444",
                        backgroundColor: post.deleting ? "#f3f4f6" : "#fef2f2",
                        border: "none", cursor: post.deleting ? "not-allowed" : "pointer",
                      }}
                    >
                      {post.deleting ? "⏳" : "🗑"}
                    </button>
                  )}
                </div>
              </div>

              <p className="text-sm leading-relaxed mb-4" style={{ color: "var(--text-secondary)" }}>
                {post.content}
              </p>

              <div className="flex gap-5 pt-3 border-t" style={{ borderColor: "var(--border)" }}>
                <button
                  onClick={() => {
                    toggleLike(post.id);
                    const el = document.getElementById(`heart-${post.id}`);
                    el.classList.remove("heart-bounce");
                    void el.offsetWidth;
                    el.classList.add("heart-bounce");
                  }}
                  className="flex items-center gap-1.5 text-sm font-semibold"
                  style={{ color: post.liked ? "#007A3D" : "var(--text-secondary)" }}
                >
                  <span id={`heart-${post.id}`}>{post.liked ? "❤️" : "🤍"}</span>{" "}
                  {post.like_count}
                </button>
                <button
                  onClick={() => setActiveComments(post)}
                  className="flex items-center gap-1.5 text-sm font-semibold"
                  style={{ color: "var(--text-secondary)" }}
                >
                  💬 {post.comment_count}
                </button>
                <button
                  onClick={() => setActiveShare(post)}
                  className="flex items-center gap-1.5 text-sm font-semibold"
                  style={{ color: "var(--text-secondary)" }}
                >
                  ↗ Share
                </button>
              </div>
            </motion.div>
          ))}

          {/* Load more */}
          {hasMore && (
            <button
              onClick={loadMore}
              className="w-full py-3 rounded-xl text-sm font-semibold border transition-colors duration-300"
              style={{ backgroundColor: "var(--card)", borderColor: "var(--border)", color: "var(--text-secondary)", cursor: "pointer" }}
            >
              Load more posts
            </button>
          )}
        </div>
      )}

      {/* Floating refresh button */}
      <motion.button
        onClick={refresh}
        whileTap={{ scale: 0.85 }}
        whileHover={{ scale: 1.1 }}
        className="fixed bottom-24 right-4 w-14 h-14 rounded-full text-white flex items-center justify-center shadow-xl z-20 text-2xl"
        style={{ background: "linear-gradient(135deg, #007A3D, #4c1d95)" }}
      >
        <span className={refreshing ? "spin" : ""}>🔄</span>
      </motion.button>

      {/* Comments sheet */}
      <AnimatePresence>
        {activeComments && (
          <CommentsSheet
            post={activeComments}
            onClose={() => setActiveComments(null)}
            fetchComments={fetchComments}
            addComment={addComment}
          />
        )}
      </AnimatePresence>

      {/* Share sheet */}
      <AnimatePresence>
        {activeShare && (
          <ShareSheet post={activeShare} onClose={() => setActiveShare(null)} />
        )}
      </AnimatePresence>

      {/* Create post sheet */}
      <AnimatePresence>
        {createPost && (
          <CreatePostSheet
            onClose={() => setCreatePost(false)}
            onPost={() => refresh()}
          />
        )}
      </AnimatePresence>
    </div>
  );
}