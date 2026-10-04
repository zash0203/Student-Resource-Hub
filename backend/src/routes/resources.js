import { Router } from "express";
import mongoose from "mongoose";
import Category from "../models/Category.js";
import Resource from "../models/Resource.js";
import asyncHandler from "../middleware/asyncHandler.js";

const router = Router();

router.get("/", asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.category) {
    const category = await Category.findOne({
      $or: [{ slug: req.query.category }, ...(mongoose.isValidObjectId(req.query.category)
        ? [{ _id: req.query.category }]
        : [])]
    }).select("_id");
    if (!category) return res.json([]);
    filter.category = category._id;
  }
  if (req.query.q) {
    const query = String(req.query.q).trim();
    if (query.length > 100) {
      return res.status(400).json({ error: "Search query must be 100 characters or fewer." });
    }
    const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    filter.$or = [
      { name: { $regex: escaped, $options: "i" } },
      { description: { $regex: escaped, $options: "i" } },
      { tag: { $regex: escaped, $options: "i" } }
    ];
  }
  const resources = await Resource.find(filter)
    .populate("category", "name slug emoji")
    .sort({ name: 1 })
    .lean();
  res.json(resources);
}));

router.get("/:id", asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ error: "Invalid resource id." });
  }
  const resource = await Resource.findById(req.params.id)
    .populate("category", "name slug emoji");
  if (!resource) return res.status(404).json({ error: "Resource not found." });
  res.json(resource);
}));

router.post("/", asyncHandler(async (req, res) => {
  const resource = await Resource.create(req.body);
  await resource.populate("category", "name slug emoji");
  res.status(201).json(resource);
}));

router.put("/:id", asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ error: "Invalid resource id." });
  }
  const resource = await Resource.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  }).populate("category", "name slug emoji");
  if (!resource) return res.status(404).json({ error: "Resource not found." });
  res.json(resource);
}));

router.delete("/:id", asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ error: "Invalid resource id." });
  }
  const resource = await Resource.findByIdAndDelete(req.params.id);
  if (!resource) return res.status(404).json({ error: "Resource not found." });
  res.status(204).end();
}));

export default router;
