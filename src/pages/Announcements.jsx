import { useState, useEffect } from "react";
import API from "../utils/api";

export default function Announcements() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    API.get("/lecturers/announcements")
      .then((res) => setItems(res.data.slice(0, 2)))
      .catch(console.error);
  }, []);

  if (items.length === 0) return null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
      {items.map((a) => (
        <div
          key={a.id}
          className="rounded-2xl p-4"
          style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)", borderLeft: "4px solid #007A3D" }}
        >
          <div style={{ fontSize: 11, fontWeight: 700, color: "#007A3D", marginBottom: 4 }}>
            📢 OFFICIAL · ✓ {a.full_name || a.username}
          </div>
          <div style={{ fontWeight: 700, fontSize: 14, color: "var(--text-primary)" }}>{a.title}</div>
          <div style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 4, lineHeight: 1.5 }}>
            {a.content.slice(0, 140)}{a.content.length > 140 ? "..." : ""}
          </div>
        </div>
      ))}
    </div>
  );
}