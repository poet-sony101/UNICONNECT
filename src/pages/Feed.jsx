import { useState } from "react";
import Avatar from "../components/layout/Avatar";
import Tag from "../components/layout/Tag";
import { useUser } from "../context/UserContext";
import { motion } from "framer-motion";

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
`;

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

export default function Feed() {
  const [likedPosts, setLikedPosts] = useState({});
  const { department } = useUser();

  const toggleLike = (id) => {
    setLikedPosts((prev) => ({ ...prev, [id]: !prev[id] }));
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
            {/* Header */}
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

            {/* Content */}
            <p
              className="text-sm leading-relaxed mb-4"
              style={{ color: "var(--text-secondary)" }}
            >
              {post.content}
            </p>

            {/* Actions */}
            <div
              className="flex gap-5 pt-3 border-t"
              style={{ borderColor: "var(--border)" }}
            >
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
                <span id={`heart-${post.id}`}>
                  {likedPosts[post.id] ? "❤️" : "🤍"}
                </span>{" "}
                {post.likes + (likedPosts[post.id] ? 1 : 0)}
              </button>
              <button
                className="flex items-center gap-1.5 text-sm font-semibold"
                style={{ color: "var(--text-secondary)" }}
              >
                💬 {post.comments}
              </button>
              <button
                className="flex items-center gap-1.5 text-sm font-semibold"
                style={{ color: "var(--text-secondary)" }}
              >
                ↗ Share
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}