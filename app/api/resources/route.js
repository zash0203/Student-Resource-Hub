import mongoose from "mongoose";
import { NextResponse } from "next/server";
import Category from "../../../backend/src/models/Category.js";
import Resource from "../../../backend/src/models/Resource.js";
import { ApiError, readJson, withDatabase } from "../../../lib/api.js";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request) {
  return withDatabase(async () => {
    const searchParams = new URL(request.url).searchParams;
    const filter = {};
    const categoryQuery = searchParams.get("category");

    if (categoryQuery) {
      const category = await Category.findOne({
        $or: [
          { slug: categoryQuery },
          ...(mongoose.isValidObjectId(categoryQuery) ? [{ _id: categoryQuery }] : [])
        ]
      }).select("_id");
      if (!category) return NextResponse.json([]);
      filter.category = category._id;
    }

    const query = searchParams.get("q");
    if (query) {
      const trimmedQuery = query.trim();
      if (trimmedQuery.length > 100) {
        throw new ApiError(400, "Search query must be 100 characters or fewer.");
      }
      const escapedQuery = trimmedQuery.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      filter.$or = [
        { name: { $regex: escapedQuery, $options: "i" } },
        { description: { $regex: escapedQuery, $options: "i" } },
        { tag: { $regex: escapedQuery, $options: "i" } }
      ];
    }

    const resources = await Resource.find(filter)
      .populate("category", "name slug emoji")
      .sort({ name: 1 })
      .lean();
    return NextResponse.json(resources);
  });
}

export async function POST(request) {
  return withDatabase(async () => {
    const resource = await Resource.create(await readJson(request));
    await resource.populate("category", "name slug emoji");
    return NextResponse.json(resource, { status: 201 });
  });
}
