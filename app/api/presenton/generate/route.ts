import { NextRequest, NextResponse } from "next/server";
import type { ClientBrief } from "@/types";
import { checkPresentonAvailable } from "@/lib/presenton-api";
import { generatePresentationWithPresenton } from "@/lib/presenton-adapter";
import { matchInfluencers } from "@/lib/influencer-matcher";
import { logInfo, logError } from "@/lib/logger";

/**
 * POST /api/presenton/generate
 * Generate presentation using Presenton engine
 */
export async function POST(request: NextRequest) {
  try {
    const brief: ClientBrief = await request.json();
    
    logInfo("Presenton generation request received", {
      clientName: brief.clientName,
      budget: brief.budget,
    });
    
    // Check if Presenton is available
    const isAvailable = await checkPresentonAvailable();
    
    if (!isAvailable) {
      return NextResponse.json(
        {
          success: false,
          error: "Presenton is not available",
          fallbackToStandard: true,
        },
        { status: 503 }
      );
    }
    
    // Match influencers using your existing logic
    const matchedInfluencers = await matchInfluencers(brief, []);
    
    logInfo("Influencers matched for Presenton", {
      count: matchedInfluencers.length,
    });
    
    // Generate with Presenton
    const result = await generatePresentationWithPresenton(brief, matchedInfluencers);
    
    logInfo("Presenton generation successful", {
      presentationId: result.presentationId,
    });
    
    return NextResponse.json({
      success: true,
      presentationId: result.presentationId,
      filePath: result.filePath,
      editPath: result.editPath,
      influencerCount: matchedInfluencers.length,
    });
  } catch (error) {
    logError("Presenton generation failed", { error });
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        fallbackToStandard: true,
      },
      { status: 500 }
    );
  }
}

