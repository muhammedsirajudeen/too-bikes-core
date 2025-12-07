import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";
import { ValidationError } from "./validation.util";
import { connectDb } from "@/config/mongo.config";

export function withLoggingAndErrorHandling(
  handler: (request: NextRequest) => Promise<NextResponse>
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    console.log(`[Request] ${request.method} ${request.url}`);

    if (mongoose.connection.readyState === 0) {
      try {
        await connectDb();
      } catch (dbError) {
        // If DB connection fails, return error response instead of crashing
        return NextResponse.json(
          {
            success: false,
            message: "Database connection failed. Please check your MONGO_URI environment variable.",
            error: dbError instanceof Error ? dbError.message : String(dbError),
          },
          { status: 503 }
        );
      }
    }

    // Check if MongoDB is actually connected
    if (mongoose.connection.readyState !== 1) {
      return NextResponse.json(
        {
          success: false,
          message: "Database is not connected. Please check your MONGO_URI environment variable.",
        },
        { status: 503 }
      );
    }

    try {
      const response = await handler(request);
      console.log(`[Response] Status: ${response.status}`);
      return response;
    } catch (error) {
      console.error("[Error in Route Handler]", error);

      if (error instanceof ValidationError) {
        return NextResponse.json(
          {
            message: error.message,
            errors: error.errors,
          },
          { status: error.statusCode }
        );
      }

      return NextResponse.json(
        {
          message: "An unexpected error occurred",
          error: error instanceof Error ? error.message : String(error),
        },
        { status: 500 }
      );
    } finally {
      console.log(`[End] ${request.method} ${request.url}`);
    }
  };
}
