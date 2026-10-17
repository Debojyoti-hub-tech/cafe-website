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
    <nav className="glass-dark text-cafe-cream sticky top-0 z-50 shadow-lg">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/" className="font-display text-2xl text-cafe-amber tracking-wide">☕ Café Lumière</Link>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-6">
          {navLinks.map(({ to, label }) => (
            <NavLink key={to} to={to}
              className={({ isActive }) =>
                `text-sm font-medium transition-colors hover:text-cafe-amber ${isActive ? "text-cafe-amber border-b border-cafe-amber pb-0.5" : "text-cafe-cream"}`
              }>{label}</NavLink>
          ))}

          {user ? (
            <div className="relative">
              <button onClick={() => setProfileOpen((v) => !v)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-cafe-cream/20 hover:border-cafe-amber transition-colors">
                <div className="w-6 h-6 rounded-full bg-cafe-amber text-cafe-dark flex items-center justify-center text-xs font-bold">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm text-cafe-cream/90">{user.name.split(" ")[0]}</span>
                <span className="text-xs text-cafe-cream/40">▾</span>
              </button>

              {profileOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setProfileOpen(false)} />
                  <div className="absolute right-0 mt-2 w-52 glass-panel rounded-2xl shadow-xl py-2 z-20 text-cafe-dark">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="font-semibold text-cafe-dark text-sm">{user.name}</p>
                      <p className="text-xs text-gray-400 truncate">{user.email}</p>
                    </div>
                    <Link to="/profile" onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-cafe-cream transition-colors">
                      👤 My Profile
                    </Link>
                    <Link to="/my-orders" onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-cafe-cream transition-colors">
                      📦 My Orders & Bookings
                    </Link>
                    {isAdmin && (
                      <Link to="/admin" onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-cafe-cream transition-colors">
                        ⚡ Admin Panel
                      </Link>
                    )}
                    <div className="border-t border-gray-100 mt-1">
                      <button onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors">
                        🚪 Logout
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            <Link to="/login" className="text-sm px-4 py-1.5 bg-cafe-amber text-cafe-dark rounded-full font-medium hover:bg-amber-400 transition-colors">
              Login
            </Link>
          )}
        </div>

        <button className="md:hidden text-cafe-cream text-xl" onClick={() => setMenuOpen((v) => !v)}>
          {menuOpen ? "✕" : "☰"}
        </button>
      </div>

      {menuOpen && (
        <div className="md:hidden bg-cafe-dark/95 border-t border-cafe-brown px-4 pb-4 flex flex-col gap-3">
          {navLinks.map(({ to, label }) => (
            <NavLink key={to} to={to} onClick={() => setMenuOpen(false)}
              className="text-cafe-cream hover:text-cafe-amber py-1">{label}</NavLink>
          ))}
          {user ? (
            <>
              <Link to="/profile" onClick={() => setMenuOpen(false)} className="text-cafe-cream hover:text-cafe-amber py-1">👤 My Profile</Link>
              <Link to="/my-orders" onClick={() => setMenuOpen(false)} className="text-cafe-cream hover:text-cafe-amber py-1">📦 My Orders & Bookings</Link>
              <button onClick={() => { logout(); setMenuOpen(false); navigate("/login"); }}
                className="text-left text-red-400 py-1">🚪 Logout</button>
            </>
          ) : (
            <Link to="/login" onClick={() => setMenuOpen(false)} className="text-cafe-amber py-1">Login / Register</Link>
          )}
        </div>
      )}
    </nav>
  );
}