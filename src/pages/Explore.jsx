import { useState } from "react";
import Events from "./Events";
import Confessions from "./Confessions";
import Polls from "./Polls";
import StudyGroups from "./StudyGroups";
import PastQuestions from "./PastQuestions";
import LectureNotes from "./LectureNotes";
import Timetable from "./Timetable";
import Jobs from "./Jobs";
import Marketplace from "./Marketplace";
import Skills from "./Skills";
import Leaderboard from "./Leaderboard";

const TABS = [
  { id: "events", icon: "📅", label: "Events" },
  { id: "confessions", icon: "🤫", label: "Confess" },
  { id: "polls", icon: "📊", label: "Polls" },
  { id: "study", icon: "👥", label: "Study" },
  { id: "pastq", icon: "📚", label: "Past Q" },
  { id: "notes", icon: "📝", label: "Notes" },
  { id: "timetable", icon: "🗓️", label: "Timetable" },
  { id: "jobs", icon: "💼", label: "Jobs" },
  { id: "marketplace", icon: "🛒", label: "Market" },
  { id: "skills", icon: "🔄", label: "Skills" },
  { id: "leaderboard", icon: "🏆", label: "Top" },
];

export default function Explore() {
  const [activeTab, setActiveTab] = useState("events");

  return (
    <div className="pb-28">
      {/* Tab bar */}
      <div
        className="border-b sticky top-[64px] z-10 overflow-x-auto"
        style={{ borderColor: "var(--border)", backgroundColor: "var(--card)" }}
      >
        <div className="flex min-w-max">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              style={{
                padding: "12px 14px",
                fontSize: 12,
                fontWeight: 600,
                border: "none",
                cursor: "pointer",
                fontFamily: "inherit",
                backgroundColor: "transparent",
                color: activeTab === t.id ? "#007A3D" : "var(--text-secondary)",
                borderBottom: activeTab === t.id ? "2px solid #007A3D" : "2px solid transparent",
                whiteSpace: "nowrap",
              }}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {activeTab === "events" && <Events />}
      {activeTab === "confessions" && <Confessions />}
      {activeTab === "polls" && <Polls />}
      {activeTab === "study" && <StudyGroups />}
      {activeTab === "pastq" && <PastQuestions />}
      {activeTab === "notes" && <LectureNotes />}
      {activeTab === "timetable" && <Timetable />}
      {activeTab === "jobs" && <Jobs />}
      {activeTab === "marketplace" && <Marketplace />}
      {activeTab === "skills" && <Skills />}
      {activeTab === "leaderboard" && <Leaderboard />}
    </div>
  );
}