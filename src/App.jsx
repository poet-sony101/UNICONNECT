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

function MainApp() {
  const [authed, setAuthed] = useState(false);
  const [onboarded, setOnboarded] = useState(false);
  const [tab, setTab] = useState("feed");
  const { theme, toggleTheme } = useTheme();

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
          <button
            onClick={toggleTheme}
            className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-sm"
          >
            {theme === "light" ? "🌙" : "☀️"}
          </button>
          <button className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-sm">
            🔔
          </button>
          <Avatar initials="ME" color="#7c3aed" size={32} />
        </div>
      </div>

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
          {tab === "chat" && <GroupChat />}
          {tab === "dms" && <Messages />}
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