import express from "express";
import Otp from "../models/Otp.js";
import { sendOtpEmail } from "../utils/mailer.js";

const router = express.Router();

// POST /api/otp/send
router.post("/send", async (req, res) => {
  try {
    const { email, purpose } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required." });

    const otp = String(Math.floor(100000 + Math.random() * 900000));

    await Otp.deleteMany({ email, purpose });
    await Otp.create({ email, otp, purpose });

    await sendOtpEmail(email, otp, purpose);

    res.json({ message: "OTP sent to your email." });
  } catch (err) {
    // Log the FULL error so you can see what's actually wrong
    console.error("═══ OTP SEND ERROR ═══");
    console.error("Message:", err.message);
    console.error("Code:", err.code);
    console.error("Response:", err.response);
    console.error("══════════════════════");
    res.status(500).json({
      message: "Failed to send OTP.",
      detail: err.message, // send detail to frontend too
    });
  }
});

// POST /api/otp/verify
router.post("/verify", async (req, res) => {
  try {
    const { email, otp, purpose } = req.body;

    const record = await Otp.findOne({ email, purpose });

    if (!record) {
      return res.status(400).json({ message: "OTP expired or not found. Request a new one." });
    }

    if (record.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP. Please try again." });
    }

    await Otp.deleteOne({ _id: record._id });

    res.json({ verified: true, message: "OTP verified successfully." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
