export default function FoodCard({ food, onOrder }) {
  const { name, description, price, image, isVeg, rating, preparationTime, category } = food;

  return (
    <div className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden group">
      {/* Image */}
      <div className="relative h-48 bg-cafe-cream overflow-hidden">
        {image ? (
          <img
            src={image}
            alt={name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-5xl">☕</div>
        )}
        {/* Veg/Non-veg badge */}
        <span
          className={`absolute top-2 left-2 text-xs font-bold px-2 py-0.5 rounded-full ${
            isVeg
              ? "bg-green-100 text-green-700 border border-green-300"
              : "bg-red-100 text-red-700 border border-red-300"
          }`}
        >
          {isVeg ? "🟢 Veg" : "🔴 Non-Veg"}
        </span>
        {/* Category badge */}
        <span className="absolute top-2 right-2 text-xs bg-cafe-dark/70 text-cafe-cream px-2 py-0.5 rounded-full capitalize">
          {category}
        </span>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="font-display text-cafe-dark text-lg leading-tight">{name}</h3>
          <span className="text-cafe-amber font-bold text-lg whitespace-nowrap">
            ₹{price}
          </span>
        </div>

        <p className="text-gray-500 text-sm line-clamp-2 mb-3">{description}</p>

        {/* Meta */}
        <div className="flex items-center gap-3 text-xs text-gray-400 mb-4">
          <span>⭐ {rating > 0 ? rating.toFixed(1) : "New"}</span>
          <span>🕐 {preparationTime} min</span>
        </div>

        {/* CTA */}
        {onOrder && (
          <button
            onClick={() => onOrder(food)}
            className="w-full bg-cafe-amber text-cafe-dark font-semibold py-2 rounded-xl hover:bg-amber-400 active:scale-95 transition-all duration-150"
          >
            Add to Order
          </button>
        )}
      </div>
    </div>
  );
}
