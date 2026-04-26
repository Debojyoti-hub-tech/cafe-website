import express from "express";
import Booking from "../models/Booking.js";
import { protect, adminOnly } from "../middleware/auth.js";

const router = express.Router();

// POST /api/bookings — create (public, user optional)
router.post("/", async (req, res) => {
  try {
    const booking = await Booking.create(req.body);
    res.status(201).json({ message: "Booking request received!", booking });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// GET /api/bookings/my — current user's bookings
router.get("/my", protect, async (req, res) => {
  try {
    const bookings = await Booking.find({ guestEmail: req.user.email }).sort("-createdAt");
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/bookings — admin: all bookings
router.get("/", protect, adminOnly, async (req, res) => {
  try {
    const { status, date } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (date) {
      const start = new Date(date);
      const end = new Date(date);
      end.setDate(end.getDate() + 1);
      filter.date = { $gte: start, $lt: end };
    }
    const bookings = await Booking.find(filter).sort("date");
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/bookings/:id — update (admin or owner)
router.put("/:id", protect, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: "Booking not found." });

    // Only admin or the booking owner can update
    const isOwner = booking.guestEmail === req.user.email;
    if (!isOwner && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized." });
    }

    const updated = await Booking.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE /api/bookings/:id — admin only
router.delete("/:id", protect, adminOnly, async (req, res) => {
  try {
    await Booking.findByIdAndDelete(req.params.id);
    res.json({ message: "Booking deleted." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
