import Food from "../models/Food.js";

const REFRESH_INTERVAL_MS = 30 * 60 * 1000;

let cachedFoods = null;

export async function refreshMenuCache() {
  const foods = await Food.find({ isAvailable: true }).lean();
  cachedFoods = foods;
  console.log(`✅ Menu cache refreshed (${foods.length} items)`);
  return foods;
}

export async function startMenuCacheBot() {
  const refresh = () => {
    refreshMenuCache().catch((err) => {
      console.error("❌ Menu cache refresh error:", err.message);
    });
  };

  try {
    await refreshMenuCache();
  } catch (err) {
    console.error("❌ Initial menu cache refresh error:", err.message);
  }

  return setInterval(refresh, REFRESH_INTERVAL_MS);
}

export function invalidateMenuCache() {
  cachedFoods = null;
}

export function getCachedFoods({ category, featured } = {}) {
  if (!cachedFoods) return null;

  return cachedFoods.filter((food) => {
    if (category && food.category !== category) return false;
    if (featured === "true" && !food.isFeatured) return false;
    return true;
  });
}

export function getCachedFoodById(id) {
  if (!cachedFoods) return null;
  return cachedFoods.find((food) => food._id.toString() === id) || undefined;
}
