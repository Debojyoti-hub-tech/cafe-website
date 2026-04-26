// Run: node seed.js
// Seeds the database with sample menu items

import mongoose from "mongoose";
import dotenv from "dotenv";
import Food from "./models/Food.js";

dotenv.config();

const foods = [
  // Starters
  { name: "Bruschetta al Pomodoro", description: "Crispy sourdough topped with marinated cherry tomatoes, fresh basil, and aged balsamic glaze.", price: 199, category: "starters", isVeg: true, isFeatured: true, rating: 4.5, reviewCount: 38, preparationTime: 10, tags: ["popular", "italian"] },
  { name: "Chicken Tikka Skewers", description: "Tandoor-grilled chicken chunks marinated in yogurt and aromatic spices, served with mint chutney.", price: 299, category: "starters", isVeg: false, isFeatured: true, rating: 4.7, reviewCount: 62, preparationTime: 15, tags: ["spicy", "grilled"] },
  { name: "Mushroom Crostini", description: "Pan-seared wild mushrooms with garlic, thyme and cream on toasted baguette slices.", price: 229, category: "starters", isVeg: true, rating: 4.3, reviewCount: 21, preparationTime: 12 },
  { name: "Soup of the Day", description: "Ask your server for today's freshly made seasonal soup, served with crusty bread.", price: 179, category: "starters", isVeg: true, rating: 4.2, reviewCount: 15, preparationTime: 8, tags: ["seasonal"] },

  // Mains
  { name: "Penne Arrabbiata", description: "Penne pasta in a bold, spicy tomato sauce with garlic, red chillies and fresh parsley.", price: 349, category: "mains", isVeg: true, isFeatured: true, rating: 4.6, reviewCount: 54, preparationTime: 20, tags: ["pasta", "spicy"] },
  { name: "Grilled Chicken Sandwich", description: "Herb-marinated grilled chicken breast, lettuce, pickled onions and chipotle mayo on a toasted brioche bun.", price: 379, category: "mains", isVeg: false, rating: 4.5, reviewCount: 41, preparationTime: 18, tags: ["sandwich", "popular"] },
  { name: "Paneer Butter Masala Bowl", description: "Cottage cheese cubes simmered in a rich tomato-cashew gravy, served with garlic naan.", price: 329, category: "mains", isVeg: true, rating: 4.4, reviewCount: 37, preparationTime: 20, tags: ["indian"] },
  { name: "Fish & Chips", description: "Beer-battered basa fillet with crispy golden fries, tartar sauce and a lemon wedge.", price: 419, category: "mains", isVeg: false, rating: 4.3, reviewCount: 29, preparationTime: 22 },
  { name: "Veggie Buddha Bowl", description: "Roasted sweet potato, quinoa, edamame, avocado, pickled carrots and tahini dressing.", price: 359, category: "mains", isVeg: true, rating: 4.6, reviewCount: 48, preparationTime: 15, tags: ["healthy", "popular"] },
  { name: "Mutton Keema Pav", description: "Slow-cooked spiced minced mutton served with buttered pav — a Mumbai street classic elevated.", price: 389, category: "mains", isVeg: false, isFeatured: true, rating: 4.8, reviewCount: 71, preparationTime: 25, tags: ["indian", "spicy"] },

  // Desserts
  { name: "Chocolate Lava Cake", description: "Warm dark chocolate cake with a molten centre, served with vanilla bean ice cream.", price: 249, category: "desserts", isVeg: true, isFeatured: true, rating: 4.9, reviewCount: 88, preparationTime: 15, tags: ["chocolate", "popular"] },
  { name: "Mango Panna Cotta", description: "Silky Italian cream pudding topped with fresh Alphonso mango coulis.", price: 229, category: "desserts", isVeg: true, rating: 4.5, reviewCount: 32, preparationTime: 10, tags: ["seasonal", "mango"] },
  { name: "Tiramisu", description: "Classic Italian dessert with mascarpone, espresso-soaked ladyfingers and a dusting of cocoa.", price: 259, category: "desserts", isVeg: true, rating: 4.7, reviewCount: 56, preparationTime: 5, tags: ["italian", "coffee"] },
  { name: "Gulab Jamun Sundae", description: "Warm gulab jamun served over vanilla gelato with rose syrup — the ultimate East-meets-West treat.", price: 199, category: "desserts", isVeg: true, rating: 4.6, reviewCount: 44, preparationTime: 8, tags: ["indian", "fusion"] },

  // Beverages
  { name: "Classic Cappuccino", description: "Double espresso with velvety steamed milk and a thick layer of foam. Art on your cup.", price: 129, category: "beverages", isVeg: true, isFeatured: true, rating: 4.7, reviewCount: 104, preparationTime: 5, tags: ["coffee", "popular"] },
  { name: "Cold Brew Float", description: "16-hour cold brew poured over a scoop of vanilla ice cream. Caffeinated bliss.", price: 189, category: "beverages", isVeg: true, rating: 4.6, reviewCount: 67, preparationTime: 5, tags: ["coffee", "cold"] },
  { name: "Mango Lassi", description: "Chilled blended yogurt with fresh Alphonso mango pulp and a pinch of cardamom.", price: 149, category: "beverages", isVeg: true, rating: 4.5, reviewCount: 59, preparationTime: 5, tags: ["mango", "indian"] },
  { name: "Masala Chai", description: "Traditional Indian spiced tea with ginger, cardamom, cinnamon and whole milk.", price: 89, category: "beverages", isVeg: true, rating: 4.8, reviewCount: 120, preparationTime: 5, tags: ["indian", "popular"] },
  { name: "Fresh Lime Soda", description: "Hand-squeezed lime juice with sparkling water — choose sweet, salted or mixed.", price: 99, category: "beverages", isVeg: true, rating: 4.3, reviewCount: 42, preparationTime: 3 },
  { name: "Strawberry Milkshake", description: "Thick shake blended with fresh strawberries and premium vanilla ice cream.", price: 169, category: "beverages", isVeg: true, rating: 4.4, reviewCount: 38, preparationTime: 5, tags: ["cold"] },

  // Specials
  { name: "Chef's Weekend Brunch Platter", description: "A curated platter of avocado toast, two eggs your way, turkey bacon, hash browns and fresh OJ.", price: 549, category: "specials", isVeg: false, isFeatured: true, rating: 4.9, reviewCount: 93, preparationTime: 25, tags: ["brunch", "weekend", "popular"] },
  { name: "Lumière Tasting Board", description: "Charcuterie board with imported cheeses, seasonal fruits, honeycomb, crackers and pickles. For two.", price: 699, category: "specials", isVeg: true, rating: 4.8, reviewCount: 47, preparationTime: 10, tags: ["sharing", "premium"] },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    await Food.deleteMany({});
    console.log("🗑️  Cleared existing food items");

    const inserted = await Food.insertMany(foods);
    console.log(`🌱 Seeded ${inserted.length} food items successfully`);

    await mongoose.disconnect();
    console.log("✅ Done");
    process.exit(0);
  } catch (err) {
    console.error("❌ Seed error:", err.message);
    process.exit(1);
  }
}

seed();
