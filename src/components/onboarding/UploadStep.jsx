import { useState } from "react";
import { GREEN } from "../../utils/constants";

export default function UploadStep({ department, onComplete }) {
  const [uploaded, setUploaded] = useState(false);

  return (
    <>
      <div className="text-xl font-extrabold text-white mb-1">Verify your Admission</div>
      <div className="text-gray-400 text-[13px] leading-relaxed mb-6">
        Upload your UNILAG admission letter to join the{" "}
        <span style={{ color: GREEN }} className="font-semibold">{department}</span> group.
      </div>

      {!uploaded ? (
        <div
          onClick={() => setUploaded(true)}
          className="border-2 border-dashed border-[#3a3f4a] rounded-xl py-8 px-5 text-center cursor-pointer mb-5"
        >
          <div className="text-3xl mb-2">📄</div>
          <div className="text-gray-200 font-semibold text-sm">Tap to upload admission letter</div>
          <div className="text-gray-500 text-xs mt-1">PDF or image accepted</div>
        </div>
      ) : (
        <div className="bg-[#1a2e22] border border-green-800 rounded-xl p-4 mb-5 flex items-center gap-3">
          <span className="text-2xl">✅</span>
          <div>
            <div className="text-green-400 font-semibold text-sm">Admission letter uploaded</div>
            <div className="text-gray-500 text-xs">admission_letter.pdf</div>
          </div>
        </div>
      )}

      <button
        onClick={() => uploaded && onComplete()}
        disabled={!uploaded}
        style={{
          backgroundColor: uploaded ? GREEN : "#2d3139",
          color: uploaded ? "#fff" : "#6b7280",
          cursor: uploaded ? "pointer" : "not-allowed",
        }}
        className="w-full py-3.5 rounded-xl font-bold text-[15px]"
      >
        Join {department} Group →
      </button>
    </>
  );
}