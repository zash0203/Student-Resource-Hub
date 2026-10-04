import mongoose from "mongoose";

const resourceSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 150 },
    url: {
      type: String,
      required: true,
      trim: true,
      validate: {
        validator: (value) => {
          try {
            return ["http:", "https:"].includes(new URL(value).protocol);
          } catch {
            return false;
          }
        },
        message: "URL must be a valid HTTP or HTTPS URL."
      }
    },
    description: { type: String, trim: true, maxlength: 1000, default: "" },
    tag: { type: String, trim: true, maxlength: 50, default: "" },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true
    }
  },
  { timestamps: true }
);

resourceSchema.index({ category: 1, name: 1 });

export default mongoose.model("Resource", resourceSchema);
