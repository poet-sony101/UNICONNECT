import { useState } from "react";
import Avatar from "../components/layout/Avatar";
import Tag from "../components/layout/Tag";
import { useUser } from "../context/UserContext";
import { motion, AnimatePresence } from "framer-motion";

const styles = `
  @keyframes bounceHeart {
    0% { transform: scale(1); }
    30% { transform: scale(1.5); }
    60% { transform: scale(0.9); }
    100% { transform: scale(1); }
  }
  .heart-bounce {
    animation: bounceHeart 0.4s ease forwards;
  }
  .overlay {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.5);
    z-index: 40;
    display: flex;
    align-items: flex-end;
    justify-content: center;
  }
  .sheet {
    width: 100%;
    max-width: 480px;
    border-radius: 20px 20px 0 0;
    padding: 20px;
    max-height: 70vh;
    display: flex;
    flex-direction: column;
  }
  .comment-input {
    flex: 1;
    padding: 10px 16px;
    border-radius: 22px;
    border: 1.5px solid var(--border);
    background: var(--bg);
    color: var(--text-primary);
    font-size: 14px;
    outline: none;
    font-family: inherit;
  }
`;

const INITIAL_COMMENTS = {
  1: [
    { id: 1, author: "Tunde O.", avatar: "TO", text: "Thanks for the info!", time: "1h ago" },
    { id: 2, author: "Chioma A.", avatar: "CA", text: "Finally! Been waiting for this.", time: "30m ago" },
  ],
  2: [
    { id: 1, author: "Amaka B.", avatar: "AB", text: "Can't wait for orientation 🎉", time: "3h ago" },
  ],
  3: [],
};

const POSTS = [
  {
    id: 1,
    author: "UNILAG Admin",
    avatar: "UA",
    avatarColor: "#007A3D",
    time: "2h ago",
    content: "Post-UTME screening for 2026/2027 session begins July 14th. All candidates should visit the admissions portal to complete registration.",
    likes: 234,
    comments: 41,
    tag: "Admissions",
  },
  {
    id: 2,
    author: "CS Department",
    avatar: "CS",
    avatarColor: "#1a56db",
    time: "5h ago",
    content: "Welcome to all newly admitted 100L Computer Science students! Your orientation week begins Monday, July 21st.",
    likes: 189,
    comments: 67,
    tag: "Department News",
  },
  {
    id: 3,
    author: "Student Union UNILAG",
    avatar: "SU",
    avatarColor: "#7c3aed",
    time: "1d ago",
    content: "The SUG elections are scheduled for next month. Interested candidates should pick up nomination forms from the Dean of Students office.",
    likes: 412,
    comments: 98,
    tag: "Campus Life",
  },
];

function CommentsSheet({ post, comments, onClose, onAddComment }) {
  const [input, setInput] = useState("");

  const submit = () => {
    if (!input.trim()) return;
    onAddComment(post.id, input);
    setInput("");
  };

  return (
    <div className="overlay" onClick={onClose}>
      <motion.div
        className="sheet"
        style={{ backgroundColor: "var(--card)" }}
        initial={{ y: 300 }}
        animate={{ y: 0 }}
        exit={{ y: 300 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle */}
        <div className="w-10 h-1 rounded-full bg-gray-300 mx-auto mb-4" />
        <div className="font-bold text-base mb-4" style={{ color: "var(--text-primary)" }}>
          Comments ({comments.length})
        </div>

        {/* Comments list */}
        <div className="flex-1 overflow-y-auto flex flex-col gap-4 mb-4">
          {comments.length === 0 && (
            <div className="text-center py-8" style={{ color: "var(--text-secondary)" }}>
              <div className="text-3xl mb-2">💬</div>
              <div className="text-sm">No comments yet. Be the first!</div>
            </div>
          )}
          {comments.map((c) => (
            <div key={c.id} className="flex gap-3">
              <Avatar initials={c.avatar} color="#6366f1" size={32} />
              <div>
                <div className="text-xs font-bold mb-0.5" style={{ color: "var(--text-primary)" }}>{c.author}</div>
                <div className="text-sm" style={{ color: "var(--text-secondary)" }}>{c.text}</div>
                <div className="text-[10px] mt-0.5" style={{ color: "var(--text-secondary)" }}>{c.time}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Input */}
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
          >
            ↑
          </button>
        </div>
      </motion.div>
    </div>
  );
}

function ShareSheet({ post, onClose }) {
  const url = `https://uniconnect-sony.vercel.app`;
  const text = `Check this out on UniConnect: "${post.content.slice(0, 60)}..."`;

  const platforms = [
    {
      name: "WhatsApp",
      icon: "💬",
      color: "#25D366",
      action: () => window.open(`https://wa.me/?text=${encodeURIComponent(text + " " + url)}`),
    },
    {
      name: "Twitter / X",
      icon: "🐦",
      color: "#1DA1F2",
      action: () => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`),
    },
    {
      name: "Facebook",
      icon: "📘",
      color: "#1877F2",
      action: () => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`),
    },
    {
      name: "Copy Link",
      icon: "🔗",
      color: "#6b7280",
      action: () => {
        navigator.clipboard.writeText(url);
        onClose();
      },
    },
  ];

  return (
    <div className="overlay" onClick={onClose}>
      <motion.div
        className="sheet"
        style={{ backgroundColor: "var(--card)" }}
        initial={{ y: 300 }}
        animate={{ y: 0 }}
        exit={{ y: 300 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-10 h-1 rounded-full bg-gray-300 mx-auto mb-4" />
        <div className="font-bold text-base mb-5" style={{ color: "var(--text-primary)" }}>
          Share Post
        </div>
        <div className="grid grid-cols-4 gap-3">
          {platforms.map((p) => (
            <button
              key={p.name}
              onClick={p.action}
              className="flex flex-col items-center gap-2"
              style={{ background: "none", border: "none", cursor: "pointer" }}
            >
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl"
                style={{ backgroundColor: p.color + "22", border: `1.5px solid ${p.color}33` }}
              >
                {p.icon}
              </div>
              <span className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>
                {p.name}
              </span>
            </button>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

export default function Feed() {
  const [likedPosts, setLikedPosts] = useState({});
  const [comments, setComments] = useState(INITIAL_COMMENTS);
  const [activeComments, setActiveComments] = useState(null);
  const [activeShare, setActiveShare] = useState(null);
  const { department } = useUser();

  const toggleLike = (id) => {
    setLikedPosts((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const addComment = (postId, text) => {
    setComments((prev) => ({
      ...prev,
      [postId]: [
        ...prev[postId],
        { id: Date.now(), author: "You", avatar: "ME", text, time: "Just now" },
      ],
    }));
  };

  return (
    <div className="px-4 pt-4 pb-28">
      <style>{styles}</style>

      {/* Department badge */}
      <div
        className="rounded-2xl px-4 py-3.5 flex items-center gap-3 mb-5 shadow-sm"
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

      {/* Posts */}
      <div className="flex flex-col gap-4">
        {POSTS.map((post, index) => (
          <motion.div
            key={post.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.3, ease: "easeOut" }}
            className="rounded-2xl p-4 shadow-sm border transition-colors duration-300"
            style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}
          >
            <div className="flex items-center gap-3 mb-3">
              <Avatar initials={post.avatar} color={post.avatarColor} size={40} />
              <div className="flex-1">
                <div className="font-bold text-sm" style={{ color: "var(--text-primary)" }}>
                  {post.author}
                </div>
                <div className="text-xs" style={{ color: "var(--text-secondary)" }}>{post.time}</div>
              </div>
              <Tag label={post.tag} />
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
                style={{ color: likedPosts[post.id] ? "#007A3D" : "var(--text-secondary)" }}
              >
                <span id={`heart-${post.id}`}>{likedPosts[post.id] ? "❤️" : "🤍"}</span>{" "}
                {post.likes + (likedPosts[post.id] ? 1 : 0)}
              </button>

              <button
                onClick={() => setActiveComments(post)}
                className="flex items-center gap-1.5 text-sm font-semibold"
                style={{ color: "var(--text-secondary)" }}
              >
                💬 {comments[post.id]?.length || post.comments}
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
      </div>

      {/* Comments sheet */}
      <AnimatePresence>
        {activeComments && (
          <CommentsSheet
            post={activeComments}
            comments={comments[activeComments.id] || []}
            onClose={() => setActiveComments(null)}
            onAddComment={addComment}
          />
        )}
      </AnimatePresence>

      {/* Share sheet */}
      <AnimatePresence>
        {activeShare && (
          <ShareSheet
            post={activeShare}
            onClose={() => setActiveShare(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}