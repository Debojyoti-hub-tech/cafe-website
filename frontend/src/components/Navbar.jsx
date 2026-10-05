import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setProfileOpen(false);
    navigate("/login");
  };

  const navLinks = [
    { to: "/", label: "Home" },
    { to: "/menu", label: "Menu" },
    { to: "/booking", label: "Reserve" },
    ...(isAdmin ? [{ to: "/admin", label: "Admin" }] : []),
  ];

  return (
    <nav className="sticky top-0 z-50 px-3 pt-3 md:px-5 md:pt-5">
      <div className="glass-dark text-cafe-cream max-w-7xl mx-auto rounded-2xl md:rounded-[1.35rem] shadow-2xl">
      <div className="max-w-6xl mx-auto px-4 py-3 md:py-3.5 flex items-center justify-between gap-4">
        <Link to="/" className="group flex items-center gap-2.5 min-w-0">
          <span className="w-10 h-10 rounded-xl bg-cafe-amber text-cafe-dark flex items-center justify-center text-xl shadow-[0_8px_18px_rgba(200,136,42,0.24)] group-hover:rotate-6 transition-transform">☕</span>
          <span className="min-w-0">
            <span className="block font-display text-xl md:text-2xl text-cafe-cream tracking-wide leading-none">Café <span className="text-cafe-amber">Lumière</span></span>
            <span className="hidden sm:block text-[9px] uppercase tracking-[0.28em] text-cafe-cream/45 mt-1">Future brewed daily</span>
          </span>
        </Link>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-1 rounded-xl bg-black/15 p-1 border border-white/5">
          {navLinks.map(({ to, label }) => (
            <NavLink key={to} to={to}
              className={({ isActive }) =>
                `relative px-4 py-2 rounded-lg text-sm font-medium transition-all ${isActive ? "bg-cafe-amber text-cafe-dark shadow-md" : "text-cafe-cream/70 hover:bg-white/10 hover:text-cafe-cream"}`
              }>{label}</NavLink>
          ))}
        </div>

        <div className="hidden md:flex items-center">
          {user ? (
            <div className="relative">
              <button onClick={() => setProfileOpen((v) => !v)}
                className="flex items-center gap-2.5 px-2 py-1.5 rounded-xl border border-white/10 bg-white/5 hover:border-cafe-amber/70 hover:bg-white/10 transition-all">
                <div className="w-8 h-8 rounded-lg bg-cafe-amber text-cafe-dark flex items-center justify-center text-xs font-bold">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm text-cafe-cream/90">{user.name.split(" ")[0]}</span>
                <span className={`text-xs text-cafe-cream/40 transition-transform ${profileOpen ? "rotate-180" : ""}`}>⌄</span>
              </button>

              {profileOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setProfileOpen(false)} />
                  <div className="absolute right-0 mt-2 w-52 glass-panel rounded-2xl shadow-xl py-2 z-20 text-cafe-dark">
                    <div className="px-4 py-3 border-b border-cafe-dark/10">
                      <p className="font-semibold text-cafe-dark text-sm">{user.name}</p>
                      <p className="text-xs text-gray-400 truncate">{user.email}</p>
                    </div>
                    <Link to="/profile" onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-cafe-cream transition-colors">
                      👤 My Profile
                    </Link>
                    <Link to="/my-orders" onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-cafe-cream transition-colors">
                      📦 My Orders & Bookings
                    </Link>
                    {isAdmin && (
                      <Link to="/admin" onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-cafe-cream transition-colors">
                        ⚡ Admin Panel
                      </Link>
                    )}
                    <div className="border-t border-cafe-dark/10 mt-1">
                      <button onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors">
                        🚪 Logout
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            <Link to="/login" className="text-sm px-5 py-2.5 bg-cafe-amber text-cafe-dark rounded-xl font-semibold hover:bg-amber-400 hover:-translate-y-0.5 shadow-md transition-all">
              Enter Café
            </Link>
          )}
        </div>

        <button aria-label="Toggle menu" className="md:hidden w-10 h-10 rounded-xl border border-white/10 bg-white/5 text-cafe-cream text-xl flex items-center justify-center" onClick={() => setMenuOpen((v) => !v)}>
          {menuOpen ? "✕" : "☰"}
        </button>
      </div>

      {menuOpen && (
        <div className="md:hidden border-t border-white/10 px-4 pb-4 pt-3 flex flex-col gap-1">
          {navLinks.map(({ to, label }) => (
            <NavLink key={to} to={to} onClick={() => setMenuOpen(false)}
              className={({ isActive }) => `rounded-xl px-4 py-3 text-sm ${isActive ? "bg-cafe-amber text-cafe-dark font-semibold" : "text-cafe-cream/75 hover:bg-white/10 hover:text-cafe-cream"}`}>{label}</NavLink>
          ))}
          {user ? (
            <>
              <Link to="/profile" onClick={() => setMenuOpen(false)} className="text-cafe-cream/75 hover:text-cafe-amber px-4 py-3">👤 My Profile</Link>
              <Link to="/my-orders" onClick={() => setMenuOpen(false)} className="text-cafe-cream/75 hover:text-cafe-amber px-4 py-3">📦 My Orders & Bookings</Link>
              <button onClick={() => { logout(); setMenuOpen(false); navigate("/login"); }}
                className="text-left text-red-400 px-4 py-3">🚪 Logout</button>
            </>
          ) : (
            <Link to="/login" onClick={() => setMenuOpen(false)} className="text-cafe-amber px-4 py-3 font-semibold">Login / Register</Link>
          )}
        </div>
      )}
      </div>
    </nav>
  );
}
