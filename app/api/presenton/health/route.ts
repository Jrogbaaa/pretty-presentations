import { NextResponse } from "next/server";
import { checkPresentonAvailable } from "@/lib/presenton-api";

/**
 * GET /api/presenton/health
 * Check if Presenton Docker container is running and accessible
 */
export async function GET() {
  try {
    const isAvailable = await checkPresentonAvailable();
    
    if (isAvailable) {
      return NextResponse.json({
        status: "healthy",
        available: true,
        message: "Presenton is running and accessible",
      });
    } else {
      return NextResponse.json(
        {
          status: "unavailable",
          available: false,
          message: "Presenton is not available. Please start the Docker container.",
        },
        { status: 503 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        available: false,
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

