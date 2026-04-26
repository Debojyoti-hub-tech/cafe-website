import mongoose from "mongoose";

const siteConfigSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true }, // e.g. "contact"
    value: { type: mongoose.Schema.Types.Mixed, required: true },
  },
  { timestamps: true }
);

export default mongoose.model("SiteConfig", siteConfigSchema);
