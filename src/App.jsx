import { useState } from "react";
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

const TAB_TITLES = {
  feed: "UniConnect",
  colleges: "Faculties",
  chat: "Group Chat",
  dms: "Messages",
  profile: "My Profile",
};

const INITIAL_GROUP_MESSAGES = [
  { id: 1, sender: "Chioma A.", avatar: "CA", content: "Hey everyone! Anyone know when our first lecture is?", time: "10:02 AM", mine: false },
  { id: 2, sender: "You", avatar: "ME", content: "I heard it's Monday 8am in LT1", time: "10:05 AM", mine: true },
  { id: 3, sender: "Tunde O.", avatar: "TO", content: "Omo that's early 😩 anybody know the course advisor?", time: "10:07 AM", mine: false },
  { id: 4, sender: "Amaka B.", avatar: "AB", content: "It's Dr. Fashola, I saw it on the notice board", time: "10:09 AM", mine: false },
  { id: 5, sender: "You", avatar: "ME", content: "Thanks Amaka! This group is already helpful 🙏", time: "10:11 AM", mine: true },
];

const INITIAL_DM_LIST = [];

const NOTIFICATIONS = [
  { id: 1, icon: "❤️", text: "Tunde liked your post", time: "2m ago" },
  { id: 2, icon: "💬", text: "Chioma commented on your post", time: "10m ago" },
  { id: 3, icon: "👥", text: "3 new students joined your department", time: "1h ago" },
  { id: 4, icon: "📢", text: "New announcement from UNILAG Admin", time: "2h ago" },
];

function NotificationsPanel({ onClose }) {
  return (
    <div
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 40, display: "flex", alignItems: "flex-start", justifyContent: "flex-end" }}
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
          maxHeight: "60vh",
          overflowY: "auto",
          border: "1px solid var(--border)",
          borderTop: "none",
        }}
      >
        <div className="px-5 py-4 flex items-center justify-between border-b" style={{ borderColor: "var(--border)" }}>
          <div className="font-bold text-base" style={{ color: "var(--text-primary)" }}>Notifications</div>
          <button
            onClick={onClose}
            className="text-sm font-semibold"
            style={{ color: "#007A3D", background: "none", border: "none", cursor: "pointer" }}
          >
            Mark all read
          </button>
        </div>

        <div className="flex flex-col">
          {NOTIFICATIONS.map((n, index) => (
            <div
              key={n.id}
              className="px-5 py-4 flex items-center gap-3 border-b"
              style={{ borderColor: "var(--border)", backgroundColor: index === 0 ? "var(--bg)" : "transparent" }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                style={{ backgroundColor: "var(--bg)", border: "1px solid var(--border)" }}
              >
                {n.icon}
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{n.text}</div>
                <div className="text-xs mt-0.5" style={{ color: "var(--text-secondary)" }}>{n.time}</div>
              </div>
              {index === 0 && (
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
              )}
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

function MainApp() {
  const [authed, setAuthed] = useState(!!localStorage.getItem("token"));
  const [onboarded, setOnboarded] = useState(!!localStorage.getItem("token") && !!JSON.parse(localStorage.getItem("user") || "{}").department_id);
  const [tab, setTab] = useState("feed");
  const [showNotifications, setShowNotifications] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const [groupMessages, setGroupMessages] = useState(INITIAL_GROUP_MESSAGES);
  const [dmList, setDmList] = useState(INITIAL_DM_LIST);

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userInitials = (user.full_name || user.username || "ME").slice(0, 2).toUpperCase();

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
            onClick={() => setShowNotifications(!showNotifications)}
            className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-sm relative"
          >
            🔔
            <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center">
              3
            </div>
          </button>

          {/* Profile avatar */}
          <button
            onClick={() => setTab("profile")}
            className="rounded-full border-2 border-emerald-500"
          >
            <Avatar initials={userInitials} color="#7c3aed" size={32} />
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