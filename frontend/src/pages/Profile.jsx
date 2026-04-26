import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";

export default function Profile() {
  const { user, updateUser } = useAuth();

  const [nameForm, setNameForm] = useState({ name: user?.name || "" });
  const [passForm, setPassForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [nameLoading, setNameLoading] = useState(false);
  const [passLoading, setPassLoading] = useState(false);

  const handleNameSubmit = async (e) => {
    e.preventDefault();
    if (!nameForm.name.trim()) return toast.error("Name cannot be empty.");
    setNameLoading(true);
    try {
      const { data } = await axios.put("/api/auth/profile", { name: nameForm.name });
      updateUser(data.user);
      toast.success("Name updated successfully!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed.");
    } finally {
      setNameLoading(false);
    }
  };

  const handlePassSubmit = async (e) => {
    e.preventDefault();
    if (passForm.newPassword !== passForm.confirmPassword) {
      return toast.error("New passwords do not match.");
    }
    if (passForm.newPassword.length < 6) {
      return toast.error("Password must be at least 6 characters.");
    }
    setPassLoading(true);
    try {
      await axios.put("/api/auth/profile", {
        currentPassword: passForm.currentPassword,
        newPassword: passForm.newPassword,
      });
      toast.success("Password changed successfully!");
      setPassForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      toast.error(err.response?.data?.message || "Password update failed.");
    } finally {
      setPassLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="w-20 h-20 rounded-full bg-cafe-amber/20 flex items-center justify-center text-4xl mx-auto mb-4">
          {user?.name?.charAt(0).toUpperCase()}
        </div>
        <h1 className="font-display text-4xl text-cafe-dark">{user?.name}</h1>
        <p className="text-gray-500 text-sm mt-1">{user?.email}</p>
        {user?.role === "admin" && (
          <span className="mt-2 inline-block bg-cafe-amber text-cafe-dark text-xs font-bold px-3 py-1 rounded-full">
            ⚡ Admin
          </span>
        )}
      </div>

      {/* Account Info Card */}
      <div className="bg-white rounded-3xl shadow-lg p-6 mb-6">
        <h2 className="font-display text-xl text-cafe-dark mb-4 flex items-center gap-2">
          <span>👤</span> Account Info
        </h2>
        <div className="space-y-3 text-sm text-gray-600">
          <div className="flex justify-between py-2 border-b border-gray-50">
            <span className="text-gray-400">Email</span>
            <span className="font-medium text-cafe-dark">{user?.email}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-50">
            <span className="text-gray-400">Phone</span>
            <span className="font-medium text-cafe-dark">{user?.phone || "Not set"}</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-gray-400">Role</span>
            <span className="font-medium text-cafe-dark capitalize">{user?.role}</span>
          </div>
        </div>
        <p className="text-xs text-gray-400 mt-4">
          * Email and phone cannot be changed here. Contact support if needed.
        </p>
      </div>

      {/* Change Name */}
      <div className="bg-white rounded-3xl shadow-lg p-6 mb-6">
        <h2 className="font-display text-xl text-cafe-dark mb-4 flex items-center gap-2">
          <span>✏️</span> Change Name
        </h2>
        <form onSubmit={handleNameSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Display Name</label>
            <input
              type="text"
              value={nameForm.name}
              onChange={(e) => setNameForm({ name: e.target.value })}
              required
              placeholder="Your full name"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-cafe-amber focus:ring-2 focus:ring-cafe-amber/20 transition"
            />
          </div>
          <button
            type="submit"
            disabled={nameLoading || nameForm.name === user?.name}
            className="px-8 py-2.5 bg-cafe-amber text-cafe-dark font-semibold rounded-xl hover:bg-amber-400 disabled:opacity-50 transition-colors"
          >
            {nameLoading ? "Saving…" : "Save Name"}
          </button>
        </form>
      </div>

      {/* Change Password */}
      <div className="bg-white rounded-3xl shadow-lg p-6">
        <h2 className="font-display text-xl text-cafe-dark mb-4 flex items-center gap-2">
          <span>🔑</span> Change Password
        </h2>
        <form onSubmit={handlePassSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
            <input
              type="password"
              value={passForm.currentPassword}
              onChange={(e) => setPassForm((p) => ({ ...p, currentPassword: e.target.value }))}
              required
              placeholder="Your current password"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-cafe-amber focus:ring-2 focus:ring-cafe-amber/20 transition"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
            <input
              type="password"
              value={passForm.newPassword}
              onChange={(e) => setPassForm((p) => ({ ...p, newPassword: e.target.value }))}
              required
              minLength={6}
              placeholder="Min. 6 characters"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-cafe-amber focus:ring-2 focus:ring-cafe-amber/20 transition"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
            <input
              type="password"
              value={passForm.confirmPassword}
              onChange={(e) => setPassForm((p) => ({ ...p, confirmPassword: e.target.value }))}
              required
              placeholder="Repeat new password"
              className={`w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 transition ${
                passForm.confirmPassword && passForm.confirmPassword !== passForm.newPassword
                  ? "border-red-300 focus:border-red-400 focus:ring-red-100"
                  : "border-gray-200 focus:border-cafe-amber focus:ring-cafe-amber/20"
              }`}
            />
            {passForm.confirmPassword && passForm.confirmPassword !== passForm.newPassword && (
              <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
            )}
          </div>
          <button
            type="submit"
            disabled={passLoading}
            className="px-8 py-2.5 bg-cafe-dark text-cafe-cream font-semibold rounded-xl hover:bg-cafe-brown disabled:opacity-50 transition-colors"
          >
            {passLoading ? "Updating…" : "Update Password"}
          </button>
        </form>
      </div>
    </div>
  );
}
