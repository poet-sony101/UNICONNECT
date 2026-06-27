import { useState, useEffect } from "react";
import { useUser } from "../context/UserContext";
import API from "../utils/api";

export default function Faculties() {
  const { department } = useUser();
  const [faculties, setFaculties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFaculties = async () => {
      try {
        const res = await API.get("/departments");
        setFaculties(res.data);
      } catch (err) {
        console.error("Faculties fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchFaculties();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-3xl mb-2">⏳</div>
          <div className="text-sm" style={{ color: "var(--text-secondary)" }}>
            Loading faculties...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-4 pb-24">
      <div
        className="font-extrabold text-xl mb-1 transition-colors duration-300"
        style={{ color: "var(--text-primary)" }}
      >
        Faculties & Departments
      </div>
      <div
        className="text-sm mb-5 transition-colors duration-300"
        style={{ color: "var(--text-secondary)" }}
      >
        All verified UNILAG groups
      </div>

      {faculties.map((f) => (
        <div
          key={f.faculty_id}
          className="rounded-2xl mb-4 border overflow-hidden shadow-sm transition-colors duration-300"
          style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}
        >
          {/* Faculty header */}
          <div
            className="px-4 py-3.5 font-bold text-sm border-b transition-colors duration-300"
            style={{
              color: "var(--text-primary)",
              borderColor: "var(--border)",
              backgroundColor: "var(--bg)",
            }}
          >
            {f.faculty}
          </div>

          {/* Departments */}
          {f.departments.map((dept, i) => (
            <div
              key={dept.id}
              className="px-4 py-3.5 flex items-center justify-between border-b transition-colors duration-300"
              style={{
                borderColor: i !== f.departments.length - 1 ? "var(--border)" : "transparent",
              }}
            >
              <span className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
                {dept.name}
              </span>
              <div className="flex items-center gap-2">
                {dept.name === department && (
                  <span className="text-xs bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded-full">
                    Joined ✓
                  </span>
                )}
                <span style={{ color: "var(--border)" }}>›</span>
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}