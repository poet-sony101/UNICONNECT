import { motion } from "framer-motion";

export default function Avatar({ initials = "U", color = "#10b981", size = 38, isOnline = false, ring = false }) {
  // Vibrant campus gradient fallback based on initials
  const gradients = [
    "from-emerald-500 to-teal-600",
    "from-indigo-500 to-purple-600",
    "from-pink-500 to-rose-600",
    "from-amber-500 to-orange-600",
    "from-cyan-500 to-blue-600",
  ];
  
  const charCode = (initials.charCodeAt(0) || 0) + (initials.charCodeAt(1) || 0);
  const gradientClass = gradients[charCode % gradients.length];

  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 ${
        ring ? "p-0.5 rounded-full story-ring-active" : ""
      }`}
      style={{ width: size, height: size }}
    >
      <div
        className={`w-full h-full rounded-full flex items-center justify-center text-white font-black tracking-wider shadow-sm select-none bg-gradient-to-tr ${gradientClass}`}
        style={{
          fontSize: Math.max(10, Math.floor(size * 0.38)),
          border: ring ? "2px solid var(--card)" : "none",
        }}
      >
        {initials}
      </div>

      {isOnline && (
        <span
          className="absolute bottom-0 right-0 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900 shadow-sm"
          style={{
            width: Math.max(8, Math.floor(size * 0.28)),
            height: Math.max(8, Math.floor(size * 0.28)),
          }}
        />
      )}
    </div>
  );
}
