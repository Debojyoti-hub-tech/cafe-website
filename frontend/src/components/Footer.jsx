import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

const DEFAULT = {
  address: "12 Brew Lane, Kolkata 700001",
  phone: "+91 98765 43210",
  email: "hello@cafelumiere.in",
  hours: "Mon–Sun: 8am – 10pm",
  mapLink: "",
};

export default function Footer() {
  const [contact, setContact] = useState(DEFAULT);

  useEffect(() => {
    axios.get("/api/config/contact")
      .then(({ data }) => setContact({ ...DEFAULT, ...data }))
      .catch(() => {});
  }, []);

  return (
    <footer className="bg-cafe-dark/95 text-cafe-cream/70 py-10 mt-auto border-t border-cafe-cream/10">
      <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Brand */}
        <div>
          <h3 className="font-display text-cafe-amber text-xl mb-2">☕ Café Lumière</h3>
          <p className="text-sm leading-relaxed">
            A quiet corner for great coffee, warm food, and good conversations.
          </p>
        </div>

        {/* Links */}
        <div>
          <h4 className="text-cafe-cream font-semibold mb-3">Quick Links</h4>
          <ul className="space-y-2 text-sm">
            {[
              ["/", "Home"],
              ["/menu", "Menu"],
              ["/booking", "Reserve a Table"],
              ["/login", "Login"],
            ].map(([path, label]) => (
              <li key={path}>
                <Link to={path} className="hover:text-cafe-amber transition-colors">{label}</Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact — live from admin */}
        <div>
          <h4 className="text-cafe-cream font-semibold mb-3">Visit Us</h4>
          <ul className="text-sm space-y-1.5">
            <li>📍 {contact.address}</li>
            <li>📞 {contact.phone}</li>
            <li>✉️ {contact.email}</li>
            <li>🕐 {contact.hours}</li>
            {contact.mapLink && (
              <li className="pt-1">
                <a href={contact.mapLink} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-cafe-amber hover:underline font-medium text-xs mt-1">
                  🗺️ Open in Maps ↗
                </a>
              </li>
            )}
          </ul>
        </div>
      </div>

      <div className="text-center text-xs text-cafe-cream/40 mt-8 border-t border-cafe-brown pt-4">
        © {new Date().getFullYear()} Café Lumière. All rights reserved.
      </div>
    </footer>
  );
}
