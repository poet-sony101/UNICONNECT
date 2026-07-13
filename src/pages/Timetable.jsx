import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import API from "../utils/api";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const COLORS = ["#007A3D", "#7c3aed", "#1d4ed8", "#dc2626", "#d97706", "#0891b2", "#be185d"];

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

function AddCourseSheet({ onClose, onAdded }) {
  const [form, setForm] = useState({ course_code: "", course_name: "", day: "Monday", start_time: "08:00", end_time: "10:00", location: "", color: "#007A3D" });
  const [loading, setLoading] = useState(false);

  const inputStyle = { width: "100%", padding: "12px 16px", borderRadius: 12, border: "1.5px solid var(--border)", background: "var(--bg)", color: "var(--text-primary)", fontSize: 14, outline: "none", fontFamily: "inherit" };
  const labelStyle = { fontSize: 11, fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: 6 };

  const submit = async () => {
    if (!form.course_code || !form.course_name) return;
    setLoading(true);
    try {
      const res = await API.post("/timetable", form);
      onAdded(res.data);
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
        <div style={{ fontSize: 18, fontWeight: 700, color: "var(--text-primary)" }}>🗓️ Add Course</div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <div><label style={labelStyle}>Course Code *</label><input value={form.course_code} onChange={(e) => setForm((p) => ({ ...p, course_code: e.target.value }))} placeholder="CSC301" style={inputStyle} /></div>
          <div>
            <label style={labelStyle}>Day</label>
            <select value={form.day} onChange={(e) => setForm((p) => ({ ...p, day: e.target.value }))} style={inputStyle}>
              {DAYS.map((d) => <option key={d}>{d}</option>)}
            </select>
          </div>
        </div>
        <div><label style={labelStyle}>Course Name *</label><input value={form.course_name} onChange={(e) => setForm((p) => ({ ...p, course_name: e.target.value }))} placeholder="Data Structures" style={inputStyle} /></div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <div><label style={labelStyle}>Start Time</label><input type="time" value={form.start_time} onChange={(e) => setForm((p) => ({ ...p, start_time: e.target.value }))} style={inputStyle} /></div>
          <div><label style={labelStyle}>End Time</label><input type="time" value={form.end_time} onChange={(e) => setForm((p) => ({ ...p, end_time: e.target.value }))} style={inputStyle} /></div>
        </div>
        <div><label style={labelStyle}>Location</label><input value={form.location} onChange={(e) => setForm((p) => ({ ...p, location: e.target.value }))} placeholder="e.g. Science LT1" style={inputStyle} /></div>

        {/* Color picker */}
        <div>
          <label style={labelStyle}>Color</label>
          <div style={{ display: "flex", gap: 8 }}>
            {COLORS.map((c) => (
              <button
                key={c}
                onClick={() => setForm((p) => ({ ...p, color: c }))}
                style={{ width: 28, height: 28, borderRadius: "50%", backgroundColor: c, border: form.color === c ? "3px solid #fff" : "3px solid transparent", cursor: "pointer", outline: form.color === c ? `2px solid ${c}` : "none" }}
              />
            ))}
          </div>
        </div>

        <button
          onClick={submit}
          disabled={loading || !form.course_code || !form.course_name}
          style={{ width: "100%", padding: 14, borderRadius: 12, border: "none", color: "#fff", fontWeight: 700, fontSize: 14, fontFamily: "inherit", cursor: loading ? "not-allowed" : "pointer", background: loading ? "#2d3139" : "linear-gradient(135deg, #007A3D, #4c1d95)" }}
        >
          {loading ? "Adding..." : "Add to Timetable"}
        </button>
      </motion.div>
    </div>
  );
}

export default function Timetable() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [activeDay, setActiveDay] = useState("Monday");

  useEffect(() => {
    API.get("/timetable")
      .then((res) => setCourses(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id) => {
    try {
      await API.delete(`/timetable/${id}`);
      setCourses((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const dayCourses = courses.filter((c) => c.day === activeDay);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-3xl mb-2">⏳</div>
          <div className="text-sm" style={{ color: "var(--text-secondary)" }}>Loading timetable...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-4">
      <style>{styles}</style>

      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="font-extrabold text-xl" style={{ color: "var(--text-primary)" }}>Timetable 🗓️</div>
          <div className="text-sm" style={{ color: "var(--text-secondary)" }}>Your weekly schedule</div>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          style={{ padding: "8px 16px", borderRadius: 20, background: "linear-gradient(135deg, #007A3D, #4c1d95)", color: "#fff", fontWeight: 700, fontSize: 13, border: "none", cursor: "pointer" }}
        >
          + Add Course
        </button>
      </div>

      {/* Day selector */}
      <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 8, marginBottom: 16 }}>
        {DAYS.map((day) => {
          const count = courses.filter((c) => c.day === day).length;
          return (
            <button
              key={day}
              onClick={() => setActiveDay(day)}
              style={{
                flexShrink: 0, padding: "8px 14px", borderRadius: 20, fontSize: 12, fontWeight: 600,
                border: "1.5px solid", cursor: "pointer", fontFamily: "inherit",
                backgroundColor: activeDay === day ? "#007A3D" : "var(--bg)",
                color: activeDay === day ? "#fff" : "var(--text-secondary)",
                borderColor: activeDay === day ? "#007A3D" : "var(--border)",
              }}
            >
              {day.slice(0, 3)} {count > 0 && `(${count})`}
            </button>
          );
        })}
      </div>

      {/* Courses for active day */}
      {dayCourses.length === 0 ? (
        <div className="text-center py-12" style={{ color: "var(--text-secondary)" }}>
          <div className="text-4xl mb-3">🎉</div>
          <div className="font-bold text-base mb-1" style={{ color: "var(--text-primary)" }}>No classes on {activeDay}</div>
          <div className="text-sm">Enjoy your free day!</div>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {dayCourses
            .sort((a, b) => a.start_time.localeCompare(b.start_time))
            .map((course, index) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="rounded-2xl border shadow-sm overflow-hidden"
                style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}
              >
                <div style={{ width: 4, backgroundColor: course.color, position: "absolute", top: 0, bottom: 0, left: 0 }} />
                <div style={{ padding: 16, borderLeft: `4px solid ${course.color}` }}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 15, color: "var(--text-primary)" }}>{course.course_name}</div>
                      <div style={{ fontSize: 12, color: course.color, fontWeight: 600, marginTop: 2 }}>{course.course_code}</div>
                    </div>
                    <button
                      onClick={() => handleDelete(course.id)}
                      style={{ background: "none", border: "none", cursor: "pointer", color: "#ef4444", fontSize: 16 }}
                    >
                      🗑
                    </button>
                  </div>
                  <div style={{ marginTop: 10, display: "flex", gap: 16 }}>
                    <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>
                      ⏰ {course.start_time} — {course.end_time}
                    </div>
                    {course.location && (
                      <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>
                        📍 {course.location}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
        </div>
      )}

      <AnimatePresence>
        {showAdd && (
          <AddCourseSheet
            onClose={() => setShowAdd(false)}
            onAdded={(c) => setCourses((prev) => [...prev, c])}
          />
        )}
      </AnimatePresence>
    </div>
  );
}