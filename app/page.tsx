"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import BriefForm from "@/components/BriefForm";
import BriefUpload from "@/components/BriefUpload";
import { processBrief } from "@/lib/ai-processor";
import { mockInfluencers } from "@/lib/mock-influencers";
import type { ClientBrief } from "@/types";

const HomePage = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [parsedBrief, setParsedBrief] = useState<ClientBrief | null>(null);
  const [showUpload, setShowUpload] = useState(true);
  const router = useRouter();

  const handleParsedBrief = (brief: ClientBrief) => {
    setParsedBrief(brief);
    setShowUpload(false);
    setError(null);
  };

  const handleSubmit = async (brief: ClientBrief) => {
    setIsProcessing(true);
    setError(null);

    try {
      // Process the brief and generate presentation
      const result = await processBrief(brief, mockInfluencers);

      if (result.warnings.length > 0 && result.confidence < 50) {
        setError(`Unable to process brief: ${result.warnings.join(", ")}`);
        setIsProcessing(false);
        return;
      }

      // Store presentation in localStorage (in production, save to Firestore)
      localStorage.setItem("current-presentation", JSON.stringify(result.presentation));

      // Navigate to editor
      router.push(`/editor/${result.presentation.id}`);
    } catch (err) {
      console.error("Error processing brief:", err);
      setError("Failed to generate presentation. Please try again.");
      setIsProcessing(false);
    }
  };

  const handleResetUpload = () => {
    setParsedBrief(null);
    setShowUpload(true);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Look After You</h1>
              <p className="text-gray-600 mt-1">AI-Powered Presentation Generator</p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push("/presentations")}
                className="px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors"
              >
                My Presentations
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h2 className="text-5xl font-bold text-gray-900 mb-4">
            Transform Briefs into Presentations
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Our AI-powered platform automatically matches influencers to brands and generates
            professional, client-ready presentations in minutes.
          </p>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-4xl mb-4">🎯</div>
            <h3 className="text-xl font-semibold mb-2">Smart Matching</h3>
            <p className="text-gray-600">
              AI analyzes thousands of influencers to find the perfect fit for your campaign
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-4xl mb-4">⚡</div>
            <h3 className="text-xl font-semibold mb-2">Lightning Fast</h3>
            <p className="text-gray-600">
              Generate complete presentations in minutes, not hours
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-4xl mb-4">✨</div>
            <h3 className="text-xl font-semibold mb-2">Professional Quality</h3>
            <p className="text-gray-600">
              Agency-standard presentations that impress clients every time
            </p>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-3">
              <span className="text-2xl">⚠️</span>
              <div>
                <h3 className="font-semibold text-red-900">Error</h3>
                <p className="text-red-700">{error}</p>
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
          <div className="mb-8 p-6 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-start gap-3">
              <span className="text-3xl">✅</span>
              <div className="flex-1">
                <h3 className="font-semibold text-green-900 text-lg mb-2">
                  Brief Parsed Successfully!
                </h3>
                <p className="text-green-700 mb-3">
                  We&apos;ve extracted all the information from your brief and pre-filled the form below.
                  Review the details and make any adjustments before generating your presentation.
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                  <div className="flex items-center gap-2 text-green-700">
                    <span>✓</span>
                    <span>Client: {parsedBrief.clientName}</span>
                  </div>
                  <div className="flex items-center gap-2 text-green-700">
                    <span>✓</span>
                    <span>Budget: €{parsedBrief.budget.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-2 text-green-700">
                    <span>✓</span>
                    <span>Goals: {parsedBrief.campaignGoals.length}</span>
                  </div>
                  <div className="flex items-center gap-2 text-green-700">
                    <span>✓</span>
                    <span>Platforms: {parsedBrief.platformPreferences.length}</span>
                  </div>
                </div>
                <button
                  onClick={handleResetUpload}
                  className="mt-4 text-sm text-green-700 hover:text-green-900 underline"
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
          isProcessing={isProcessing}
          initialData={parsedBrief || undefined}
        />

        {/* Processing Overlay */}
        {isProcessing && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-md text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Generating Your Presentation
              </h3>
              <p className="text-gray-600 mb-4">
                Our AI is analyzing your brief, matching influencers, and creating your slides...
              </p>
              <div className="space-y-2 text-sm text-gray-500">
                <p>✓ Processing brief requirements</p>
                <p>✓ Matching influencers to target audience</p>
                <p>✓ Generating slide content with AI</p>
                <p className="animate-pulse">⏳ Creating professional presentation...</p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-20">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="text-center text-gray-600">
            <p>© 2025 Look After You. AI-powered influencer talent agency.</p>
            <p className="text-sm mt-2">
              Powered by Firebase Vertex AI & Gemini
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;