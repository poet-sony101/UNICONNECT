import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
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

const GRADES = ["A", "B", "C", "D", "E", "F"];
const GRADE_POINTS = { A: 5.0, B: 4.0, C: 3.0, D: 2.0, E: 1.0, F: 0.0 };
const GRADE_COLORS = { A: "#007A3D", B: "#1d4ed8", C: "#d97706", D: "#dc2626", E: "#7c3aed", F: "#6b7280" };

function AddGradeSheet({ onClose, onAdded }) {
  const [form, setForm] = useState({ course_code: "", course_name: "", credit_units: 3, score: "", grade: "A", semester: "First", level: "100L" });
  const [loading, setLoading] = useState(false);

  const inputStyle = { width: "100%", padding: "12px 16px", borderRadius: 12, border: "1.5px solid var(--border)", background: "var(--bg)", color: "var(--text-primary)", fontSize: 14, outline: "none", fontFamily: "inherit" };
  const labelStyle = { fontSize: 11, fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: 6 };

  const submit = async () => {
    if (!form.course_code || !form.grade) return;
    setLoading(true);
    try {
      const res = await API.post("/grades", form);
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
        <div style={{ fontSize: 18, fontWeight: 700, color: "var(--text-primary)" }}>📊 Add Course Grade</div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <div><label style={labelStyle}>Course Code *</label><input value={form.course_code} onChange={(e) => setForm((p) => ({ ...p, course_code: e.target.value }))} placeholder="CSC301" style={inputStyle} /></div>
          <div><label style={labelStyle}>Credit Units</label><input type="number" min="1" max="6" value={form.credit_units} onChange={(e) => setForm((p) => ({ ...p, credit_units: parseInt(e.target.value) }))} style={inputStyle} /></div>
        </div>
        <div><label style={labelStyle}>Course Name</label><input value={form.course_name} onChange={(e) => setForm((p) => ({ ...p, course_name: e.target.value }))} placeholder="Data Structures" style={inputStyle} /></div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <div><label style={labelStyle}>Score (%)</label><input type="number" min="0" max="100" value={form.score} onChange={(e) => setForm((p) => ({ ...p, score: e.target.value }))} placeholder="75" style={inputStyle} /></div>
          <div>
            <label style={labelStyle}>Grade *</label>
            <select value={form.grade} onChange={(e) => setForm((p) => ({ ...p, grade: e.target.value }))} style={inputStyle}>
              {GRADES.map((g) => <option key={g}>{g}</option>)}
            </select>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <div>
            <label style={labelStyle}>Semester</label>
            <select value={form.semester} onChange={(e) => setForm((p) => ({ ...p, semester: e.target.value }))} style={inputStyle}>
              <option>First</option>
              <option>Second</option>
            </select>
          </div>
          <div>
            <label style={labelStyle}>Level</label>
            <select value={form.level} onChange={(e) => setForm((p) => ({ ...p, level: e.target.value }))} style={inputStyle}>
              {["100L", "200L", "300L", "400L", "500L", "600L"].map((l) => <option key={l}>{l}</option>)}
            </select>
          </div>
        </div>

        <button
          onClick={submit}
          disabled={loading || !form.course_code}
          style={{ width: "100%", padding: 14, borderRadius: 12, border: "none", color: "#fff", fontWeight: 700, fontSize: 14, fontFamily: "inherit", cursor: loading ? "not-allowed" : "pointer", background: loading ? "#2d3139" : "linear-gradient(135deg, #007A3D, #4c1d95)" }}
        >
          {loading ? "Adding..." : "Add Grade"}
        </button>
      </motion.div>
    </div>
  );
}

export default function GradeTracker() {
  const [data, setData] = useState({ grades: [], gpa: 0, totalUnits: 0 });
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [activeLevel, setActiveLevel] = useState("All");

  useEffect(() => {
    API.get("/grades")
      .then((res) => setData(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id) => {
    try {
      await API.delete(`/grades/${id}`);
      setData((prev) => ({ ...prev, grades: prev.grades.filter((g) => g.id !== id) }));
    } catch (err) {
      console.error(err);
    }
  };

  const handleAdd = (grade) => {
    setData((prev) => ({ ...prev, grades: [grade, ...prev.grades] }));
  };

  const filteredGrades = activeLevel === "All"
    ? data.grades
    : data.grades.filter((g) => g.level === activeLevel);

  const getGPAColor = (gpa) => {
    if (gpa >= 4.5) return "#007A3D";
    if (gpa >= 3.5) return "#1d4ed8";
    if (gpa >= 2.5) return "#d97706";
    return "#dc2626";
  };

  const getHonors = (gpa) => {
    if (gpa >= 4.5) return "First Class";
    if (gpa >= 3.5) return "Second Class Upper";
    if (gpa >= 2.5) return "Second Class Lower";
    if (gpa >= 1.5) return "Third Class";
    return "Pass";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-3xl mb-2">⏳</div>
          <div className="text-sm" style={{ color: "var(--text-secondary)" }}>Loading grades...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-4">
      <style>{styles}</style>

      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="font-extrabold text-xl" style={{ color: "var(--text-primary)" }}>Grade Tracker 📊</div>
          <div className="text-sm" style={{ color: "var(--text-secondary)" }}>Track your academic performance</div>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          style={{ padding: "8px 16px", borderRadius: 20, background: "linear-gradient(135deg, #007A3D, #4c1d95)", color: "#fff", fontWeight: 700, fontSize: 13, border: "none", cursor: "pointer" }}
        >
          + Add Grade
        </button>
      </div>

      {/* GPA Card */}
      {data.grades.length > 0 && (
        <div
          className="rounded-2xl p-5 mb-5"
          style={{ background: "linear-gradient(135deg, #064e3b, #4c1d95)" }}
        >
          <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 13, marginBottom: 4 }}>Current CGPA</div>
          <div style={{ color: "#fff", fontWeight: 800, fontSize: 48, lineHeight: 1 }}>{data.gpa}</div>
          <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 13, marginTop: 4 }}>
            {getHonors(parseFloat(data.gpa))} · {data.totalUnits} credit units
          </div>

          {/* GPA bar */}
          <div style={{ marginTop: 16, backgroundColor: "rgba(255,255,255,0.2)", borderRadius: 8, height: 8, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${(parseFloat(data.gpa) / 5) * 100}%`, backgroundColor: "#fff", borderRadius: 8, transition: "width 1s ease" }} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
            <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 10 }}>0.0</span>
            <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 10 }}>5.0</span>
          </div>
        </div>
      )}

      {/* Level filter */}
      <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 8, marginBottom: 16 }}>
        {["All", "100L", "200L", "300L", "400L", "500L", "600L"].map((l) => (
          <button
            key={l}
            onClick={() => setActiveLevel(l)}
            style={{
              flexShrink: 0, padding: "6px 12px", borderRadius: 20, fontSize: 11, fontWeight: 600,
              border: "1.5px solid", cursor: "pointer", fontFamily: "inherit",
              backgroundColor: activeLevel === l ? "#007A3D" : "var(--bg)",
              color: activeLevel === l ? "#fff" : "var(--text-secondary)",
              borderColor: activeLevel === l ? "#007A3D" : "var(--border)",
            }}
          >
            {l}
          </button>
        ))}
      </div>

      {filteredGrades.length === 0 ? (
        <div className="text-center py-16" style={{ color: "var(--text-secondary)" }}>
          <div className="text-4xl mb-3">📊</div>
          <div className="font-bold text-base mb-1" style={{ color: "var(--text-primary)" }}>No grades yet</div>
          <div className="text-sm">Add your first course grade!</div>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {filteredGrades.map((grade, index) => (
            <motion.div
              key={grade.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.03 }}
              style={{
                display: "flex", alignItems: "center", gap: 12, padding: "14px 16px",
                borderRadius: 14, border: "1px solid var(--border)",
                backgroundColor: "var(--card)",
                borderLeft: `4px solid ${GRADE_COLORS[grade.grade] || "#6b7280"}`,
              }}
            >
              <div style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: (GRADE_COLORS[grade.grade] || "#6b7280") + "22", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontSize: 18, fontWeight: 800, color: GRADE_COLORS[grade.grade] || "#6b7280" }}>{grade.grade}</span>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)" }}>{grade.course_code}</div>
                <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>
                  {grade.course_name} · {grade.credit_units} units · {grade.level}
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                {grade.score && <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}>{grade.score}%</div>}
                <div style={{ fontSize: 11, color: "var(--text-secondary)" }}>{GRADE_POINTS[grade.grade]}pts</div>
              </div>
              <button
                onClick={() => handleDelete(grade.id)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "#ef4444", fontSize: 16, padding: "4px" }}
              >
                🗑
              </button>
            </motion.div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {showAdd && (
          <AddGradeSheet
            onClose={() => setShowAdd(false)}
            onAdded={handleAdd}
          />
        )}
      </AnimatePresence>
    </div>
  );
}