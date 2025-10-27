import { NextRequest, NextResponse } from "next/server";
import {
  getPresentation,
  updatePresentation,
  deletePresentation,
} from "@/lib/presentation-service";
import { logError } from "@/lib/logger";

/**
 * GET /api/presentations/[id] - Get a single presentation
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const presentation = await getPresentation(id);

    if (!presentation) {
      return NextResponse.json(
        { success: false, error: "Presentation not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      presentation,
    });
  } catch (error) {
    logError("Error in GET /api/presentations/[id]", { error });
    return NextResponse.json(
      { success: false, error: "Failed to fetch presentation" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/presentations/[id] - Update a presentation
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const updates = await request.json();

    await updatePresentation(id, updates);

    return NextResponse.json({
      success: true,
      message: "Presentation updated successfully",
    });
  } catch (error) {
    logError("Error in PATCH /api/presentations/[id]", { error });
    return NextResponse.json(
      { success: false, error: "Failed to update presentation" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/presentations/[id] - Delete a presentation
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await deletePresentation(id);

    return NextResponse.json({
      success: true,
      message: "Presentation deleted successfully",
    });
  } catch (error) {
    logError("Error in DELETE /api/presentations/[id]", { error });
    return NextResponse.json(
      { success: false, error: "Failed to delete presentation" },
      { status: 500 }
    );
  }
}

