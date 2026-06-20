import Avatar from "../components/layout/Avatar";
import { useUser } from "../context/UserContext";

const styles = `
  @keyframes fadeUp {
    0% { opacity: 0; transform: translateY(20px); }
    100% { opacity: 1; transform: translateY(0); }
  }
  .fade-up {
    animation: fadeUp 0.4s ease forwards;
  }
`;

const STATS = [
  { label: "Posts", value: 12 },
  { label: "Friends", value: 47 },
  { label: "Groups", value: 3 },
];

const RECENT_ACTIVITY = [
  { id: 1, icon: "❤️", text: "Liked UNILAG Admin's post", time: "2h ago" },
  { id: 2, icon: "💬", text: "Commented in CS Group Chat", time: "5h ago" },
  { id: 3, icon: "👥", text: "Joined Computer Science — 100L", time: "1d ago" },
  { id: 4, icon: "✅", text: "Verified admission letter", time: "1d ago" },
];

export default function Profile() {
  const { department, faculty } = useUser();

  return (
    <div className="pb-28">
      <style>{styles}</style>

      {/* Header banner */}
      <div
        className="h-28 w-full"
        style={{ background: "linear-gradient(135deg, #064e3b, #4c1d95)" }}
      />

      {/* Avatar + name */}
      <div
        className="px-5 pb-4 border-b transition-colors duration-300"
        style={{ borderColor: "var(--border)" }}
      >
        <div className="flex items-end justify-between -mt-10 mb-3">
          <div className="w-20 h-20 rounded-2xl bg-purple-600 flex items-center justify-center text-white text-2xl font-extrabold border-4 shadow-lg fade-up"
            style={{ borderColor: "var(--bg)" }}
          >
            ME
          </div>
          <button
            className="px-4 py-2 rounded-xl border text-sm font-semibold shadow-sm transition-colors duration-300"
            style={{ borderColor: "var(--border)", color: "var(--text-primary)", backgroundColor: "var(--card)" }}
          >
            Edit Profile
          </button>
        </div>
        <div className="fade-up">
          <div className="font-extrabold text-lg" style={{ color: "var(--text-primary)" }}>Your Name</div>
          <div className="text-sm mt-0.5" style={{ color: "var(--text-secondary)" }}>{department} · 100L</div>
          <div className="text-xs mt-0.5" style={{ color: "var(--text-secondary)" }}>{faculty}</div>
        </div>
      </div>

      {/* Stats */}
      <div
        className="grid grid-cols-3 divide-x border-b transition-colors duration-300"
        style={{ borderColor: "var(--border)", backgroundColor: "var(--card)" }}
      >
        {STATS.map((stat) => (
          <div key={stat.label} className="py-4 flex flex-col items-center gap-0.5">
            <div className="font-extrabold text-xl" style={{ color: "var(--text-primary)" }}>{stat.value}</div>
            <div className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Verified badge */}
      <div
        className="px-5 py-4 border-b transition-colors duration-300"
        style={{ borderColor: "var(--border)" }}
      >
        <div
          className="rounded-2xl px-4 py-3.5 flex items-center gap-3 fade-up"
          style={{ background: "linear-gradient(135deg, #064e3b, #4c1d95)" }}
        >
          <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-lg">🎓</div>
          <div>
            <div className="text-sm font-bold text-white">UNILAG Verified Student</div>
            <div className="text-xs text-white/60">Admission letter approved</div>
          </div>
          <div className="ml-auto text-xs bg-white/10 text-white/80 px-2 py-1 rounded-full font-medium">
            ✓ Verified
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="px-5 py-4">
        <div className="font-bold text-sm mb-3" style={{ color: "var(--text-primary)" }}>
          Recent Activity
        </div>
        <div className="flex flex-col gap-3">
          {RECENT_ACTIVITY.map((item, index) => (
            <div
              key={item.id}
              className="rounded-2xl px-4 py-3.5 border flex items-center gap-3 shadow-sm fade-up transition-colors duration-300"
              style={{
                backgroundColor: "var(--card)",
                borderColor: "var(--border)",
                animationDelay: `${index * 0.08}s`,
              }}
            >
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center text-lg border transition-colors duration-300"
                style={{ backgroundColor: "var(--bg)", borderColor: "var(--border)" }}
              >
                {item.icon}
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{item.text}</div>
                <div className="text-xs mt-0.5" style={{ color: "var(--text-secondary)" }}>{item.time}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sign out */}
      <div className="px-5">
        <button className="w-full py-3.5 rounded-2xl border border-red-100 bg-red-50 text-red-500 font-bold text-sm">
          Sign Out
        </button>
      </div>
    </div>
  );
}