import { useState, useEffect } from "react";
import { useUser } from "../context/UserContext";
import UploadStep from "../components/onboarding/UploadStep";
import API from "../utils/api";

export default function Onboarding({ onComplete }) {
  const [step, setStep] = useState(0);
  const [faculties, setFaculties] = useState([]);
  const [loading, setLoading] = useState(true);
  const { faculty, setFaculty, department, setDepartment, setIsVerified } = useUser();

  // Fetch real faculties from backend
  useEffect(() => {
    const fetchFaculties = async () => {
      try {
        const res = await API.get("/departments");
        setFaculties(res.data);
      } catch (err) {
        console.error("Fetch faculties error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchFaculties();
  }, []);

  const handleFacultySelect = (f) => {
    setFaculty(f);
    setStep(2);
  };

  const handleDeptSelect = (d) => {
    setDepartment(d);
    setStep(3);
  };

  const handleComplete = async () => {
    try {
      const allFaculties = faculties;
      let deptId = null;
      allFaculties.forEach((f) => {
        f.departments.forEach((d) => {
          if (d.name === department) deptId = d.id;
        });
      });

      if (deptId) {
        await API.post("/users/join-department", { departmentId: deptId });
        const updatedUser = {
          ...JSON.parse(localStorage.getItem("user") || "{}"),
          department_id: deptId,
          department,
          faculty,
        };
        localStorage.setItem("user", JSON.stringify(updatedUser));
      }

      setIsVerified(true);
      onComplete();
    } catch (err) {
      console.error("Onboarding error:", err);
      setIsVerified(true);
      onComplete();
    }
  };

  return (
    <div className="min-h-screen bg-[#0f1117] flex flex-col items-center justify-center px-6 py-10">
      {/* Logo */}
      <div className="flex items-center gap-2.5 mb-10">
        <div className="w-10 h-10 rounded-xl bg-emerald-700 flex items-center justify-center">
          <span className="text-white font-extrabold text-lg">U</span>
        </div>
        <div>
          <div className="text-white font-extrabold text-xl tracking-tight">UniConnect</div>
          <div className="text-gray-500 text-xs font-medium">UNILAG</div>
        </div>
      </div>

      {/* Card */}
      <div className="bg-[#1c1f26] rounded-2xl p-7 w-full max-w-sm border border-[#2d3139]">
        {/* Progress bar */}
        <div className="flex gap-1.5 mb-7">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-1 flex-1 rounded-full transition-all duration-300"
              style={{ backgroundColor: i <= step ? "#007A3D" : "#2d3139" }}
            />
          ))}
        </div>

        {/* Step 0 — Welcome */}
        {step === 0 && (
          <>
            <div className="text-2xl font-extrabold text-white mb-2">Welcome to UniConnect</div>
            <div className="text-gray-400 text-sm leading-relaxed mb-7">
              Connect with UNILAG students in your faculty, department, and course.
              Find your people before you even step on campus.
            </div>
            <button
              onClick={() => setStep(1)}
              style={{ backgroundColor: "#007A3D" }}
              className="w-full py-3.5 text-white rounded-xl font-bold text-[15px]"
            >
              Get Started
            </button>
          </>
        )}

        {/* Step 1 — Faculty */}
        {step === 1 && (
          <>
            <div className="text-xl font-extrabold text-white mb-1">Select your Faculty</div>
            <div className="text-gray-400 text-[13px] mb-5">
              Choose the faculty you were admitted into.
            </div>
            {loading ? (
              <div className="text-center py-8 text-gray-400 text-sm">Loading faculties...</div>
            ) : (
              <div className="flex flex-col gap-2.5 overflow-y-auto max-h-72">
                {faculties.map((f) => (
                  <button
                    key={f.faculty_id}
                    onClick={() => handleFacultySelect(f.faculty)}
                    style={{
                      backgroundColor: faculty === f.faculty ? "#007A3D" : "#262932",
                      borderColor: faculty === f.faculty ? "#007A3D" : "#3a3f4a",
                    }}
                    className="px-4 py-3.5 text-left rounded-lg border text-sm font-medium text-gray-200"
                  >
                    {f.faculty}
                  </button>
                ))}
              </div>
            )}
          </>
        )}

        {/* Step 2 — Department */}
        {step === 2 && (
          <>
            <div className="text-xl font-extrabold text-white mb-1">Select your Department</div>
            <div className="text-gray-400 text-[13px] mb-5">{faculty}</div>
            <div className="flex flex-col gap-2.5 overflow-y-auto max-h-72">
              {faculties
                .find((f) => f.faculty === faculty)
                ?.departments.map((d) => (
                  <button
                    key={d.id}
                    onClick={() => handleDeptSelect(d.name)}
                    className="px-4 py-3.5 text-left rounded-lg border border-[#3a3f4a] bg-[#262932] text-sm font-medium text-gray-200"
                  >
                    {d.name}
                  </button>
                ))}
            </div>
            <button
              onClick={() => setStep(1)}
              className="mt-4 text-gray-500 text-[13px] bg-transparent border-none cursor-pointer"
            >
              ← Back
            </button>
          </>
        )}

        {/* Step 3 — Upload */}
        {step === 3 && (
          <UploadStep department={department} onComplete={handleComplete} />
        )}
      </div>
    </div>
  );
}