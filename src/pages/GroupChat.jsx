import { useState, useRef, useEffect } from "react";
import Avatar from "../components/layout/Avatar";
import { useUser } from "../context/UserContext";
import API from "../utils/api";
import useSocket from "../hooks/useSocket";
import { AnimatePresence, motion } from "framer-motion";

const styles = `
  @keyframes popSend {
    0% { transform: scale(1); }
    30% { transform: scale(0.8); }
    60% { transform: scale(1.15); }
    100% { transform: scale(1); }
  }
  .pop-send { animation: popSend 0.3s ease forwards; }
  @keyframes popUp {
    0% { opacity: 0; transform: translateY(16px) scale(0.97); }
    100% { opacity: 1; transform: translateY(0) scale(1); }
  }
  .pop-up { animation: popUp 0.3s ease forwards; opacity: 0; }
  .overlay {
    position: fixed; inset: 0; background: rgba(0,0,0,0.5);
    z-index: 40; display: flex; align-items: flex-end; justify-content: center;
  }
  .sheet {
    width: 100%; max-width: 480px; border-radius: 20px 20px 0 0;
    padding: 20px; max-height: 80vh; overflow-y: auto; display: flex; flex-direction: column;
  }
`;

const REACTIONS = ["👍", "❤️", "😂", "😮", "😢", "🔥"];

function MembersSheet({ departmentId, onClose }) {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get(`/messages/group/${departmentId}/members`)
      .then((res) => setMembers(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [departmentId]);

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
        <div className="w-10 h-1 rounded-full bg-gray-300 mx-auto mb-4" />
        <div className="font-bold text-base mb-4" style={{ color: "var(--text-primary)" }}>
          Members ({members.length})
        </div>
        {loading ? (
          <div className="text-center py-8 text-sm" style={{ color: "var(--text-secondary)" }}>Loading...</div>
        ) : (
          <div className="flex flex-col gap-3">
            {members.map((m) => (
              <div key={m.id} className="flex items-center gap-3">
                <Avatar
                  initials={(m.full_name || m.username || "U").slice(0, 2).toUpperCase()}
                  color={m.avatar_color || "#7c3aed"}
                  size={38}
                />
                <div>
                  <div className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                    {m.full_name || m.username}
                  </div>
                  <div className="text-xs" style={{ color: "var(--text-secondary)" }}>
                    @{m.username}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}

function GroupSwitcher({ groups, activeGroup, onSwitch, onClose }) {
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
        <div className="w-10 h-1 rounded-full bg-gray-300 mx-auto mb-4" />
        <div className="font-bold text-base mb-4" style={{ color: "var(--text-primary)" }}>
          My Groups
        </div>
        <div className="flex flex-col gap-3">
          {groups.map((g) => (
            <div
              key={g.id}
              onClick={() => { onSwitch(g); onClose(); }}
              className="flex items-center gap-3 px-4 py-3.5 rounded-2xl border cursor-pointer transition-colors duration-300"
              style={{
                backgroundColor: activeGroup?.id === g.id ? "#ecfdf5" : "var(--bg)",
                borderColor: activeGroup?.id === g.id ? "#007A3D" : "var(--border)",
              }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
                style={{ background: "linear-gradient(135deg, #064e3b, #4c1d95)" }}
              >
                👥
              </div>
              <div className="flex-1">
                <div className="font-bold text-sm" style={{ color: "var(--text-primary)" }}>{g.name}</div>
                <div className="text-xs" style={{ color: "var(--text-secondary)" }}>{g.faculty}</div>
              </div>
              {activeGroup?.id === g.id && (
                <span className="text-xs font-bold text-emerald-600">Active</span>
              )}
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

export default function GroupChat({ messages, setMessages }) {
  const [input, setInput] = useState("");
  const [replyTo, setReplyTo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showMembers, setShowMembers] = useState(false);
  const [showSwitcher, setShowSwitcher] = useState(false);
  const [myGroups, setMyGroups] = useState([]);
  const [activeGroup, setActiveGroup] = useState(null);
  const [pinnedMessage, setPinnedMessage] = useState(null);
  const [typingUser, setTypingUser] = useState(null);
  const [reactionPicker, setReactionPicker] = useState(null);
  const [messageReactions, setMessageReactions] = useState({});
  const { department } = useUser();
  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const typingTimeout = useRef(null);
  const socket = useSocket();

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  // Fetch user's groups
  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const res = await API.get("/messages/my-groups");
        setMyGroups(res.data);
        // Set active group to user's department by default
        const defaultGroup = res.data.find((g) => g.id === user.department_id) || res.data[0];
        if (defaultGroup) setActiveGroup(defaultGroup);
      } catch (err) {
        console.error("Groups fetch error:", err);
      }
    };
    fetchGroups();
  }, []);

  // Fetch messages when active group changes
  useEffect(() => {
    if (!activeGroup) return;
    setLoading(true);
    const fetchMessages = async () => {
      try {
        const [msgRes, pinnedRes] = await Promise.all([
          API.get(`/messages/group/${activeGroup.id}`),
          API.get(`/messages/group/${activeGroup.id}/pinned`),
        ]);
        const formatted = msgRes.data.map((msg) => ({
          id: msg.id,
          sender: msg.full_name || msg.username,
          avatar: (msg.full_name || msg.username || "U").slice(0, 2).toUpperCase(),
          content: msg.content,
          time: new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          mine: msg.sender_id === user.id,
          replyTo: null,
          reactions: {},
        }));
        setMessages(formatted);
        setPinnedMessage(pinnedRes.data);
      } catch (err) {
        console.error("Fetch messages error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMessages();
  }, [activeGroup]);

  // Socket events
  useEffect(() => {
    if (!socket.current || !activeGroup) return;

    socket.current.emit("join_department", activeGroup.id);

    socket.current.on("new_group_message", (msg) => {
      if (msg.sender_id === user.id) return;
      setMessages((prev) => {
        if (prev.find((m) => m.id === msg.id)) return prev;
        return [...prev, {
          id: msg.id,
          sender: msg.username,
          avatar: (msg.username || "U").slice(0, 2).toUpperCase(),
          content: msg.content,
          time: new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          mine: false,
          replyTo: msg.replyTo || null,
          reactions: {},
        }];
      });
    });

    socket.current.on("user_typing", ({ username, typing }) => {
      if (username === (user.full_name || user.username)) return;
      setTypingUser(typing ? username : null);
    });

    socket.current.on("new_reaction", ({ messageId, emoji, username }) => {
      setMessageReactions((prev) => ({
        ...prev,
        [messageId]: {
          ...prev[messageId],
          [emoji]: [...(prev[messageId]?.[emoji] || []), username],
        },
      }));
    });

    return () => {
      socket.current?.off("new_group_message");
      socket.current?.off("user_typing");
      socket.current?.off("new_reaction");
    };
  }, [activeGroup]);

  // Auto scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typingUser]);

  const handleTyping = () => {
    if (!socket.current || !activeGroup) return;
    socket.current.emit("typing_start", {
      departmentId: activeGroup.id,
      username: user.full_name || user.username,
    });
    clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => {
      socket.current?.emit("typing_stop", { departmentId: activeGroup.id });
    }, 2000);
  };

  const sendMessage = () => {
    if (!input.trim() || !socket.current || !activeGroup) return;

    const newMsg = {
      id: Date.now(),
      sender: user.full_name || user.username,
      avatar: (user.full_name || user.username || "U").slice(0, 2).toUpperCase(),
      content: input,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      mine: true,
      replyTo: replyTo || null,
      reactions: {},
    };

    setMessages((prev) => [...prev, newMsg]);
    socket.current.emit("group_message", {
      senderId: user.id,
      departmentId: activeGroup.id,
      content: input,
      senderName: user.full_name || user.username,
      avatarColor: user.avatar_color || "#7c3aed",
      replyTo: replyTo || null,
    });
    socket.current.emit("typing_stop", { departmentId: activeGroup.id });
    setInput("");
    setReplyTo(null);
  };

  const handleReaction = (msgId, emoji) => {
    setMessageReactions((prev) => ({
      ...prev,
      [msgId]: {
        ...prev[msgId],
        [emoji]: [...(prev[msgId]?.[emoji] || []), user.username],
      },
    }));
    socket.current?.emit("message_reaction", {
      messageId: msgId,
      emoji,
      departmentId: activeGroup?.id,
      username: user.username,
    });
    API.post(`/messages/group/${msgId}/react`, { emoji }).catch(console.error);
    setReactionPicker(null);
  };

  const handlePin = async (msgId) => {
    try {
      await API.post(`/messages/group/${activeGroup.id}/pin`, { messageId: msgId });
      const msg = messages.find((m) => m.id === msgId);
      if (msg) setPinnedMessage({ content: msg.content, username: msg.sender });
    } catch (err) {
      console.error("Pin error:", err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-3xl mb-2">⏳</div>
          <div className="text-sm" style={{ color: "var(--text-secondary)" }}>Loading chat...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-140px)]">
      <style>{styles}</style>

      {/* Chat header */}
      <div
        className="px-4 py-3 flex items-center gap-3"
        style={{ background: "linear-gradient(135deg, #064e3b, #4c1d95)" }}
      >
        <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-lg">👥</div>
        <div className="flex-1 cursor-pointer" onClick={() => setShowSwitcher(true)}>
          <div className="font-bold text-sm text-white">{activeGroup?.name || department} ▾</div>
          <div className="text-xs text-white/60">{myGroups.length} groups · tap to switch</div>
        </div>
        <button
          onClick={() => setShowMembers(true)}
          className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-sm"
        >
          👥
        </button>
      </div>

      {/* Pinned message */}
      {pinnedMessage && (
        <div
          className="px-4 py-2.5 flex items-center gap-2 border-b"
          style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}
        >
          <span className="text-sm">📌</span>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-bold text-emerald-600">Pinned Message</div>
            <div className="text-xs truncate" style={{ color: "var(--text-secondary)" }}>
              {pinnedMessage.content}
            </div>
          </div>
        </div>
      )}

      {/* Messages */}
      <div
        className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-4 transition-colors duration-300"
        style={{ backgroundColor: "var(--bg)" }}
      >
        {messages.length === 0 && (
          <div className="text-center py-16" style={{ color: "var(--text-secondary)" }}>
            <div className="text-4xl mb-3">👋</div>
            <div className="font-bold text-base mb-1" style={{ color: "var(--text-primary)" }}>No messages yet</div>
            <div className="text-sm">Say hi to your coursemates!</div>
          </div>
        )}

        {messages.map((msg, index) => (
          <div
            key={msg.id}
            className={`flex gap-2 items-end pop-up ${msg.mine ? "flex-row-reverse" : ""}`}
            style={{ animationDelay: `${index < 5 ? index * 0.07 : 0}s` }}
          >
            {!msg.mine && <Avatar initials={msg.avatar} color="#6366f1" size={30} />}
            <div className="max-w-[75%]">
              {!msg.mine && (
                <div className="text-xs font-semibold mb-1" style={{ color: "var(--text-secondary)" }}>
                  {msg.sender}
                </div>
              )}

              {/* Reply bubble */}
              {msg.replyTo && (
                <div
                  className="px-3 py-1.5 rounded-xl rounded-b-none text-xs mb-0.5 border-l-4 border-emerald-500 opacity-80"
                  style={{ backgroundColor: "var(--border)", color: "var(--text-secondary)" }}
                >
                  <span className="font-semibold">{msg.replyTo.sender}: </span>
                  {msg.replyTo.content.length > 50 ? msg.replyTo.content.slice(0, 50) + "..." : msg.replyTo.content}
                </div>
              )}

              {/* Main bubble */}
              <div
                className={`px-4 py-2.5 text-sm leading-relaxed transition-colors duration-300 ${msg.replyTo ? "rounded-t-none" : ""} ${
                  msg.mine ? "bg-emerald-700 text-white rounded-2xl rounded-br-sm" : "rounded-2xl rounded-bl-sm border"
                }`}
                style={!msg.mine ? { backgroundColor: "var(--card)", borderColor: "var(--border)", color: "var(--text-primary)" } : {}}
              >
                {msg.content}
              </div>

              {/* Reactions display */}
              {messageReactions[msg.id] && Object.keys(messageReactions[msg.id]).length > 0 && (
                <div className="flex gap-1 mt-1 flex-wrap">
                  {Object.entries(messageReactions[msg.id]).map(([emoji, users]) => (
                    <span
                      key={emoji}
                      className="text-xs px-2 py-0.5 rounded-full border cursor-pointer"
                      style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}
                      onClick={() => handleReaction(msg.id, emoji)}
                    >
                      {emoji} {users.length}
                    </span>
                  ))}
                </div>
              )}

              {/* Time + Reply + React + Pin */}
              <div className={`flex items-center gap-2 mt-1 ${msg.mine ? "flex-row-reverse" : ""}`}>
                <div className="text-[10px]" style={{ color: "var(--text-secondary)" }}>{msg.time}</div>
                <button
                  onClick={() => { setReplyTo(msg); inputRef.current?.focus(); }}
                  className="text-[10px] font-semibold"
                  style={{ color: "#007A3D", background: "none", border: "none", cursor: "pointer" }}
                >
                  ↩ Reply
                </button>
                <button
                  onClick={() => setReactionPicker(reactionPicker === msg.id ? null : msg.id)}
                  className="text-[10px]"
                  style={{ background: "none", border: "none", cursor: "pointer" }}
                >
                  😊
                </button>
                {!msg.mine && (
                  <button
                    onClick={() => handlePin(msg.id)}
                    className="text-[10px]"
                    style={{ background: "none", border: "none", cursor: "pointer" }}
                  >
                    📌
                  </button>
                )}
              </div>

              {/* Reaction picker */}
              {reactionPicker === msg.id && (
                <div
                  className="flex gap-2 mt-1 p-2 rounded-xl border"
                  style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}
                >
                  {REACTIONS.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => handleReaction(msg.id, emoji)}
                      className="text-lg hover:scale-125 transition-transform"
                      style={{ background: "none", border: "none", cursor: "pointer" }}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {typingUser && (
          <div className="flex gap-2 items-center">
            <div className="text-xs italic" style={{ color: "var(--text-secondary)" }}>
              {typingUser} is typing...
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Reply preview */}
      {replyTo && (
        <div
          className="px-4 py-2.5 flex items-center justify-between border-t border-l-4 border-emerald-500"
          style={{ backgroundColor: "var(--card)", borderTopColor: "var(--border)" }}
        >
          <div className="flex-1 min-w-0">
            <div className="text-xs font-bold text-emerald-600">Replying to {replyTo.sender}</div>
            <div className="text-xs truncate" style={{ color: "var(--text-secondary)" }}>{replyTo.content}</div>
          </div>
          <button
            onClick={() => setReplyTo(null)}
            className="ml-3 text-lg font-bold"
            style={{ color: "var(--text-secondary)", background: "none", border: "none", cursor: "pointer" }}
          >✕</button>
        </div>
      )}

      {/* Input */}
      <div
        className="px-4 py-3 flex gap-3 items-center border-t transition-colors duration-300"
        style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}
      >
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => { setInput(e.target.value); handleTyping(); }}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder={replyTo ? `Reply to ${replyTo.sender}...` : "Message group..."}
          className="flex-1 rounded-full px-4 py-2.5 text-sm outline-none transition-colors duration-300"
          style={{ backgroundColor: "var(--bg)", color: "var(--text-primary)" }}
        />
        <button
          id="send-btn"
          onClick={() => {
            sendMessage();
            const el = document.getElementById("send-btn");
            el.classList.remove("pop-send");
            void el.offsetWidth;
            el.classList.add("pop-send");
          }}
          className="w-10 h-10 rounded-full bg-emerald-700 text-white flex items-center justify-center text-lg font-bold"
        >↑</button>
      </div>

      {/* Members sheet */}
      <AnimatePresence>
        {showMembers && (
          <MembersSheet
            departmentId={activeGroup?.id}
            onClose={() => setShowMembers(false)}
          />
        )}
      </AnimatePresence>

      {/* Group switcher */}
      <AnimatePresence>
        {showSwitcher && (
          <GroupSwitcher
            groups={myGroups}
            activeGroup={activeGroup}
            onSwitch={(g) => { setActiveGroup(g); setMessages([]); }}
            onClose={() => setShowSwitcher(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}