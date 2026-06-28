import { useState, useEffect } from "react";
import { useUser } from "../context/UserContext";
import Avatar from "../components/layout/Avatar";
import API from "../utils/api";
import { motion, AnimatePresence } from "framer-motion";

const styles = `
  .search-input {
    width: 100%;
    padding: 10px 16px;
    border-radius: 22px;
    border: 1.5px solid var(--border);
    background: var(--bg);
    color: var(--text-primary);
    font-size: 14px;
    outline: none;
    font-family: inherit;
  }
  .overlay {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.5);
    z-index: 40;
    display: flex;
    align-items: flex-end;
    justify-content: center;
  }
  .sheet {
    width: 100%;
    max-width: 480px;
    border-radius: 20px 20px 0 0;
    padding: 24px 20px;
    max-height: 80vh;
    display: flex;
    flex-direction: column;
    overflow-y: auto;
  }
`;

function DepartmentSheet({ dept, userDeptId, userGroups, onClose, onJoin }) {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);

  const isMyDept = dept.id === userDeptId;
  const isJoined = isMyDept || userGroups.includes(dept.id);

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const res = await API.get(`/departments/${dept.id}/members`);
        setMembers(res.data);
      } catch (err) {
        console.error("Members fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMembers();
  }, [dept.id]);

  const handleJoin = async () => {
    setJoining(true);
    try {
      await API.post(`/departments/${dept.id}/join`);
      onJoin(dept.id);
    } catch (err) {
      console.error("Join error:", err);
    } finally {
      setJoining(false);
    }
  };

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
        {/* Handle */}
        <div className="w-10 h-1 rounded-full bg-gray-300 mx-auto mb-5" />

        {/* Header */}
        <div
          className="rounded-2xl px-4 py-4 mb-5"
          style={{ background: "linear-gradient(135deg, #064e3b, #4c1d95)" }}
        >
          <div className="text-white font-extrabold text-lg">{dept.name}</div>
          <div className="text-white/60 text-xs mt-1">{dept.faculty}</div>
          <div className="flex items-center gap-4 mt-3">
            <div className="text-center">
              <div className="text-white font-bold text-xl">{dept.member_count || 0}</div>
              <div className="text-white/60 text-xs">Members</div>
            </div>
          </div>
        </div>

        {/* Join button */}
        {!isJoined ? (
          <button
            onClick={handleJoin}
            disabled={joining}
            className="w-full py-3.5 rounded-xl font-bold text-sm text-white mb-5"
            style={{
              background: joining ? "#2d3139" : "linear-gradient(135deg, #007A3D, #4c1d95)",
              cursor: joining ? "not-allowed" : "pointer",
            }}
          >
            {joining ? "Joining..." : "Join Group"}
          </button>
        ) : (
          <div
            className="w-full py-3.5 rounded-xl font-bold text-sm text-center mb-5"
            style={{ backgroundColor: "#ecfdf5", color: "#007A3D" }}
          >
            {isMyDept ? "✓ Your Department" : "✓ Joined"}
          </div>
        )}

        {/* Members */}
        <div className="font-bold text-sm mb-3" style={{ color: "var(--text-primary)" }}>
          Members ({members.length})
        </div>
        {loading ? (
          <div className="text-center py-4 text-sm" style={{ color: "var(--text-secondary)" }}>
            Loading members...
          </div>
        ) : members.length === 0 ? (
          <div className="text-center py-4 text-sm" style={{ color: "var(--text-secondary)" }}>
            No members yet — be the first to join!
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {members.map((m) => (
              <div key={m.id} className="flex items-center gap-3">
                <Avatar
                  initials={(m.full_name || m.username || "U").slice(0, 2).toUpperCase()}
                  color={m.avatar_color || "#7c3aed"}
                  size={36}
                />
                <div>
                  <div className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                    {m.full_name || m.username}
                  </div>
                  <div className="text-xs" style={{ color: "var(--text-secondary)" }}>
                    @{m.username}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}

export default function Faculties() {
  const { department } = useUser();
  const [faculties, setFaculties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeDept, setActiveDept] = useState(null);
  const [userGroups, setUserGroups] = useState([]);
  const [myGroups, setMyGroups] = useState([]);

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [deptRes, groupRes] = await Promise.all([
          API.get("/departments"),
          API.get("/departments/user/groups"),
        ]);
        setFaculties(deptRes.data);
        setMyGroups(groupRes.data);
        setUserGroups(groupRes.data.map((g) => g.id));
      } catch (err) {
        console.error("Faculties fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleJoin = (deptId) => {
    setUserGroups((prev) => [...prev, deptId]);
    const joined = faculties
      .flatMap((f) => f.departments.map((d) => ({ ...d, faculty: f.faculty })))
      .find((d) => d.id === deptId);
    if (joined) setMyGroups((prev) => [...prev, joined]);
  };

  // Filter faculties based on search
  const filtered = faculties
    .map((f) => ({
      ...f,
      departments: f.departments.filter((d) =>
        d.name.toLowerCase().includes(search.toLowerCase()) ||
        f.faculty.toLowerCase().includes(search.toLowerCase())
      ),
    }))
    .filter((f) => f.departments.length > 0);

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
      <style>{styles}</style>

      <div className="font-extrabold text-xl mb-1 transition-colors duration-300" style={{ color: "var(--text-primary)" }}>
        Faculties & Departments
      </div>
      <div className="text-sm mb-4 transition-colors duration-300" style={{ color: "var(--text-secondary)" }}>
        All verified UNILAG groups
      </div>

      {/* Search */}
      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search faculty or department..."
        className="search-input mb-5"
      />

      {/* My Groups */}
      {myGroups.length > 0 && (
        <div className="mb-5">
          <div className="font-bold text-sm mb-3" style={{ color: "var(--text-primary)" }}>
            My Groups
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {myGroups.map((g) => (
              <div
                key={g.id}
                onClick={() => setActiveDept({ ...g, faculty: g.faculty })}
                className="flex-shrink-0 px-4 py-2.5 rounded-xl border cursor-pointer"
                style={{
                  background: "linear-gradient(135deg, #064e3b, #4c1d95)",
                  minWidth: 120,
                }}
              >
                <div className="text-white font-bold text-xs">{g.name}</div>
                <div className="text-white/60 text-[10px] mt-0.5">{g.member_count || 0} members</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Faculties list */}
      {filtered.map((f) => (
        <div
          key={f.faculty_id}
          className="rounded-2xl mb-4 border overflow-hidden shadow-sm transition-colors duration-300"
          style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}
        >
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

          {f.departments.map((dept, i) => (
            <div
              key={dept.id}
              onClick={() => setActiveDept({ ...dept, faculty: f.faculty })}
              className="px-4 py-3.5 flex items-center justify-between border-b cursor-pointer transition-colors duration-300"
              style={{ borderColor: i !== f.departments.length - 1 ? "var(--border)" : "transparent" }}
            >
              <div>
                <span className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
                  {dept.name}
                </span>
                <div className="text-xs mt-0.5" style={{ color: "var(--text-secondary)", opacity: 0.6 }}>
                  {dept.member_count || 0} members
                </div>
              </div>
              <div className="flex items-center gap-2">
                {dept.name === department && (
                  <span className="text-xs bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded-full">
                    Mine ✓
                  </span>
                )}
                {userGroups.includes(dept.id) && dept.name !== department && (
                  <span className="text-xs bg-purple-50 text-purple-700 font-bold px-2 py-0.5 rounded-full">
                    Joined ✓
                  </span>
                )}
                <span style={{ color: "var(--border)" }}>›</span>
              </div>
            </div>
          ))}
        </div>
      ))}

      {/* Department sheet */}
      <AnimatePresence>
        {activeDept && (
          <DepartmentSheet
            dept={activeDept}
            userDeptId={user.department_id}
            userGroups={userGroups}
            onClose={() => setActiveDept(null)}
            onJoin={handleJoin}
          />
        )}
      </AnimatePresence>
    </div>
  );
}