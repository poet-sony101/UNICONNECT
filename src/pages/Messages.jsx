import { useState, useRef, useEffect } from "react";
import Avatar from "../components/layout/Avatar";
import API from "../utils/api";
import useSocket from "../hooks/useSocket";

const styles = `
  @keyframes popUp {
    0% { opacity: 0; transform: translateY(16px) scale(0.97); }
    100% { opacity: 1; transform: translateY(0) scale(1); }
  }
  .pop-up {
    animation: popUp 0.3s ease forwards;
    opacity: 0;
  }
  @keyframes popSend {
    0% { transform: scale(1); }
    30% { transform: scale(0.8); }
    60% { transform: scale(1.15); }
    100% { transform: scale(1); }
  }
  .pop-send {
    animation: popSend 0.3s ease forwards;
  }
  .search-input {
    width: 100%;
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

function DMConversation({ dm, onBack, onUpdateLastMsg }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [replyTo, setReplyTo] = useState(null);
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const socket = useSocket();

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const roomId = [user.id, dm.id].sort().join("_");

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await API.get(`/messages/dm/${dm.id}`);
        const formatted = res.data.map((msg) => ({
          id: msg.id,
          content: msg.content,
          mine: msg.sender_id === user.id,
          time: new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          replyTo: null,
        }));
        setMessages(formatted);
      } catch (err) {
        console.error("DM fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMessages();
  }, [dm.id]);

  useEffect(() => {
    if (!socket.current) return;
    socket.current.emit("join_dm", roomId);
    socket.current.on("new_direct_message", (msg) => {
      if (msg.sender_id === user.id) return;
      setMessages((prev) => {
        if (prev.find((m) => m.id === msg.id)) return prev;
        return [
          ...prev,
          {
            id: msg.id,
            content: msg.content,
            mine: false,
            time: new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            replyTo: null,
          },
        ];
      });
    });
    return () => { socket.current?.off("new_direct_message"); };
  }, [roomId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (!input.trim() || !socket.current) return;
    const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    setMessages((prev) => [...prev, { id: Date.now(), content: input, mine: true, time, replyTo: replyTo || null }]);
    onUpdateLastMsg(dm.id, input, time);
    socket.current.emit("direct_message", {
      senderId: user.id,
      receiverId: dm.id,
      content: input,
      senderName: user.full_name || user.username,
      replyTo: replyTo || null,
    });
    setInput("");
    setReplyTo(null);
  };

  const handleReply = (msg) => {
    setReplyTo(msg);
    inputRef.current?.focus();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-3xl mb-2">⏳</div>
          <div className="text-sm" style={{ color: "var(--text-secondary)" }}>Loading messages...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-140px)]">
      <style>{styles}</style>

      {/* Header */}
      <div
        className="px-4 py-3.5 flex items-center gap-3"
        style={{ background: "linear-gradient(135deg, #064e3b, #4c1d95)" }}
      >
        <button onClick={onBack} className="text-white/80 text-xl bg-transparent border-none cursor-pointer">‹</button>
        <Avatar initials={(dm.name || "U").slice(0, 2).toUpperCase()} color="#8b5cf6" size={34} />
        <div>
          <div className="font-bold text-sm text-white">{dm.name}</div>
          <div className="text-xs text-white/60">{dm.department || "UNILAG"}</div>
        </div>
      </div>

      {/* Messages */}
      <div
        className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-4 transition-colors duration-300"
        style={{ backgroundColor: "var(--bg)" }}
      >
        {messages.length === 0 && (
          <div className="text-center py-16" style={{ color: "var(--text-secondary)" }}>
            <div className="text-4xl mb-3">💬</div>
            <div className="font-bold text-base mb-1" style={{ color: "var(--text-primary)" }}>No messages yet</div>
            <div className="text-sm">Say hi to {dm.name.split(" ")[0]}!</div>
          </div>
        )}

        {messages.map((msg, index) => (
          <div
            key={msg.id}
            className={`flex pop-up ${msg.mine ? "justify-end" : "justify-start"}`}
            style={{ animationDelay: `${index * 0.08}s` }}
          >
            <div className="max-w-[75%]">
              {msg.replyTo && (
                <div
                  className="px-3 py-1.5 rounded-xl rounded-b-none text-xs mb-0.5 border-l-4 border-emerald-500 opacity-80"
                  style={{ backgroundColor: "var(--border)", color: "var(--text-secondary)" }}
                >
                  <span className="font-semibold">{msg.replyTo.mine ? "You" : dm.name.split(" ")[0]}: </span>
                  {msg.replyTo.content.length > 50 ? msg.replyTo.content.slice(0, 50) + "..." : msg.replyTo.content}
                </div>
              )}
              <div
                className={`px-4 py-2.5 text-sm leading-relaxed border transition-colors duration-300 ${msg.replyTo ? "rounded-t-none" : ""} ${
                  msg.mine ? "bg-emerald-700 text-white rounded-2xl rounded-br-sm border-transparent" : "rounded-2xl rounded-bl-sm"
                }`}
                style={!msg.mine ? { backgroundColor: "var(--card)", borderColor: "var(--border)", color: "var(--text-primary)" } : {}}
              >
                {msg.content}
              </div>
              <div className={`flex items-center gap-2 mt-1 ${msg.mine ? "flex-row-reverse" : ""}`}>
                <div className="text-[10px]" style={{ color: "var(--text-secondary)" }}>{msg.time}</div>
                <button
                  onClick={() => handleReply(msg)}
                  className="text-[10px] font-semibold"
                  style={{ color: "#007A3D", background: "none", border: "none", cursor: "pointer" }}
                >
                  ↩ Reply
                </button>
              </div>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Reply preview */}
      {replyTo && (
        <div
          className="px-4 py-2.5 flex items-center justify-between border-t border-l-4 border-emerald-500"
          style={{ backgroundColor: "var(--card)", borderTopColor: "var(--border)" }}
        >
          <div className="flex-1 min-w-0">
            <div className="text-xs font-bold text-emerald-600">
              Replying to {replyTo.mine ? "yourself" : dm.name.split(" ")[0]}
            </div>
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
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder={replyTo ? `Reply to ${replyTo.mine ? "yourself" : dm.name.split(" ")[0]}...` : `Message ${dm.name.split(" ")[0]}...`}
          className="flex-1 rounded-full px-4 py-2.5 text-sm outline-none transition-colors duration-300"
          style={{ backgroundColor: "var(--bg)", color: "var(--text-primary)" }}
        />
        <button
          id="dm-send-btn"
          onClick={() => {
            sendMessage();
            const el = document.getElementById("dm-send-btn");
            el.classList.remove("pop-send");
            void el.offsetWidth;
            el.classList.add("pop-send");
          }}
          className="w-10 h-10 rounded-full bg-emerald-700 text-white flex items-center justify-center text-lg font-bold"
        >↑</button>
      </div>
    </div>
  );
}

export default function Messages({ dmList, setDmList }) {
  const [activeDM, setActiveDM] = useState(null);
  const [searching, setSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);

  const updateLastMsg = (id, msg, time) => {
    setDmList((prev) =>
      prev.map((dm) => (dm.id === id ? { ...dm, lastMsg: msg, time, unread: 0 } : dm))
    );
  };

  const openDM = (dm) => {
    setDmList((prev) =>
      prev.map((d) => (d.id === dm.id ? { ...d, unread: 0 } : d))
    );
    setSearching(false);
    setSearchQuery("");
    setSearchResults([]);
    setActiveDM(dm);
  };

  const searchUsers = async (q) => {
    setSearchQuery(q);
    if (!q.trim()) { setSearchResults([]); return; }
    setSearchLoading(true);
    try {
      const res = await API.get(`/users/search?q=${q}`);
      setSearchResults(res.data);
    } catch (err) {
      console.error("Search error:", err);
    } finally {
      setSearchLoading(false);
    }
  };

  if (activeDM) {
    return (
      <DMConversation
        dm={activeDM}
        onBack={() => setActiveDM(null)}
        onUpdateLastMsg={updateLastMsg}
      />
    );
  }

  return (
    <div className="px-4 py-4 pb-28">
      <style>{styles}</style>

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="font-extrabold text-xl transition-colors duration-300" style={{ color: "var(--text-primary)" }}>
          Messages
        </div>
        <button
          onClick={() => setSearching(!searching)}
          className="w-9 h-9 rounded-xl flex items-center justify-center text-lg transition-colors duration-300"
          style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)" }}
        >
          {searching ? "✕" : "✏️"}
        </button>
      </div>

      {/* Search box */}
      {searching && (
        <div className="mb-4">
          <input
            value={searchQuery}
            onChange={(e) => searchUsers(e.target.value)}
            placeholder="Search by name or username..."
            className="search-input"
            autoFocus
          />

          {/* Search results */}
          {searchLoading && (
            <div className="text-center py-4 text-sm" style={{ color: "var(--text-secondary)" }}>
              Searching...
            </div>
          )}
          {searchResults.length > 0 && (
            <div className="flex flex-col gap-2 mt-3">
              {searchResults.map((u) => (
                <div
                  key={u.id}
                  onClick={() => openDM({
                    id: u.id,
                    name: u.full_name || u.username,
                    avatar: (u.full_name || u.username || "U").slice(0, 2).toUpperCase(),
                    department: u.department,
                    lastMsg: "",
                    time: "",
                    unread: 0,
                  })}
                  className="rounded-2xl px-4 py-3.5 border flex items-center gap-3 cursor-pointer transition-colors duration-300"
                  style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}
                >
                  <Avatar
                    initials={(u.full_name || u.username || "U").slice(0, 2).toUpperCase()}
                    color="#8b5cf6"
                    size={40}
                  />
                  <div>
                    <div className="font-bold text-sm" style={{ color: "var(--text-primary)" }}>
                      {u.full_name || u.username}
                    </div>
                    <div className="text-xs" style={{ color: "var(--text-secondary)" }}>
                      @{u.username} · {u.department || "UNILAG"}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          {!searchLoading && searchQuery && searchResults.length === 0 && (
            <div className="text-center py-4 text-sm" style={{ color: "var(--text-secondary)" }}>
              No users found
            </div>
          )}
        </div>
      )}

      {/* DM List */}
      {dmList.length === 0 && !searching ? (
        <div className="text-center py-16" style={{ color: "var(--text-secondary)" }}>
          <div className="text-4xl mb-3">💬</div>
          <div className="font-bold text-base mb-1" style={{ color: "var(--text-primary)" }}>
            No messages yet
          </div>
          <div className="text-sm">Tap ✏️ to find and message a coursemate!</div>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {dmList.map((dm, index) => (
            <div
              key={dm.id}
              onClick={() => openDM(dm)}
              className="pop-up rounded-2xl px-4 py-4 border flex items-center gap-3 cursor-pointer shadow-sm transition-colors duration-300"
              style={{
                backgroundColor: "var(--card)",
                borderColor: "var(--border)",
                animationDelay: `${index * 0.1}s`,
              }}
            >
              <Avatar initials={(dm.name || "U").slice(0, 2).toUpperCase()} color="#8b5cf6" size={44} />
              <div className="flex-1 min-w-0">
                <div className="font-bold text-sm" style={{ color: "var(--text-primary)" }}>{dm.name}</div>
                <div className="text-xs mt-0.5 truncate" style={{ color: "var(--text-secondary)" }}>{dm.lastMsg}</div>
              </div>
              <div className="text-right flex flex-col items-end gap-1 shrink-0">
                <div className="text-xs" style={{ color: "var(--text-secondary)" }}>{dm.time}</div>
                {dm.unread > 0 && (
                  <div className="w-5 h-5 rounded-full bg-emerald-700 text-white text-xs font-bold flex items-center justify-center">
                    {dm.unread}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}