import mongoose from "mongoose";
import { NextResponse } from "next/server";
import Resource from "../../../../backend/src/models/Resource.js";
import { ApiError, readJson, withDatabase } from "../../../../lib/api.js";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(_request, context) {
  return withDatabase(async () => {
    const { id } = await context.params;
    if (!mongoose.isValidObjectId(id)) throw new ApiError(400, "Invalid resource id.");
    const resource = await Resource.findById(id).populate("category", "name slug emoji");
    if (!resource) throw new ApiError(404, "Resource not found.");
    return NextResponse.json(resource);
  });
}

export async function PUT(request, context) {
  return withDatabase(async () => {
    const { id } = await context.params;
    if (!mongoose.isValidObjectId(id)) throw new ApiError(400, "Invalid resource id.");
    const resource = await Resource.findByIdAndUpdate(id, await readJson(request), {
      new: true,
      runValidators: true
    }).populate("category", "name slug emoji");
    if (!resource) throw new ApiError(404, "Resource not found.");
    return NextResponse.json(resource);
  });
}

export async function DELETE(_request, context) {
  return withDatabase(async () => {
    const { id } = await context.params;
    if (!mongoose.isValidObjectId(id)) throw new ApiError(400, "Invalid resource id.");
    const resource = await Resource.findByIdAndDelete(id);
    if (!resource) throw new ApiError(404, "Resource not found.");
    return new Response(null, { status: 204 });
  });
}
