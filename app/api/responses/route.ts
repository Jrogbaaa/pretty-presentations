import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import type { BriefResponse } from "@/types";

/**
 * POST /api/responses
 * Save a brief response to Firestore (using Admin SDK for server-side operations)
 */
export async function POST(request: NextRequest) {
  try {
    const response: BriefResponse = await request.json();

    // Convert Date objects to timestamps for Firestore
    const responseData = {
      ...response,
      createdAt: response.createdAt instanceof Date 
        ? response.createdAt.toISOString() 
        : response.createdAt,
    };

    // Use Admin SDK to write to Firestore
    const docRef = await adminDb.collection("responses").add(responseData);

    return NextResponse.json(
      { 
        success: true, 
        id: docRef.id,
        message: "Response saved successfully" 
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error saving response:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : "Failed to save response" 
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/responses/[id]
 * Retrieve a brief response from Firestore (using Admin SDK)
 */
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Response ID is required" },
        { status: 400 }
      );
    }

    // Use Admin SDK to read from Firestore
    const docRef = adminDb.collection("responses").doc(id);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      return NextResponse.json(
        { success: false, error: "Response not found" },
        { status: 404 }
      );
    }

    const responseData = {
      ...docSnap.data(),
      id: docSnap.id,
    } as BriefResponse;

    return NextResponse.json(
      { success: true, data: responseData },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error retrieving response:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : "Failed to retrieve response" 
      },
      { status: 500 }
    );
  }
}

