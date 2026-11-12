import { motion } from "framer-motion";

const TABS = [
  { id: "feed", icon: "🏠", label: "Feed", color: "from-emerald-400 to-teal-500" },
  { id: "colleges", icon: "🎓", label: "Faculties", color: "from-blue-400 to-indigo-500" },
  { id: "chat", icon: "⚡", label: "Group", color: "from-amber-400 to-orange-500" },
  { id: "dms", icon: "💬", label: "Chats", color: "from-violet-400 to-purple-500" },
  { id: "explore", icon: "✨", label: "Explore", color: "from-pink-400 to-rose-500" },
  { id: "profile", icon: "👤", label: "Profile", color: "from-teal-400 to-emerald-500" },
];

export default function BottomNav({ activeTab, onTabChange }) {
  return (
    <nav
      className="fixed bottom-3 left-1/2 -translate-x-1/2 w-[calc(100%-24px)] max-w-[500px] z-30"
      aria-label="Bottom Navigation"
    >
      <div
        className="glass-panel rounded-2xl px-2 py-2 flex items-center justify-around shadow-xl transition-all duration-300"
        style={{
          boxShadow: "0 10px 30px -5px rgba(0, 0, 0, 0.25)",
        }}
      >
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className="relative flex-1 flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all duration-200 group active:scale-90"
              style={{
                outline: "none",
                WebkitTapHighlightColor: "transparent",
              }}
            >
              {/* Active animated pill background */}
              {isActive && (
                <motion.div
                  layoutId="activeTabBadge"
                  className="absolute inset-0 rounded-xl bg-emerald-500/10 dark:bg-emerald-400/15 border border-emerald-500/25 dark:border-emerald-400/20"
                  transition={{ type: "spring", stiffness: 380, damping: 28 }}
                />
              )}

              {/* Icon with Gen-Z micro-bounce */}
              <motion.span
                animate={isActive ? { scale: [1, 1.25, 1.1], y: -2 } : { scale: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                className={`text-xl select-none relative z-10 transition-opacity ${
                  isActive ? "opacity-100" : "opacity-60 group-hover:opacity-90"
                }`}
              >
                {tab.icon}
              </motion.span>

              {/* Label */}
              <span
                className={`text-[10px] font-bold tracking-tight select-none relative z-10 transition-all duration-200 mt-0.5 ${
                  isActive
                    ? "text-emerald-600 dark:text-emerald-400 scale-105"
                    : "text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200"
                }`}
              >
                {tab.label}
              </span>

              {/* Gen-Z active dot glow */}
              {isActive && (
                <span className="w-1 h-1 rounded-full bg-emerald-500 dark:bg-emerald-400 shadow-[0_0_6px_#10b981] mt-0.5" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
