"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import BriefForm from "@/components/BriefForm";
import BriefUpload from "@/components/BriefUpload";
import ProcessingOverlay from "@/components/ProcessingOverlay";
import { processBrief } from "@/lib/ai-processor-openai";
import { ShuffleHero } from "@/components/ui/shuffle-grid";
import { HeroSection } from "@/components/ui/hero-section-dark";
import { Target, Zap, Sparkles, Upload, FileCheck, Presentation, WifiOff } from "lucide-react";
import type { ClientBrief } from "@/types";
import { getUserFriendlyError } from "@/types/errors";
import type { PresentationEngine } from "@/components/PresentationEngineSelector";

const HomePage = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingMode, setProcessingMode] = useState<"presentation" | "text">("presentation");
  const [error, setError] = useState<string | null>(null);
  const [rateLimitResetTime, setRateLimitResetTime] = useState<number | null>(null);
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

  // Rate limit countdown timer
  useEffect(() => {
    if (!rateLimitResetTime) return;

    const updateCountdown = () => {
      const now = Date.now();
      if (now >= rateLimitResetTime) {
        setRateLimitResetTime(null);
        setError(null);
      }
    };

    // Update every second
    const interval = setInterval(updateCountdown, 1000);
    updateCountdown(); // Run immediately

    return () => clearInterval(interval);
  }, [rateLimitResetTime]);

  const handleParsedBrief = (brief: ClientBrief) => {
    setParsedBrief(brief);
    setShowUpload(false);
    setError(null);
  };

  const handleSubmit = async (brief: ClientBrief, engine: PresentationEngine = "standard") => {
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
    
    setProcessingMode("presentation");
    setIsProcessing(true);
    setError(null);

    try {
      // Check if Presenton was selected
      if (engine === "presenton") {
        console.log("🚀 Using Presenton engine...");
        
        try {
          // Call Presenton generation API
          const response = await fetch("/api/presenton/generate", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(brief),
          });
          
          const data = await response.json();
          
          if (response.ok && data.success) {
            console.log("✅ Presenton generation successful!", data);
            
            alert(`Presentation generated successfully with Presenton!\n\nPresentation ID: ${data.presentationId}\n\nYou can download it from the Presenton container's app_data directory.`);
            
            setIsProcessing(false);
            return;
          } else {
            // Presenton failed, fall back to standard
            console.warn("⚠️ Presenton generation failed, falling back to standard generator");
            setError("Presenton is not available. Using standard generator instead.");
            // Fall through to standard generator
          }
        } catch (presentonError) {
          console.error("❌ Presenton error:", presentonError);
          setError("Presenton generation failed. Using standard generator instead.");
          // Fall through to standard generator
        }
      }
      
      // Standard generator (or fallback from Presenton)
      console.log("🎯 Using standard generator...");
      
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
    setRateLimitResetTime(null);

    try {
      // Call API route to generate markdown response
      const res = await fetch("/api/generate-text-response", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(brief),
      });

      const data = await res.json();

      // Handle rate limiting
      if (res.status === 429) {
        const resetTime = data.resetTime || Date.now() + 60000;
        setRateLimitResetTime(resetTime);
        setError(data.error || 'Rate limit exceeded. Please try again later.');
        setIsProcessing(false);
        return;
      }

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
            <div 
              className={`mb-8 p-6 border-2 rounded-xl ${
                rateLimitResetTime 
                  ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800' 
                  : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
              }`}
              role="alert"
              aria-live="assertive"
            >
              <div className="flex items-start gap-3">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                  rateLimitResetTime 
                    ? 'bg-orange-100 dark:bg-orange-900/30' 
                    : 'bg-red-100 dark:bg-red-900/30'
                }`}>
                  <span className="text-2xl">{rateLimitResetTime ? '⏱️' : '⚠️'}</span>
                </div>
                <div className="flex-1">
                  <h3 className={`font-semibold text-lg mb-1 ${
                    rateLimitResetTime 
                      ? 'text-orange-900 dark:text-orange-300' 
                      : 'text-red-900 dark:text-red-300'
                  }`}>
                    {rateLimitResetTime ? 'Rate Limit Reached' : 'Error'}
                  </h3>
                  <p className={
                    rateLimitResetTime 
                      ? 'text-orange-700 dark:text-orange-400' 
                      : 'text-red-700 dark:text-red-400'
                  }>
                    {error}
                  </p>
                  {rateLimitResetTime && (() => {
                    const secondsRemaining = Math.max(0, Math.ceil((rateLimitResetTime - Date.now()) / 1000));
                    const minutes = Math.floor(secondsRemaining / 60);
                    const seconds = secondsRemaining % 60;
                    
                    return (
                      <div className="mt-3 flex items-center gap-2">
                        <div className="bg-orange-100 dark:bg-orange-900/40 px-4 py-2 rounded-lg">
                          <p className="text-orange-900 dark:text-orange-200 font-mono text-lg font-semibold">
                            {minutes > 0 ? `${minutes}:${seconds.toString().padStart(2, '0')}` : `${seconds}s`}
                          </p>
                          <p className="text-orange-700 dark:text-orange-400 text-xs mt-1">
                            Try again in
                          </p>
                        </div>
                        <p className="text-sm text-orange-600 dark:text-orange-400">
                          To prevent abuse, we limit requests to 5 per minute. Your limit will reset shortly.
                        </p>
                      </div>
                    );
                  })()}
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
          {isProcessing && <ProcessingOverlay mode={processingMode} />}
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