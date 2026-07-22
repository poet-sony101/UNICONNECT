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

const INDUSTRIES = ["Tech", "Finance", "Healthcare", "Education", "Engineering", "Law", "Media", "Government", "NGO", "Other"];

function RegisterAlumniSheet({ onClose, onRegistered }) {
  const [form, setForm] = useState({ graduation_year: "", current_company: "", job_title: "", industry: "Tech", linkedin: "", willing_to_mentor: false, bio: "" });
  const [loading, setLoading] = useState(false);

  const inputStyle = { width: "100%", padding: "12px 16px", borderRadius: 12, border: "1.5px solid var(--border)", background: "var(--bg)", color: "var(--text-primary)", fontSize: 14, outline: "none", fontFamily: "inherit" };
  const labelStyle = { fontSize: 11, fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: 6 };

  const submit = async () => {
    if (!form.current_company || !form.job_title) return;
    setLoading(true);
    try {
      const res = await API.post("/alumni", form);
      onRegistered(res.data);
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
        <div style={{ fontSize: 18, fontWeight: 700, color: "var(--text-primary)" }}>🎓 Join Alumni Network</div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <div><label style={labelStyle}>Graduation Year</label><input type="number" value={form.graduation_year} onChange={(e) => setForm((p) => ({ ...p, graduation_year: e.target.value }))} placeholder="2022" style={inputStyle} /></div>
          <div>
            <label style={labelStyle}>Industry</label>
            <select value={form.industry} onChange={(e) => setForm((p) => ({ ...p, industry: e.target.value }))} style={inputStyle}>
              {INDUSTRIES.map((i) => <option key={i}>{i}</option>)}
            </select>
          </div>
        </div>
        <div><label style={labelStyle}>Current Company *</label><input value={form.current_company} onChange={(e) => setForm((p) => ({ ...p, current_company: e.target.value }))} placeholder="e.g. Google, Andela" style={inputStyle} /></div>
        <div><label style={labelStyle}>Job Title *</label><input value={form.job_title} onChange={(e) => setForm((p) => ({ ...p, job_title: e.target.value }))} placeholder="e.g. Software Engineer" style={inputStyle} /></div>
        <div><label style={labelStyle}>LinkedIn</label><input value={form.linkedin} onChange={(e) => setForm((p) => ({ ...p, linkedin: e.target.value }))} placeholder="linkedin.com/in/yourname" style={inputStyle} /></div>
        <div><label style={labelStyle}>Bio</label><textarea value={form.bio} onChange={(e) => setForm((p) => ({ ...p, bio: e.target.value }))} placeholder="Share your UNILAG journey and what you're up to now..." rows={3} style={{ ...inputStyle, resize: "none" }} /></div>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button
            onClick={() => setForm((p) => ({ ...p, willing_to_mentor: !p.willing_to_mentor }))}
            style={{ width: 48, height: 24, borderRadius: 12, backgroundColor: form.willing_to_mentor ? "#007A3D" : "#d1d5db", border: "none", cursor: "pointer", position: "relative" }}
          >
            <div style={{ position: "absolute", top: 4, width: 16, height: 16, borderRadius: "50%", backgroundColor: "#fff", transition: "left 0.3s", left: form.willing_to_mentor ? "calc(100% - 20px)" : 4 }} />
          </button>
          <span style={{ fontSize: 13, color: "var(--text-primary)" }}>I'm willing to mentor students</span>
        </div>

        <button
          onClick={submit}
          disabled={loading || !form.current_company || !form.job_title}
          style={{ width: "100%", padding: 14, borderRadius: 12, border: "none", color: "#fff", fontWeight: 700, fontSize: 14, fontFamily: "inherit", cursor: loading ? "not-allowed" : "pointer", background: loading ? "#2d3139" : "linear-gradient(135deg, #007A3D, #4c1d95)" }}
        >
          {loading ? "Registering..." : "Join Alumni Network"}
        </button>
      </motion.div>
    </div>
  );
}

function MentorRequestSheet({ alumni, onClose }) {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const submit = async () => {
    if (!message.trim()) return;
    setLoading(true);
    try {
      await API.post(`/alumni/${alumni.user_id}/mentor-request`, { message });
      setSent(true);
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
        {sent ? (
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🎉</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: "var(--text-primary)", marginBottom: 8 }}>Request Sent!</div>
            <div style={{ fontSize: 14, color: "var(--text-secondary)" }}>
              {alumni.full_name || alumni.username} will review your mentorship request.
            </div>
            <button onClick={onClose} style={{ marginTop: 20, padding: "10px 24px", borderRadius: 20, background: "#007A3D", color: "#fff", border: "none", cursor: "pointer", fontWeight: 600 }}>
              Done
            </button>
          </div>
        ) : (
          <>
            <div style={{ fontSize: 18, fontWeight: 700, color: "var(--text-primary)" }}>
              Request Mentorship from {alumni.full_name || alumni.username}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, padding: 12, borderRadius: 12, backgroundColor: "var(--bg)" }}>
              <Avatar initials={(alumni.full_name || alumni.username || "U").slice(0, 2).toUpperCase()} color={alumni.avatar_color || "#007A3D"} size={40} />
              <div>
                <div style={{ fontWeight: 700, fontSize: 14, color: "var(--text-primary)" }}>{alumni.full_name || alumni.username}</div>
                <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>{alumni.job_title} at {alumni.current_company}</div>
              </div>
            </div>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Introduce yourself and tell them what kind of mentorship you're looking for..."
              rows={5}
              style={{ width: "100%", padding: "12px 16px", borderRadius: 12, border: "1.5px solid var(--border)", background: "var(--bg)", color: "var(--text-primary)", fontSize: 14, outline: "none", fontFamily: "inherit", resize: "none" }}
            />
            <button
              onClick={submit}
              disabled={loading || !message.trim()}
              style={{ width: "100%", padding: 14, borderRadius: 12, border: "none", color: "#fff", fontWeight: 700, fontSize: 14, fontFamily: "inherit", cursor: loading ? "not-allowed" : "pointer", background: loading ? "#2d3139" : "linear-gradient(135deg, #007A3D, #4c1d95)" }}
            >
              {loading ? "Sending..." : "Send Request"}
            </button>
          </>
        )}
      </motion.div>
    </div>
  );
}

export default function Alumni() {
  const [alumni, setAlumni] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showRegister, setShowRegister] = useState(false);
  const [selectedMentor, setSelectedMentor] = useState(null);
  const [activeFilter, setActiveFilter] = useState("All");
  const [mentorOnly, setMentorOnly] = useState(false);

  useEffect(() => {
    API.get("/alumni")
      .then((res) => setAlumni(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = alumni
    .filter((a) => activeFilter === "All" || a.industry === activeFilter)
    .filter((a) => !mentorOnly || a.willing_to_mentor);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-3xl mb-2">⏳</div>
          <div className="text-sm" style={{ color: "var(--text-secondary)" }}>Loading alumni...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-4">
      <style>{styles}</style>

      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="font-extrabold text-xl" style={{ color: "var(--text-primary)" }}>Alumni Network 🎓</div>
          <div className="text-sm" style={{ color: "var(--text-secondary)" }}>Connect with UNILAG graduates</div>
        </div>
        <button
          onClick={() => setShowRegister(true)}
          style={{ padding: "8px 16px", borderRadius: 20, background: "linear-gradient(135deg, #007A3D, #4c1d95)", color: "#fff", fontWeight: 700, fontSize: 13, border: "none", cursor: "pointer" }}
        >
          + Join
        </button>
      </div>

      {/* Mentor filter toggle */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
        <button
          onClick={() => setMentorOnly(!mentorOnly)}
          style={{ width: 40, height: 22, borderRadius: 11, backgroundColor: mentorOnly ? "#007A3D" : "#d1d5db", border: "none", cursor: "pointer", position: "relative" }}
        >
          <div style={{ position: "absolute", top: 3, width: 16, height: 16, borderRadius: "50%", backgroundColor: "#fff", transition: "left 0.3s", left: mentorOnly ? "calc(100% - 19px)" : 3 }} />
        </button>
        <span style={{ fontSize: 13, color: "var(--text-primary)" }}>Mentors only</span>
      </div>

      {/* Industry filter */}
      <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 8, marginBottom: 16 }}>
        {["All", ...INDUSTRIES].map((i) => (
          <button
            key={i}
            onClick={() => setActiveFilter(i)}
            style={{
              flexShrink: 0, padding: "6px 12px", borderRadius: 20, fontSize: 11, fontWeight: 600,
              border: "1.5px solid", cursor: "pointer", fontFamily: "inherit",
              backgroundColor: activeFilter === i ? "#007A3D" : "var(--bg)",
              color: activeFilter === i ? "#fff" : "var(--text-secondary)",
              borderColor: activeFilter === i ? "#007A3D" : "var(--border)",
            }}
          >
            {i}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16" style={{ color: "var(--text-secondary)" }}>
          <div className="text-4xl mb-3">🎓</div>
          <div className="font-bold text-base mb-1" style={{ color: "var(--text-primary)" }}>No alumni yet</div>
          <div className="text-sm">Be the first to join the network!</div>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((a, index) => (
            <motion.div
              key={a.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="rounded-2xl border shadow-sm p-4"
              style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}
            >
              <div style={{ display: "flex", gap: 12, alignItems: "flex-start", marginBottom: 12 }}>
                {a.avatar_url ? (
                  <img src={a.avatar_url} alt="avatar" style={{ width: 48, height: 48, borderRadius: "50%", objectFit: "cover" }} />
                ) : (
                  <Avatar initials={(a.full_name || a.username || "U").slice(0, 2).toUpperCase()} color={a.avatar_color || "#007A3D"} size={48} />
                )}
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 15, color: "var(--text-primary)" }}>{a.full_name || a.username}</div>
                  <div style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 2 }}>{a.job_title} at {a.current_company}</div>
                  <div style={{ display: "flex", gap: 6, marginTop: 6, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 20, backgroundColor: "#ecfdf5", color: "#047857", fontWeight: 600 }}>{a.industry}</span>
                    {a.graduation_year && <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 20, backgroundColor: "var(--bg)", color: "var(--text-secondary)" }}>Class of {a.graduation_year}</span>}
                    {a.willing_to_mentor && <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 20, backgroundColor: "#eff6ff", color: "#1d4ed8", fontWeight: 600 }}>🤝 Mentor</span>}
                  </div>
                </div>
              </div>

              {a.bio && (
                <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.5, marginBottom: 12 }}>
                  {a.bio.slice(0, 120)}{a.bio.length > 120 ? "..." : ""}
                </p>
              )}

              <div style={{ display: "flex", gap: 8, paddingTop: 12, borderTop: "1px solid var(--border)" }}>
                {a.linkedin && (
                  <button
                    onClick={() => window.open(`https://${a.linkedin.replace("https://", "")}`, "_blank")}
                    style={{ flex: 1, padding: "8px", borderRadius: 10, border: "1.5px solid var(--border)", backgroundColor: "var(--bg)", color: "var(--text-secondary)", fontWeight: 600, fontSize: 12, cursor: "pointer" }}
                  >
                    LinkedIn →
                  </button>
                )}
                {a.willing_to_mentor && (
                  <button
                    onClick={() => setSelectedMentor(a)}
                    style={{ flex: 1, padding: "8px", borderRadius: 10, border: "none", background: "linear-gradient(135deg, #007A3D, #4c1d95)", color: "#fff", fontWeight: 600, fontSize: 12, cursor: "pointer" }}
                  >
                    Request Mentorship
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {showRegister && (
          <RegisterAlumniSheet
            onClose={() => setShowRegister(false)}
            onRegistered={(a) => setAlumni((prev) => [a, ...prev])}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedMentor && (
          <MentorRequestSheet
            alumni={selectedMentor}
            onClose={() => setSelectedMentor(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}