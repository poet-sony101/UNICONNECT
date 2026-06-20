const TABS = [
  { id: "feed", icon: "🏠", label: "Feed" },
  { id: "colleges", icon: "🎓", label: "Faculties" },
  { id: "chat", icon: "👥", label: "Group" },
  { id: "dms", icon: "💬", label: "Messages" },
  { id: "profile", icon: "👤", label: "Profile" },
];

export default function BottomNav({ activeTab, onTabChange }) {
  return (
    <div
      className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] flex pb-4 pt-3 px-2"
      style={{ background: "linear-gradient(135deg, #0f1117 0%, #1a1d27 100%)" }}
    >
      {TABS.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className="flex-1 flex flex-col items-center gap-1 py-1 relative"
          >
            {isActive && (
              <div className="absolute -top-1 w-8 h-1 rounded-full bg-emerald-500" />
            )}
            <span className={`text-xl transition-all ${isActive ? "scale-110" : "opacity-50"}`}>
              {tab.icon}
            </span>
            <span className={`text-[10px] font-semibold transition-all ${isActive ? "text-emerald-400" : "text-gray-600"}`}>
              {tab.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}