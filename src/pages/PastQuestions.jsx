import { useState, useEffect, useRef } from "react";
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
  .search-input {
    width: 100%; padding: 10px 16px; border-radius: 22px;
    border: 1.5px solid var(--border); background: var(--bg);
    color: var(--text-primary); font-size: 14px; outline: none; font-family: inherit;
  }
`;

function UploadSheet({ onClose, onUploaded }) {
  const [form, setForm] = useState({ title: "", course_code: "", course_name: "", year: "", semester: "First" });
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const fileRef = useRef(null);

  const inputStyle = { width: "100%", padding: "12px 16px", borderRadius: 12, border: "1.5px solid var(--border)", background: "var(--bg)", color: "var(--text-primary)", fontSize: 14, outline: "none", fontFamily: "inherit" };
  const labelStyle = { fontSize: 11, fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: 6 };

  const submit = async () => {
    if (!form.title || !form.course_code || !file) return;
    setLoading(true);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([k, v]) => formData.append(k, v));
      formData.append("file", file);
      const res = await API.post("/past-questions", formData, { headers: { "Content-Type": "multipart/form-data" } });
      onUploaded(res.data);
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
        <div style={{ fontSize: 18, fontWeight: 700, color: "var(--text-primary)" }}>📚 Upload Past Question</div>

        <div><label style={labelStyle}>Title *</label><input value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} placeholder="e.g. CSC301 2023 Past Question" style={inputStyle} /></div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <div><label style={labelStyle}>Course Code *</label><input value={form.course_code} onChange={(e) => setForm((p) => ({ ...p, course_code: e.target.value }))} placeholder="CSC301" style={inputStyle} /></div>
          <div><label style={labelStyle}>Year</label><input type="number" value={form.year} onChange={(e) => setForm((p) => ({ ...p, year: e.target.value }))} placeholder="2023" style={inputStyle} /></div>
        </div>
        <div><label style={labelStyle}>Course Name</label><input value={form.course_name} onChange={(e) => setForm((p) => ({ ...p, course_name: e.target.value }))} placeholder="Data Structures" style={inputStyle} /></div>
        <div>
          <label style={labelStyle}>Semester</label>
          <select value={form.semester} onChange={(e) => setForm((p) => ({ ...p, semester: e.target.value }))} style={inputStyle}>
            <option>First</option>
            <option>Second</option>
          </select>
        </div>

        {/* File upload */}
        <div
          onClick={() => fileRef.current?.click()}
          style={{ border: "2px dashed var(--border)", borderRadius: 12, padding: "20px", textAlign: "center", cursor: "pointer" }}
        >
          {file ? (
            <div style={{ color: "#007A3D", fontWeight: 600, fontSize: 14 }}>✅ {file.name}</div>
          ) : (
            <>
              <div style={{ fontSize: 32, marginBottom: 8 }}>📄</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>Upload PDF or Image</div>
              <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 4 }}>Max 10MB</div>
            </>
          )}
          <input ref={fileRef} type="file" accept=".pdf,image/*" style={{ display: "none" }} onChange={(e) => setFile(e.target.files[0])} />
        </div>

        <button
          onClick={submit}
          disabled={loading || !form.title || !form.course_code || !file}
          style={{ width: "100%", padding: 14, borderRadius: 12, border: "none", color: "#fff", fontWeight: 700, fontSize: 14, fontFamily: "inherit", cursor: loading ? "not-allowed" : "pointer", background: loading ? "#2d3139" : "linear-gradient(135deg, #007A3D, #4c1d95)" }}
        >
          {loading ? "Uploading..." : "Upload Past Question"}
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

export default function PastQuestions() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    API.get("/past-questions")
      .then((res) => setQuestions(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleSearch = async (q) => {
    setSearch(q);
    try {
      const res = await API.get(`/past-questions?course_code=${q}`);
      setQuestions(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDownload = async (q) => {
    try {
      const res = await API.post(`/past-questions/${q.id}/download`);
      window.open(res.data.url, "_blank");
      setQuestions((prev) => prev.map((item) => item.id === q.id ? { ...item, download_count: item.download_count + 1 } : item));
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-3xl mb-2">⏳</div>
          <div className="text-sm" style={{ color: "var(--text-secondary)" }}>Loading past questions...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-4">
      <style>{styles}</style>

      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="font-extrabold text-xl" style={{ color: "var(--text-primary)" }}>Past Questions 📚</div>
          <div className="text-sm" style={{ color: "var(--text-secondary)" }}>Download and study</div>
        </div>
        <button
          onClick={() => setShowUpload(true)}
          style={{ padding: "8px 16px", borderRadius: 20, background: "linear-gradient(135deg, #007A3D, #4c1d95)", color: "#fff", fontWeight: 700, fontSize: 13, border: "none", cursor: "pointer" }}
        >
          + Upload
        </button>
      </div>

      <input
        value={search}
        onChange={(e) => handleSearch(e.target.value)}
        placeholder="Search by course code..."
        className="search-input mb-4"
      />

      {questions.length === 0 ? (
        <div className="text-center py-16" style={{ color: "var(--text-secondary)" }}>
          <div className="text-4xl mb-3">📚</div>
          <div className="font-bold text-base mb-1" style={{ color: "var(--text-primary)" }}>No past questions yet</div>
          <div className="text-sm">Be the first to upload!</div>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {questions.map((q, index) => (
            <motion.div
              key={q.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="rounded-2xl border shadow-sm p-4"
              style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}
            >
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 8 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: "var(--text-primary)" }}>{q.title}</div>
                  <div style={{ fontSize: 12, color: "#007A3D", fontWeight: 600, marginTop: 2 }}>
                    {q.course_code} {q.year ? `· ${q.year}` : ""} {q.semester ? `· ${q.semester} Semester` : ""}
                  </div>
                </div>
                <div style={{ fontSize: 28 }}>{q.file_type === "pdf" ? "📄" : "🖼️"}</div>
              </div>

              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 12, paddingTop: 12, borderTop: "1px solid var(--border)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <Avatar initials={(q.full_name || q.username || "U").slice(0, 2).toUpperCase()} color={q.avatar_color || "#007A3D"} size={22} />
                  <span style={{ fontSize: 11, color: "var(--text-secondary)" }}>{q.full_name || q.username} · {timeAgo(q.created_at)}</span>
                </div>
                <button
                  onClick={() => handleDownload(q)}
                  style={{ padding: "6px 14px", borderRadius: 20, background: "linear-gradient(135deg, #007A3D, #4c1d95)", color: "#fff", fontWeight: 600, fontSize: 12, border: "none", cursor: "pointer" }}
                >
                  ⬇️ {q.download_count}
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {showUpload && (
          <UploadSheet
            onClose={() => setShowUpload(false)}
            onUploaded={(q) => setQuestions((prev) => [q, ...prev])}
          />
        )}
      </AnimatePresence>
    </div>
  );
}