import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Avatar from "../components/layout/Avatar";
import API from "../utils/api";

const styles = `
  .overlay {
    position: fixed; inset: 0; background: rgba(0,0,0,0.5);
    z-index: 40; display: flex; align-items: flex-end; justify-content: center;
  }
  .sheet {
    width: 100%; max-width: 480px; border-radius: 20px 20px 0 0;
    padding: 24px 20px; max-height: 85vh; overflow-y: auto;
    display: flex; flex-direction: column; gap: 14px;
  }
`;

const EVENT_TAGS = ["General", "Academic", "Social", "Sports", "Career", "Cultural"];

function CreateEventSheet({ onClose, onCreated }) {
  const [form, setForm] = useState({ title: "", description: "", location: "", event_date: "", tag: "General" });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const submit = async () => {
    if (!form.title || !form.event_date) return;
    setLoading(true);
    try {
      const res = await API.post("/events", form);
      onCreated(res.data);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = { width: "100%", padding: "12px 16px", borderRadius: 12, border: "1.5px solid var(--border)", background: "var(--bg)", color: "var(--text-primary)", fontSize: 14, outline: "none", fontFamily: "inherit" };
  const labelStyle = { fontSize: 11, fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: 6 };

  return (
    <div className="overlay" onClick={onClose}>
      <motion.div
        className="sheet"
        style={{ backgroundColor: "var(--card)" }}
        initial={{ y: 400 }}
        animate={{ y: 0 }}
        exit={{ y: 400 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-10 h-1 rounded-full bg-gray-300 mx-auto" />
        <div style={{ fontSize: 18, fontWeight: 700, color: "var(--text-primary)" }}>Create Event</div>

        <div>
          <label style={labelStyle}>Event Title *</label>
          <input name="title" value={form.title} onChange={handleChange} placeholder="e.g. GST101 Lecture" style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>Description</label>
          <textarea name="description" value={form.description} onChange={handleChange} placeholder="What's this event about?" rows={3} style={{ ...inputStyle, resize: "none" }} />
        </div>
        <div>
          <label style={labelStyle}>Location</label>
          <input name="location" value={form.location} onChange={handleChange} placeholder="e.g. Faculty of Science LT1" style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>Date & Time *</label>
          <input name="event_date" type="datetime-local" value={form.event_date} onChange={handleChange} style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>Tag</label>
          <div className="flex gap-2 flex-wrap">
            {EVENT_TAGS.map((t) => (
              <button
                key={t}
                onClick={() => setForm((prev) => ({ ...prev, tag: t }))}
                style={{
                  padding: "6px 12px", borderRadius: 20, fontSize: 12, fontWeight: 600,
                  border: "1.5px solid", cursor: "pointer", fontFamily: "inherit",
                  backgroundColor: form.tag === t ? "#007A3D" : "var(--bg)",
                  color: form.tag === t ? "#fff" : "var(--text-secondary)",
                  borderColor: form.tag === t ? "#007A3D" : "var(--border)",
                }}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={submit}
          disabled={loading || !form.title || !form.event_date}
          style={{
            width: "100%", padding: 14, borderRadius: 12, border: "none",
            color: "#fff", fontWeight: 700, fontSize: 14, cursor: loading ? "not-allowed" : "pointer",
            fontFamily: "inherit",
            background: loading ? "#2d3139" : "linear-gradient(135deg, #007A3D, #4c1d95)",
          }}
        >
          {loading ? "Creating..." : "Create Event"}
        </button>
      </motion.div>
    </div>
  );
}

function timeAgo(dateStr) {
  const now = new Date();
  const date = new Date(dateStr);
  const diff = Math.floor((now - date) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function formatEventDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-NG", { weekday: "short", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

export default function Events() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => {
    API.get("/events")
      .then((res) => setEvents(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const TAG_COLORS = {
    General: "#6b7280", Academic: "#1d4ed8", Social: "#7c3aed",
    Sports: "#dc2626", Career: "#047857", Cultural: "#d97706",
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-3xl mb-2">⏳</div>
          <div className="text-sm" style={{ color: "var(--text-secondary)" }}>Loading events...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-4">
      <style>{styles}</style>

      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="font-extrabold text-xl" style={{ color: "var(--text-primary)" }}>Events</div>
          <div className="text-sm" style={{ color: "var(--text-secondary)" }}>Campus events and activities</div>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          style={{ padding: "8px 16px", borderRadius: 20, background: "linear-gradient(135deg, #007A3D, #4c1d95)", color: "#fff", fontWeight: 700, fontSize: 13, border: "none", cursor: "pointer" }}
        >
          + Create
        </button>
      </div>

      {events.length === 0 ? (
        <div className="text-center py-16" style={{ color: "var(--text-secondary)" }}>
          <div className="text-4xl mb-3">📅</div>
          <div className="font-bold text-base mb-1" style={{ color: "var(--text-primary)" }}>No events yet</div>
          <div className="text-sm">Be the first to create an event!</div>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {events.map((event, index) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="rounded-2xl border overflow-hidden shadow-sm"
              style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}
            >
              {/* Color bar */}
              <div style={{ height: 4, backgroundColor: TAG_COLORS[event.tag] || "#6b7280" }} />

              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="font-bold text-base" style={{ color: "var(--text-primary)" }}>{event.title}</div>
                    <div className="text-xs mt-0.5 font-semibold" style={{ color: TAG_COLORS[event.tag] || "#6b7280" }}>
                      {event.tag}
                    </div>
                  </div>
                </div>

                {event.description && (
                  <p className="text-sm leading-relaxed mb-3" style={{ color: "var(--text-secondary)" }}>{event.description}</p>
                )}

                <div className="flex flex-col gap-1.5 mb-3">
                  <div className="flex items-center gap-2 text-xs" style={{ color: "var(--text-secondary)" }}>
                    <span>📅</span> {formatEventDate(event.event_date)}
                  </div>
                  {event.location && (
                    <div className="flex items-center gap-2 text-xs" style={{ color: "var(--text-secondary)" }}>
                      <span>📍</span> {event.location}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 pt-3 border-t" style={{ borderColor: "var(--border)" }}>
                  <Avatar
                    initials={(event.full_name || event.username || "U").slice(0, 2).toUpperCase()}
                    color={event.avatar_color || "#007A3D"}
                    size={24}
                  />
                  <div className="text-xs" style={{ color: "var(--text-secondary)" }}>
                    Posted by {event.full_name || event.username} · {timeAgo(event.created_at)}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {showCreate && (
          <CreateEventSheet
            onClose={() => setShowCreate(false)}
            onCreated={(event) => setEvents((prev) => [event, ...prev])}
          />
        )}
      </AnimatePresence>
    </div>
  );
}