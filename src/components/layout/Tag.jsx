const TAG_STYLES = {
  Admissions: "bg-emerald-50 text-emerald-700",
  "Department News": "bg-blue-50 text-blue-700",
  "Campus Life": "bg-violet-50 text-violet-700",
};

export default function Tag({ label }) {
  const style = TAG_STYLES[label] || "bg-gray-100 text-gray-700";
  return (
    <span className={`${style} text-xs font-semibold px-2 py-0.5 rounded-full`}>
      {label}
    </span>
  );
}