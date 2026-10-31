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
import Alumni from "./Alumni";
import MentorshipInbox from "./MentorshipInbox";
import Lecturer from "./Lecturer";
import GradeTracker from "./GradeTracker";
import Emergency from "./Emergency";

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
  { id: "alumni", icon: "🎓", label: "Alumni" },
  { id: "mentor", icon: "🤝", label: "Mentor" },
  { id: "lecturer", icon: "👨‍🏫", label: "Lecturers" },
  { id: "grades", icon: "📈", label: "Grades" },
  { id: "emergency", icon: "🆘", label: "SOS" },
];

const PAGES = {
  events: Events,
  confessions: Confessions,
  polls: Polls,
  study: StudyGroups,
  pastq: PastQuestions,
  notes: LectureNotes,
  timetable: Timetable,
  jobs: Jobs,
  marketplace: Marketplace,
  skills: Skills,
  leaderboard: Leaderboard,
  alumni: Alumni,
  mentor: MentorshipInbox,
  lecturer: Lecturer,
  grades: GradeTracker,
  emergency: Emergency,
};

export default function Explore() {
  const [activeTab, setActiveTab] = useState("events");
  const ActivePage = PAGES[activeTab];

  return (
    <div style={{ paddingBottom: 112 }}>
      <div
        style={{
          borderBottom: "1px solid var(--border)",
          position: "sticky",
          top: 64,
          zIndex: 10,
          overflowX: "auto",
          backgroundColor: "var(--card)",
        }}
      >
        <div style={{ display: "flex", minWidth: "max-content" }}>
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

      <ActivePage />
    </div>
  );
}