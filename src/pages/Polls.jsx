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

function timeAgo(dateStr) {
  const now = new Date();
  const date = new Date(dateStr);
  const diff = Math.floor((now - date) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function CreatePollSheet({ onClose, onCreated }) {
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [loading, setLoading] = useState(false);

  const addOption = () => {
    if (options.length < 5) setOptions((prev) => [...prev, ""]);
  };

  const updateOption = (index, value) => {
    setOptions((prev) => prev.map((o, i) => (i === index ? value : o)));
  };

  const removeOption = (index) => {
    if (options.length > 2) setOptions((prev) => prev.filter((_, i) => i !== index));
  };

  const submit = async () => {
    if (!question.trim() || options.filter((o) => o.trim()).length < 2) return;
    setLoading(true);
    try {
      const res = await API.post("/polls", {
        question,
        options: options.filter((o) => o.trim()),
      });
      onCreated(res.data);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = { width: "100%", padding: "12px 16px", borderRadius: 12, border: "1.5px solid var(--border)", background: "var(--bg)", color: "var(--text-primary)", fontSize: 14, outline: "none", fontFamily: "inherit" };

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
        <div style={{ fontSize: 18, fontWeight: 700, color: "var(--text-primary)" }}>📊 Create Poll</div>

        <div>
          <label style={{ fontSize: 11, fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: 6 }}>Question *</label>
          <input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask your coursemates something..."
            style={inputStyle}
          />
        </div>

        <div>
          <label style={{ fontSize: 11, fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: 6 }}>Options *</label>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {options.map((option, index) => (
              <div key={index} style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <input
                  value={option}
                  onChange={(e) => updateOption(index, e.target.value)}
                  placeholder={`Option ${index + 1}`}
                  style={{ ...inputStyle, flex: 1 }}
                />
                {options.length > 2 && (
                  <button
                    onClick={() => removeOption(index)}
                    style={{ background: "none", border: "none", cursor: "pointer", color: "#ef4444", fontSize: 18 }}
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>
          {options.length < 5 && (
            <button
              onClick={addOption}
              style={{ marginTop: 8, fontSize: 13, fontWeight: 600, color: "#007A3D", background: "none", border: "none", cursor: "pointer" }}
            >
              + Add option
            </button>
          )}
        </div>

        <button
          onClick={submit}
          disabled={loading || !question.trim() || options.filter((o) => o.trim()).length < 2}
          style={{
            width: "100%", padding: 14, borderRadius: 12, border: "none",
            color: "#fff", fontWeight: 700, fontSize: 14, fontFamily: "inherit",
            cursor: loading ? "not-allowed" : "pointer",
            background: loading ? "#2d3139" : "linear-gradient(135deg, #007A3D, #4c1d95)",
          }}
        >
          {loading ? "Creating..." : "Create Poll"}
        </button>
      </motion.div>
    </div>
  );
}

export default function Polls() {
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => {
    API.get("/polls")
      .then((res) => setPolls(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const vote = async (pollId, optionId) => {
    try {
      await API.post(`/polls/${pollId}/vote`, { optionId });
      setPolls((prev) =>
        prev.map((p) =>
          p.id === pollId
            ? {
                ...p,
                voted: true,
                voted_option: optionId,
                options: p.options.map((o) =>
                  o.id === optionId ? { ...o, vote_count: o.vote_count + 1 } : o
                ),
              }
            : p
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
          <div className="text-sm" style={{ color: "var(--text-secondary)" }}>Loading polls...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-4">
      <style>{styles}</style>

      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="font-extrabold text-xl" style={{ color: "var(--text-primary)" }}>Polls 📊</div>
          <div className="text-sm" style={{ color: "var(--text-secondary)" }}>Vote on what matters</div>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          style={{ padding: "8px 16px", borderRadius: 20, background: "linear-gradient(135deg, #007A3D, #4c1d95)", color: "#fff", fontWeight: 700, fontSize: 13, border: "none", cursor: "pointer" }}
        >
          + Poll
        </button>
      </div>

      {polls.length === 0 ? (
        <div className="text-center py-16" style={{ color: "var(--text-secondary)" }}>
          <div className="text-4xl mb-3">📊</div>
          <div className="font-bold text-base mb-1" style={{ color: "var(--text-primary)" }}>No polls yet</div>
          <div className="text-sm">Create the first poll!</div>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {polls.map((poll, index) => {
            const totalVotes = poll.options.reduce((sum, o) => sum + o.vote_count, 0);

            return (
              <motion.div
                key={poll.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="rounded-2xl p-4 border shadow-sm"
                style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}
              >
                {/* Author */}
                <div className="flex items-center gap-2 mb-3">
                  <Avatar
                    initials={(poll.full_name || poll.username || "U").slice(0, 2).toUpperCase()}
                    color={poll.avatar_color || "#007A3D"}
                    size={32}
                  />
                  <div>
                    <div className="text-xs font-bold" style={{ color: "var(--text-primary)" }}>
                      {poll.full_name || poll.username}
                    </div>
                    <div className="text-[10px]" style={{ color: "var(--text-secondary)" }}>
                      {timeAgo(poll.created_at)}
                    </div>
                  </div>
                </div>

                {/* Question */}
                <div className="font-bold text-base mb-4" style={{ color: "var(--text-primary)" }}>
                  {poll.question}
                </div>

                {/* Options */}
                <div className="flex flex-col gap-2 mb-3">
                  {poll.options.map((option) => {
                    const percentage = totalVotes > 0 ? Math.round((option.vote_count / totalVotes) * 100) : 0;
                    const isVoted = poll.voted_option === option.id;

                    return (
                      <button
                        key={option.id}
                        onClick={() => !poll.voted && vote(poll.id, option.id)}
                        disabled={poll.voted}
                        style={{
                          position: "relative", width: "100%", padding: "10px 14px",
                          borderRadius: 10, border: `1.5px solid ${isVoted ? "#007A3D" : "var(--border)"}`,
                          cursor: poll.voted ? "default" : "pointer",
                          backgroundColor: "var(--bg)", overflow: "hidden",
                          textAlign: "left", fontFamily: "inherit",
                        }}
                      >
                        {/* Progress bar */}
                        {poll.voted && (
                          <div
                            style={{
                              position: "absolute", inset: 0, left: 0,
                              width: `${percentage}%`,
                              backgroundColor: isVoted ? "#007A3D22" : "var(--border)",
                              transition: "width 0.5s ease",
                            }}
                          />
                        )}
                        <div style={{ position: "relative", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span style={{ fontSize: 13, fontWeight: 600, color: isVoted ? "#007A3D" : "var(--text-primary)" }}>
                            {isVoted && "✓ "}{option.text}
                          </span>
                          {poll.voted && (
                            <span style={{ fontSize: 12, fontWeight: 700, color: "var(--text-secondary)" }}>
                              {percentage}%
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="text-xs" style={{ color: "var(--text-secondary)" }}>
                  {totalVotes} vote{totalVotes !== 1 ? "s" : ""}
                  {!poll.voted && " · Tap to vote"}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      <AnimatePresence>
        {showCreate && (
          <CreatePollSheet
            onClose={() => setShowCreate(false)}
            onCreated={() => {
              API.get("/polls").then((res) => setPolls(res.data));
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}