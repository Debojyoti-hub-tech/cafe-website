import express from "express";
import SiteConfig from "../models/SiteConfig.js";
import { protect, adminOnly } from "../middleware/auth.js";

const router = express.Router();

const DEFAULTS = {
  contact: {
    address: "12 Brew Lane, Kolkata 700001",
    phone: "+91 98765 43210",
    email: "hello@cafelumiere.in",
    hours: "Mon–Sun: 8am – 10pm",
    mapLink: "",
  },
};

// GET /api/config/:key — public
router.get("/:key", async (req, res) => {
  try {
    const doc = await SiteConfig.findOne({ key: req.params.key });
    if (!doc) {
      // Return default if not yet set
      return res.json(DEFAULTS[req.params.key] || {});
    }
    res.json(doc.value);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/config/:key — admin only
router.put("/:key", protect, adminOnly, async (req, res) => {
  try {
    const doc = await SiteConfig.findOneAndUpdate(
      { key: req.params.key },
      { value: req.body },
      { upsert: true, new: true }
    );
    res.json(doc.value);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
