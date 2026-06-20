import { useUser } from "../context/UserContext";
import { DEPARTMENTS } from "../utils/constants";

export default function Faculties() {
  const { department } = useUser();

  return (
    <div className="px-4 py-4 pb-24">
      <div className="font-extrabold text-xl mb-1 transition-colors duration-300" style={{ color: "var(--text-primary)" }}>
        Faculties & Departments
      </div>
      <div className="text-sm mb-5 transition-colors duration-300" style={{ color: "var(--text-secondary)" }}>
        All verified UNILAG groups
      </div>

      {Object.entries(DEPARTMENTS).map(([faculty, depts]) => (
        <div
          key={faculty}
          className="rounded-2xl mb-4 border overflow-hidden shadow-sm transition-colors duration-300"
          style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}
        >
          {/* Faculty header */}
          <div
            className="px-4 py-3.5 font-bold text-sm border-b transition-colors duration-300"
            style={{ color: "var(--text-primary)", borderColor: "var(--border)", backgroundColor: "var(--bg)" }}
          >
            {faculty}
          </div>

          {/* Departments */}
          {depts.map((dept, i) => (
            <div
              key={dept}
              className="px-4 py-3.5 flex items-center justify-between border-b transition-colors duration-300"
              style={{ borderColor: i !== depts.length - 1 ? "var(--border)" : "transparent" }}
            >
              <span className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
                {dept}
              </span>
              <div className="flex items-center gap-2">
                {dept === department && (
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