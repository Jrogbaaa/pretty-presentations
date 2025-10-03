import { initializeApp, getApps, getApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { GoogleGenerativeAI } from "@google/generative-ai";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize services
let analytics: ReturnType<typeof getAnalytics> | null = null;
if (typeof window !== "undefined") {
  analytics = getAnalytics(app);
}

const db = getFirestore(app);
const storage = getStorage(app);

// Initialize Google Generative AI (more reliable than Vertex AI preview)
// Try Google AI API key first, fallback to Firebase API key
const apiKey = process.env.NEXT_PUBLIC_GOOGLE_AI_API_KEY || process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "";

if (!apiKey) {
  console.warn("No API key found for Google Generative AI. Please set NEXT_PUBLIC_GOOGLE_AI_API_KEY in your .env.local file.");
}

const genAI = new GoogleGenerativeAI(apiKey);

// Text generation model (for briefs, content, matching)
// Note: Google AI API uses Gemini 2.5 models
const model = genAI.getGenerativeModel({
  model: process.env.NEXT_PUBLIC_GOOGLE_AI_MODEL || "gemini-2.5-flash",
});

// Image generation model (for backgrounds, graphics, editing)
// Using image generation model as per https://ai.google.dev/gemini-api/docs/image-generation
// FIXED: Removed "-preview" suffix per official docs
const imageModel = genAI.getGenerativeModel({
  model: process.env.NEXT_PUBLIC_GOOGLE_AI_IMAGE_MODEL || "gemini-2.5-flash-image",
});

export { app, analytics, db, storage, genAI, model, imageModel };
