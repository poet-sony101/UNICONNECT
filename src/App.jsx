import { useState, useEffect } from "react";
import { UserProvider } from "./context/UserContext";
import { ThemeProvider, useTheme } from "./context/ThemeContext";
import Auth from "./pages/Auth";
import Onboarding from "./pages/Onboarding";
import Feed from "./pages/Feed";
import Faculties from "./pages/Faculties";
import GroupChat from "./pages/GroupChat";
import Messages from "./pages/Messages";
import Profile from "./pages/Profile";
import BottomNav from "./components/layout/BottomNav";
import Avatar from "./components/layout/Avatar";
import { AnimatePresence, motion } from "framer-motion";
import API from "./utils/api";
import Explore from "./pages/Explore";

const TAB_TITLES = {
  feed: "UniConnect",
  colleges: "Faculties",
  chat: "Group Chat",
  dms: "Messages",
  profile: "My Profile",
  explore: "Explore",
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
    if (type === "like") return "❤️";
    if (type === "comment") return "💬";
    if (type === "friend") return "👥";
    if (type === "post") return "📢";
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
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 40, display: "flex", alignItems: "flex-start", justifyContent: "center" }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.2 }}
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: "var(--card)",
          borderRadius: "0 0 16px 16px",
          width: "100%",
          maxWidth: 480,
          maxHeight: "70vh",
          overflowY: "auto",
          border: "1px solid var(--border)",
          borderTop: "none",
        }}
      >
        <div
          className="px-5 py-4 flex items-center justify-between border-b sticky top-0"
          style={{ borderColor: "var(--border)", backgroundColor: "var(--card)" }}
        >
          <div className="font-bold text-base" style={{ color: "var(--text-primary)" }}>
            Notifications
          </div>
          <button
            onClick={onClose}
            style={{ color: "#007A3D", background: "none", border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600 }}
          >
            Close
          </button>
        </div>

        {loading ? (
          <div className="text-center py-8" style={{ color: "var(--text-secondary)" }}>
            <div className="text-3xl mb-2">⏳</div>
            <div className="text-sm">Loading notifications...</div>
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-8" style={{ color: "var(--text-secondary)" }}>
            <div className="text-3xl mb-2">🔔</div>
            <div className="text-sm">No notifications yet</div>
          </div>
        ) : (
          <div className="flex flex-col">
            {notifications.map((n, index) => (
              <div
                key={index}
                className="px-5 py-4 flex items-start gap-3 border-b"
                style={{ borderColor: "var(--border)" }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                  style={{ backgroundColor: "var(--bg)", border: "1px solid var(--border)" }}
                >
                  {getIcon(n.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                    {n.message}
                  </div>
                  {n.context && (
                    <div className="text-xs mt-0.5 truncate" style={{ color: "var(--text-secondary)" }}>
                      "{n.context.slice(0, 50)}{n.context.length > 50 ? "..." : ""}"
                    </div>
                  )}
                  <div className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>
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
  const [authed, setAuthed] = useState(!!localStorage.getItem("token"));
  const [onboarded, setOnboarded] = useState(
    !!localStorage.getItem("token") &&
    !!JSON.parse(localStorage.getItem("user") || "{}").department_id
  );
  const [tab, setTab] = useState("feed");
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifCount, setNotifCount] = useState(0);
  const { theme, toggleTheme } = useTheme();
  const [groupMessages, setGroupMessages] = useState(INITIAL_GROUP_MESSAGES);
  const [dmList, setDmList] = useState([]);

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userInitials = (user.full_name || user.username || "ME").slice(0, 2).toUpperCase();

  useEffect(() => {
    if (!authed) return;
    API.get("/users/me/notifications-feed")
      .then((res) => setNotifCount(res.data.length))
      .catch(console.error);
  }, [authed]);

  if (!authed) return <Auth onComplete={() => setAuthed(true)} />;
  if (!onboarded) return <Onboarding onComplete={() => setOnboarded(true)} />;

  return (
    <div
      className="max-w-[480px] mx-auto min-h-screen transition-colors duration-300"
      style={{ backgroundColor: "var(--bg)" }}
    >
      {/* Top Nav */}
      <div
        className="px-5 py-4 flex items-center justify-between sticky top-0 z-10"
        style={{ background: "var(--nav-bg)" }}
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-600 flex items-center justify-center shadow-lg">
            <span className="text-white font-extrabold text-sm">U</span>
          </div>
          <span className="font-extrabold text-white text-lg tracking-tight">
            {TAB_TITLES[tab]}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-sm"
          >
            {theme === "light" ? "🌙" : "☀️"}
          </button>

          {/* Notifications */}
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              setNotifCount(0);
            }}
            className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-sm relative"
          >
            🔔
            {notifCount > 0 && (
              <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center">
                {notifCount > 9 ? "9+" : notifCount}
              </div>
            )}
          </button>

          {/* Profile avatar */}
          <button
            onClick={() => setTab("profile")}
            className="rounded-full border-2 border-emerald-500"
          >
            {user.avatar_url ? (
              <img src={user.avatar_url} alt="avatar" className="w-8 h-8 rounded-full object-cover" />
            ) : (
              <Avatar initials={userInitials} color="#7c3aed" size={32} />
            )}
          </button>
        </div>
      </div>

      {/* Notifications panel */}
      <AnimatePresence>
        {showNotifications && (
          <NotificationsPanel onClose={() => setShowNotifications(false)} />
        )}
      </AnimatePresence>

      {/* Animated Pages */}
      <AnimatePresence mode="popLayout">
        <motion.div
          key={tab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2, ease: "easeInOut" }}
        >
          {tab === "feed" && <Feed />}
          {tab === "colleges" && <Faculties />}
          {tab === "chat" && (
            <GroupChat messages={groupMessages} setMessages={setGroupMessages} />
          )}
          {tab === "dms" && (
            <Messages dmList={dmList} setDmList={setDmList} />
          )}
          {tab === "profile" && <Profile />}
          {tab === "explore" && <Explore />}
        </motion.div>
      </AnimatePresence>

      <BottomNav activeTab={tab} onTabChange={setTab} />
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