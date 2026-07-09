import { useState } from "react";
import Events from "./Events";
import Confessions from "./Confessions";
import Polls from "./Polls";

const TABS = [
  { id: "events", icon: "📅", label: "Events" },
  { id: "confessions", icon: "🤫", label: "Confessions" },
  { id: "polls", icon: "📊", label: "Polls" },
];

export default function Explore() {
  const [activeTab, setActiveTab] = useState("events");

  return (
    <div className="pb-28">
      {/* Tab bar */}
      <div
        className="flex border-b sticky top-[64px] z-10"
        style={{ borderColor: "var(--border)", backgroundColor: "var(--card)" }}
      >
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            style={{
              flex: 1,
              padding: "12px 0",
              fontSize: 13,
              fontWeight: 600,
              border: "none",
              cursor: "pointer",
              fontFamily: "inherit",
              backgroundColor: "transparent",
              color: activeTab === t.id ? "#007A3D" : "var(--text-secondary)",
              borderBottom: activeTab === t.id ? "2px solid #007A3D" : "2px solid transparent",
            }}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === "events" && <Events />}
      {activeTab === "confessions" && <Confessions />}
      {activeTab === "polls" && <Polls />}
    </div>
  );
}