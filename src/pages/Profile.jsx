import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Avatar from "../components/layout/Avatar";
import { useUser } from "../context/UserContext";
import API from "../utils/api";

const styles = `
  @keyframes fadeUp {
    0% { opacity: 0; transform: translateY(20px); }
    100% { opacity: 1; transform: translateY(0); }
  }
  .fade-up {
    animation: fadeUp 0.4s ease forwards;
  }
  .edit-input {
    width: 100%;
    padding: 12px 16px;
    border-radius: 12px;
    border: 1.5px solid var(--border);
    background: var(--bg);
    color: var(--text-primary);
    font-size: 14px;
    outline: none;
    font-family: inherit;
    transition: border-color 0.2s;
  }
  .edit-input:focus {
    border-color: #007A3D;
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

function EditProfileSheet({ profile, onClose, onSave }) {
  const [form, setForm] = useState({ ...profile });
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await API.put("/users/me", {
        full_name: form.name,
        username: form.username,
        bio: form.bio,
        phone: form.phone,
      });
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      localStorage.setItem("user", JSON.stringify({
        ...user,
        full_name: form.name,
        username: form.username,
      }));
      onSave(form);
      onClose();
    } catch (err) {
      console.error("Update error:", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 40, display: "flex", alignItems: "flex-end", justifyContent: "center" }}
      onClick={onClose}
    >
      <motion.div
        style={{ width: "100%", maxWidth: 480, borderRadius: "20px 20px 0 0", padding: 24, display: "flex", flexDirection: "column", gap: 16, backgroundColor: "var(--card)" }}
        initial={{ y: 400 }}
        animate={{ y: 0 }}
        exit={{ y: 400 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-10 h-1 rounded-full bg-gray-300 mx-auto" />

        <div className="font-bold text-lg" style={{ color: "var(--text-primary)" }}>
          Edit Profile
        </div>

        <div className="flex flex-col gap-3">
          <div>
            <label className="text-xs font-semibold mb-1.5 block" style={{ color: "var(--text-secondary)" }}>
              Full Name
            </label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Your full name"
              className="edit-input"
            />
          </div>
          <div>
            <label className="text-xs font-semibold mb-1.5 block" style={{ color: "var(--text-secondary)" }}>
              Username
            </label>
            <input
              name="username"
              value={form.username}
              onChange={handleChange}
              placeholder="@username"
              className="edit-input"
            />
          </div>
          <div>
            <label className="text-xs font-semibold mb-1.5 block" style={{ color: "var(--text-secondary)" }}>
              Bio
            </label>
            <textarea
              name="bio"
              value={form.bio}
              onChange={handleChange}
              placeholder="Tell your coursemates about yourself..."
              rows={3}
              className="edit-input"
              style={{ resize: "none" }}
            />
          </div>
          <div>
            <label className="text-xs font-semibold mb-1.5 block" style={{ color: "var(--text-secondary)" }}>
              Phone Number
            </label>
            <input
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="+234 000 000 0000"
              className="edit-input"
            />
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl border font-semibold text-sm transition-colors duration-300"
            style={{ borderColor: "var(--border)", color: "var(--text-secondary)", backgroundColor: "var(--bg)" }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 py-3 rounded-xl font-bold text-sm text-white"
            style={{ background: "linear-gradient(135deg, #007A3D, #4c1d95)", cursor: saving ? "not-allowed" : "pointer" }}
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export default function Profile() {
  const { department, faculty } = useUser();
  const [editOpen, setEditOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState({
    name: "",
    username: "",
    bio: "",
    phone: "",
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await API.get("/users/me");
        setProfile({
          name: res.data.full_name || "",
          username: res.data.username || "",
          bio: res.data.bio || "",
          phone: res.data.phone || "",
        });
      } catch (err) {
        console.error("Profile fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-3xl mb-2">⏳</div>
          <div className="text-sm" style={{ color: "var(--text-secondary)" }}>
            Loading profile...
          </div>
        </div>
      </div>
    );
  }

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
          <div
            className="w-20 h-20 rounded-2xl bg-purple-600 flex items-center justify-center text-white text-2xl font-extrabold border-4 shadow-lg fade-up"
            style={{ borderColor: "var(--bg)" }}
          >
            {(profile.name || profile.username || "ME").slice(0, 2).toUpperCase()}
          </div>
          <button
            onClick={() => setEditOpen(true)}
            className="px-4 py-2 rounded-xl border text-sm font-semibold shadow-sm transition-colors duration-300"
            style={{ borderColor: "var(--border)", color: "var(--text-primary)", backgroundColor: "var(--card)" }}
          >
            Edit Profile
          </button>
        </div>
        <div className="fade-up">
          <div className="font-extrabold text-lg" style={{ color: "var(--text-primary)" }}>
            {profile.name || profile.username || "Your Name"}
          </div>
          <div className="text-sm mt-0.5" style={{ color: "var(--text-secondary)" }}>
            @{profile.username}
          </div>
          {profile.bio && (
            <div className="text-sm mt-1.5 leading-relaxed" style={{ color: "var(--text-secondary)" }}>
              {profile.bio}
            </div>
          )}
          <div className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>
            {department} · 100L · {faculty}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div
        className="grid grid-cols-3 divide-x border-b transition-colors duration-300"
        style={{ borderColor: "var(--border)", backgroundColor: "var(--card)" }}
      >
        {STATS.map((stat) => (
          <div key={stat.label} className="py-4 flex flex-col items-center gap-0.5">
            <div className="font-extrabold text-xl" style={{ color: "var(--text-primary)" }}>
              {stat.value}
            </div>
            <div className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>
              {stat.label}
            </div>
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
                <div className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                  {item.text}
                </div>
                <div className="text-xs mt-0.5" style={{ color: "var(--text-secondary)" }}>
                  {item.time}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sign out */}
      <button
  onClick={() => {
    localStorage.clear();
    window.location.reload();
  }}
  onMouseEnter={(e) => {
    e.target.style.backgroundColor = "#fee2e2";
    e.target.style.borderColor = "#fca5a5";
  }}
  onMouseLeave={(e) => {
    e.target.style.backgroundColor = "#fef2f2";
    e.target.style.borderColor = "#fee2e2";
  }}
  className="w-full py-3.5 rounded-2xl border border-red-100 bg-red-50 text-red-500 font-bold text-sm transition-all duration-200 cursor-pointer"
>
  Sign Out
</button>

      {/* Edit Profile Sheet */}
      <AnimatePresence>
        {editOpen && (
          <EditProfileSheet
            profile={profile}
            onClose={() => setEditOpen(false)}
            onSave={(updated) => setProfile(updated)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}