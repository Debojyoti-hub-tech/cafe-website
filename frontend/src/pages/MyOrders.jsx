import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import OtpModal from "../components/OtpModal";
import { useAuth } from "../context/AuthContext";

const ORDER_STATUS_COLORS = {
  pending: "bg-yellow-100 text-yellow-700",
  confirmed: "bg-blue-100 text-blue-700",
  preparing: "bg-orange-100 text-orange-700",
  ready: "bg-purple-100 text-purple-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

const BOOKING_STATUS_COLORS = {
  pending: "bg-yellow-100 text-yellow-700",
  confirmed: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
  completed: "bg-gray-100 text-gray-500",
};

const TIME_SLOTS = [
  "08:00 AM","09:00 AM","10:00 AM","11:00 AM",
  "12:00 PM","01:00 PM","02:00 PM","03:00 PM",
  "06:00 PM","07:00 PM","08:00 PM","09:00 PM",
];

export default function MyOrders() {
  const { user } = useAuth();
  const [tab, setTab] = useState("orders");
  const [orders, setOrders] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Reschedule state
  const [rescheduleTarget, setRescheduleTarget] = useState(null); // booking object
  const [rescheduleForm, setRescheduleForm] = useState({ date: "", time: "" });
  const [otpStep, setOtpStep] = useState(false);
  const [pendingReschedule, setPendingReschedule] = useState(null);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [o, b] = await Promise.all([
        axios.get("/api/orders/my"),
        axios.get("/api/bookings/my"),
      ]);
      setOrders(o.data);
      setBookings(b.data);
    } catch {
      toast.error("Could not load your data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const cancelOrder = async (id) => {
    if (!confirm("Cancel this order?")) return;
    try {
      const { data } = await axios.put(`/api/orders/${id}/cancel`);
      setOrders((prev) => prev.map((o) => o._id === id ? data : o));
      toast.success("Order cancelled.");
    } catch (err) {
      toast.error(err.response?.data?.message || "Cannot cancel.");
    }
  };

  const cancelBooking = async (id) => {
    if (!confirm("Cancel this booking?")) return;
    try {
      const { data } = await axios.put(`/api/bookings/${id}`, { status: "cancelled" });
      setBookings((prev) => prev.map((b) => b._id === id ? data : b));
      toast.success("Booking cancelled.");
    } catch (err) {
      toast.error(err.response?.data?.message || "Cannot cancel.");
    }
  };

  // Reschedule: open form
  const startReschedule = (booking) => {
    setRescheduleTarget(booking);
    setRescheduleForm({ date: "", time: "" });
  };

  // Reschedule: submit form → send OTP
  const handleRescheduleSubmit = async (e) => {
    e.preventDefault();
    if (!rescheduleForm.date || !rescheduleForm.time) return toast.error("Pick a date and time.");
    setPendingReschedule({ ...rescheduleForm });
    try {
      await axios.post("/api/otp/send", { email: user.email, purpose: "booking" });
      toast.success("OTP sent for verification.");
      setOtpStep(true);
    } catch {
      toast.error("Could not send OTP.");
    }
  };

  // Reschedule: OTP verified → apply
  const handleRescheduleVerified = async () => {
    setOtpStep(false);
    try {
      const { data } = await axios.put(`/api/bookings/${rescheduleTarget._id}`, {
        date: pendingReschedule.date,
        time: pendingReschedule.time,
        status: "pending", // reset to pending after reschedule
      });
      setBookings((prev) => prev.map((b) => b._id === data._id ? data : b));
      toast.success("Booking rescheduled!");
      setRescheduleTarget(null);
    } catch (err) {
      toast.error(err.response?.data?.message || "Reschedule failed.");
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      {otpStep && (
        <OtpModal
          email={user?.email}
          purpose="booking"
          onVerified={handleRescheduleVerified}
          onClose={() => setOtpStep(false)}
        />
      )}

      <div className="text-center mb-8">
        <h1 className="font-display text-4xl text-cafe-dark">My Activity</h1>
        <p className="text-gray-500 text-sm mt-1">Track and manage your orders and reservations</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200 mb-8">
        {[["orders", "📦 My Orders"], ["bookings", "📅 My Bookings"]].map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)}
            className={`px-6 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${tab === key ? "border-cafe-amber text-cafe-dark" : "border-transparent text-gray-500 hover:text-cafe-dark"}`}>
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-28 bg-gray-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : (
        <>
          {/* ── ORDERS ── */}
          {tab === "orders" && (
            <div className="space-y-4">
              {orders.length === 0 ? (
                <div className="text-center py-16 text-gray-400">
                  <div className="text-5xl mb-3">📦</div>
                  <p>No orders yet. Go explore the menu!</p>
                </div>
              ) : (
                orders.map((order) => (
                  <div key={order._id} className="bg-white rounded-2xl shadow p-5">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div>
                        <p className="font-semibold text-cafe-dark text-sm">
                          Order #{order._id.slice(-6).toUpperCase()}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {new Date(order.createdAt).toLocaleString()} · {order.orderType}
                        </p>
                      </div>
                      <span className={`text-xs px-3 py-1 rounded-full font-medium capitalize flex-shrink-0 ${ORDER_STATUS_COLORS[order.status] || "bg-gray-100 text-gray-600"}`}>
                        {order.status}
                      </span>
                    </div>

                    {/* Items */}
                    <div className="space-y-1 mb-3">
                      {order.items?.map((item, i) => (
                        <div key={i} className="flex justify-between text-sm text-gray-600">
                          <span>{item.name} × {item.quantity}</span>
                          <span>₹{item.price * item.quantity}</span>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center justify-between border-t border-gray-100 pt-3">
                      <span className="font-semibold text-cafe-dark">Total: <span className="text-cafe-amber">₹{order.totalAmount}</span></span>
                      {["pending", "confirmed"].includes(order.status) && (
                        <button onClick={() => cancelOrder(order._id)}
                          className="text-xs text-red-500 hover:text-red-700 border border-red-200 hover:border-red-400 px-3 py-1.5 rounded-lg transition-colors">
                          Cancel Order
                        </button>
                      )}
                    </div>

                    {/* Delivery location */}
                    {order.deliveryAddress?.street && (
                      <p className="text-xs text-gray-400 mt-2">📍 {order.deliveryAddress.street}</p>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {/* ── BOOKINGS ── */}
          {tab === "bookings" && (
            <div className="space-y-4">
              {bookings.length === 0 ? (
                <div className="text-center py-16 text-gray-400">
                  <div className="text-5xl mb-3">📅</div>
                  <p>No bookings yet. Reserve a table!</p>
                </div>
              ) : (
                bookings.map((b) => (
                  <div key={b._id} className="bg-white rounded-2xl shadow p-5">
                    {/* Reschedule form inline */}
                    {rescheduleTarget?._id === b._id ? (
                      <form onSubmit={handleRescheduleSubmit} className="space-y-3">
                        <p className="font-semibold text-cafe-dark mb-2">📅 Reschedule Booking</p>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs text-gray-500 mb-1">New Date</label>
                            <input type="date" value={rescheduleForm.date}
                              min={new Date().toISOString().split("T")[0]}
                              onChange={(e) => setRescheduleForm((p) => ({ ...p, date: e.target.value }))}
                              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-cafe-amber" />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-500 mb-1">New Time</label>
                            <select value={rescheduleForm.time}
                              onChange={(e) => setRescheduleForm((p) => ({ ...p, time: e.target.value }))}
                              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-cafe-amber bg-white">
                              <option value="">Select</option>
                              {TIME_SLOTS.map((t) => <option key={t} value={t}>{t}</option>)}
                            </select>
                          </div>
                        </div>
                        <p className="text-xs text-gray-400">An OTP will be sent to verify the change.</p>
                        <div className="flex gap-2">
                          <button type="submit" className="px-5 py-2 bg-cafe-amber text-cafe-dark font-semibold rounded-xl text-sm hover:bg-amber-400 transition-colors">
                            Send OTP & Confirm
                          </button>
                          <button type="button" onClick={() => setRescheduleTarget(null)}
                            className="px-4 py-2 border border-gray-300 text-gray-600 rounded-xl text-sm hover:bg-gray-50 transition-colors">
                            Cancel
                          </button>
                        </div>
                      </form>
                    ) : (
                      <>
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <div>
                            <p className="font-semibold text-cafe-dark">{b.guestName}</p>
                            <p className="text-sm text-gray-500 mt-0.5">
                              📅 {new Date(b.date).toLocaleDateString()} at {b.time} · 👥 {b.partySize} guests
                            </p>
                            <p className="text-xs text-gray-400 mt-0.5 capitalize">🎉 {b.occasion}</p>
                            {b.specialRequests && (
                              <p className="text-xs text-gray-400 mt-0.5 italic">"{b.specialRequests}"</p>
                            )}
                          </div>
                          <span className={`text-xs px-3 py-1 rounded-full font-medium capitalize flex-shrink-0 ${BOOKING_STATUS_COLORS[b.status] || "bg-gray-100 text-gray-600"}`}>
                            {b.status}
                          </span>
                        </div>

                        {["pending", "confirmed"].includes(b.status) && (
                          <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
                            <button onClick={() => startReschedule(b)}
                              className="text-xs text-cafe-amber border border-amber-300 hover:border-cafe-amber px-3 py-1.5 rounded-lg transition-colors font-medium">
                              📅 Reschedule
                            </button>
                            <button onClick={() => cancelBooking(b._id)}
                              className="text-xs text-red-500 border border-red-200 hover:border-red-400 px-3 py-1.5 rounded-lg transition-colors">
                              Cancel
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
