import { NextResponse } from "next/server";
import { connectToDatabase, DatabaseUnavailableError } from "./mongodb.js";

export class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

export async function readJson(request) {
  try {
    return await request.json();
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new ApiError(400, "Request body must contain valid JSON.");
    }
    throw error;
  }
}

export async function withDatabase(action) {
  if (!process.env.MONGODB_URI) {
    return NextResponse.json({
      error: "Database is not connected. Configure MONGODB_URI to enable resource and category data."
    }, { status: 503 });
  }

  try {
    await connectToDatabase();
    return await action();
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    if (error instanceof DatabaseUnavailableError) {
      console.error("Could not connect to MongoDB:", error.cause ?? error);
      return NextResponse.json({
        error: "Database is not connected. Check MONGODB_URI and Atlas network access."
      }, { status: 503 });
    }
    if (error?.code === 11000) {
      return NextResponse.json(
        { error: "A category with that slug already exists." },
        { status: 409 }
      );
    }
    if (error?.name === "ValidationError" || error?.name === "CastError") {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: "Request body must contain valid JSON." },
        { status: 400 }
      );
    }
    console.error(error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
