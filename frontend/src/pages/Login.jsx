import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

export default function Login() {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const returnTo = location.state?.from || "/";

  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "", phone: "" });

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isRegister) {
        await register(form.name, form.email, form.password, form.phone);
        toast.success("Account created! Welcome to Café Lumière.");
      } else {
        await login(form.email, form.password);
        toast.success("Welcome back!");
      }
      navigate(returnTo, { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 bg-cafe-light">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="font-display text-3xl text-cafe-amber">☕ Café Lumière</Link>
          <h2 className="font-display text-3xl text-cafe-dark mt-4">
            {isRegister ? "Create Account" : "Welcome Back"}
          </h2>
          {returnTo !== "/" && (
            <p className="mt-2 text-sm text-cafe-amber bg-amber-50 border border-amber-200 rounded-full px-4 py-1.5 inline-block">
              🔒 Please sign in to continue
            </p>
          )}
        </div>

        <div className="bg-white shadow-xl rounded-3xl p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input name="name" value={form.name} onChange={handleChange} required placeholder="Your full name" className="input" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input name="phone" value={form.phone} onChange={handleChange} placeholder="+91 98765 43210" className="input" />
                </div>
              </>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input name="email" type="email" value={form.email} onChange={handleChange} required placeholder="you@email.com" className="input" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input name="password" type="password" value={form.password} onChange={handleChange} required minLength={6} placeholder="Min. 6 characters" className="input" />
            </div>
            <button type="submit" disabled={loading}
              className="w-full py-3 bg-cafe-amber text-cafe-dark font-semibold rounded-xl hover:bg-amber-400 disabled:opacity-60 transition-colors mt-2">
              {loading ? "Please wait…" : isRegister ? "Create Account" : "Sign In"}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            {isRegister ? "Already have an account?" : "Don't have an account?"}{" "}
            <button onClick={() => setIsRegister((v) => !v)} className="text-cafe-amber font-medium hover:underline">
              {isRegister ? "Sign In" : "Create one — it's free"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
