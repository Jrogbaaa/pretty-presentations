"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import BriefForm from "@/components/BriefForm";
import BriefUpload from "@/components/BriefUpload";
import ProcessingOverlay from "@/components/ProcessingOverlay";
import LanguageToggle from "@/components/LanguageToggle";
import { HeroSection } from "@/components/ui/hero-section-dark";
import { ShuffleHero } from "@/components/ui/shuffle-grid";
import { Target, Zap, Sparkles, Upload, FileCheck, FileText, WifiOff } from "lucide-react";
import type { ClientBrief } from "@/types";
import { getUserFriendlyError } from "@/types/errors";
import { useLanguage } from "@/lib/language-context";

const HomePage = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rateLimitResetTime, setRateLimitResetTime] = useState<number | null>(null);
  const [parsedBrief, setParsedBrief] = useState<ClientBrief | null>(null);
  const [showUpload, setShowUpload] = useState(true);
  const [isOnline, setIsOnline] = useState(true);
  const router = useRouter();
  const { t } = useLanguage();

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

  const handleGenerateBriefResponse = async (brief: ClientBrief) => {
    // Check budget is provided
    if (!brief.budget || brief.budget === 0) {
      setError('Please enter a campaign budget before generating your brief response.');
      return;
    }
    
    // Check online status
    if (!isOnline) {
      setError('You are offline. Please check your internet connection and try again.');
      return;
    }
    
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
      console.error("Error generating brief response:", err);
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
      {/* Language Toggle - Fixed Position */}
      <div className="fixed top-4 right-4 z-50">
        <LanguageToggle variant="dropdown" />
      </div>

      {/* Animated Hero Section */}
      <HeroSection
        title={t.hero.title}
        subtitle={{
          regular: t.hero.subtitleRegular,
          gradient: t.hero.subtitleGradient,
        }}
        description={t.hero.description}
        ctaText={t.hero.cta}
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
              {t.features.title}
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              {t.features.subtitle}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow border border-gray-200 dark:border-gray-800">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mb-4">
                <Target className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">{t.features.smartMatching.title}</h3>
              <p className="text-gray-600 dark:text-gray-400">
                {t.features.smartMatching.description}
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow border border-gray-200 dark:border-gray-800">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">{t.features.superFast.title}</h3>
              <p className="text-gray-600 dark:text-gray-400">
                {t.features.superFast.description}
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow border border-gray-200 dark:border-gray-800">
              <div className="w-12 h-12 bg-pink-100 dark:bg-pink-900/30 rounded-lg flex items-center justify-center mb-4">
                <Sparkles className="w-6 h-6 text-pink-600 dark:text-pink-400" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">{t.features.professionalQuality.title}</h3>
              <p className="text-gray-600 dark:text-gray-400">
                {t.features.professionalQuality.description}
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
              {t.howItWorks.title}
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              {t.howItWorks.subtitle}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <Upload className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-semibold mb-3 text-gray-900 dark:text-white">{t.howItWorks.step1.title}</h3>
              <p className="text-gray-600 dark:text-gray-400">
                {t.howItWorks.step1.description}
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <FileCheck className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-semibold mb-3 text-gray-900 dark:text-white">{t.howItWorks.step2.title}</h3>
              <p className="text-gray-600 dark:text-gray-400">
                {t.howItWorks.step2.description}
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-pink-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <FileText className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-semibold mb-3 text-gray-900 dark:text-white">{t.howItWorks.step3.title}</h3>
              <p className="text-gray-600 dark:text-gray-400">
                {t.howItWorks.step3.description}
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
              {t.errors.offlineWarning}
            </p>
          </div>
        </div>
      )}

      {/* Brief Upload Section */}
      <section id="brief-section" className="py-20 bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-black">
        <div className="max-w-7xl mx-auto px-6">

          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {t.brief.title}
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              {t.brief.subtitle}
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
                    {rateLimitResetTime ? t.errors.rateLimitTitle : t.errors.error}
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
                            {t.errors.tryAgainIn}
                          </p>
                        </div>
                        <p className="text-sm text-orange-600 dark:text-orange-400">
                          {t.errors.rateLimitText}
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
                    {t.brief.successTitle}
                  </h3>
                  <p className="text-green-700 dark:text-green-400 mb-4">
                    {t.brief.successDescription}
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
                      <span className="text-lg">✓</span>
                      <span>{t.brief.clientInfo}: {parsedBrief.clientName}</span>
                    </div>
                    <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
                      <span className="text-lg">✓</span>
                      <span>{t.brief.budget}: €{parsedBrief.budget.toLocaleString()}</span>
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
                    {t.brief.uploadDifferent}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Brief Form */}
          <BriefForm 
            onGenerateBriefResponse={handleGenerateBriefResponse}
            isProcessing={isProcessing}
            initialData={parsedBrief || undefined}
          />

          {/* Processing Overlay */}
          {isProcessing && <ProcessingOverlay />}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white dark:bg-black border-t border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{t.footer.company}</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">{t.footer.tagline}</p>
            <p className="text-sm text-gray-500 dark:text-gray-500">
              {t.footer.poweredBy}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-6">
              {t.footer.copyright}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
