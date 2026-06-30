import { useState, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Avatar from "../components/layout/Avatar";
import { useUser } from "../context/UserContext";
import API from "../utils/api";

function timeAgo(dateStr) {
  if (!dateStr) return "";
  const now = new Date();
  const date = new Date(dateStr);
  const diff = Math.floor((now - date) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function EditProfileSheet({ profile, onClose, onSave }) {
  const [form, setForm] = useState({ ...profile });
  const [saving, setSaving] = useState(false);
  const [activeSection, setActiveSection] = useState("basic");

  const handleChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSave = async () => {
    setSaving(true);
    try {
      await API.put("/users/me", {
        full_name: form.name,
        username: form.username,
        bio: form.bio,
        phone: form.phone,
      });
      await API.put("/users/me/social", {
        twitter: form.twitter,
        instagram: form.instagram,
        graduation_year: form.graduation_year,
        level: form.level,
      });
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      localStorage.setItem("user", JSON.stringify({ ...user, full_name: form.name, username: form.username }));
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
        style={{ width: "100%", maxWidth: 480, borderRadius: "20px 20px 0 0", padding: 24, maxHeight: "85vh", overflowY: "auto", backgroundColor: "var(--card)", display: "flex", flexDirection: "column", gap: 16 }}
        initial={{ y: 400 }}
        animate={{ y: 0 }}
        exit={{ y: 400 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-10 h-1 rounded-full bg-gray-300 mx-auto" />
        <div className="font-bold text-lg" style={{ color: "var(--text-primary)" }}>Edit Profile</div>

        {/* Section tabs */}
<div style={{ display: "flex", borderRadius: 12, overflow: "hidden", border: "1.5px solid var(--border)" }}>
  {["basic", "social", "password"].map((s) => (
    <button
      key={s}
      onClick={() => setActiveSection(s)}
      style={{
        flex: 1,
        padding: "10px 0",
        fontSize: 13,
        fontWeight: 600,
        border: "none",
        cursor: "pointer",
        fontFamily: "inherit",
        backgroundColor: activeSection === s ? "#007A3D" : "var(--bg)",
        color: activeSection === s ? "#fff" : "var(--text-secondary)",
        transition: "all 0.2s",
      }}
    >
      {s === "basic" ? "Basic" : s === "social" ? "Social" : "Password"}
    </button>
  ))}
</div>

        {/* Basic info */}
        {activeSection === "basic" && (
          <div className="flex flex-col gap-3">
            <div>
              <label className="text-xs font-semibold mb-1.5 block" style={{ color: "var(--text-secondary)" }}>Full Name</label>
              <input name="name" value={form.name} onChange={handleChange} placeholder="Your full name"
                style={{ width: "100%", padding: "12px 16px", borderRadius: 12, border: "1.5px solid var(--border)", background: "var(--bg)", color: "var(--text-primary)", fontSize: 14, outline: "none", fontFamily: "inherit" }}
              />
            </div>
            <div>
              <label className="text-xs font-semibold mb-1.5 block" style={{ color: "var(--text-secondary)" }}>Username</label>
              <input name="username" value={form.username} onChange={handleChange} placeholder="@username"
                style={{ width: "100%", padding: "12px 16px", borderRadius: 12, border: "1.5px solid var(--border)", background: "var(--bg)", color: "var(--text-primary)", fontSize: 14, outline: "none", fontFamily: "inherit" }}
              />
            </div>
            <div>
              <label className="text-xs font-semibold mb-1.5 block" style={{ color: "var(--text-secondary)" }}>Bio</label>
              <textarea name="bio" value={form.bio} onChange={handleChange} placeholder="Tell your coursemates about yourself..." rows={3}
                style={{ width: "100%", padding: "12px 16px", borderRadius: 12, border: "1.5px solid var(--border)", background: "var(--bg)", color: "var(--text-primary)", fontSize: 14, outline: "none", fontFamily: "inherit", resize: "none" }}
              />
            </div>
            <div>
              <label className="text-xs font-semibold mb-1.5 block" style={{ color: "var(--text-secondary)" }}>Phone Number</label>
              <input name="phone" value={form.phone} onChange={handleChange} placeholder="+234 000 000 0000"
                style={{ width: "100%", padding: "12px 16px", borderRadius: 12, border: "1.5px solid var(--border)", background: "var(--bg)", color: "var(--text-primary)", fontSize: 14, outline: "none", fontFamily: "inherit" }}
              />
            </div>
            <div>
              <label className="text-xs font-semibold mb-1.5 block" style={{ color: "var(--text-secondary)" }}>Level</label>
              <select name="level" value={form.level} onChange={handleChange}
                style={{ width: "100%", padding: "12px 16px", borderRadius: 12, border: "1.5px solid var(--border)", background: "var(--bg)", color: "var(--text-primary)", fontSize: 14, outline: "none", fontFamily: "inherit" }}
              >
                {["100L", "200L", "300L", "400L", "500L", "600L"].map((l) => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold mb-1.5 block" style={{ color: "var(--text-secondary)" }}>Graduation Year</label>
              <input name="graduation_year" type="number" value={form.graduation_year} onChange={handleChange} placeholder="e.g. 2028"
                style={{ width: "100%", padding: "12px 16px", borderRadius: 12, border: "1.5px solid var(--border)", background: "var(--bg)", color: "var(--text-primary)", fontSize: 14, outline: "none", fontFamily: "inherit" }}
              />
            </div>
          </div>
        )}

        {/* Social links */}
        {activeSection === "social" && (
          <div className="flex flex-col gap-3">
            <div>
              <label className="text-xs font-semibold mb-1.5 block" style={{ color: "var(--text-secondary)" }}>Twitter / X</label>
              <input name="twitter" value={form.twitter || ""} onChange={handleChange} placeholder="@yourtwitter"
                style={{ width: "100%", padding: "12px 16px", borderRadius: 12, border: "1.5px solid var(--border)", background: "var(--bg)", color: "var(--text-primary)", fontSize: 14, outline: "none", fontFamily: "inherit" }}
              />
            </div>
            <div>
              <label className="text-xs font-semibold mb-1.5 block" style={{ color: "var(--text-secondary)" }}>Instagram</label>
              <input name="instagram" value={form.instagram || ""} onChange={handleChange} placeholder="@yourinstagram"
                style={{ width: "100%", padding: "12px 16px", borderRadius: 12, border: "1.5px solid var(--border)", background: "var(--bg)", color: "var(--text-primary)", fontSize: 14, outline: "none", fontFamily: "inherit" }}
              />
            </div>
          </div>
        )}

        {/* Change password */}
        {activeSection === "password" && (
          <ChangePasswordSection onClose={onClose} />
        )}

        {activeSection !== "password" && (
          <div className="flex gap-3">
            <button
              onClick={onClose}
              style={{ flex: 1, padding: "12px", borderRadius: 12, border: "1.5px solid var(--border)", color: "var(--text-secondary)", backgroundColor: "var(--bg)", fontWeight: 600, fontSize: 14, cursor: "pointer", fontFamily: "inherit" }}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              style={{ flex: 1, padding: "12px", borderRadius: 12, border: "none", color: "#fff", background: "linear-gradient(135deg, #007A3D, #4c1d95)", fontWeight: 700, fontSize: 14, cursor: saving ? "not-allowed" : "pointer", fontFamily: "inherit" }}
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}

function ChangePasswordSection({ onClose }) {
  const [form, setForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSave = async () => {
    if (form.newPassword !== form.confirmPassword) { setError("New passwords don't match"); return; }
    if (form.newPassword.length < 6) { setError("Password must be at least 6 characters"); return; }
    setSaving(true);
    setError("");
    try {
      await API.put("/users/me/password", { currentPassword: form.currentPassword, newPassword: form.newPassword });
      setSuccess(true);
      setTimeout(onClose, 1500);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update password");
    } finally {
      setSaving(false);
    }
  };

  const inputStyle = { width: "100%", padding: "12px 16px", borderRadius: 12, border: "1.5px solid var(--border)", background: "var(--bg)", color: "var(--text-primary)", fontSize: 14, outline: "none", fontFamily: "inherit" };

  return (
    <div className="flex flex-col gap-3">
      {success ? (
        <div className="text-center py-8">
          <div className="text-4xl mb-3">✅</div>
          <div className="font-bold text-base" style={{ color: "var(--text-primary)" }}>Password updated!</div>
        </div>
      ) : (
        <>
          {error && (
            <div className="px-4 py-2.5 rounded-xl text-sm font-medium" style={{ backgroundColor: "#fef2f2", color: "#ef4444" }}>⚠️ {error}</div>
          )}
          <div>
            <label className="text-xs font-semibold mb-1.5 block" style={{ color: "var(--text-secondary)" }}>Current Password</label>
            <input name="currentPassword" type="password" value={form.currentPassword} onChange={handleChange} placeholder="••••••••" style={inputStyle} />
          </div>
          <div>
            <label className="text-xs font-semibold mb-1.5 block" style={{ color: "var(--text-secondary)" }}>New Password</label>
            <input name="newPassword" type="password" value={form.newPassword} onChange={handleChange} placeholder="••••••••" style={inputStyle} />
          </div>
          <div>
            <label className="text-xs font-semibold mb-1.5 block" style={{ color: "var(--text-secondary)" }}>Confirm New Password</label>
            <input name="confirmPassword" type="password" value={form.confirmPassword} onChange={handleChange} placeholder="••••••••" style={inputStyle} />
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            style={{ width: "100%", padding: "12px", borderRadius: 12, border: "none", color: "#fff", background: "linear-gradient(135deg, #007A3D, #4c1d95)", fontWeight: 700, fontSize: 14, cursor: saving ? "not-allowed" : "pointer", fontFamily: "inherit" }}
          >
            {saving ? "Updating..." : "Update Password"}
          </button>
        </>
      )}
    </div>
  );
}

function NotificationSettings({ onClose }) {
  const [settings, setSettings] = useState({
    likes: true, comments: true, friend_requests: true,
    group_messages: true, direct_messages: true, announcements: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    API.get("/users/me/notifications")
      .then((res) => setSettings(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const toggle = (key) => setSettings((prev) => ({ ...prev, [key]: !prev[key] }));

  const save = async () => {
    setSaving(true);
    try {
      await API.put("/users/me/notifications", settings);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const ITEMS = [
    { key: "likes", label: "Likes", icon: "❤️", desc: "When someone likes your post" },
    { key: "comments", label: "Comments", icon: "💬", desc: "When someone comments on your post" },
    { key: "friend_requests", label: "Friend Requests", icon: "👥", desc: "When someone sends you a friend request" },
    { key: "group_messages", label: "Group Messages", icon: "📢", desc: "New messages in your groups" },
    { key: "direct_messages", label: "Direct Messages", icon: "✉️", desc: "When someone DMs you" },
    { key: "announcements", label: "Announcements", icon: "📣", desc: "UNILAG announcements and news" },
  ];

  return (
    <div
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 40, display: "flex", alignItems: "flex-end", justifyContent: "center" }}
      onClick={onClose}
    >
      <motion.div
        style={{ width: "100%", maxWidth: 480, borderRadius: "20px 20px 0 0", padding: 24, maxHeight: "80vh", overflowY: "auto", backgroundColor: "var(--card)" }}
        initial={{ y: 400 }}
        animate={{ y: 0 }}
        exit={{ y: 400 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-10 h-1 rounded-full bg-gray-300 mx-auto mb-5" />
        <div className="font-bold text-lg mb-5" style={{ color: "var(--text-primary)" }}>Notification Settings</div>

        {loading ? (
          <div className="text-center py-8" style={{ color: "var(--text-secondary)" }}>Loading...</div>
        ) : (
          <div className="flex flex-col gap-3">
            {ITEMS.map((item) => (
              <div
                key={item.key}
                className="flex items-center gap-3 px-4 py-3.5 rounded-2xl border"
                style={{ backgroundColor: "var(--bg)", borderColor: "var(--border)" }}
              >
                <span className="text-xl">{item.icon}</span>
                <div className="flex-1">
                  <div className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>{item.label}</div>
                  <div className="text-xs" style={{ color: "var(--text-secondary)" }}>{item.desc}</div>
                </div>
                <button
                  onClick={() => toggle(item.key)}
                  style={{ width: 48, height: 24, borderRadius: 12, backgroundColor: settings[item.key] ? "#007A3D" : "#d1d5db", border: "none", cursor: "pointer", position: "relative" }}
                >
                  <div
                    style={{ position: "absolute", top: 4, width: 16, height: 16, borderRadius: "50%", backgroundColor: "#fff", transition: "left 0.3s", left: settings[item.key] ? "calc(100% - 20px)" : 4 }}
                  />
                </button>
              </div>
            ))}
          </div>
        )}

        <button
          onClick={save}
          disabled={saving}
          style={{ width: "100%", padding: "14px", borderRadius: 12, border: "none", color: "#fff", background: "linear-gradient(135deg, #007A3D, #4c1d95)", fontWeight: 700, fontSize: 14, cursor: saving ? "not-allowed" : "pointer", fontFamily: "inherit", marginTop: 20 }}
        >
          {saving ? "Saving..." : "Save Settings"}
        </button>
      </motion.div>
    </div>
  );
}

export default function Profile() {
  const { department, faculty } = useUser();
  const [editOpen, setEditOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("activity");
  const [myPosts, setMyPosts] = useState([]);
  const [activity, setActivity] = useState([]);
  const [friends, setFriends] = useState([]);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const avatarInputRef = useRef(null);
  const coverInputRef = useRef(null);

  const [profile, setProfile] = useState({
    name: "", username: "", bio: "", phone: "",
    twitter: "", instagram: "", graduation_year: "", level: "100L",
    avatar_url: null, cover_url: null,
    post_count: 0, friend_count: 0, group_count: 0,
  });

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [profileRes, postsRes, activityRes, friendsRes] = await Promise.all([
          API.get("/users/me"),
          API.get("/users/me/posts"),
          API.get("/users/me/activity"),
          API.get("/users/me/friends"),
        ]);
        const d = profileRes.data;
        setProfile({
          name: d.full_name || "",
          username: d.username || "",
          bio: d.bio || "",
          phone: d.phone || "",
          twitter: d.twitter || "",
          instagram: d.instagram || "",
          graduation_year: d.graduation_year || "",
          level: d.level || "100L",
          avatar_url: d.avatar_url || null,
          cover_url: d.cover_url || null,
          post_count: parseInt(d.post_count) || 0,
          friend_count: parseInt(d.friend_count) || 0,
          group_count: parseInt(d.group_count) || 0,
        });
        setMyPosts(postsRes.data);
        setActivity(activityRes.data);
        setFriends(friendsRes.data);
      } catch (err) {
        console.error("Profile fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingAvatar(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await API.post("/upload/avatar", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setProfile((prev) => ({ ...prev, avatar_url: res.data.url }));
    } catch (err) {
      console.error("Avatar upload error:", err);
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleCoverUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingCover(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await API.post("/upload/cover", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setProfile((prev) => ({ ...prev, cover_url: res.data.url }));
    } catch (err) {
      console.error("Cover upload error:", err);
    } finally {
      setUploadingCover(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-3xl mb-2">⏳</div>
          <div className="text-sm" style={{ color: "var(--text-secondary)" }}>Loading profile...</div>
        </div>
      </div>
    );
  }

  const initials = (profile.name || profile.username || "ME").slice(0, 2).toUpperCase();

  return (
    <div className="pb-28">

      {/* Cover photo */}
      <div
        className="h-32 w-full relative cursor-pointer"
        style={{
          background: profile.cover_url
            ? `url(${profile.cover_url}) center/cover`
            : "linear-gradient(135deg, #064e3b, #4c1d95)",
        }}
        onClick={() => coverInputRef.current?.click()}
      >
        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
          <span className="text-white text-xs font-semibold">
            {uploadingCover ? "Uploading..." : "📷 Change Cover"}
          </span>
        </div>
        <input ref={coverInputRef} type="file" accept="image/*" className="hidden" onChange={handleCoverUpload} />
      </div>

      {/* Avatar + name */}
      <div className="px-5 pb-4 border-b transition-colors duration-300" style={{ borderColor: "var(--border)" }}>
        <div className="flex items-end justify-between -mt-10 mb-3">
          <div className="relative cursor-pointer" onClick={() => avatarInputRef.current?.click()}>
            {profile.avatar_url ? (
              <img src={profile.avatar_url} alt="avatar" className="w-20 h-20 rounded-2xl object-cover border-4 shadow-lg" style={{ borderColor: "var(--bg)" }} />
            ) : (
              <div className="w-20 h-20 rounded-2xl bg-purple-600 flex items-center justify-center text-white text-2xl font-extrabold border-4 shadow-lg" style={{ borderColor: "var(--bg)" }}>
                {initials}
              </div>
            )}
            <div className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-emerald-600 flex items-center justify-center text-white text-xs border-2 border-white">
              {uploadingAvatar ? "⏳" : "📷"}
            </div>
            <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setNotifOpen(true)}
              className="px-3 py-2 rounded-xl border text-sm font-semibold shadow-sm"
              style={{ borderColor: "var(--border)", color: "var(--text-primary)", backgroundColor: "var(--card)" }}
            >🔔</button>
            <button
              onClick={() => setEditOpen(true)}
              className="px-4 py-2 rounded-xl border text-sm font-semibold shadow-sm"
              style={{ borderColor: "var(--border)", color: "var(--text-primary)", backgroundColor: "var(--card)" }}
            >Edit Profile</button>
          </div>
        </div>

        <div>
          <div className="font-extrabold text-lg" style={{ color: "var(--text-primary)" }}>
            {profile.name || profile.username || "Your Name"}
          </div>
          <div className="text-sm mt-0.5" style={{ color: "var(--text-secondary)" }}>@{profile.username}</div>
          {profile.bio && (
            <div className="text-sm mt-1.5 leading-relaxed" style={{ color: "var(--text-secondary)" }}>{profile.bio}</div>
          )}
          <div className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>
            {department} · {profile.level} · {faculty}
            {profile.graduation_year && ` · Class of ${profile.graduation_year}`}
          </div>
          {(profile.twitter || profile.instagram) && (
            <div className="flex gap-3 mt-2">
              {profile.twitter && (
                <a href={`https://twitter.com/${profile.twitter.replace("@", "")}`} target="_blank" rel="noreferrer" className="text-xs font-semibold text-blue-400">
                  🐦 {profile.twitter}
                </a>
              )}
              {profile.instagram && (
                <a href={`https://instagram.com/${profile.instagram.replace("@", "")}`} target="_blank" rel="noreferrer" className="text-xs font-semibold text-pink-400">
                  📸 {profile.instagram}
                </a>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 divide-x border-b" style={{ borderColor: "var(--border)", backgroundColor: "var(--card)" }}>
        {[
          { label: "Posts", value: profile.post_count },
          { label: "Friends", value: profile.friend_count },
          { label: "Groups", value: profile.group_count },
        ].map((stat) => (
          <div key={stat.label} className="py-4 flex flex-col items-center gap-0.5">
            <div className="font-extrabold text-xl" style={{ color: "var(--text-primary)" }}>{stat.value}</div>
            <div className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Verified badge */}
      <div className="px-5 py-4 border-b" style={{ borderColor: "var(--border)" }}>
        <div className="rounded-2xl px-4 py-3.5 flex items-center gap-3" style={{ background: "linear-gradient(135deg, #064e3b, #4c1d95)" }}>
          <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-lg">🎓</div>
          <div>
            <div className="text-sm font-bold text-white">UNILAG Verified Student</div>
            <div className="text-xs text-white/60">Admission letter approved</div>
          </div>
          <div className="ml-auto text-xs bg-white/10 text-white/80 px-2 py-1 rounded-full font-medium">✓ Verified</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b" style={{ borderColor: "var(--border)", backgroundColor: "var(--card)" }}>
        {[
          { id: "activity", label: "Activity" },
          { id: "posts", label: `Posts (${profile.post_count})` },
          { id: "friends", label: `Friends (${profile.friend_count})` },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            style={{
              flex: 1, padding: "10px", fontSize: 13, fontWeight: 600,
              border: "none", cursor: "pointer", fontFamily: "inherit",
              backgroundColor: "transparent",
              color: activeTab === t.id ? "#007A3D" : "var(--text-secondary)",
              borderBottom: activeTab === t.id ? "2px solid #007A3D" : "2px solid transparent",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="px-5 py-4">
        {activeTab === "activity" && (
          <div className="flex flex-col gap-3">
            {activity.length === 0 ? (
              <div className="text-center py-8" style={{ color: "var(--text-secondary)" }}>
                <div className="text-3xl mb-2">📭</div>
                <div className="text-sm">No activity yet</div>
              </div>
            ) : (
              activity.map((item) => (
                <div key={item.id} className="rounded-2xl px-4 py-3.5 border flex items-center gap-3 shadow-sm" style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg border" style={{ backgroundColor: "var(--bg)", borderColor: "var(--border)" }}>
                    {item.type === "like" ? "❤️" : item.type === "comment" ? "💬" : item.type === "join" ? "👥" : "✅"}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{item.description}</div>
                    <div className="text-xs mt-0.5" style={{ color: "var(--text-secondary)" }}>{timeAgo(item.created_at)}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === "posts" && (
          <div className="flex flex-col gap-3">
            {myPosts.length === 0 ? (
              <div className="text-center py-8" style={{ color: "var(--text-secondary)" }}>
                <div className="text-3xl mb-2">📭</div>
                <div className="text-sm">No posts yet</div>
              </div>
            ) : (
              myPosts.map((post) => (
                <div key={post.id} className="rounded-2xl p-4 border shadow-sm" style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}>
                  <p className="text-sm leading-relaxed mb-2" style={{ color: "var(--text-primary)" }}>{post.content}</p>
                  <div className="flex gap-4 text-xs" style={{ color: "var(--text-secondary)" }}>
                    <span>❤️ {post.like_count}</span>
                    <span>💬 {post.comment_count}</span>
                    <span>{timeAgo(post.created_at)}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === "friends" && (
          <div className="flex flex-col gap-3">
            {friends.length === 0 ? (
              <div className="text-center py-8" style={{ color: "var(--text-secondary)" }}>
                <div className="text-3xl mb-2">👥</div>
                <div className="text-sm">No friends yet — connect with coursemates!</div>
              </div>
            ) : (
              friends.map((f) => (
                <div key={f.id} className="rounded-2xl px-4 py-3.5 border flex items-center gap-3" style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}>
                  {f.avatar_url ? (
                    <img src={f.avatar_url} alt="avatar" className="w-10 h-10 rounded-xl object-cover" />
                  ) : (
                    <Avatar initials={(f.full_name || f.username || "U").slice(0, 2).toUpperCase()} color={f.avatar_color || "#7c3aed"} size={40} />
                  )}
                  <div className="flex-1">
                    <div className="font-bold text-sm" style={{ color: "var(--text-primary)" }}>{f.full_name || f.username}</div>
                    <div className="text-xs" style={{ color: "var(--text-secondary)" }}>@{f.username} · {f.department}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Sign out */}
      <div className="px-5 mt-2">
        <button
          onClick={() => { localStorage.clear(); window.location.reload(); }}
          onMouseEnter={(e) => { e.target.style.backgroundColor = "#fee2e2"; }}
          onMouseLeave={(e) => { e.target.style.backgroundColor = "#fef2f2"; }}
          style={{ width: "100%", padding: "14px", borderRadius: 16, border: "1px solid #fee2e2", backgroundColor: "#fef2f2", color: "#ef4444", fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "inherit" }}
        >
          Sign Out
        </button>
      </div>

      {/* Edit Profile Sheet */}
      <AnimatePresence>
        {editOpen && (
          <EditProfileSheet
            profile={profile}
            onClose={() => setEditOpen(false)}
            onSave={(updated) => setProfile((prev) => ({ ...prev, ...updated }))}
          />
        )}
      </AnimatePresence>

      {/* Notification Settings */}
      <AnimatePresence>
        {notifOpen && (
          <NotificationSettings onClose={() => setNotifOpen(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}