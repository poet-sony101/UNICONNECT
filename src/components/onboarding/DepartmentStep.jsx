import { DEPARTMENTS } from "../../utils/constants";

export default function DepartmentStep({ faculty, onSelect, onBack }) {
  return (
    <>
      <div className="text-xl font-extrabold text-white mb-1">Select your Department</div>
      <div className="text-gray-400 text-[13px] mb-5">{faculty}</div>
      <div className="flex flex-col gap-2.5">
        {DEPARTMENTS[faculty]?.map((d) => (
          <button
            key={d}
            onClick={() => onSelect(d)}
            className="px-4 py-3.5 text-left rounded-lg border border-[#3a3f4a] bg-[#262932] text-sm font-medium text-gray-200"
          >
            {d}
          </button>
        ))}
      </div>
      <button onClick={onBack} className="mt-4 text-gray-500 text-[13px] bg-transparent border-none">
        ← Back
      </button>
    </>
  );
}