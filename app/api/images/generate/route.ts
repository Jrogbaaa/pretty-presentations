import { NextRequest, NextResponse } from "next/server";
import { generateSlideImage } from "@/lib/replicate-image-service";
import type { ClientBrief } from "@/types";
import { imageGenerationLimiter, getClientIdentifier } from "@/lib/rate-limiter";
import { GenerateImageRequestSchema } from "@/lib/validation-schemas";

export async function POST(request: NextRequest) {
  try {
    // Check rate limit
    const clientId = getClientIdentifier(request);
    const rateLimit = imageGenerationLimiter.checkLimit(clientId);

    if (!rateLimit.allowed) {
      const resetTime = new Date(rateLimit.resetTime).toISOString();
      return NextResponse.json(
        { 
          error: "Rate limit exceeded. Please try again later.",
          resetTime 
        },
        { 
          status: 429,
          headers: {
            "X-RateLimit-Limit": "10",
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": resetTime,
          }
        }
      );
    }

    const body = await request.json();

    // Validate request body with Zod
    const validation = GenerateImageRequestSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json(
        { 
          error: "Invalid request data",
          details: validation.error.issues.map(issue => ({
            field: issue.path.join('.'),
            message: issue.message
          }))
        },
        { status: 400 }
      );
    }

    const { slideType, slideContent, brief, aspectRatio } = validation.data;

    const imageUrl = await generateSlideImage({
      slideType,
      slideContent,
      brief,
      aspectRatio: aspectRatio || "16:9",
    });

    if (!imageUrl) {
      return NextResponse.json(
        { error: "Failed to generate image" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        imageUrl,
        prompt: `Generated for ${slideType} slide`,
      },
      {
        headers: {
          "X-RateLimit-Limit": "10",
          "X-RateLimit-Remaining": imageGenerationLimiter.checkLimit(getClientIdentifier(request)).remaining.toString(),
        }
      }
    );
  } catch (error) {
    console.error("Error in /api/images/generate:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
