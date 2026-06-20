export default function Avatar({ initials, color = "#007A3D", size = 36 }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        backgroundColor: color,
        fontSize: size * 0.35,
      }}
      className="rounded-full flex items-center justify-center text-white font-bold shrink-0"
    >
      {initials}
    </div>
  );
}