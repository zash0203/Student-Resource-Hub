import { NextResponse } from "next/server";
import Category from "../../../backend/src/models/Category.js";
import Resource from "../../../backend/src/models/Resource.js";
import { readJson, withDatabase } from "../../../lib/api.js";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  return withDatabase(async () => {
    const categories = await Category.find().sort({ name: 1 }).lean();
    const counts = await Resource.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } }
    ]);
    const countByCategory = new Map(counts.map(({ _id, count }) => [String(_id), count]));
    return NextResponse.json(categories.map((category) => ({
      ...category,
      resourceCount: countByCategory.get(String(category._id)) ?? 0
    })));
  });
}

export async function POST(request) {
  return withDatabase(async () => {
    const category = await Category.create(await readJson(request));
    return NextResponse.json(category, { status: 201 });
  });
}
