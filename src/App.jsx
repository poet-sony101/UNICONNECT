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

const INITIAL_DM_LIST = [
  { id: 1, name: "Chioma Adeyemi", avatar: "CA", lastMsg: "See you in class tomorrow!", time: "10:11 AM", unread: 2 },
  { id: 2, name: "Tunde Okonkwo", avatar: "TO", lastMsg: "Do you have the CSC101 textbook?", time: "Yesterday", unread: 0 },
  { id: 3, name: "Amaka Bello", avatar: "AB", lastMsg: "Thanks for the info!", time: "Yesterday", unread: 0 },
];

function MainApp() {
  const [authed, setAuthed] = useState(false);
  const [onboarded, setOnboarded] = useState(false);
  const [tab, setTab] = useState("feed");
  const { theme, toggleTheme } = useTheme();
  const [groupMessages, setGroupMessages] = useState(INITIAL_GROUP_MESSAGES);
  const [dmList, setDmList] = useState(INITIAL_DM_LIST);

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
          {tab === "chat" && (
            <GroupChat
              messages={groupMessages}
              setMessages={setGroupMessages}
            />
          )}
          {tab === "dms" && (
            <Messages
              dmList={dmList}
              setDmList={setDmList}
            />
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