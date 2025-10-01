import { db } from "./firebase";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  limit,
  where,
  Timestamp,
  serverTimestamp,
} from "firebase/firestore";
import type { Presentation } from "@/types";
import { logInfo, logWarn, logError } from "./logger";

const PRESENTATIONS_COLLECTION = "presentations";

/**
 * Save a presentation to Firestore
 */
export const savePresentation = async (presentation: Presentation): Promise<void> => {
  try {
    const presentationRef = doc(db, PRESENTATIONS_COLLECTION, presentation.id);
    
    const data = {
      ...presentation,
      updatedAt: serverTimestamp(),
      createdAt: presentation.createdAt || serverTimestamp(),
    };

    await setDoc(presentationRef, data, { merge: true });
    
    logInfo("Presentation saved to Firestore", {
      id: presentation.id,
      campaignName: presentation.campaignName,
      slideCount: presentation.slides.length,
    });
  } catch (error) {
    logError("Error saving presentation to Firestore", { error, id: presentation.id });
    throw new Error("Failed to save presentation");
  }
};

/**
 * Get a single presentation by ID
 */
export const getPresentation = async (id: string): Promise<Presentation | null> => {
  try {
    const presentationRef = doc(db, PRESENTATIONS_COLLECTION, id);
    const presentationSnap = await getDoc(presentationRef);

    if (!presentationSnap.exists()) {
      logWarn("Presentation not found", { id });
      return null;
    }

    const data = presentationSnap.data();
    
    // Convert Firestore Timestamps to ISO strings
    return {
      ...data,
      createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
      updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt,
    } as Presentation;
  } catch (error) {
    logError("Error fetching presentation from Firestore", { error, id });
    throw new Error("Failed to load presentation");
  }
};

/**
 * Get all presentations (with optional filters)
 */
export const getAllPresentations = async (options?: {
  limitCount?: number;
  status?: string;
}): Promise<Presentation[]> => {
  try {
    let q = query(
      collection(db, PRESENTATIONS_COLLECTION),
      orderBy("createdAt", "desc")
    );

    if (options?.status) {
      q = query(q, where("status", "==", options.status));
    }

    if (options?.limitCount) {
      q = query(q, limit(options.limitCount));
    }

    const querySnapshot = await getDocs(q);
    
    const presentations: Presentation[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      presentations.push({
        ...data,
        id: doc.id,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt,
      } as Presentation);
    });

    logInfo("Presentations fetched from Firestore", {
      count: presentations.length,
    });

    return presentations;
  } catch (error) {
    logError("Error fetching presentations from Firestore", { error });
    throw new Error("Failed to load presentations");
  }
};

/**
 * Update a presentation
 */
export const updatePresentation = async (
  id: string,
  updates: Partial<Presentation>
): Promise<void> => {
  try {
    const presentationRef = doc(db, PRESENTATIONS_COLLECTION, id);
    
    await updateDoc(presentationRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });

    logInfo("Presentation updated in Firestore", { id });
  } catch (error) {
    logError("Error updating presentation in Firestore", { error, id });
    throw new Error("Failed to update presentation");
  }
};

/**
 * Delete a presentation
 */
export const deletePresentation = async (id: string): Promise<void> => {
  try {
    const presentationRef = doc(db, PRESENTATIONS_COLLECTION, id);
    await deleteDoc(presentationRef);
    
    logInfo("Presentation deleted from Firestore", { id });
  } catch (error) {
    logError("Error deleting presentation from Firestore", { error, id });
    throw new Error("Failed to delete presentation");
  }
};

/**
 * Duplicate a presentation
 */
export const duplicatePresentation = async (id: string): Promise<Presentation> => {
  try {
    const original = await getPresentation(id);
    
    if (!original) {
      throw new Error("Presentation not found");
    }

    const newId = Date.now().toString();
    const duplicate: Presentation = {
      ...original,
      id: newId,
      campaignName: `${original.campaignName} (Copy)`,
      status: "draft",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await savePresentation(duplicate);
    
    logInfo("Presentation duplicated", { originalId: id, newId });
    
    return duplicate;
  } catch (error) {
    logError("Error duplicating presentation", { error, id });
    throw new Error("Failed to duplicate presentation");
  }
};

