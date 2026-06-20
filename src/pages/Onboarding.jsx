import { useState } from "react";
import { useUser } from "../context/UserContext";
import WelcomeStep from "../components/onboarding/WelcomeStep";
import FacultyStep from "../components/onboarding/FacultyStep";
import DepartmentStep from "../components/onboarding/DepartmentStep";
import UploadStep from "../components/onboarding/UploadStep";

export default function Onboarding({ onComplete }) {
  const [step, setStep] = useState(0);
  const { faculty, setFaculty, department, setDepartment, setIsVerified } = useUser();

  const handleFacultySelect = (f) => {
    setFaculty(f);
    setStep(2);
  };

  const handleDeptSelect = (d) => {
    setDepartment(d);
    setStep(3);
  };

  const handleComplete = () => {
    setIsVerified(true);
    onComplete();
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

        {step === 0 && <WelcomeStep onNext={() => setStep(1)} />}
        {step === 1 && <FacultyStep selectedFaculty={faculty} onSelect={handleFacultySelect} />}
        {step === 2 && (
          <DepartmentStep
            faculty={faculty}
            onSelect={handleDeptSelect}
            onBack={() => setStep(1)}
          />
        )}
        {step === 3 && (
          <UploadStep department={department} onComplete={handleComplete} />
        )}
      </div>
    </div>
  );
}