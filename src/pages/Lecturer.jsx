import { useState, useEffect } from "react";
import API from "../utils/api";

const inputStyle = { width: "100%", padding: "12px 16px", borderRadius: 12, border: "1.5px solid var(--border)", background: "var(--bg)", color: "var(--text-primary)", fontSize: 14, outline: "none", fontFamily: "inherit" };
const labelStyle = { fontSize: 11, fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: 6 };
const btnStyle = (disabled) => ({ width: "100%", padding: 14, borderRadius: 12, border: "none", color: "#fff", fontWeight: 700, fontSize: 14, fontFamily: "inherit", cursor: disabled ? "not-allowed" : "pointer", background: disabled ? "#2d3139" : "linear-gradient(135deg, #007A3D, #4c1d95)" });

export default function Lecturer() {
  const [lecturer, setLecturer] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apply, setApply] = useState({ staff_id: "", courses: "" });
  const [post, setPost] = useState({ title: "", content: "" });
  const [saving, setSaving] = useState(false);
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    Promise.all([API.get("/lecturers/me"), API.get("/lecturers/announcements")])
      .then(([me, ann]) => {
        setLecturer(me.data);
        setAnnouncements(ann.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const submitApplication = async () => {
    if (!apply.staff_id.trim()) return;
    setSaving(true);
    try {
      const res = await API.post("/lecturers/apply", apply);
      setLecturer(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const submitAnnouncement = async () => {
    if (!post.title.trim() || !post.content.trim()) return;
    setSaving(true);
    try {
      const res = await API.post("/lecturers/announcements", post);
      setAnnouncements((prev) => [{ ...res.data, full_name: user.full_name, username: user.username }, ...prev]);
      setPost({ title: "", content: "" });
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    try {
      await API.delete(`/lecturers/announcements/${id}`);
      setAnnouncements((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return <div className="text-center py-16 text-sm" style={{ color: "var(--text-secondary)" }}>⏳ Loading...</div>;
  }

  return (
    <div className="px-4 py-4">
      <div className="font-extrabold text-xl mb-1" style={{ color: "var(--text-primary)" }}>Lecturers 👨‍🏫</div>
      <div className="text-sm mb-4" style={{ color: "var(--text-secondary)" }}>Official department announcements</div>

      {/* Application / status */}
      {!lecturer && (
        <div className="rounded-2xl border p-4 mb-5" style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}>
          <div className="font-bold text-sm mb-1" style={{ color: "var(--text-primary)" }}>Are you a lecturer?</div>
          <div className="text-xs mb-3" style={{ color: "var(--text-secondary)" }}>
            Apply for a verified badge. You need to have joined a department first. Applications are reviewed manually.
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div><label style={labelStyle}>Staff ID *</label><input value={apply.staff_id} onChange={(e) => setApply((p) => ({ ...p, staff_id: e.target.value }))} placeholder="Your UNILAG staff ID" style={inputStyle} /></div>
            <div><label style={labelStyle}>Courses you teach (comma separated)</label><input value={apply.courses} onChange={(e) => setApply((p) => ({ ...p, courses: e.target.value }))} placeholder="CSC301, CSC305" style={inputStyle} /></div>
            <button onClick={submitApplication} disabled={saving || !apply.staff_id.trim()} style={btnStyle(saving || !apply.staff_id.trim())}>
              {saving ? "Submitting..." : "Apply for Verification"}
            </button>
          </div>
        </div>
      )}

      {lecturer && !lecturer.is_verified && (
        <div className="rounded-2xl p-4 mb-5" style={{ backgroundColor: "#fffbeb", border: "1px solid #fde68a" }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: "#92400e" }}>⏳ Application pending</div>
          <div style={{ fontSize: 12, color: "#92400e", marginTop: 4 }}>Your staff ID is being reviewed. You'll be able to post once verified.</div>
        </div>
      )}

      {lecturer && lecturer.is_verified && (
        <div className="rounded-2xl border p-4 mb-5" style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}>
          <div className="font-bold text-sm mb-3" style={{ color: "#007A3D" }}>✓ Verified Lecturer: post an announcement</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <input value={post.title} onChange={(e) => setPost((p) => ({ ...p, title: e.target.value }))} placeholder="Title" style={inputStyle} />
            <textarea value={post.content} onChange={(e) => setPost((p) => ({ ...p, content: e.target.value }))} placeholder="Announcement for your department..." rows={4} style={{ ...inputStyle, resize: "none" }} />
            <button onClick={submitAnnouncement} disabled={saving || !post.title.trim() || !post.content.trim()} style={btnStyle(saving || !post.title.trim() || !post.content.trim())}>
              {saving ? "Posting..." : "Post Announcement"}
            </button>
          </div>
        </div>
      )}

      {/* Announcements list */}
      <div className="font-bold text-sm mb-3" style={{ color: "var(--text-primary)" }}>Recent announcements</div>
      {announcements.length === 0 ? (
        <div className="text-center py-10" style={{ color: "var(--text-secondary)" }}>
          <div className="text-4xl mb-2">📢</div>
          <div className="text-sm">No announcements yet</div>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {announcements.map((a) => (
            <div key={a.id} className="rounded-2xl border p-4" style={{ backgroundColor: "var(--card)", borderColor: "var(--border)", borderLeft: "4px solid #007A3D" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: "var(--text-primary)" }}>{a.title}</div>
                {a.lecturer_id === user.id && (
                  <button onClick={() => remove(a.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#ef4444" }}>🗑</button>
                )}
              </div>
              <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.5, margin: "6px 0 10px" }}>{a.content}</p>
              <div style={{ fontSize: 11, color: "var(--text-secondary)" }}>
                <span style={{ color: "#007A3D", fontWeight: 700 }}>✓ Lecturer</span> · {a.full_name || a.username} · {new Date(a.created_at).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}