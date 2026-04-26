import { useState, useEffect } from "react";
import toast from "react-hot-toast";

const STORAGE_KEY = "cafe_delivery_location";

export default function LocationModal({ onConfirm, onClose }) {
  const [mode, setMode] = useState("gps"); // "gps" | "manual"
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsCoords, setGpsCoords] = useState(null);
  const [gpsLabel, setGpsLabel] = useState("");
  const [manual, setManual] = useState({ street: "", city: "", pincode: "" });
  const [saved, setSaved] = useState(null);

  useEffect(() => {
    const prev = localStorage.getItem(STORAGE_KEY);
    if (prev) setSaved(JSON.parse(prev));
  }, []);

  const requestGps = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation not supported in this browser.");
      return;
    }
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        setGpsCoords({ latitude, longitude });
        // Reverse geocode using nominatim (free, no key needed)
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
          );
          const data = await res.json();
          const label =
            data.display_name ||
            `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
          setGpsLabel(label);
        } catch {
          setGpsLabel(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
        }
        setGpsLoading(false);
      },
      (err) => {
        toast.error("Location denied. Please enter manually.");
        setMode("manual");
        setGpsLoading(false);
      },
      { timeout: 10000 }
    );
  };

  const handleConfirm = () => {
    let location;
    if (mode === "gps" && gpsCoords) {
      location = {
        type: "gps",
        label: gpsLabel,
        coords: gpsCoords,
        street: "",
        city: "",
        pincode: "",
      };
    } else if (mode === "manual") {
      if (!manual.street || !manual.city || !manual.pincode) {
        toast.error("Please fill in all address fields.");
        return;
      }
      location = {
        type: "manual",
        label: `${manual.street}, ${manual.city} – ${manual.pincode}`,
        street: manual.street,
        city: manual.city,
        pincode: manual.pincode,
      };
    } else if (mode === "saved" && saved) {
      location = saved;
    } else {
      toast.error("Please select or enter a location.");
      return;
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(location));
    onConfirm(location);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-3xl shadow-2xl p-7 w-full max-w-md">
        <button onClick={onClose} className="absolute top-4 right-5 text-gray-400 hover:text-gray-600 text-xl">✕</button>

        <div className="text-4xl mb-3 text-center">📍</div>
        <h2 className="font-display text-2xl text-cafe-dark text-center mb-1">Delivery Location</h2>
        <p className="text-gray-400 text-sm text-center mb-6">We need to know where to send your order.</p>

        {/* Saved location option */}
        {saved && (
          <button onClick={() => setMode("saved")}
            className={`w-full mb-3 p-4 rounded-2xl border-2 text-left transition-all ${mode === "saved" ? "border-cafe-amber bg-amber-50" : "border-gray-200 hover:border-cafe-amber/50"}`}>
            <div className="flex items-start gap-3">
              <span className="text-xl mt-0.5">🏠</span>
              <div>
                <p className="font-semibold text-cafe-dark text-sm">Use Saved Location</p>
                <p className="text-gray-500 text-xs mt-0.5 line-clamp-2">{saved.label}</p>
              </div>
              {mode === "saved" && <span className="ml-auto text-cafe-amber text-lg">✓</span>}
            </div>
          </button>
        )}

        {/* GPS option */}
        <button onClick={() => { setMode("gps"); if (!gpsCoords) requestGps(); }}
          className={`w-full mb-3 p-4 rounded-2xl border-2 text-left transition-all ${mode === "gps" ? "border-cafe-amber bg-amber-50" : "border-gray-200 hover:border-cafe-amber/50"}`}>
          <div className="flex items-start gap-3">
            <span className="text-xl mt-0.5">🛰️</span>
            <div className="flex-1">
              <p className="font-semibold text-cafe-dark text-sm">Use My Current Location</p>
              {gpsLoading && <p className="text-xs text-gray-400 mt-1">Getting your location…</p>}
              {gpsLabel && !gpsLoading && <p className="text-gray-500 text-xs mt-0.5 line-clamp-2">{gpsLabel}</p>}
              {!gpsLabel && !gpsLoading && <p className="text-gray-400 text-xs mt-0.5">Click to grant location access</p>}
            </div>
            {mode === "gps" && gpsCoords && <span className="ml-auto text-cafe-amber text-lg flex-shrink-0">✓</span>}
          </div>
        </button>

        {/* Manual option */}
        <button onClick={() => setMode("manual")}
          className={`w-full mb-4 p-4 rounded-2xl border-2 text-left transition-all ${mode === "manual" ? "border-cafe-amber bg-amber-50" : "border-gray-200 hover:border-cafe-amber/50"}`}>
          <div className="flex items-center gap-3">
            <span className="text-xl">✏️</span>
            <p className="font-semibold text-cafe-dark text-sm">Enter Address Manually</p>
            {mode === "manual" && <span className="ml-auto text-cafe-amber text-lg">✓</span>}
          </div>
        </button>

        {mode === "manual" && (
          <div className="space-y-3 mb-4 px-1">
            <input placeholder="Street / Flat / Area *" value={manual.street}
              onChange={(e) => setManual((p) => ({ ...p, street: e.target.value }))}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-cafe-amber transition text-sm" />
            <div className="grid grid-cols-2 gap-3">
              <input placeholder="City *" value={manual.city}
                onChange={(e) => setManual((p) => ({ ...p, city: e.target.value }))}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-cafe-amber transition text-sm" />
              <input placeholder="Pincode *" value={manual.pincode}
                onChange={(e) => setManual((p) => ({ ...p, pincode: e.target.value }))}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-cafe-amber transition text-sm" />
            </div>
          </div>
        )}

        <button onClick={handleConfirm}
          disabled={mode === "gps" && (gpsLoading || !gpsCoords)}
          className="w-full py-3 bg-cafe-amber text-cafe-dark font-semibold rounded-xl hover:bg-amber-400 disabled:opacity-50 transition-colors">
          Confirm Location →
        </button>

        <p className="text-center text-xs text-gray-400 mt-3">
          Your location is only used for this delivery and saved locally on your device.
        </p>
      </div>
    </div>
  );
}
