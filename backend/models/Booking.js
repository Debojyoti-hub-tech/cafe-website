import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    guestName: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    guestEmail: {
      type: String,
      required: [true, "Email is required"],
      lowercase: true,
    },
    guestPhone: {
      type: String,
      required: [true, "Phone is required"],
    },
    date: {
      type: Date,
      required: [true, "Date is required"],
    },
    time: {
      type: String,
      required: [true, "Time slot is required"],
    },
    partySize: {
      type: Number,
      required: true,
      min: 1,
      max: 20,
    },
    tableNumber: Number,
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled", "completed"],
      default: "pending",
    },
    specialRequests: {
      type: String,
      maxlength: 500,
    },
    occasion: {
      type: String,
      enum: ["birthday", "anniversary", "business", "casual", "other"],
      default: "casual",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Booking", bookingSchema);
