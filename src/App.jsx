import { useState, useEffect } from "react";
import { UserProvider } from "./context/UserContext";
import { ThemeProvider, useTheme } from "./context/ThemeContext";
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import Feed from "./pages/Feed";
import Faculties from "./pages/Faculties";
import GroupChat from "./pages/GroupChat";
import Messages from "./pages/Messages";
import Profile from "./pages/Profile";
import Explore from "./pages/Explore";
import BottomNav from "./components/layout/BottomNav";
import Avatar from "./components/layout/Avatar";
import { AnimatePresence, motion } from "framer-motion";
import API from "./utils/api";
import VerifyEmail from "./pages/VerifyEmail";

const TAB_TITLES = {
  feed: "Campus Buzz",
  colleges: "Faculties",
  chat: "Group Hub",
  dms: "Messages",
  explore: "Discover",
  profile: "My Profile",
};

const INITIAL_GROUP_MESSAGES = [
  { id: 1, sender: "Chioma A.", avatar: "CA", content: "Hey everyone! Anyone know when our first lecture is?", time: "10:02 AM", mine: false },
  { id: 2, sender: "You", avatar: "ME", content: "I heard it's Monday 8am in LT1", time: "10:05 AM", mine: true },
  { id: 3, sender: "Tunde O.", avatar: "TO", content: "Omo that's early 😩 anybody know the course advisor?", time: "10:07 AM", mine: false },
  { id: 4, sender: "Amaka B.", avatar: "AB", content: "It's Dr. Fashola, I saw it on the notice board", time: "10:09 AM", mine: false },
  { id: 5, sender: "You", avatar: "ME", content: "Thanks Amaka! This group is already helpful 🙏", time: "10:11 AM", mine: true },
];

function NotificationsPanel({ onClose }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get("/users/me/notifications-feed")
      .then((res) => setNotifications(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const getIcon = (type) => {
    if (type === "like") return "💖";
    if (type === "comment") return "💬";
    if (type === "friend") return "🤝";
    if (type === "post") return "🚀";
    return "🔔";
  };

  const timeAgo = (dateStr) => {
    if (!dateStr) return "";
    const now = new Date();
    const date = new Date(dateStr);
    const diff = Math.floor((now - date) / 1000);
    if (diff < 60) return "just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: -20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        transition={{ type: "spring", damping: 25, stiffness: 350 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-3xl overflow-hidden glass-panel shadow-2xl flex flex-col max-h-[80vh] mt-12 border border-slate-200/60 dark:border-slate-800/80"
        style={{ backgroundColor: "var(--card)" }}
      >
        <div className="px-5 py-4 flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 sticky top-0 bg-inherit backdrop-blur-md">
          <div className="flex items-center gap-2">
            <span className="text-xl">🔔</span>
            <span className="font-black text-base tracking-tight" style={{ color: "var(--text-primary)" }}>
              Notifications
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 font-bold text-sm transition-all active:scale-90"
          >
            ✕
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12" style={{ color: "var(--text-secondary)" }}>
            <div className="text-3xl mb-2 animate-bounce">⚡</div>
            <div className="text-sm font-semibold">Catching up with your vibe...</div>
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-12 px-4" style={{ color: "var(--text-secondary)" }}>
            <div className="text-4xl mb-3">✨</div>
            <div className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>All caught up!</div>
            <div className="text-xs mt-1">No new pings right now. Time to explore the feed!</div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
            {notifications.map((n, index) => (
              <div
                key={index}
                className="px-5 py-3.5 flex items-start gap-3 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
              >
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-lg shrink-0 bg-emerald-500/10 border border-emerald-500/20 shadow-sm">
                  {getIcon(n.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium leading-snug" style={{ color: "var(--text-primary)" }}>
                    {n.message}
                  </div>
                  {n.context && (
                    <div className="text-xs mt-1 p-2 rounded-xl bg-slate-100 dark:bg-slate-800/60 truncate text-slate-500 dark:text-slate-400 border border-slate-200/40 dark:border-slate-750">
                      "{n.context.slice(0, 60)}{n.context.length > 60 ? "..." : ""}"
                    </div>
                  )}
                  <div className="text-[11px] font-semibold mt-1 text-emerald-600 dark:text-emerald-400">
                    {timeAgo(n.created_at)}
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

function MainApp() {
  const [screen, setScreen] = useState(
    localStorage.getItem("token") ? "app" : "landing"
  );
  const [authMode, setAuthMode] = useState("signup");
  const [pendingEmail, setPendingEmail] = useState("");
  const [tab, setTab] = useState("feed");
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifCount, setNotifCount] = useState(0);
  const { theme, toggleTheme } = useTheme();
  const [groupMessages, setGroupMessages] = useState(INITIAL_GROUP_MESSAGES);
  const [dmList, setDmList] = useState([]);

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userInitials = (user.full_name || user.username || "ME").slice(0, 2).toUpperCase();

  useEffect(() => {
    if (screen !== "app") return;
    API.get("/users/me/notifications-feed")
      .then((res) => setNotifCount(res.data.length))
      .catch(console.error);
  }, [screen]);

  // Landing page
  if (screen === "landing") {
    return (
      <Landing
        onLogin={() => { setAuthMode("login"); setScreen("auth"); }}
        onSignup={() => { setAuthMode("signup"); setScreen("auth"); }}
      />
    );
  }

  // Auth page
  if (screen === "auth") {
    return (
      <Auth
        initialMode={authMode}
        onComplete={(result) => {
          if (result.requiresVerification) {
            setPendingEmail(result.email);
            setScreen("verify");
          } else {
            setScreen("app");
          }
        }}
      />
    );
  }

  if (screen === "verify") {
    return (
      <VerifyEmail
        email={pendingEmail}
        onComplete={() => setScreen("app")}
      />
    );
  }

  // Main app
  return (
    <div className="min-h-screen transition-colors duration-300 relative flex flex-col justify-between">
      {/* Container wrapper: keeps mobile crisp on phones while giving desktop a polished app-frame */}
      <div className="w-full max-w-[500px] mx-auto min-h-screen flex flex-col pb-24 shadow-2xl relative border-x border-slate-200/50 dark:border-slate-800/60 bg-[var(--bg)]">
        
        {/* Sleek Glass Top Bar */}
        <header className="px-4 py-3.5 flex items-center justify-between sticky top-0 z-20 backdrop-blur-xl bg-white/75 dark:bg-slate-900/80 border-b border-slate-200/60 dark:border-slate-800/80 transition-all">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl campus-gradient-bg flex items-center justify-center shadow-md shadow-emerald-500/20 active:scale-95 transition-transform">
              <span className="text-white font-black text-base">U</span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-base tracking-tight" style={{ color: "var(--text-primary)" }}>
                  {TAB_TITLES[tab]}
                </span>
                <span className="px-1.5 py-0.2 text-[9px] font-black uppercase tracking-wider rounded-md bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  UNILAG
                </span>
              </div>
              <div className="text-[10px] font-semibold text-slate-400">
                UniConnect Ecosystem
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Dark/Light mode toggle */}
            <button
              onClick={toggleTheme}
              className="w-9 h-9 rounded-2xl bg-slate-100 dark:bg-slate-800/90 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-center text-sm shadow-sm hover:scale-105 active:scale-95 transition-all"
              title="Toggle theme"
            >
              {theme === "light" ? "🌙" : "☀️"}
            </button>

            {/* Notifications button */}
            <button
              onClick={() => { setShowNotifications(!showNotifications); setNotifCount(0); }}
              className="w-9 h-9 rounded-2xl bg-slate-100 dark:bg-slate-800/90 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-center text-sm relative shadow-sm hover:scale-105 active:scale-95 transition-all"
              title="Notifications"
            >
              🔔
              {notifCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-500 text-white text-[9px] font-black flex items-center justify-center shadow-md shadow-rose-500/40 animate-pulse">
                  {notifCount > 9 ? "9+" : notifCount}
                </span>
              )}
            </button>

            {/* Profile avatar button */}
            <button
              onClick={() => setTab("profile")}
              className="rounded-full hover:scale-105 active:scale-95 transition-all"
              title="My profile"
            >
              {user.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt="avatar"
                  className="w-9 h-9 rounded-full object-cover ring-2 ring-emerald-500/50"
                />
              ) : (
                <Avatar initials={userInitials} size={36} ring={true} />
              )}
            </button>
          </div>
        </header>

        {/* Notifications modal */}
        <AnimatePresence>
          {showNotifications && <NotificationsPanel onClose={() => setShowNotifications(false)} />}
        </AnimatePresence>

        {/* Tab Content with smooth spring transitions */}
        <main className="flex-1 flex flex-col">
          <AnimatePresence mode="wait">
            <motion.div
              key={tab}
              initial={{ opacity: 0, y: 10, scale: 0.99 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.99 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className="flex-1"
            >
              {tab === "feed" && <Feed />}
              {tab === "colleges" && <Faculties />}
              {tab === "chat" && <GroupChat messages={groupMessages} setMessages={setGroupMessages} />}
              {tab === "dms" && <Messages dmList={dmList} setDmList={setDmList} />}
              {tab === "explore" && <Explore />}
              {tab === "profile" && <Profile />}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Floating Bottom Nav */}
        <BottomNav activeTab={tab} onTabChange={setTab} />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <UserProvider>
        <MainApp />
      </UserProvider>
    </ThemeProvider>
  );
}
