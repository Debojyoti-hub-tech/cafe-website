import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import FoodCard from "../components/FoodCard";
import OtpModal from "../components/OtpModal";
import LocationModal from "../components/LocationModal";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

const CATEGORIES = ["all","starters","mains","desserts","beverages","specials"];
const LOCATION_KEY = "cafe_delivery_location";

export default function Menu() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);

  // flow: null → "location" → "otp" → done
  const [flowStep, setFlowStep] = useState(null);
  const [orderLoading, setOrderLoading] = useState(false);
  const [deliveryLocation, setDeliveryLocation] = useState(null);

  useEffect(() => {
    axios.get("/api/food")
      .then(({ data }) => setFoods(data))
      .catch(() => toast.error("Could not load menu."))
      .finally(() => setLoading(false));

    const saved = localStorage.getItem(LOCATION_KEY);
    if (saved) setDeliveryLocation(JSON.parse(saved));
  }, []);

  const filtered = foods.filter((f) => {
    const matchCat = activeCategory === "all" || f.category === activeCategory;
    const matchSearch = f.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const addToCart = (food) => {
    if (!user) {
      toast("Please log in to order food", { icon: "🔒" });
      navigate("/login", { state: { from: "/menu" } });
      return;
    }
    setCart((prev) => {
      const ex = prev.find((i) => i._id === food._id);
      if (ex) return prev.map((i) => i._id === food._id ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { ...food, qty: 1 }];
    });
    toast.success(`${food.name} added!`);
  };

  const updateQty = (id, delta) =>
    setCart((prev) =>
      prev.map((i) => i._id === id ? { ...i, qty: Math.max(0, i.qty + delta) } : i).filter((i) => i.qty > 0)
    );

  const cartTotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const cartCount = cart.reduce((s, i) => s + i.qty, 0);

  // Step 1: start checkout — show location modal
  const handleCheckout = () => {
    if (!cart.length) return toast.error("Your cart is empty.");
    setFlowStep("location");
    setCartOpen(false);
  };

  // Step 2: location confirmed → send OTP
  const handleLocationConfirmed = async (location) => {
    setDeliveryLocation(location);
    setFlowStep(null);
    setOrderLoading(true);
    try {
      await axios.post("/api/otp/send", { email: user.email, purpose: "order" });
      toast.success("OTP sent to " + user.email);
      setFlowStep("otp");
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not send OTP.");
      setFlowStep(null);
    } finally {
      setOrderLoading(false);
    }
  };

  // Step 3: OTP verified → place order
  const handleOrderVerified = async () => {
    setFlowStep(null);
    try {
      const items = cart.map((i) => ({ food: i._id, name: i.name, price: i.price, quantity: i.qty }));
      await axios.post("/api/orders", {
        items,
        totalAmount: cartTotal,
        orderType: "delivery",
        deliveryAddress: deliveryLocation
          ? { street: deliveryLocation.label, city: "", pincode: "" }
          : undefined,
      });
      toast.success("🎉 Order placed successfully!");
      setCart([]);
    } catch (err) {
      toast.error(err.response?.data?.message || "Order failed.");
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      {/* Location modal */}
      {flowStep === "location" && (
        <LocationModal
          onConfirm={handleLocationConfirmed}
          onClose={() => setFlowStep(null)}
        />
      )}

      {/* OTP modal */}
      {flowStep === "otp" && (
        <OtpModal
          email={user?.email}
          purpose="order"
          onVerified={handleOrderVerified}
          onClose={() => setFlowStep(null)}
        />
      )}

      <div className="text-center mb-10">
        <p className="text-cafe-amber text-sm tracking-widest uppercase mb-2">What We Serve</p>
        <h1 className="font-display text-5xl text-cafe-dark mb-4">Our Menu</h1>
        <p className="text-gray-500 max-w-lg mx-auto">Made fresh every day with locally sourced ingredients and a whole lot of love.</p>
      </div>

      <div className="flex items-center gap-3 max-w-md mx-auto mb-8">
        <input type="text" placeholder="Search dishes…" value={search} onChange={(e) => setSearch(e.target.value)}
          className="flex-1 px-5 py-3 border border-gray-200 rounded-full shadow-sm focus:outline-none focus:border-cafe-amber focus:ring-2 focus:ring-cafe-amber/30 transition" />
        {user && (
          <button onClick={() => setCartOpen(true)} className="relative px-4 py-3 bg-cafe-dark text-cafe-cream rounded-full hover:bg-cafe-brown transition-colors text-sm font-medium flex-shrink-0">
            🛒
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-cafe-amber text-cafe-dark text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">{cartCount}</span>
            )}
          </button>
        )}
      </div>

      <div className="flex flex-wrap justify-center gap-2 mb-10">
        {CATEGORIES.map((cat) => (
          <button key={cat} onClick={() => setActiveCategory(cat)}
            className={`px-5 py-2 rounded-full text-sm font-medium capitalize transition-all ${activeCategory === cat ? "bg-cafe-dark text-cafe-cream shadow" : "bg-gray-100 text-gray-600 hover:bg-cafe-amber/20 hover:text-cafe-dark"}`}>
            {cat}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-72 bg-gray-100 rounded-2xl animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <div className="text-5xl mb-4">🍽️</div>
          <p className="text-lg">No dishes found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {filtered.map((food) => <FoodCard key={food._id} food={food} onOrder={addToCart} />)}
        </div>
      )}

      {/* Cart Sidebar */}
      {cartOpen && (
        <div className="fixed inset-0 z-40 flex">
          <div className="absolute inset-0 bg-black/40" onClick={() => setCartOpen(false)} />
          <div className="relative ml-auto bg-white w-full max-w-sm h-full shadow-2xl flex flex-col">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h2 className="font-display text-2xl text-cafe-dark">Your Order</h2>
              <button onClick={() => setCartOpen(false)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {cart.length === 0 ? (
                <div className="text-center text-gray-400 py-12">
                  <div className="text-5xl mb-3">🛒</div>
                  <p>Your cart is empty</p>
                </div>
              ) : (
                cart.map((item) => (
                  <div key={item._id} className="flex items-center gap-3 bg-gray-50 rounded-xl p-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-cafe-dark text-sm truncate">{item.name}</p>
                      <p className="text-cafe-amber text-sm font-semibold">₹{item.price} × {item.qty}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => updateQty(item._id, -1)} className="w-7 h-7 rounded-full bg-gray-200 hover:bg-red-100 text-sm font-bold flex items-center justify-center">−</button>
                      <span className="w-5 text-center font-semibold text-sm">{item.qty}</span>
                      <button onClick={() => updateQty(item._id, 1)} className="w-7 h-7 rounded-full bg-gray-200 hover:bg-green-100 text-sm font-bold flex items-center justify-center">+</button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {cart.length > 0 && (
              <div className="p-5 border-t border-gray-100">
                {/* Saved location preview */}
                {deliveryLocation && (
                  <div className="mb-3 flex items-start gap-2 bg-green-50 border border-green-200 rounded-xl p-3 text-xs">
                    <span>📍</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-green-800">Deliver to:</p>
                      <p className="text-green-700 truncate">{deliveryLocation.label}</p>
                    </div>
                    <button onClick={() => setDeliveryLocation(null)} className="text-green-500 hover:text-green-700 flex-shrink-0">✎</button>
                  </div>
                )}
                <div className="flex justify-between mb-4 font-semibold text-cafe-dark">
                  <span>Total</span>
                  <span className="text-cafe-amber">₹{cartTotal}</span>
                </div>
                <button onClick={handleCheckout} disabled={orderLoading}
                  className="w-full py-3.5 bg-cafe-amber text-cafe-dark font-semibold rounded-xl hover:bg-amber-400 disabled:opacity-60 transition-colors">
                  {orderLoading ? "Processing…" : deliveryLocation ? "Verify & Place Order →" : "Set Location & Order →"}
                </button>
                <p className="text-center text-xs text-gray-400 mt-2">Location → OTP → Order confirmed</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
