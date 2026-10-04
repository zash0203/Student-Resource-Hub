import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    slug: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      match: /^[a-z0-9]+(?:-[a-z0-9]+)*$/
    },
    description: { type: String, trim: true, maxlength: 500, default: "" },
    emoji: { type: String, trim: true, maxlength: 8, default: "" }
  },
  { timestamps: true }
);

categorySchema.index({ slug: 1 }, { unique: true });

export default mongoose.model("Category", categorySchema);
