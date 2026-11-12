const TAG_STYLES = {
  Admissions: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  "Department News": "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  "Campus Life": "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
  Events: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  Sports: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
};

export default function Tag({ label, onClick, active = false }) {
  const baseStyle = TAG_STYLES[label] || "bg-slate-500/10 text-slate-700 dark:text-slate-300 border-slate-500/20";
  
  if (onClick) {
    return (
      <button
        onClick={onClick}
        className={`px-3 py-1 rounded-full text-xs font-bold border transition-all duration-200 active:scale-95 ${
          active
            ? "bg-emerald-600 text-white border-emerald-600 shadow-[0_2px_10px_rgba(16,185,129,0.35)]"
            : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-transparent hover:border-slate-300 dark:hover:border-slate-700"
        }`}
      >
        {label}
      </button>
    );
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${baseStyle}`}>
      #{label}
    </span>
  );
}
