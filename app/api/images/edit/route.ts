import { NextRequest, NextResponse } from "next/server";
import { editSlideImage } from "@/lib/replicate-image-service";
import { imageEditLimiter, getClientIdentifier } from "@/lib/rate-limiter";
import { EditImageRequestSchema } from "@/lib/validation-schemas";

export async function POST(request: NextRequest) {
  try {
    // Check rate limit
    const clientId = getClientIdentifier(request);
    const rateLimit = imageEditLimiter.checkLimit(clientId);

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
            "X-RateLimit-Limit": "20",
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": resetTime,
          }
        }
      );
    }

    const body = await request.json();

    // Validate request body with Zod
    const validation = EditImageRequestSchema.safeParse(body);
    
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

    const { currentImageUrl, editPrompt } = validation.data;

    const imageUrl = await editSlideImage(currentImageUrl, editPrompt);

    if (!imageUrl) {
      return NextResponse.json(
        { error: "Failed to edit image" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        imageUrl,
      },
      {
        headers: {
          "X-RateLimit-Limit": "20",
          "X-RateLimit-Remaining": imageEditLimiter.checkLimit(getClientIdentifier(request)).remaining.toString(),
        }
      }
    );
  } catch (error) {
    console.error("Error in /api/images/edit:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
