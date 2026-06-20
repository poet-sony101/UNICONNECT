import { GREEN } from "../../utils/constants";

export default function WelcomeStep({ onNext }) {
  return (
    <>
      <div className="text-2xl font-extrabold text-white mb-2">Welcome to UniConnect</div>
      <div className="text-gray-400 text-sm leading-relaxed mb-7">
        Connect with UNILAG students in your faculty, department, and course.
        Find your people before you even step on campus.
      </div>
      <button
        onClick={onNext}
        style={{ backgroundColor: GREEN }}
        className="w-full py-3.5 text-white rounded-xl font-bold text-[15px]"
      >
        Get Started
      </button>
    </>
  );
}