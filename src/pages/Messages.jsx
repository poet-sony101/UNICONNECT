import { useState, useRef, useEffect } from "react";
import Avatar from "../components/layout/Avatar";

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
`;

function DMConversation({ dm, onBack, onUpdateLastMsg }) {
  const [messages, setMessages] = useState([
    { id: 1, content: dm.lastMsg, mine: false, time: dm.time },
  ]);
  const [input, setInput] = useState("");
  const [replyTo, setReplyTo] = useState(null);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (!input.trim()) return;
    const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    setMessages((prev) => [
      ...prev,
      {
        id: prev.length + 1,
        content: input,
        mine: true,
        time,
        replyTo: replyTo || null,
      },
    ]);
    onUpdateLastMsg(dm.id, input, time);
    setInput("");
    setReplyTo(null);
  };

  const handleReply = (msg) => {
    setReplyTo(msg);
    inputRef.current?.focus();
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)]">
      <style>{styles}</style>

      {/* Header */}
      <div
        className="px-4 py-3.5 flex items-center gap-3"
        style={{ background: "linear-gradient(135deg, #064e3b, #4c1d95)" }}
      >
        <button onClick={onBack} className="text-white/80 text-xl bg-transparent border-none cursor-pointer">
          ‹
        </button>
        <Avatar initials={dm.avatar} color="#8b5cf6" size={34} />
        <div>
          <div className="font-bold text-sm text-white">{dm.name}</div>
          <div className="text-xs text-white/60">UNILAG · 100L</div>
        </div>
      </div>

      {/* Messages */}
      <div
        className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-4 transition-colors duration-300"
        style={{ backgroundColor: "var(--bg)" }}
      >
        {messages.map((msg, index) => (
          <div
            key={msg.id}
            className={`flex pop-up ${msg.mine ? "justify-end" : "justify-start"}`}
            style={{ animationDelay: `${index * 0.08}s` }}
          >
            <div className="max-w-[75%]">
              {/* Reply bubble */}
              {msg.replyTo && (
                <div
                  className="px-3 py-1.5 rounded-xl rounded-b-none text-xs mb-0.5 border-l-4 border-emerald-500 opacity-80"
                  style={{ backgroundColor: "var(--border)", color: "var(--text-secondary)" }}
                >
                  <span className="font-semibold">{msg.replyTo.mine ? "You" : dm.name.split(" ")[0]}: </span>
                  {msg.replyTo.content.length > 50
                    ? msg.replyTo.content.slice(0, 50) + "..."
                    : msg.replyTo.content}
                </div>
              )}

              {/* Main bubble */}
              <div
                className={`px-4 py-2.5 text-sm leading-relaxed border transition-colors duration-300 ${
                  msg.replyTo ? "rounded-t-none" : ""
                } ${
                  msg.mine
                    ? "bg-emerald-700 text-white rounded-2xl rounded-br-sm border-transparent"
                    : "rounded-2xl rounded-bl-sm"
                }`}
                style={
                  !msg.mine
                    ? { backgroundColor: "var(--card)", borderColor: "var(--border)", color: "var(--text-primary)" }
                    : {}
                }
              >
                {msg.content}
              </div>

              {/* Time + Reply */}
              <div className={`flex items-center gap-2 mt-1 ${msg.mine ? "flex-row-reverse" : ""}`}>
                <div className="text-[10px]" style={{ color: "var(--text-secondary)" }}>
                  {msg.time}
                </div>
                <button
                  onClick={() => handleReply(msg)}
                  className="text-[10px] font-semibold"
                  style={{ color: "var(--text-secondary)", background: "none", border: "none", cursor: "pointer", opacity: 0.6 }}
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
            <div className="text-xs truncate" style={{ color: "var(--text-secondary)" }}>
              {replyTo.content}
            </div>
          </div>
          <button
            onClick={() => setReplyTo(null)}
            className="ml-3 text-lg font-bold"
            style={{ color: "var(--text-secondary)", background: "none", border: "none", cursor: "pointer" }}
          >
            ✕
          </button>
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
        >
          ↑
        </button>
      </div>
    </div>
  );
}

export default function Messages({ dmList, setDmList }) {
  const [activeDM, setActiveDM] = useState(null);

  const updateLastMsg = (id, msg, time) => {
    setDmList((prev) =>
      prev.map((dm) => (dm.id === id ? { ...dm, lastMsg: msg, time, unread: 0 } : dm))
    );
  };

  const openDM = (dm) => {
    setDmList((prev) =>
      prev.map((d) => (d.id === dm.id ? { ...d, unread: 0 } : d))
    );
    setActiveDM(dm);
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
      <div className="font-extrabold text-xl mb-5 transition-colors duration-300" style={{ color: "var(--text-primary)" }}>
        Messages
      </div>

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
            <Avatar initials={dm.avatar} color="#8b5cf6" size={44} />
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
    </div>
  );
}