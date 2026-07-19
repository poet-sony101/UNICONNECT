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

const JOB_TYPES = ["Internship", "Part-time", "Full-time", "Remote", "Volunteer", "Graduate Trainee"];

function timeAgo(dateStr) {
  const now = new Date();
  const date = new Date(dateStr);
  const diff = Math.floor((now - date) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function PostJobSheet({ onClose, onPosted }) {
  const [form, setForm] = useState({ title: "", company: "", description: "", requirements: "", type: "Internship", location: "", deadline: "", apply_link: "", is_remote: false });
  const [loading, setLoading] = useState(false);

  const inputStyle = { width: "100%", padding: "12px 16px", borderRadius: 12, border: "1.5px solid var(--border)", background: "var(--bg)", color: "var(--text-primary)", fontSize: 14, outline: "none", fontFamily: "inherit" };
  const labelStyle = { fontSize: 11, fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: 6 };

  const submit = async () => {
    if (!form.title || !form.company) return;
    setLoading(true);
    try {
      const res = await API.post("/jobs", form);
      onPosted(res.data);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="overlay" onClick={onClose}>
      <motion.div
        className="sheet"
        style={{ backgroundColor: "var(--card)" }}
        initial={{ y: 400 }} animate={{ y: 0 }} exit={{ y: 400 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-10 h-1 rounded-full bg-gray-300 mx-auto" />
        <div style={{ fontSize: 18, fontWeight: 700, color: "var(--text-primary)" }}>💼 Post a Job</div>

        <div><label style={labelStyle}>Job Title *</label><input value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} placeholder="e.g. Frontend Developer Intern" style={inputStyle} /></div>
        <div><label style={labelStyle}>Company *</label><input value={form.company} onChange={(e) => setForm((p) => ({ ...p, company: e.target.value }))} placeholder="e.g. Flutterwave" style={inputStyle} /></div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <div>
            <label style={labelStyle}>Type</label>
            <select value={form.type} onChange={(e) => setForm((p) => ({ ...p, type: e.target.value }))} style={inputStyle}>
              {JOB_TYPES.map((t) => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div><label style={labelStyle}>Location</label><input value={form.location} onChange={(e) => setForm((p) => ({ ...p, location: e.target.value }))} placeholder="Lagos" style={inputStyle} /></div>
        </div>
        <div><label style={labelStyle}>Description</label><textarea value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} placeholder="What will the role involve?" rows={3} style={{ ...inputStyle, resize: "none" }} /></div>
        <div><label style={labelStyle}>Requirements</label><textarea value={form.requirements} onChange={(e) => setForm((p) => ({ ...p, requirements: e.target.value }))} placeholder="What skills are needed?" rows={3} style={{ ...inputStyle, resize: "none" }} /></div>
        <div><label style={labelStyle}>Apply Link</label><input value={form.apply_link} onChange={(e) => setForm((p) => ({ ...p, apply_link: e.target.value }))} placeholder="https://..." style={inputStyle} /></div>
        <div><label style={labelStyle}>Deadline</label><input type="datetime-local" value={form.deadline} onChange={(e) => setForm((p) => ({ ...p, deadline: e.target.value }))} style={inputStyle} /></div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button
            onClick={() => setForm((p) => ({ ...p, is_remote: !p.is_remote }))}
            style={{ width: 48, height: 24, borderRadius: 12, backgroundColor: form.is_remote ? "#007A3D" : "#d1d5db", border: "none", cursor: "pointer", position: "relative" }}
          >
            <div style={{ position: "absolute", top: 4, width: 16, height: 16, borderRadius: "50%", backgroundColor: "#fff", transition: "left 0.3s", left: form.is_remote ? "calc(100% - 20px)" : 4 }} />
          </button>
          <span style={{ fontSize: 13, color: "var(--text-primary)" }}>Remote position</span>
        </div>

        <button
          onClick={submit}
          disabled={loading || !form.title || !form.company}
          style={{ width: "100%", padding: 14, borderRadius: 12, border: "none", color: "#fff", fontWeight: 700, fontSize: 14, fontFamily: "inherit", cursor: loading ? "not-allowed" : "pointer", background: loading ? "#2d3139" : "linear-gradient(135deg, #007A3D, #4c1d95)" }}
        >
          {loading ? "Posting..." : "Post Job"}
        </button>
      </motion.div>
    </div>
  );
}

const TYPE_COLORS = {
  Internship: "#1d4ed8",
  "Part-time": "#7c3aed",
  "Full-time": "#007A3D",
  Remote: "#0891b2",
  Volunteer: "#d97706",
  "Graduate Trainee": "#dc2626",
};

export default function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPost, setShowPost] = useState(false);
  const [activeFilter, setActiveFilter] = useState("All");

  useEffect(() => {
    API.get("/jobs")
      .then((res) => setJobs(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = activeFilter === "All" ? jobs : jobs.filter((j) => j.type === activeFilter);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-3xl mb-2">⏳</div>
          <div className="text-sm" style={{ color: "var(--text-secondary)" }}>Loading jobs...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-4">
      <style>{styles}</style>

      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="font-extrabold text-xl" style={{ color: "var(--text-primary)" }}>Jobs & Internships 💼</div>
          <div className="text-sm" style={{ color: "var(--text-secondary)" }}>Opportunities for UNILAG students</div>
        </div>
        <button
          onClick={() => setShowPost(true)}
          style={{ padding: "8px 16px", borderRadius: 20, background: "linear-gradient(135deg, #007A3D, #4c1d95)", color: "#fff", fontWeight: 700, fontSize: 13, border: "none", cursor: "pointer" }}
        >
          + Post
        </button>
      </div>

      {/* Filter tabs */}
      <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 8, marginBottom: 16 }}>
        {["All", ...JOB_TYPES].map((t) => (
          <button
            key={t}
            onClick={() => setActiveFilter(t)}
            style={{
              flexShrink: 0, padding: "6px 12px", borderRadius: 20, fontSize: 11, fontWeight: 600,
              border: "1.5px solid", cursor: "pointer", fontFamily: "inherit",
              backgroundColor: activeFilter === t ? "#007A3D" : "var(--bg)",
              color: activeFilter === t ? "#fff" : "var(--text-secondary)",
              borderColor: activeFilter === t ? "#007A3D" : "var(--border)",
            }}
          >
            {t}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16" style={{ color: "var(--text-secondary)" }}>
          <div className="text-4xl mb-3">💼</div>
          <div className="font-bold text-base mb-1" style={{ color: "var(--text-primary)" }}>No jobs yet</div>
          <div className="text-sm">Post an opportunity for fellow students!</div>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {filtered.map((job, index) => (
            <motion.div
              key={job.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="rounded-2xl border shadow-sm overflow-hidden"
              style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}
            >
              <div style={{ height: 4, backgroundColor: TYPE_COLORS[job.type] || "#007A3D" }} />
              <div style={{ padding: 16 }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 8 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 15, color: "var(--text-primary)" }}>{job.title}</div>
                    <div style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 2 }}>{job.company}</div>
                  </div>
                  <span style={{ fontSize: 11, padding: "3px 10px", borderRadius: 20, fontWeight: 600, backgroundColor: (TYPE_COLORS[job.type] || "#007A3D") + "22", color: TYPE_COLORS[job.type] || "#007A3D" }}>
                    {job.type}
                  </span>
                </div>

                {job.description && (
                  <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.5, marginBottom: 12 }}>
                    {job.description.slice(0, 120)}{job.description.length > 120 ? "..." : ""}
                  </p>
                )}

                <div style={{ display: "flex", gap: 12, marginBottom: 12, flexWrap: "wrap" }}>
                  {job.location && <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>📍 {job.location}</span>}
                  {job.is_remote && <span style={{ fontSize: 12, color: "#0891b2" }}>🌐 Remote</span>}
                  {job.deadline && <span style={{ fontSize: 12, color: "#d97706" }}>⏰ {new Date(job.deadline).toLocaleDateString()}</span>}
                </div>

                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 12, borderTop: "1px solid var(--border)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <Avatar initials={(job.full_name || job.username || "U").slice(0, 2).toUpperCase()} color={job.avatar_color || "#007A3D"} size={22} />
                    <span style={{ fontSize: 11, color: "var(--text-secondary)" }}>{timeAgo(job.created_at)}</span>
                  </div>
                  {job.apply_link && (
                    <button
                      onClick={() => window.open(job.apply_link, "_blank")}
                      style={{ padding: "6px 16px", borderRadius: 20, background: "linear-gradient(135deg, #007A3D, #4c1d95)", color: "#fff", fontWeight: 600, fontSize: 12, border: "none", cursor: "pointer" }}
                    >
                      Apply →
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {showPost && (
          <PostJobSheet
            onClose={() => setShowPost(false)}
            onPosted={(j) => setJobs((prev) => [j, ...prev])}
          />
        )}
      </AnimatePresence>
    </div>
  );
}