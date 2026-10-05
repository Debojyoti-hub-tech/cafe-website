import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import OtpModal from "../components/OtpModal";

const TIME_SLOTS = [
  "08:00 AM","09:00 AM","10:00 AM","11:00 AM",
  "12:00 PM","01:00 PM","02:00 PM","03:00 PM",
  "06:00 PM","07:00 PM","08:00 PM","09:00 PM",
];

const OCCASIONS = ["casual","birthday","anniversary","business","other"];

export default function Booking() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    guestName: user?.name || "",
    guestEmail: user?.email || "",
    guestPhone: user?.phone || "",
    date: "",
    time: "",
    partySize: 2,
    occasion: "casual",
    specialRequests: "",
  });

  const [step, setStep] = useState("form"); // "form" | "otp" | "success"
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmitForm = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Send OTP to user's email
      await axios.post("/api/otp/send", { email: form.guestEmail, purpose: "booking" });
      toast.success("OTP sent to your email!");
      setStep("otp");
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not send OTP.");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpVerified = async () => {
    // OTP passed — now actually create the booking
    try {
      await axios.post("/api/bookings", { ...form, user: user?._id });
      setStep("success");
    } catch (err) {
      toast.error(err.response?.data?.message || "Booking failed after verification.");
      setStep("form");
    }
  };

  if (step === "success") {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="text-7xl mb-6">🎉</div>
          <h2 className="font-display text-4xl text-cafe-dark mb-3">You're on the list!</h2>
          <p className="text-gray-500 mb-8">
            Reservation confirmed for <strong>{form.guestName}</strong> on{" "}
            <strong>{new Date(form.date).toDateString()}</strong> at <strong>{form.time}</strong>.
            We'll see you there!
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => { setStep("form"); setForm({ guestName: user?.name || "", guestEmail: user?.email || "", guestPhone: user?.phone || "", date: "", time: "", partySize: 2, occasion: "casual", specialRequests: "" }); }}
              className="px-6 py-3 bg-cafe-amber text-cafe-dark font-semibold rounded-full hover:bg-amber-400 transition-colors"
            >
              Book Again
            </button>
            <button
              onClick={() => navigate("/")}
              className="px-6 py-3 border border-cafe-dark text-cafe-dark rounded-full hover:bg-cafe-dark hover:text-cafe-cream transition-colors"
            >
              Go Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      {step === "otp" && (
        <OtpModal
          email={form.guestEmail}
          purpose="booking"
          onVerified={handleOtpVerified}
          onClose={() => setStep("form")}
        />
      )}

      <div className="text-center mb-10">
        <p className="text-cafe-amber text-sm tracking-widest uppercase mb-2">Reserve Your Spot</p>
        <h1 className="font-display text-5xl text-cafe-dark">Book a Table</h1>
        <p className="text-gray-500 mt-3">
          Logged in as <span className="font-medium text-cafe-dark">{user?.name}</span>.
          Your details are pre-filled.
        </p>
      </div>

      <form onSubmit={handleSubmitForm} className="glass-panel rounded-3xl p-8 space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input name="guestName" value={form.guestName} onChange={handleChange} required className="input" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input name="guestEmail" type="email" value={form.guestEmail} onChange={handleChange} required className="input" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input name="guestPhone" value={form.guestPhone} onChange={handleChange} required placeholder="+91 98765 43210" className="input" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Party Size</label>
            <input name="partySize" type="number" min={1} max={20} value={form.partySize} onChange={handleChange} required className="input" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input name="date" type="date" value={form.date} onChange={handleChange} required min={new Date().toISOString().split("T")[0]} className="input" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Time Slot</label>
            <select name="time" value={form.time} onChange={handleChange} required className="input bg-white">
              <option value="">Select a time</option>
              {TIME_SLOTS.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Occasion</label>
          <div className="flex flex-wrap gap-2">
            {OCCASIONS.map((occ) => (
              <button type="button" key={occ} onClick={() => setForm((p) => ({ ...p, occasion: occ }))}
                className={`px-4 py-1.5 rounded-full text-sm capitalize transition-all ${form.occasion === occ ? "bg-cafe-dark text-cafe-cream" : "bg-gray-100 text-gray-600 hover:bg-cafe-amber/20"}`}>
                {occ}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Special Requests</label>
          <textarea name="specialRequests" value={form.specialRequests} onChange={handleChange} rows={3} placeholder="Dietary restrictions, seating preferences, allergies…" className="input resize-none" />
        </div>

        <button type="submit" disabled={loading} className="w-full py-3.5 bg-cafe-amber text-cafe-dark font-semibold rounded-xl hover:bg-amber-400 disabled:opacity-60 transition-colors text-lg">
          {loading ? "Sending OTP…" : "Verify & Reserve →"}
        </button>
        <p className="text-center text-xs text-gray-400">An OTP will be sent to your email to confirm this reservation.</p>
      </form>
    </div>
  );
}
