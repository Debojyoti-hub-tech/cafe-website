import express from "express";
import Food from "../models/Food.js";
import { protect, adminOnly } from "../middleware/auth.js";

const router = express.Router();

// GET /api/food — get all (with optional category filter)
router.get("/", async (req, res) => {
  try {
    const { category, featured } = req.query;
    const filter = {};
    if (category) filter.category = category;
    if (featured === "true") filter.isFeatured = true;

    const foods = await Food.find({ ...filter, isAvailable: true });
    res.json(foods);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/food/:id
router.get("/:id", async (req, res) => {
  try {
    const food = await Food.findById(req.params.id);
    if (!food) return res.status(404).json({ message: "Food item not found." });
    res.json(food);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/food — admin only
router.post("/", protect, adminOnly, async (req, res) => {
  try {
    const food = await Food.create(req.body);
    res.status(201).json(food);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT /api/food/:id — admin only
router.put("/:id", protect, adminOnly, async (req, res) => {
  try {
    const food = await Food.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!food) return res.status(404).json({ message: "Food item not found." });
    res.json(food);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE /api/food/:id — admin only
router.delete("/:id", protect, adminOnly, async (req, res) => {
  try {
    await Food.findByIdAndDelete(req.params.id);
    res.json({ message: "Food item deleted." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
