"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import BriefForm from "@/components/BriefForm";
import BriefUpload from "@/components/BriefUpload";
import { processBrief } from "@/lib/ai-processor-openai";
import { ShuffleHero } from "@/components/ui/shuffle-grid";
import { HeroSection } from "@/components/ui/hero-section-dark";
import { Target, Zap, Sparkles, Upload, FileCheck, Presentation, WifiOff } from "lucide-react";
import type { ClientBrief } from "@/types";
import { getUserFriendlyError } from "@/types/errors";

const HomePage = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [parsedBrief, setParsedBrief] = useState<ClientBrief | null>(null);
  const [showUpload, setShowUpload] = useState(true);
  const [isOnline, setIsOnline] = useState(true);
  const router = useRouter();

  // Online/offline detection
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setError(null);
    };
    
    const handleOffline = () => {
      setIsOnline(false);
      setError('You are currently offline. Please check your internet connection.');
    };
    
    // Check initial state
    setIsOnline(navigator.onLine);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleParsedBrief = (brief: ClientBrief) => {
    setParsedBrief(brief);
    setShowUpload(false);
    setError(null);
  };

  const handleSubmit = async (brief: ClientBrief) => {
    // Check budget is provided
    if (!brief.budget || brief.budget === 0) {
      setError('Please enter a campaign budget before generating your presentation.');
      return;
    }
    
    // Check online status
    if (!isOnline) {
      setError('You are offline. Please check your internet connection and try again.');
      return;
    }
    
    setIsProcessing(true);
    setError(null);

    try {
      // Process the brief and generate presentation
      // Pass empty array to fetch real influencers from Firestore database (~3k Spanish influencers)
      // Will automatically fall back to mockInfluencers if Firestore is unavailable
      const result = await processBrief(brief, []);

      if (result.warnings.length > 0 && result.confidence < 50) {
        setError(`Unable to process brief: ${result.warnings.join(", ")}`);
        setIsProcessing(false);
        return;
      }

      // Upload images to Firebase Storage and replace base64 with URLs
      let presentationToSave = result.presentation;
      try {
        const { uploadSlideImages } = await import("@/lib/storage-service");
        const updatedSlides = await uploadSlideImages(
          result.presentation.slides,
          result.presentation.id
        );
        presentationToSave = {
          ...result.presentation,
          slides: updatedSlides,
        };
      } catch (uploadError) {
        console.error("Error uploading images to Storage:", uploadError);
        // Continue with base64 images if upload fails
      }

      // Save presentation to Firestore
      try {
        await fetch("/api/presentations", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(presentationToSave),
        });
      } catch (saveError) {
        console.error("Error saving presentation:", saveError);
        // Continue anyway - presentation is in memory
      }

      // Store presentation in sessionStorage for immediate display
      // This allows the editor to show images immediately while Firestore loads
      try {
        sessionStorage.setItem(
          `presentation-${result.presentation.id}`,
          JSON.stringify(result.presentation)
        );
      } catch (storageError) {
        console.warn("Could not store presentation in sessionStorage:", storageError);
      }

      // Navigate to editor
      router.push(`/editor/${result.presentation.id}`);
    } catch (err) {
      console.error("Error processing brief:", err);
      const friendlyError = getUserFriendlyError(err);
      setError(friendlyError);
      setIsProcessing(false);
    }
  };

  const handleGenerateTextResponse = async (brief: ClientBrief) => {
    // Check budget is provided
    if (!brief.budget || brief.budget === 0) {
      setError('Please enter a campaign budget before generating influencer recommendations.');
      return;
    }
    
    // Check online status
    if (!isOnline) {
      setError('You are offline. Please check your internet connection and try again.');
      return;
    }
    
    setProcessingMode("text");
    setIsProcessing(true);
    setError(null);

    try {
      // Call API route to generate markdown response
      const res = await fetch("/api/generate-text-response", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(brief),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to generate response");
      }

      const response = data.response;

      // Save response to Firestore
      try {
        await fetch("/api/responses", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(response),
        });
      } catch (saveError) {
        console.error("Error saving response:", saveError);
        // Continue anyway - response is in memory
      }

      // Store response in sessionStorage for immediate display
      try {
        sessionStorage.setItem(
          `response-${response.id}`,
          JSON.stringify(response)
        );
      } catch (storageError) {
        console.warn("Could not store response in sessionStorage:", storageError);
      }

      // Navigate to response page
      router.push(`/response/${response.id}`);
    } catch (err) {
      console.error("Error generating text response:", err);
      const friendlyError = getUserFriendlyError(err);
      setError(friendlyError);
      setIsProcessing(false);
    }
  };

  const handleResetUpload = () => {
    setParsedBrief(null);
    setShowUpload(true);
    setError(null);
  };

  const handleScrollToBrief = () => {
    const briefSection = document.getElementById("brief-section");
    if (briefSection) {
      briefSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      {/* Animated Hero Section */}
      <HeroSection
        title="AI-Powered Presentations"
        subtitle={{
          regular: "Transform briefs into ",
          gradient: "stunning presentations",
        }}
        description="Our intelligent platform matches influencers to brands and generates professional, client-ready presentations in minutes using advanced AI technology."
        ctaText="Create Presentation"
        ctaHref="#brief-section"
        onCtaClick={handleScrollToBrief}
        gridOptions={{
          angle: 65,
          opacity: 0.3,
          cellSize: 60,
          lightLineColor: "#9333ea",
          darkLineColor: "#7c3aed",
        }}
      />

      {/* Shuffle Grid Hero Section */}
      <div className="bg-gradient-to-b from-white to-gray-50 dark:from-black dark:to-gray-950 py-12">
        <ShuffleHero />
      </div>

      {/* Features Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-950">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Why Choose Pretty Presentations?
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Everything you need to create professional presentations with AI
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow border border-gray-200 dark:border-gray-800">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mb-4">
                <Target className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">Smart Matching</h3>
              <p className="text-gray-600 dark:text-gray-400">
                AI analyzes thousands of influencers to find the perfect fit for your campaign goals and target audience
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow border border-gray-200 dark:border-gray-800">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">Lightning Fast</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Generate complete, client-ready presentations in minutes instead of spending hours on manual work
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow border border-gray-200 dark:border-gray-800">
              <div className="w-12 h-12 bg-pink-100 dark:bg-pink-900/30 rounded-lg flex items-center justify-center mb-4">
                <Sparkles className="w-6 h-6 text-pink-600 dark:text-pink-400" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">Professional Quality</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Agency-standard presentations with beautiful designs that impress clients every single time
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-white dark:bg-black">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Three simple steps to create your perfect presentation
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <Upload className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-semibold mb-3 text-gray-900 dark:text-white">1. Upload Brief</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Upload your client brief or fill out our simple form with campaign details
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <FileCheck className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-semibold mb-3 text-gray-900 dark:text-white">2. AI Processing</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Our AI analyzes your brief and matches the perfect influencers automatically
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-pink-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <Presentation className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-semibold mb-3 text-gray-900 dark:text-white">3. Get Presentation</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Receive your professional presentation ready to present or customize further
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Offline Warning Banner */}
      {!isOnline && (
        <div className="sticky top-0 z-50 bg-orange-500 text-white py-3 px-6 shadow-lg">
          <div className="max-w-7xl mx-auto flex items-center justify-center gap-3">
            <WifiOff className="w-5 h-5" />
            <p className="font-semibold">
              You are currently offline. Features requiring internet will not work.
            </p>
          </div>
        </div>
      )}

      {/* Brief Upload Section */}
      <section id="brief-section" className="py-20 bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-black">
        <div className="max-w-7xl mx-auto px-6">

          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Start Creating Now
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Upload your brief or fill out the form below to generate your presentation
            </p>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-8 p-6 bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">⚠️</span>
                </div>
                <div>
                  <h3 className="font-semibold text-red-900 dark:text-red-300 text-lg">Error</h3>
                  <p className="text-red-700 dark:text-red-400">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Brief Upload/Parse Section */}
          {showUpload && !parsedBrief && (
            <BriefUpload onParsed={handleParsedBrief} />
          )}

          {/* Show parsed brief success message */}
          {parsedBrief && !isProcessing && (
            <div className="mb-8 p-6 bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-800 rounded-xl">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                  <FileCheck className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-green-900 dark:text-green-300 text-lg mb-2">
                    Brief Parsed Successfully!
                  </h3>
                  <p className="text-green-700 dark:text-green-400 mb-4">
                    We&apos;ve extracted all the information from your brief and pre-filled the form below.
                    Review the details and make any adjustments before generating your presentation.
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
                      <span className="text-lg">✓</span>
                      <span>Client: {parsedBrief.clientName}</span>
                    </div>
                    <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
                      <span className="text-lg">✓</span>
                      <span>Budget: €{parsedBrief.budget.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
                      <span className="text-lg">✓</span>
                      <span>Goals: {parsedBrief.campaignGoals.length}</span>
                    </div>
                    <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
                      <span className="text-lg">✓</span>
                      <span>Platforms: {parsedBrief.platformPreferences.length}</span>
                    </div>
                  </div>
                  <button
                    onClick={handleResetUpload}
                    className="mt-4 text-sm text-green-700 dark:text-green-400 hover:text-green-900 dark:hover:text-green-300 underline transition-colors"
                  >
                    Upload a different brief
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Brief Form */}
          <BriefForm 
            onSubmit={handleSubmit}
            onGenerateTextResponse={handleGenerateTextResponse}
            isProcessing={isProcessing}
            initialData={parsedBrief || undefined}
          />

          {/* Processing Overlay */}
          {isProcessing && (
            <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
              <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 max-w-md text-center shadow-2xl border border-gray-200 dark:border-gray-800">
                <div className="relative">
                  <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-200 dark:border-purple-900 border-t-purple-600 dark:border-t-purple-400 mx-auto mb-6" />
                  <Sparkles className="w-6 h-6 text-purple-600 dark:text-purple-400 absolute top-5 left-1/2 -translate-x-1/2 animate-pulse" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                  Generating Your Presentation
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Our AI is analyzing your brief, matching influencers, and creating your slides...
                </p>
                <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-center gap-3 justify-center">
                    <FileCheck className="w-4 h-4 text-green-600 dark:text-green-400" />
                    <p>Processing brief requirements</p>
                  </div>
                  <div className="flex items-center gap-3 justify-center">
                    <Target className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <p>Matching influencers to target audience</p>
                  </div>
                  <div className="flex items-center gap-3 justify-center">
                    <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    <p>Generating slide content with AI</p>
                  </div>
                  <div className="flex items-center gap-3 justify-center animate-pulse">
                    <Presentation className="w-4 h-4 text-pink-600 dark:text-pink-400" />
                    <p>Creating professional presentation...</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white dark:bg-black border-t border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Look After You</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">AI-powered influencer talent agency</p>
            <p className="text-sm text-gray-500 dark:text-gray-500">
              Powered by Firebase Vertex AI & Gemini
            </p>
            <div className="mt-6 flex items-center justify-center gap-6">
              <button
                onClick={() => router.push("/presentations")}
                className="text-sm text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors"
              >
                My Presentations
              </button>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-6">
              © 2025 Pretty Presentations. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;