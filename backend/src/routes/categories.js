import { Router } from "express";
import mongoose from "mongoose";
import Category from "../models/Category.js";
import Resource from "../models/Resource.js";
import asyncHandler from "../middleware/asyncHandler.js";

const router = Router();

router.get("/", asyncHandler(async (_req, res) => {
  const categories = await Category.find().sort({ name: 1 }).lean();
  const counts = await Resource.aggregate([
    { $group: { _id: "$category", count: { $sum: 1 } } }
  ]);
  const countByCategory = new Map(counts.map(({ _id, count }) => [String(_id), count]));
  res.json(categories.map((category) => ({
    ...category,
    resourceCount: countByCategory.get(String(category._id)) ?? 0
  })));
}));

router.get("/:id", asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ error: "Invalid category id." });
  }
  const category = await Category.findById(req.params.id).lean();
  if (!category) return res.status(404).json({ error: "Category not found." });
  res.json(category);
}));

router.post("/", asyncHandler(async (req, res) => {
  const category = await Category.create(req.body);
  res.status(201).json(category);
}));

router.put("/:id", asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ error: "Invalid category id." });
  }
  const category = await Category.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });
  if (!category) return res.status(404).json({ error: "Category not found." });
  res.json(category);
}));

router.delete("/:id", asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ error: "Invalid category id." });
  }
  const category = await Category.findById(req.params.id);
  if (!category) return res.status(404).json({ error: "Category not found." });
  if (await Resource.exists({ category: category._id })) {
    return res.status(409).json({ error: "Move or delete this category's resources before deleting it." });
  }
  await category.deleteOne();
  res.status(204).end();
}));

export default router;
