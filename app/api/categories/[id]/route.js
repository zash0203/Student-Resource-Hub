import mongoose from "mongoose";
import { NextResponse } from "next/server";
import Category from "../../../../lib/models/Category.js";
import Resource from "../../../../lib/models/Resource.js";
import { ApiError, readJson, withDatabase } from "../../../../lib/api.js";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(_request, context) {
  return withDatabase(async () => {
    const { id } = await context.params;
    if (!mongoose.isValidObjectId(id)) throw new ApiError(400, "Invalid category id.");
    const category = await Category.findById(id).lean();
    if (!category) throw new ApiError(404, "Category not found.");
    return NextResponse.json(category);
  });
}

export async function PUT(request, context) {
  return withDatabase(async () => {
    const { id } = await context.params;
    if (!mongoose.isValidObjectId(id)) throw new ApiError(400, "Invalid category id.");
    const category = await Category.findByIdAndUpdate(id, await readJson(request), {
      new: true,
      runValidators: true
    });
    if (!category) throw new ApiError(404, "Category not found.");
    return NextResponse.json(category);
  });
}

export async function DELETE(_request, context) {
  return withDatabase(async () => {
    const { id } = await context.params;
    if (!mongoose.isValidObjectId(id)) throw new ApiError(400, "Invalid category id.");
    const category = await Category.findById(id);
    if (!category) throw new ApiError(404, "Category not found.");
    if (await Resource.exists({ category: category._id })) {
      throw new ApiError(409, "Move or delete this category's resources before deleting it.");
    }
    await category.deleteOne();
    return new Response(null, { status: 204 });
  });
}
