import { useState, useRef, useEffect } from "react";
import Avatar from "../components/layout/Avatar";
import { useUser } from "../context/UserContext";

const styles = `
  @keyframes popSend {
    0% { transform: scale(1); }
    30% { transform: scale(0.8); }
    60% { transform: scale(1.15); }
    100% { transform: scale(1); }
  }
  .pop-send {
    animation: popSend 0.3s ease forwards;
  }
  @keyframes popUp {
    0% { opacity: 0; transform: translateY(16px) scale(0.97); }
    100% { opacity: 1; transform: translateY(0) scale(1); }
  }
  .pop-up {
    animation: popUp 0.3s ease forwards;
    opacity: 0;
  }
`;

export default function GroupChat({ messages, setMessages }) {
  const [input, setInput] = useState("");
  const { department } = useUser();
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (!input.trim()) return;
    setMessages((prev) => [
      ...prev,
      {
        id: prev.length + 1,
        sender: "You",
        avatar: "ME",
        content: input,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        mine: true,
      },
    ]);
    setInput("");
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)]">
      <style>{styles}</style>

      {/* Chat header */}
      <div
        className="px-5 py-3.5 flex items-center gap-3"
        style={{ background: "linear-gradient(135deg, #064e3b, #4c1d95)" }}
      >
        <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-lg">👥</div>
        <div>
          <div className="font-bold text-sm text-white">{department} — 100L</div>
          <div className="text-xs text-white/60">247 members · UNILAG</div>
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
              <div
                className={`px-4 py-2.5 text-sm leading-relaxed transition-colors duration-300 ${
                  msg.mine
                    ? "bg-emerald-700 text-white rounded-2xl rounded-br-sm"
                    : "rounded-2xl rounded-bl-sm border"
                }`}
                style={
                  !msg.mine
                    ? { backgroundColor: "var(--card)", borderColor: "var(--border)", color: "var(--text-primary)" }
                    : {}
                }
              >
                {msg.content}
              </div>
              <div
                className={`text-[10px] mt-1 ${msg.mine ? "text-right" : ""}`}
                style={{ color: "var(--text-secondary)" }}
              >
                {msg.time}
              </div>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div
        className="px-4 py-3 flex gap-3 items-center border-t transition-colors duration-300"
        style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Message group..."
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
        >
          ↑
        </button>
      </div>
    </div>
  );
}