import { useState } from "react";
import API from "../utils/api";

export default function VerifyEmail({ onComplete, email }) {
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleChange = (index, value) => {
    if (value.length > 1) return;
    if (!/^\d*$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);
    setError("");

    // Auto focus next input
    if (value && index < 5) {
      document.getElementById(`code-${index + 1}`)?.focus();
    }

    // Auto submit when all 6 digits entered
    if (value && index === 5) {
      const fullCode = [...newCode].join("");
      if (fullCode.length === 6) handleVerify(fullCode);
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      document.getElementById(`code-${index - 1}`)?.focus();
    }
  };

  const handleVerify = async (fullCode) => {
    const codeToVerify = fullCode || code.join("");
    if (codeToVerify.length !== 6) {
      setError("Please enter all 6 digits");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await API.post("/auth/verify-email", { code: codeToVerify });
      setSuccess(true);
      // Update localStorage
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      localStorage.setItem("user", JSON.stringify({ ...user, email_verified: true }));
      setTimeout(onComplete, 1500);
    } catch (err) {
      setError(err.response?.data?.message || "Invalid code. Try again.");
      setCode(["", "", "", "", "", ""]);
      document.getElementById("code-0")?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    setError("");
    try {
      await API.post("/auth/resend-code");
      setError("✅ New code sent to your email!");
    } catch (err) {
      setError("Failed to resend code. Try again.");
    } finally {
      setResending(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0f1117", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24, fontFamily: "inherit" }}>

      {/* Logo */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 40 }}>
        <div style={{ width: 42, height: 42, borderRadius: 12, background: "#007A3D", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ color: "#fff", fontWeight: 800, fontSize: 20 }}>U</span>
        </div>
        <div>
          <div style={{ color: "#fff", fontWeight: 800, fontSize: 20 }}>UniConnect</div>
          <div style={{ color: "#6b7280", fontSize: 11 }}>UNILAG</div>
        </div>
      </div>

      {/* Card */}
      <div style={{ background: "#1c1f26", borderRadius: 20, padding: 32, width: "100%", maxWidth: 400, border: "1px solid #2d3139" }}>

        {success ? (
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>🎉</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: "#fff", marginBottom: 8 }}>Email Verified!</div>
            <div style={{ color: "#9ca3af", fontSize: 14 }}>Taking you into UniConnect...</div>
          </div>
        ) : (
          <>
            <div style={{ textAlign: "center", marginBottom: 28 }}>
              <div style={{ fontSize: 44, marginBottom: 12 }}>📧</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: "#fff", marginBottom: 8 }}>
                Check your email
              </div>
              <div style={{ color: "#9ca3af", fontSize: 14, lineHeight: 1.6 }}>
                We sent a 6-digit verification code to{" "}
                <span style={{ color: "#007A3D", fontWeight: 600 }}>{email}</span>
              </div>
            </div>

            {/* Code inputs */}
            <div style={{ display: "flex", gap: 8, justifyContent: "center", marginBottom: 24 }}>
              {code.map((digit, index) => (
                <input
                  key={index}
                  id={`code-${index}`}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  style={{
                    width: 48, height: 56, borderRadius: 12, textAlign: "center",
                    fontSize: 22, fontWeight: 700, outline: "none",
                    border: `2px solid ${digit ? "#007A3D" : "#2d3139"}`,
                    background: "#262932", color: "#fff", fontFamily: "inherit",
                    transition: "border-color 0.2s",
                  }}
                />
              ))}
            </div>

            {/* Error */}
            {error && (
              <div style={{
                padding: "10px 16px", borderRadius: 10, marginBottom: 16, fontSize: 13, fontWeight: 500, textAlign: "center",
                backgroundColor: error.startsWith("✅") ? "#1a2e22" : "#fef2f2",
                color: error.startsWith("✅") ? "#4ade80" : "#ef4444",
                border: `1px solid ${error.startsWith("✅") ? "#166534" : "#fca5a5"}`,
              }}>
                {error}
              </div>
            )}

            {/* Verify button */}
            <button
              onClick={() => handleVerify()}
              disabled={loading || code.join("").length !== 6}
              style={{
                width: "100%", padding: 14, borderRadius: 12, border: "none",
                color: "#fff", fontWeight: 700, fontSize: 15, fontFamily: "inherit",
                cursor: loading || code.join("").length !== 6 ? "not-allowed" : "pointer",
                background: loading || code.join("").length !== 6
                  ? "#2d3139"
                  : "linear-gradient(135deg, #007A3D, #4c1d95)",
                marginBottom: 16,
              }}
            >
              {loading ? "Verifying..." : "Verify Email ✓"}
            </button>

            {/* Resend */}
            <div style={{ textAlign: "center" }}>
              <span style={{ color: "#6b7280", fontSize: 13 }}>Didn't get the code? </span>
              <button
                onClick={handleResend}
                disabled={resending}
                style={{ color: "#007A3D", fontWeight: 600, fontSize: 13, background: "none", border: "none", cursor: "pointer", fontFamily: "inherit" }}
              >
                {resending ? "Sending..." : "Resend"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}