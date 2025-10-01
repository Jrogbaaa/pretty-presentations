import { NextRequest, NextResponse } from "next/server";
import {
  getAllPresentations,
  savePresentation,
} from "@/lib/presentation-service";
import type { Presentation } from "@/types";
import { logError } from "@/lib/logger";

/**
 * GET /api/presentations - Get all presentations
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status") || undefined;
    const limitParam = searchParams.get("limit");
    const limitCount = limitParam ? parseInt(limitParam, 10) : undefined;

    const presentations = await getAllPresentations({
      status,
      limitCount,
    });

    return NextResponse.json({
      success: true,
      presentations,
      count: presentations.length,
    });
  } catch (error) {
    logError("Error in GET /api/presentations", { error });
    return NextResponse.json(
      { success: false, error: "Failed to fetch presentations" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/presentations - Save a new presentation
 */
export async function POST(request: NextRequest) {
  try {
    const presentation: Presentation = await request.json();

    if (!presentation.id || !presentation.campaignName || !presentation.slides) {
      return NextResponse.json(
        { success: false, error: "Invalid presentation data" },
        { status: 400 }
      );
    }

    await savePresentation(presentation);

    return NextResponse.json({
      success: true,
      message: "Presentation saved successfully",
      id: presentation.id,
    });
  } catch (error) {
    logError("Error in POST /api/presentations", { error });
    return NextResponse.json(
      { success: false, error: "Failed to save presentation" },
      { status: 500 }
    );
  }
}

