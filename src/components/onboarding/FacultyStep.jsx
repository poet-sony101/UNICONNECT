import { DEPARTMENTS, GREEN } from "../../utils/constants";

export default function FacultyStep({ selectedFaculty, onSelect }) {
  return (
    <>
      <div className="text-xl font-extrabold text-white mb-1">Select your Faculty</div>
      <div className="text-gray-400 text-[13px] mb-5">Choose the faculty you were admitted into.</div>
      <div className="flex flex-col gap-2.5">
        {Object.keys(DEPARTMENTS).map((f) => (
          <button
            key={f}
            onClick={() => onSelect(f)}
            style={{
              backgroundColor: selectedFaculty === f ? GREEN : "#262932",
              borderColor: selectedFaculty === f ? GREEN : "#3a3f4a",
            }}
            className="px-4 py-3.5 text-left rounded-lg border text-sm font-medium text-gray-200"
          >
            {f}
          </button>
        ))}
      </div>
    </>
  );
}