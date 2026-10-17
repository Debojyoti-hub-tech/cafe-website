import { useState, useEffect, useRef } from "react";
import axios from "axios";
import toast from "react-hot-toast";

export default function OtpModal({ email, purpose, onVerified, onClose }) {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef([]);

  // 30s cooldown then just show Resend button, no countdown
  useEffect(() => {
    const t = setTimeout(() => setCanResend(true), 30000);
    return () => clearTimeout(t);
  }, []);

  const handleChange = (idx, val) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...otp];
    next[idx] = val;
    setOtp(next);
    if (val && idx < 5) inputRefs.current[idx + 1]?.focus();
  };

  const handleKeyDown = (idx, e) => {
    if (e.key === "Backspace" && !otp[idx] && idx > 0) inputRefs.current[idx - 1]?.focus();
  };

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 6) {
      setOtp(pasted.split(""));
      inputRefs.current[5]?.focus();
    }
  };

  const handleVerify = async () => {
    const code = otp.join("");
    if (code.length < 6) return toast.error("Enter all 6 digits.");
    setLoading(true);
    try {
      await axios.post("/api/otp/verify", { email, otp: code, purpose });
      toast.success("Verified! ✅");
      onVerified();
    } catch (err) {
      toast.error(err.response?.data?.message || "Incorrect OTP.");
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      await axios.post("/api/otp/send", { email, purpose });
      toast.success("New OTP sent!");
      setCanResend(false);
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
      setTimeout(() => setCanResend(true), 30000);
    } catch {
      toast.error("Failed to resend OTP.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative glass-panel rounded-3xl shadow-2xl p-8 w-full max-w-sm text-center">
        <button onClick={onClose} className="absolute top-4 right-5 text-gray-400 hover:text-gray-600 text-xl">✕</button>
        <div className="text-5xl mb-4">📧</div>
        <h2 className="font-display text-2xl text-cafe-dark mb-2">Verify Your Email</h2>
        <p className="text-gray-500 text-sm mb-6">
          We sent a 6-digit code to{" "}
          <span className="font-medium text-cafe-dark">{email}</span>
        </p>

        <div className="flex justify-center gap-2 mb-6" onPaste={handlePaste}>
          {otp.map((digit, idx) => (
            <input key={idx} ref={(el) => (inputRefs.current[idx] = el)}
              type="text" inputMode="numeric" maxLength={1} value={digit}
              onChange={(e) => handleChange(idx, e.target.value)}
              onKeyDown={(e) => handleKeyDown(idx, e)}
              className="w-11 h-14 text-center text-xl font-bold border-2 rounded-xl focus:outline-none transition-colors"
              style={{ borderColor: digit ? "#c8882a" : "#e5e7eb" }} />
          ))}
        </div>

        <button onClick={handleVerify} disabled={loading || otp.join("").length < 6}
          className="w-full py-3 bg-cafe-amber text-cafe-dark font-semibold rounded-xl hover:bg-amber-400 disabled:opacity-50 transition-colors mb-4">
          {loading ? "Verifying…" : "Confirm OTP"}
        </button>

        <p className="text-sm text-gray-400">
          Didn't receive it?{" "}
          {canResend ? (
            <button onClick={handleResend} className="text-cafe-amber font-medium hover:underline">Resend OTP</button>
          ) : (
            <span className="text-gray-300">Resend available shortly</span>
          )}
        </p>
      </div>
    </div>
  );
}
