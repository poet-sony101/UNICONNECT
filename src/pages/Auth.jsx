import { useState } from "react";
import API from "../utils/api";

const styles = `
  @keyframes fadeUp {
    0% { opacity: 0; transform: translateY(24px); }
    100% { opacity: 1; transform: translateY(0); }
  }
  .fade-up {
    animation: fadeUp 0.4s ease forwards;
  }
  .input-field {
    width: 100%;
    padding: 13px 16px;
    border-radius: 12px;
    border: 1.5px solid #2d3139;
    background: #262932;
    color: #f9fafb;
    font-size: 14px;
    outline: none;
    transition: border-color 0.2s;
    font-family: inherit;
  }
  .input-field:focus {
    border-color: #007A3D;
  }
  .input-field::placeholder {
    color: #6b7280;
  }
`;

export default function Auth({ onComplete, initialMode = "signup" }) {
  const [isLogin, setIsLogin] = useState(initialMode === "login");
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError("");
  };

const handleSubmit = async () => {
  if (!form.email || !form.password) {
    setError("Please fill in all fields.");
    return;
  }
  if (!isLogin && !form.username) {
    setError("Please enter a username.");
    return;
  }
  if (form.password.length < 6) {
    setError("Password must be at least 6 characters.");
    return;
  }

  setLoading(true);
  setError("");

  try {
    const endpoint = isLogin ? "/auth/login" : "/auth/register";
    const payload = isLogin
      ? { email: form.email, password: form.password }
      : { username: form.username, email: form.email, password: form.password };

    const res = await API.post(endpoint, payload);

    localStorage.setItem("token", res.data.token);
    localStorage.setItem("user", JSON.stringify(res.data.user));

    setLoading(false);

    if (res.data.requiresVerification) {
      onComplete({ requiresVerification: true, email: form.email });
    } else {
      onComplete({ requiresVerification: false });
    }
  } catch (err) {
    setLoading(false);
    setError(err.response?.data?.message || "Something went wrong. Try again.");
  }
};

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6 py-10"
      style={{ background: "#0f1117" }}
    >
      <style>{styles}</style>

      {/* Logo */}
      <div className="flex items-center gap-2.5 mb-10 fade-up">
        <div className="w-11 h-11 rounded-xl bg-emerald-600 flex items-center justify-center shadow-lg">
          <span className="text-white font-extrabold text-xl">U</span>
        </div>
        <div>
          <div className="text-white font-extrabold text-2xl tracking-tight">UniConnect</div>
          <div className="text-gray-500 text-xs font-medium">UNILAG Student Network</div>
        </div>
      </div>

      {/* Card */}
      <div
        className="w-full max-w-sm rounded-2xl p-7 border fade-up"
        style={{ background: "#1c1f26", borderColor: "#2d3139", animationDelay: "0.1s", opacity: 0 }}
      >
        {/* Title */}
        <div className="mb-6">
          <div className="text-white font-extrabold text-2xl mb-1">
            {isLogin ? "Welcome back 👋" : "Create account"}
          </div>
          <div className="text-gray-400 text-sm">
            {isLogin
              ? "Sign in to your UniConnect account"
              : "Join your UNILAG student community"}
          </div>
        </div>

        {/* Form */}
        <div className="flex flex-col gap-3">
          {!isLogin && (
            <div className="fade-up" style={{ animationDelay: "0.15s", opacity: 0 }}>
              <label className="text-xs font-semibold text-gray-400 mb-1.5 block">Username</label>
              <input
                name="username"
                value={form.username}
                onChange={handleChange}
                placeholder="e.g. tunde_okonkwo"
                className="input-field"
              />
            </div>
          )}

          <div className="fade-up" style={{ animationDelay: "0.2s", opacity: 0 }}>
            <label className="text-xs font-semibold text-gray-400 mb-1.5 block">Email</label>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com"
              className="input-field"
            />
          </div>

          <div className="fade-up" style={{ animationDelay: "0.25s", opacity: 0 }}>
            <label className="text-xs font-semibold text-gray-400 mb-1.5 block">Password</label>
            <div className="relative">
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={handleChange}
                placeholder="Min. 6 characters"
                className="input-field"
                style={{ paddingRight: 44 }}
              />
              <button
                onClick={() => setShowPassword((p) => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm"
                style={{ background: "none", border: "none", cursor: "pointer" }}
              >
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-900/30 border border-red-800 rounded-xl px-4 py-2.5 text-red-400 text-xs font-medium">
              ⚠️ {error}
            </div>
          )}

          {/* Submit button */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full py-3.5 rounded-xl font-bold text-sm text-white mt-2 transition-all"
            style={{
              background: loading
                ? "#065f46"
                : "linear-gradient(135deg, #007A3D, #4c1d95)",
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading
              ? "Please wait..."
              : isLogin
              ? "Sign In"
              : "Create Account"}
          </button>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 h-px" style={{ background: "#2d3139" }} />
          <span className="text-xs text-gray-500">or</span>
          <div className="flex-1 h-px" style={{ background: "#2d3139" }} />
        </div>

        {/* Toggle */}
        <div className="text-center text-sm text-gray-400">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button
            onClick={() => { setIsLogin((p) => !p); setError(""); }}
            className="font-bold text-emerald-500"
            style={{ background: "none", border: "none", cursor: "pointer" }}
          >
            {isLogin ? "Sign Up" : "Log In"}
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="text-gray-600 text-xs mt-6 text-center fade-up" style={{ animationDelay: "0.3s", opacity: 0 }}>
        By continuing, you agree to UniConnect's Terms & Privacy Policy
      </div>
    </div>
  );
}