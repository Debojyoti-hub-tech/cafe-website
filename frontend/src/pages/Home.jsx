import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import FoodCard from "../components/FoodCard";

export default function Home() {
  const [featured, setFeatured] = useState([]);

  useEffect(() => {
    axios
      .get("/api/food?featured=true")
      .then(({ data }) => setFeatured(data.slice(0, 3)))
      .catch(() => {});
  }, []);

  return (
    <div>
      {/* Hero */}
      <section
        className="relative min-h-[88vh] flex items-center justify-center bg-cafe-dark text-cafe-cream overflow-hidden"
        style={{
          backgroundImage:
            "linear-gradient(to bottom right, #1a0f0a 60%, #3d1f10)",
        }}
      >
        {/* Decorative circles */}
        <div className="absolute top-10 right-10 w-72 h-72 rounded-full bg-cafe-amber/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full bg-cafe-brown/20 blur-3xl pointer-events-none" />

        <div className="relative z-10 text-center px-5 py-12 max-w-3xl mx-auto glass-dark rounded-[2rem]">
          <p className="text-cafe-amber text-sm tracking-[0.3em] uppercase mb-4 font-body">
            Welcome to
          </p>
          <h1 className="font-display text-6xl md:text-8xl font-bold leading-tight mb-6">
            Café <span className="text-cafe-amber">Lumière</span>
          </h1>
          <p className="text-cafe-cream/70 text-lg md:text-xl mb-10 leading-relaxed">
            Where every cup tells a story. Artisan coffee, soulful food,
            and an atmosphere that feels like home.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/menu"
              className="px-8 py-3 bg-cafe-amber text-cafe-dark font-semibold rounded-full hover:bg-amber-400 transition-colors text-lg shadow-[0_10px_25px_rgba(200,136,42,0.3)]"
            >
              Explore Menu
            </Link>
            <Link
              to="/booking"
              className="px-8 py-3 border border-cafe-cream/40 text-cafe-cream rounded-full hover:border-cafe-amber hover:text-cafe-amber transition-colors text-lg bg-cafe-cream/5"
            >
              Reserve a Table
            </Link>
          </div>
        </div>
      </section>

      {/* Features Strip */}
      <section className="bg-cafe-amber/90 text-cafe-dark py-6 shadow-[0_12px_35px_rgba(107,58,42,0.15)]">
        <div className="max-w-5xl mx-auto px-4 flex flex-wrap justify-center gap-8 text-center font-medium">
          {[
            ["☕", "Artisan Coffee"],
            ["🍽️", "Fresh Daily Menu"],
            ["📅", "Easy Reservations"],
            ["🌿", "Organic Ingredients"],
          ].map(([icon, label]) => (
            <div key={label} className="flex items-center gap-2">
              <span className="text-2xl">{icon}</span>
              <span>{label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Items */}
      {featured.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 py-16">
          <div className="text-center mb-10">
            <p className="text-cafe-amber text-sm tracking-widest uppercase mb-2">
              Chef's Pick
            </p>
            <h2 className="font-display text-4xl text-cafe-dark">
              Featured Dishes
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {featured.map((food) => (
              <FoodCard key={food._id} food={food} />
            ))}
          </div>
          <div className="text-center mt-8">
            <Link
              to="/menu"
              className="inline-block px-8 py-3 bg-cafe-dark text-cafe-cream rounded-full hover:bg-cafe-brown transition-colors font-medium"
            >
              View Full Menu →
            </Link>
          </div>
        </section>
      )}

      {/* CTA Banner */}
      <section className="bg-cafe-brown/95 text-cafe-cream text-center py-14 px-4 border-y border-cafe-cream/10">
        <h2 className="font-display text-4xl mb-4">
          Planning a Special Evening?
        </h2>
        <p className="text-cafe-cream/70 mb-7 max-w-xl mx-auto">
          Book a table for your birthday, anniversary, or a business lunch.
          We'll make it memorable.
        </p>
        <Link
          to="/booking"
          className="inline-block px-10 py-3 bg-cafe-amber text-cafe-dark font-semibold rounded-full hover:bg-amber-300 transition-colors text-lg"
        >
          Book Your Table
        </Link>
      </section>
    </div>
  );
}
