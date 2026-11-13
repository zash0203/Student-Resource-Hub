import { NextResponse } from "next/server";
import { connectToDatabase, DatabaseUnavailableError } from "../../../lib/mongodb.js";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  if (!process.env.MONGODB_URI) {
    return NextResponse.json({ status: "ok", database: "not_configured" });
  }

  try {
    await connectToDatabase();
    return NextResponse.json({ status: "ok", database: "connected" });
  } catch (error) {
    if (!(error instanceof DatabaseUnavailableError)) throw error;
    console.error("Could not connect to MongoDB:", error.cause ?? error);
    return NextResponse.json(
      { status: "ok", database: "disconnected" },
      { status: 503 }
    );
  }
}
