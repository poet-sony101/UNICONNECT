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

function timeAgo(dateStr) {
  const now = new Date();
  const date = new Date(dateStr);
  const diff = Math.floor((now - date) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function CreateGroupSheet({ onClose, onCreated }) {
  const [form, setForm] = useState({ name: "", description: "", course_code: "", max_members: 10, is_private: false });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  const inputStyle = { width: "100%", padding: "12px 16px", borderRadius: 12, border: "1.5px solid var(--border)", background: "var(--bg)", color: "var(--text-primary)", fontSize: 14, outline: "none", fontFamily: "inherit" };
  const labelStyle = { fontSize: 11, fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: 6 };

  const submit = async () => {
    if (!form.name.trim()) return;
    setLoading(true);
    try {
      const res = await API.post("/study-groups", form);
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
        initial={{ y: 400 }} animate={{ y: 0 }} exit={{ y: 400 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-10 h-1 rounded-full bg-gray-300 mx-auto" />
        <div style={{ fontSize: 18, fontWeight: 700, color: "var(--text-primary)" }}>👥 Create Study Group</div>

        <div>
          <label style={labelStyle}>Group Name *</label>
          <input name="name" value={form.name} onChange={handleChange} placeholder="e.g. CSC301 Study Squad" style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>Description</label>
          <textarea name="description" value={form.description} onChange={handleChange} placeholder="What will you study together?" rows={3} style={{ ...inputStyle, resize: "none" }} />
        </div>
        <div>
          <label style={labelStyle}>Course Code</label>
          <input name="course_code" value={form.course_code} onChange={handleChange} placeholder="e.g. CSC301" style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>Max Members</label>
          <select name="max_members" value={form.max_members} onChange={handleChange} style={inputStyle}>
            {[5, 10, 15, 20, 30, 50].map((n) => (
              <option key={n} value={n}>{n} members</option>
            ))}
          </select>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button
            onClick={() => setForm((prev) => ({ ...prev, is_private: !prev.is_private }))}
            style={{ width: 48, height: 24, borderRadius: 12, backgroundColor: form.is_private ? "#007A3D" : "#d1d5db", border: "none", cursor: "pointer", position: "relative" }}
          >
            <div style={{ position: "absolute", top: 4, width: 16, height: 16, borderRadius: "50%", backgroundColor: "#fff", transition: "left 0.3s", left: form.is_private ? "calc(100% - 20px)" : 4 }} />
          </button>
          <span style={{ fontSize: 13, color: "var(--text-primary)" }}>Private group</span>
        </div>

        <button
          onClick={submit}
          disabled={loading || !form.name.trim()}
          style={{ width: "100%", padding: 14, borderRadius: 12, border: "none", color: "#fff", fontWeight: 700, fontSize: 14, fontFamily: "inherit", cursor: loading ? "not-allowed" : "pointer", background: loading ? "#2d3139" : "linear-gradient(135deg, #007A3D, #4c1d95)" }}
        >
          {loading ? "Creating..." : "Create Group"}
        </button>
      </motion.div>
    </div>
  );
}

function GroupChat({ group, onClose }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef(null);
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    API.get(`/study-groups/${group.id}/messages`)
      .then((res) => setMessages(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [group.id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    try {
      const res = await API.post(`/study-groups/${group.id}/messages`, { content: input });
      setMessages((prev) => [...prev, {
        ...res.data,
        username: user.username,
        full_name: user.full_name,
        sender_id: user.id,
      }]);
      setInput("");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="overlay" onClick={onClose}>
      <motion.div
        style={{ width: "100%", maxWidth: 480, borderRadius: "20px 20px 0 0", height: "85vh", display: "flex", flexDirection: "column", backgroundColor: "var(--card)" }}
        initial={{ y: 400 }} animate={{ y: 0 }} exit={{ y: 400 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ padding: "16px 20px", background: "linear-gradient(135deg, #064e3b, #4c1d95)", borderRadius: "20px 20px 0 0", display: "flex", alignItems: "center", gap: 12 }}>
          <button onClick={onClose} style={{ color: "rgba(255,255,255,0.8)", background: "none", border: "none", cursor: "pointer", fontSize: 20 }}>‹</button>
          <div>
            <div style={{ color: "#fff", fontWeight: 700, fontSize: 14 }}>{group.name}</div>
            <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 11 }}>{group.member_count} members · {group.course_code}</div>
          </div>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: "auto", padding: 16, display: "flex", flexDirection: "column", gap: 12, backgroundColor: "var(--bg)" }}>
          {loading ? (
            <div style={{ textAlign: "center", color: "var(--text-secondary)", marginTop: 40 }}>Loading...</div>
          ) : messages.length === 0 ? (
            <div style={{ textAlign: "center", color: "var(--text-secondary)", marginTop: 40 }}>
              <div style={{ fontSize: 36, marginBottom: 8 }}>👋</div>
              <div style={{ fontSize: 14 }}>No messages yet. Say hi!</div>
            </div>
          ) : (
            messages.map((msg) => {
              const isMine = msg.sender_id === user.id;
              return (
                <div key={msg.id} style={{ display: "flex", justifyContent: isMine ? "flex-end" : "flex-start", gap: 8, alignItems: "flex-end" }}>
                  {!isMine && (
                    <Avatar initials={(msg.full_name || msg.username || "U").slice(0, 2).toUpperCase()} color="#6366f1" size={28} />
                  )}
                  <div style={{ maxWidth: "75%" }}>
                    {!isMine && <div style={{ fontSize: 10, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 3 }}>{msg.full_name || msg.username}</div>}
                    <div style={{
                      padding: "10px 14px", borderRadius: isMine ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                      backgroundColor: isMine ? "#007A3D" : "var(--card)",
                      color: isMine ? "#fff" : "var(--text-primary)",
                      fontSize: 14, border: isMine ? "none" : "1px solid var(--border)",
                    }}>
                      {msg.content}
                    </div>
                    <div style={{ fontSize: 10, color: "var(--text-secondary)", marginTop: 3, textAlign: isMine ? "right" : "left" }}>
                      {timeAgo(msg.created_at)}
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div style={{ padding: "12px 16px", backgroundColor: "var(--card)", borderTop: "1px solid var(--border)", display: "flex", gap: 10 }}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Message group..."
            style={{ flex: 1, padding: "10px 16px", borderRadius: 22, border: "1.5px solid var(--border)", background: "var(--bg)", color: "var(--text-primary)", fontSize: 14, outline: "none", fontFamily: "inherit" }}
          />
          <button
            onClick={sendMessage}
            style={{ width: 40, height: 40, borderRadius: "50%", backgroundColor: "#007A3D", color: "#fff", border: "none", cursor: "pointer", fontSize: 18 }}
          >↑</button>
        </div>
      </motion.div>
    </div>
  );
}

export default function StudyGroups() {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [activeChat, setActiveChat] = useState(null);
  const [activeTab, setActiveTab] = useState("all");
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    API.get("/study-groups")
      .then((res) => setGroups(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleJoin = async (groupId) => {
    try {
      await API.post(`/study-groups/${groupId}/join`);
      setGroups((prev) => prev.map((g) => g.id === groupId ? { ...g, joined: true, member_count: g.member_count + 1 } : g));
    } catch (err) {
      console.error(err);
    }
  };

  const filtered = activeTab === "mine" ? groups.filter((g) => g.joined) : groups;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-3xl mb-2">⏳</div>
          <div className="text-sm" style={{ color: "var(--text-secondary)" }}>Loading study groups...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-4">
      <style>{styles}</style>

      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="font-extrabold text-xl" style={{ color: "var(--text-primary)" }}>Study Groups 👥</div>
          <div className="text-sm" style={{ color: "var(--text-secondary)" }}>Study together, pass together</div>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          style={{ padding: "8px 16px", borderRadius: 20, background: "linear-gradient(135deg, #007A3D, #4c1d95)", color: "#fff", fontWeight: 700, fontSize: 13, border: "none", cursor: "pointer" }}
        >
          + Create
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        {["all", "mine"].map((t) => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            style={{
              padding: "6px 16px", borderRadius: 20, fontSize: 12, fontWeight: 600,
              border: "1.5px solid", cursor: "pointer", fontFamily: "inherit",
              backgroundColor: activeTab === t ? "#007A3D" : "var(--bg)",
              color: activeTab === t ? "#fff" : "var(--text-secondary)",
              borderColor: activeTab === t ? "#007A3D" : "var(--border)",
            }}
          >
            {t === "all" ? "All Groups" : "My Groups"}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16" style={{ color: "var(--text-secondary)" }}>
          <div className="text-4xl mb-3">👥</div>
          <div className="font-bold text-base mb-1" style={{ color: "var(--text-primary)" }}>
            {activeTab === "mine" ? "You haven't joined any groups yet" : "No study groups yet"}
          </div>
          <div className="text-sm">Create one and invite your coursemates!</div>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((group, index) => (
            <motion.div
              key={group.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="rounded-2xl border shadow-sm overflow-hidden"
              style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}
            >
              <div style={{ height: 4, background: "linear-gradient(135deg, #007A3D, #4c1d95)" }} />
              <div style={{ padding: 16 }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 8 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 15, color: "var(--text-primary)" }}>{group.name}</div>
                    {group.course_code && (
                      <div style={{ fontSize: 12, color: "#007A3D", fontWeight: 600, marginTop: 2 }}>{group.course_code}</div>
                    )}
                  </div>
                  {group.is_private && (
                    <span style={{ fontSize: 11, backgroundColor: "#fef3c7", color: "#92400e", padding: "2px 8px", borderRadius: 20, fontWeight: 600 }}>🔒 Private</span>
                  )}
                </div>

                {group.description && (
                  <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.5, marginBottom: 12 }}>{group.description}</p>
                )}

                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <Avatar
                      initials={(group.full_name || group.username || "U").slice(0, 2).toUpperCase()}
                      color={group.avatar_color || "#007A3D"}
                      size={24}
                    />
                    <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>
                      {group.member_count}/{group.max_members} members
                    </span>
                  </div>

                  <div style={{ display: "flex", gap: 8 }}>
                    {group.joined && (
                      <button
                        onClick={() => setActiveChat(group)}
                        style={{ padding: "6px 14px", borderRadius: 20, background: "linear-gradient(135deg, #007A3D, #4c1d95)", color: "#fff", fontWeight: 600, fontSize: 12, border: "none", cursor: "pointer" }}
                      >
                        💬 Chat
                      </button>
                    )}
                    {!group.joined && group.member_count < group.max_members && (
                      <button
                        onClick={() => handleJoin(group.id)}
                        style={{ padding: "6px 14px", borderRadius: 20, border: "1.5px solid #007A3D", color: "#007A3D", fontWeight: 600, fontSize: 12, background: "none", cursor: "pointer" }}
                      >
                        Join
                      </button>
                    )}
                    {group.member_count >= group.max_members && !group.joined && (
                      <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>Full</span>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {showCreate && (
          <CreateGroupSheet
            onClose={() => setShowCreate(false)}
            onCreated={(g) => setGroups((prev) => [{ ...g, joined: true }, ...prev])}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {activeChat && (
          <GroupChat group={activeChat} onClose={() => setActiveChat(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}