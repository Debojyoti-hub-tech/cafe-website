import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

const DEFAULT_CONTACT = {
  address: "12 Brew Lane, Kolkata 700001",
  phone: "+91 98765 43210",
  email: "hello@cafelumiere.in",
  hours: "Mon–Sun: 8am – 10pm",
  mapLink: "",
};

function ContactSettings() {
  const [form, setForm] = useState(DEFAULT_CONTACT);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    axios.get("/api/config/contact")
      .then(({ data }) => setForm({ ...DEFAULT_CONTACT, ...data }))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await axios.put("/api/config/contact", form);
      toast.success("Contact details updated!");
    } catch {
      toast.error("Save failed.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="py-12 text-center text-gray-400">Loading…</div>;

  return (
    <div className="max-w-xl">
      <h2 className="font-display text-2xl text-cafe-dark mb-6">Contact &amp; Visit Us Details</h2>
      <form onSubmit={handleSave} className="space-y-4">
        {[
          { label: "📍 Address", name: "address", placeholder: "12 Brew Lane, Kolkata 700001" },
          { label: "📞 Phone", name: "phone", placeholder: "+91 98765 43210" },
          { label: "✉️ Email", name: "email", placeholder: "hello@cafelumiere.in" },
          { label: "🕐 Opening Hours", name: "hours", placeholder: "Mon–Sun: 8am – 10pm" },
        ].map(({ label, name, placeholder }) => (
          <div key={name}>
            <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
            <input
              value={form[name]}
              onChange={(e) => setForm((p) => ({ ...p, [name]: e.target.value }))}
              placeholder={placeholder}
              className="input"
            />
          </div>
        ))}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">🗺️ Google Maps / Location Link</label>
          <input
            value={form.mapLink}
            onChange={(e) => setForm((p) => ({ ...p, mapLink: e.target.value }))}
            placeholder="https://maps.google.com/..."
            className="input"
          />
          <p className="text-xs text-gray-400 mt-1">Paste any Google Maps, Google My Business, or Waze link. It will appear as a button in the footer.</p>
        </div>
        {form.mapLink && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-sm">
            <p className="text-gray-600 mb-1">Preview:</p>
            <a href={form.mapLink} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-cafe-amber font-medium hover:underline">
              🗺️ Open Location in Maps ↗
            </a>
          </div>
        )}
        <button type="submit" disabled={saving}
          className="px-8 py-2.5 bg-cafe-amber text-cafe-dark font-semibold rounded-xl hover:bg-amber-400 disabled:opacity-60 transition-colors">
          {saving ? "Saving…" : "Save Changes"}
        </button>
      </form>
    </div>
  );
}

const TABS = ["Overview", "Orders", "Bookings", "Menu", "Settings"];
const CATEGORIES = ["starters", "mains", "desserts", "beverages", "specials"];

const STATUS_COLORS = {
  pending: "bg-yellow-100 text-yellow-700",
  confirmed: "bg-blue-100 text-blue-700",
  preparing: "bg-orange-100 text-orange-700",
  ready: "bg-purple-100 text-purple-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
  completed: "bg-green-100 text-green-700",
};

const EMPTY_FOOD = {
  name: "", description: "", price: "", category: "starters",
  isVeg: false, isFeatured: false, isAvailable: true,
  preparationTime: 15, image: "", tags: "",
};

export default function AdminPanel() {
  const [tab, setTab] = useState("Overview");
  const [orders, setOrders] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(false);

  const [showAddForm, setShowAddForm] = useState(false);
  const [foodForm, setFoodForm] = useState(EMPTY_FOOD);
  const [addLoading, setAddLoading] = useState(false);
  const [menuCategory, setMenuCategory] = useState("all");

  const fetchData = async () => {
    setLoading(true);
    try {
      const [o, b, f] = await Promise.all([
        axios.get("/api/orders"),
        axios.get("/api/bookings"),
        axios.get("/api/food"),
      ]);
      setOrders(o.data);
      setBookings(b.data);
      setFoods(f.data);
    } catch {
      toast.error("Failed to load admin data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const updateOrderStatus = async (id, status) => {
    try {
      await axios.put(`/api/orders/${id}/status`, { status });
      setOrders((prev) => prev.map((o) => o._id === id ? { ...o, status } : o));
      toast.success("Order updated.");
    } catch { toast.error("Update failed."); }
  };

  const updateBookingStatus = async (id, status) => {
    try {
      await axios.put(`/api/bookings/${id}`, { status });
      setBookings((prev) => prev.map((b) => b._id === id ? { ...b, status } : b));
      toast.success("Booking updated.");
    } catch { toast.error("Update failed."); }
  };

  const toggleAvailability = async (food) => {
    try {
      const { data } = await axios.put(`/api/food/${food._id}`, { isAvailable: !food.isAvailable });
      setFoods((prev) => prev.map((f) => f._id === food._id ? data : f));
      toast.success(`Marked as ${!food.isAvailable ? "available" : "unavailable"}.`);
    } catch { toast.error("Update failed."); }
  };

  const deleteFood = async (id) => {
    if (!confirm("Delete this food item?")) return;
    try {
      await axios.delete(`/api/food/${id}`);
      setFoods((prev) => prev.filter((f) => f._id !== id));
      toast.success("Item deleted.");
    } catch { toast.error("Delete failed."); }
  };

  const handleFoodFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFoodForm((p) => ({ ...p, [name]: type === "checkbox" ? checked : value }));
  };

  const handleAddFood = async (e) => {
    e.preventDefault();
    setAddLoading(true);
    try {
      const payload = {
        ...foodForm,
        price: Number(foodForm.price),
        preparationTime: Number(foodForm.preparationTime),
        tags: foodForm.tags ? foodForm.tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
      };
      const { data } = await axios.post("/api/food", payload);
      setFoods((prev) => [data, ...prev]);
      toast.success(`"${data.name}" added to menu!`);
      setFoodForm(EMPTY_FOOD);
      setShowAddForm(false);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add item.");
    } finally {
      setAddLoading(false);
    }
  };

  const stats = [
    { label: "Total Orders", value: orders.length, icon: "📦", color: "bg-blue-50" },
    { label: "Bookings", value: bookings.length, icon: "📅", color: "bg-purple-50" },
    { label: "Menu Items", value: foods.length, icon: "🍽️", color: "bg-amber-50" },
    { label: "Revenue", value: `₹${orders.reduce((s, o) => s + (o.totalAmount || 0), 0).toLocaleString()}`, icon: "💰", color: "bg-green-50" },
  ];

  const filteredFoods = menuCategory === "all" ? foods : foods.filter((f) => f.category === menuCategory);
  const pendingOrders = orders.filter((o) => o.status === "pending").length;

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-4xl text-cafe-dark">Admin Panel</h1>
          <p className="text-gray-500 text-sm mt-1">Manage your café operations</p>
        </div>
        <button onClick={fetchData} className="px-5 py-2 bg-cafe-amber text-cafe-dark font-medium rounded-full hover:bg-amber-400 transition-colors text-sm">
          ↻ Refresh
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200 mb-8">
        {TABS.map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-5 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${tab === t ? "border-cafe-amber text-cafe-dark" : "border-transparent text-gray-500 hover:text-cafe-dark"}`}>
            {t}
            {t === "Orders" && pendingOrders > 0 && (
              <span className="ml-1.5 bg-red-100 text-red-600 text-xs px-1.5 py-0.5 rounded-full">{pendingOrders}</span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-400">Loading…</div>
      ) : (
        <>
          {/* ── OVERVIEW ── */}
          {tab === "Overview" && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {stats.map((s) => (
                <div key={s.label} className={`${s.color} rounded-2xl p-6 text-center`}>
                  <div className="text-4xl mb-2">{s.icon}</div>
                  <div className="font-display text-3xl text-cafe-dark">{s.value}</div>
                  <div className="text-gray-500 text-sm mt-1">{s.label}</div>
                </div>
              ))}
            </div>
          )}

          {/* ── ORDERS ── */}
          {tab === "Orders" && (
            <div className="space-y-3">
              {orders.length === 0 ? (
                <p className="text-gray-400 text-center py-12">No orders yet.</p>
              ) : (
                orders.map((order) => (
                  <div key={order._id} className="glass-panel rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="flex-1">
                      <p className="font-semibold text-cafe-dark">
                        {order.user?.name || "Guest"}{" "}
                        <span className="text-gray-400 text-xs">({order.user?.email})</span>
                      </p>
                      <p className="text-sm text-gray-500 mt-0.5">
                        {order.items?.length} item(s) · ₹{order.totalAmount} · {order.orderType}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">{new Date(order.createdAt).toLocaleString()}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-xs px-3 py-1 rounded-full font-medium capitalize ${STATUS_COLORS[order.status] || "bg-gray-100 text-gray-600"}`}>
                        {order.status}
                      </span>
                      <select value={order.status} onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                        className="text-xs border border-gray-200 rounded-lg px-2 py-1 focus:outline-none">
                        {["pending","confirmed","preparing","ready","delivered","cancelled"].map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* ── BOOKINGS ── */}
          {tab === "Bookings" && (
            <div className="space-y-3">
              {bookings.length === 0 ? (
                <p className="text-gray-400 text-center py-12">No bookings yet.</p>
              ) : (
                bookings.map((b) => (
                  <div key={b._id} className="glass-panel rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="flex-1">
                      <p className="font-semibold text-cafe-dark">{b.guestName}</p>
                      <p className="text-sm text-gray-500 mt-0.5">{b.guestEmail} · {b.guestPhone}</p>
                      <p className="text-sm text-gray-500 mt-0.5">
                        📅 {new Date(b.date).toLocaleDateString()} at {b.time} · 👥 {b.partySize} guests · 🎉 {b.occasion}
                      </p>
                      {b.specialRequests && (
                        <p className="text-xs text-gray-400 mt-1 italic">"{b.specialRequests}"</p>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-xs px-3 py-1 rounded-full font-medium capitalize ${STATUS_COLORS[b.status] || "bg-gray-100 text-gray-600"}`}>
                        {b.status}
                      </span>
                      <select value={b.status} onChange={(e) => updateBookingStatus(b._id, e.target.value)}
                        className="text-xs border border-gray-200 rounded-lg px-2 py-1 focus:outline-none">
                        {["pending","confirmed","cancelled","completed"].map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* ── MENU ── */}
          {tab === "Settings" && <ContactSettings />}

          {tab === "Menu" && (
            <div>
              {/* Controls */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div className="flex flex-wrap gap-2">
                  {["all", ...CATEGORIES].map((cat) => (
                    <button key={cat} onClick={() => setMenuCategory(cat)}
                      className={`px-4 py-1.5 rounded-full text-xs font-medium capitalize transition-all ${menuCategory === cat ? "bg-cafe-dark text-cafe-cream" : "glass-panel text-gray-600 hover:bg-cafe-amber/20"}`}>
                      {cat}{cat !== "all" && ` (${foods.filter((f) => f.category === cat).length})`}
                    </button>
                  ))}
                </div>
                <button onClick={() => setShowAddForm((v) => !v)}
                  className="flex-shrink-0 px-5 py-2.5 bg-cafe-amber text-cafe-dark font-semibold rounded-xl hover:bg-amber-400 transition-colors text-sm">
                  {showAddForm ? "✕ Cancel" : "+ Add New Item"}
                </button>
              </div>

              {/* ── ADD FOOD FORM ── */}
              {showAddForm && (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-6">
                  <h3 className="font-display text-xl text-cafe-dark mb-5">Add New Menu Item</h3>
                  <form onSubmit={handleAddFood} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Item Name *</label>
                        <input name="name" value={foodForm.name} onChange={handleFoodFormChange} required
                          placeholder="e.g. Chocolate Lava Cake"
                          className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-cafe-amber bg-white transition" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                        <select name="category" value={foodForm.category} onChange={handleFoodFormChange}
                          className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-cafe-amber bg-white transition">
                          {CATEGORIES.map((c) => (
                            <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                      <textarea name="description" value={foodForm.description} onChange={handleFoodFormChange} required rows={2}
                        placeholder="Short appetizing description of the dish…"
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-cafe-amber bg-white transition resize-none" />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹) *</label>
                        <input name="price" type="number" min={0} value={foodForm.price} onChange={handleFoodFormChange} required placeholder="299"
                          className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-cafe-amber bg-white transition" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Prep Time (min)</label>
                        <input name="preparationTime" type="number" min={1} value={foodForm.preparationTime} onChange={handleFoodFormChange}
                          className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-cafe-amber bg-white transition" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Image URL <span className="text-gray-400 font-normal">(optional)</span></label>
                      <input name="image" value={foodForm.image} onChange={handleFoodFormChange}
                        placeholder="https://example.com/dish.jpg"
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-cafe-amber bg-white transition" />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Tags <span className="text-gray-400 font-normal">(comma-separated)</span></label>
                      <input name="tags" value={foodForm.tags} onChange={handleFoodFormChange}
                        placeholder="spicy, popular, seasonal"
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-cafe-amber bg-white transition" />
                    </div>

                    {/* Toggle switches */}
                    <div className="flex flex-wrap gap-6 pt-1">
                      {[
                        { name: "isVeg", label: "🟢 Vegetarian" },
                        { name: "isFeatured", label: "⭐ Featured on Home" },
                        { name: "isAvailable", label: "✅ Available Now" },
                      ].map(({ name, label }) => (
                        <label key={name} className="flex items-center gap-2.5 cursor-pointer select-none">
                          <div className="relative">
                            <input type="checkbox" name={name} checked={foodForm[name]} onChange={handleFoodFormChange} className="sr-only" />
                            <div className={`w-10 h-5 rounded-full transition-colors duration-200 ${foodForm[name] ? "bg-cafe-amber" : "bg-gray-200"}`} />
                            <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${foodForm[name] ? "translate-x-5" : "translate-x-0"}`} />
                          </div>
                          <span className="text-sm font-medium text-gray-700">{label}</span>
                        </label>
                      ))}
                    </div>

                    {/* Live preview */}
                    {foodForm.name && (
                      <div className="bg-white rounded-xl p-4 border border-amber-100">
                        <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-2">Preview</p>
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-cafe-cream flex items-center justify-center overflow-hidden flex-shrink-0 text-2xl">
                            {foodForm.image ? <img src={foodForm.image} alt="" className="w-full h-full object-cover" onError={(e) => { e.target.style.display = "none"; }} /> : "🍽️"}
                          </div>
                          <div>
                            <p className="font-semibold text-cafe-dark">{foodForm.name}</p>
                            <p className="text-gray-500 text-xs capitalize">
                              {foodForm.category} · ₹{foodForm.price || "—"} · {foodForm.isVeg ? "🟢 Veg" : "🔴 Non-Veg"}
                              {foodForm.isFeatured && " · ⭐ Featured"}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="flex gap-3 pt-1">
                      <button type="submit" disabled={addLoading}
                        className="px-8 py-2.5 bg-cafe-dark text-cafe-cream font-semibold rounded-xl hover:bg-cafe-brown disabled:opacity-60 transition-colors">
                        {addLoading ? "Adding…" : "Add to Menu"}
                      </button>
                      <button type="button" onClick={() => { setFoodForm(EMPTY_FOOD); setShowAddForm(false); }}
                        className="px-6 py-2.5 border border-gray-300 text-gray-600 rounded-xl hover:bg-gray-50 transition-colors">
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Food List */}
              <div className="space-y-3">
                {filteredFoods.length === 0 ? (
                  <div className="text-center py-12 text-gray-400">
                    <p className="text-4xl mb-3">🍽️</p>
                    <p>No items in this category.</p>
                  </div>
                ) : (
                  filteredFoods.map((food) => (
                    <div key={food._id} className="glass-panel rounded-2xl p-4 flex items-center gap-4">
                      <div className="w-14 h-14 rounded-xl bg-cafe-cream flex items-center justify-center overflow-hidden flex-shrink-0">
                        {food.image ? <img src={food.image} alt={food.name} className="w-full h-full object-cover" /> : <span className="text-2xl">🍽️</span>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-semibold text-cafe-dark">{food.name}</p>
                          {food.isFeatured && <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">⭐ Featured</span>}
                        </div>
                        <p className="text-sm text-gray-500 capitalize mt-0.5">
                          {food.category} · ₹{food.price} · {food.isVeg ? "🟢 Veg" : "🔴 Non-Veg"} · 🕐 {food.preparationTime}min
                        </p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button onClick={() => toggleAvailability(food)}
                          className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-all ${food.isAvailable
                            ? "bg-green-50 text-green-700 border-green-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                            : "bg-red-50 text-red-600 border-red-200 hover:bg-green-50 hover:text-green-700 hover:border-green-200"
                          }`}>
                          {food.isAvailable ? "✓ Available" : "✕ Hidden"}
                        </button>
                        <button onClick={() => deleteFood(food._id)}
                          className="text-xs text-red-400 hover:text-red-600 transition-colors px-2 py-1.5 rounded-lg border border-red-100 hover:border-red-300 hover:bg-red-50">
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
