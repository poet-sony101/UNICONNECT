import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Avatar from "../components/layout/Avatar";
import API from "../utils/api";

export default function Leaderboard() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    API.get("/leaderboard")
      .then((res) => setUsers(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const MEDALS = ["🥇", "🥈", "🥉"];

  const myRank = users.findIndex((u) => u.id === currentUser.id) + 1;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-3xl mb-2">⏳</div>
          <div className="text-sm" style={{ color: "var(--text-secondary)" }}>Loading leaderboard...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-4">
      <div className="font-extrabold text-xl mb-1" style={{ color: "var(--text-primary)" }}>Leaderboard 🏆</div>
      <div className="text-sm mb-4" style={{ color: "var(--text-secondary)" }}>Most active UniConnect students</div>

      {/* Points guide */}
      <div
        className="rounded-2xl p-4 mb-5 border"
        style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}
      >
        <div className="font-bold text-sm mb-3" style={{ color: "var(--text-primary)" }}>How to earn points 💡</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {[
            { icon: "📝", label: "Create a post", points: "+10" },
            { icon: "📚", label: "Upload past question", points: "+20" },
            { icon: "📖", label: "Upload lecture notes", points: "+20" },
            { icon: "❤️", label: "Like a post", points: "+2" },
          ].map((item) => (
            <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 16 }}>{item.icon}</span>
              <div>
                <div style={{ fontSize: 11, color: "var(--text-secondary)" }}>{item.label}</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#007A3D" }}>{item.points} pts</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* My rank */}
      {myRank > 0 && (
        <div
          className="rounded-2xl p-4 mb-4"
          style={{ background: "linear-gradient(135deg, #064e3b, #4c1d95)" }}
        >
          <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 12, marginBottom: 4 }}>Your Rank</div>
          <div style={{ color: "#fff", fontWeight: 800, fontSize: 24 }}>#{myRank}</div>
          <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 12, marginTop: 2 }}>
            {users[myRank - 1]?.total_points || 0} points
          </div>
        </div>
      )}

      {/* Top 3 */}
      {users.length >= 3 && (
        <div style={{ display: "flex", gap: 8, marginBottom: 20, alignItems: "flex-end" }}>
          {[1, 0, 2].map((i) => {
            const u = users[i];
            if (!u) return null;
            const isFirst = i === 0;
            return (
              <motion.div
                key={u.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                style={{
                  flex: 1, textAlign: "center", padding: "16px 8px",
                  borderRadius: 16, border: "1px solid var(--border)",
                  backgroundColor: "var(--card)",
                  transform: isFirst ? "scale(1.05)" : "scale(1)",
                }}
              >
                <div style={{ fontSize: isFirst ? 32 : 24, marginBottom: 6 }}>{MEDALS[i]}</div>
                {u.avatar_url ? (
                  <img src={u.avatar_url} alt="avatar" style={{ width: 44, height: 44, borderRadius: "50%", objectFit: "cover", margin: "0 auto 6px" }} />
                ) : (
                  <div style={{ margin: "0 auto 6px" }}>
                    <Avatar initials={(u.full_name || u.username || "U").slice(0, 2).toUpperCase()} color={u.avatar_color || "#007A3D"} size={44} />
                  </div>
                )}
                <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {u.full_name || u.username}
                </div>
                <div style={{ fontSize: 13, fontWeight: 800, color: "#007A3D", marginTop: 2 }}>
                  {u.total_points} pts
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Full list */}
      <div className="flex flex-col gap-2">
        {users.map((u, index) => {
          const isMe = u.id === currentUser.id;
          return (
            <motion.div
              key={u.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.03 }}
              style={{
                display: "flex", alignItems: "center", gap: 12, padding: "12px 16px",
                borderRadius: 14, border: "1px solid var(--border)",
                backgroundColor: isMe ? "#ecfdf5" : "var(--card)",
                borderColor: isMe ? "#bbf7d0" : "var(--border)",
              }}
            >
              <div style={{ width: 28, fontWeight: 800, fontSize: 14, color: index < 3 ? "#007A3D" : "var(--text-secondary)", textAlign: "center" }}>
                {index < 3 ? MEDALS[index] : `#${index + 1}`}
              </div>
              {u.avatar_url ? (
                <img src={u.avatar_url} alt="avatar" style={{ width: 36, height: 36, borderRadius: "50%", objectFit: "cover" }} />
              ) : (
                <Avatar initials={(u.full_name || u.username || "U").slice(0, 2).toUpperCase()} color={u.avatar_color || "#007A3D"} size={36} />
              )}
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}>
                  {u.full_name || u.username} {isMe && <span style={{ fontSize: 10, color: "#007A3D" }}>(You)</span>}
                </div>
                <div style={{ fontSize: 11, color: "var(--text-secondary)" }}>{u.department || "UNILAG"}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 14, fontWeight: 800, color: "#007A3D" }}>{u.total_points}</div>
                <div style={{ fontSize: 10, color: "var(--text-secondary)" }}>pts</div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}