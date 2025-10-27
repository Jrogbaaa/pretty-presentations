import { NextRequest, NextResponse } from "next/server";
import { generateMarkdownResponse } from "@/lib/markdown-response-generator.server";
import type { ClientBrief } from "@/types";

/**
 * POST /api/generate-text-response
 * Generate a text-based influencer recommendation response
 */
export async function POST(request: NextRequest) {
  try {
    const brief: ClientBrief = await request.json();

    // Validate brief
    if (!brief.budget || brief.budget === 0) {
      return NextResponse.json(
        { error: "Budget is required" },
        { status: 400 }
      );
    }

    if (!brief.clientName || !brief.campaignGoals?.length) {
      return NextResponse.json(
        { error: "Client name and campaign goals are required" },
        { status: 400 }
      );
    }

    // Generate markdown response with influencer matching
    const response = await generateMarkdownResponse(brief);

    return NextResponse.json({ 
      success: true, 
      response 
    });
  } catch (error) {
    console.error("Error generating text response:", error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : "Failed to generate response" 
      },
      { status: 500 }
    );
  }
}

