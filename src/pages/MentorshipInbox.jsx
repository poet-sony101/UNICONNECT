import { useState, useEffect } from "react";
import Avatar from "../components/layout/Avatar";
import API from "../utils/api";

const STATUS_STYLE = {
  pending: { bg: "#fffbeb", color: "#92400e", label: "Pending" },
  accepted: { bg: "#ecfdf5", color: "#047857", label: "Accepted" },
  declined: { bg: "#fef2f2", color: "#b91c1c", label: "Declined" },
};

export default function MentorshipInbox() {
  const [tab, setTab] = useState("incoming");
  const [incoming, setIncoming] = useState([]);
  const [sent, setSent] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([API.get("/alumni/requests/incoming"), API.get("/alumni/requests/sent")])
      .then(([inc, snt]) => {
        setIncoming(inc.data);
        setSent(snt.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const respond = async (id, status) => {
    try {
      await API.put(`/alumni/requests/${id}`, { status });
      setIncoming((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
    } catch (err) {
      console.error(err);
    }
  };

  const list = tab === "incoming" ? incoming : sent;

  if (loading) {
    return <div className="text-center py-16 text-sm" style={{ color: "var(--text-secondary)" }}>⏳ Loading...</div>;
  }

  return (
    <div className="px-4 py-4">
      <div className="font-extrabold text-xl mb-1" style={{ color: "var(--text-primary)" }}>Mentorship 🤝</div>
      <div className="text-sm mb-4" style={{ color: "var(--text-secondary)" }}>Requests you've received and sent</div>

      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        {[
          { id: "incoming", label: `Received (${incoming.length})` },
          { id: "sent", label: `Sent (${sent.length})` },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              padding: "6px 16px", borderRadius: 20, fontSize: 12, fontWeight: 600,
              border: "1.5px solid", cursor: "pointer", fontFamily: "inherit",
              backgroundColor: tab === t.id ? "#007A3D" : "var(--bg)",
              color: tab === t.id ? "#fff" : "var(--text-secondary)",
              borderColor: tab === t.id ? "#007A3D" : "var(--border)",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {list.length === 0 ? (
        <div className="text-center py-14" style={{ color: "var(--text-secondary)" }}>
          <div className="text-4xl mb-2">🤝</div>
          <div className="text-sm">
            {tab === "incoming"
              ? "No requests yet. Join the Alumni network and turn on mentoring to receive them."
              : "You haven't sent any requests. Find a mentor in the Alumni tab."}
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {list.map((r) => {
            const s = STATUS_STYLE[r.status] || STATUS_STYLE.pending;
            return (
              <div key={r.id} className="rounded-2xl border p-4" style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                  {r.avatar_url ? (
                    <img src={r.avatar_url} alt="avatar" style={{ width: 40, height: 40, borderRadius: "50%", objectFit: "cover" }} />
                  ) : (
                    <Avatar initials={(r.full_name || r.username || "U").slice(0, 2).toUpperCase()} color={r.avatar_color || "#007A3D"} size={40} />
                  )}
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 14, color: "var(--text-primary)" }}>{r.full_name || r.username}</div>
                    <div style={{ fontSize: 11, color: "var(--text-secondary)" }}>
                      {tab === "incoming" ? r.department || "UNILAG student" : "Mentor"}
                    </div>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20, backgroundColor: s.bg, color: s.color }}>{s.label}</span>
                </div>

                {r.message && (
                  <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.5, marginBottom: 10 }}>"{r.message}"</p>
                )}

                {tab === "incoming" && r.status === "pending" && (
                  <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={() => respond(r.id, "declined")} style={{ flex: 1, padding: 10, borderRadius: 10, border: "1.5px solid var(--border)", backgroundColor: "var(--bg)", color: "var(--text-secondary)", fontWeight: 600, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>
                      Decline
                    </button>
                    <button onClick={() => respond(r.id, "accepted")} style={{ flex: 1, padding: 10, borderRadius: 10, border: "none", background: "linear-gradient(135deg, #007A3D, #4c1d95)", color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>
                      Accept
                    </button>
                  </div>
                )}

                {tab === "incoming" && r.status === "accepted" && (
                  <div style={{ fontSize: 12, color: "#047857" }}>Accepted. Say hi in Messages: search for @{r.username}.</div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}