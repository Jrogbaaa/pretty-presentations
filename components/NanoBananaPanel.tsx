"use client";

import { useState, useEffect, useRef } from "react";
import type { Slide, ClientBrief } from "@/types";
import { Sparkles, RefreshCw, Loader2, Image as ImageIcon, X } from "lucide-react";
import { useImageGeneration } from "@/hooks/useImageGeneration";

interface NanoBananaPanelProps {
  currentSlide: Slide;
  brief: ClientBrief;
  onImageUpdate: (slideId: string, imageUrl: string) => void;
  onClose: () => void;
}

const NanoBananaPanel = ({
  currentSlide,
  brief,
  onImageUpdate,
  onClose,
}: NanoBananaPanelProps) => {
  const { state, generateImage, regenerateImage, editImage } = useImageGeneration();
  const [editPrompt, setEditPrompt] = useState("");
  const [chatHistory, setChatHistory] = useState<Array<{ role: "user" | "assistant"; message: string }>>([
    {
      role: "assistant",
      message: "👋 Hi! I'm Nano Banana, your AI image assistant. I can help you generate, edit, or regenerate images for your slides. What would you like to do?",
    },
  ]);

  const panelRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const currentImage = currentSlide.content.images?.[0];

  // Focus management
  useEffect(() => {
    // Focus the panel when it opens
    panelRef.current?.focus();

    // Trap focus within panel
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const handleGenerate = async () => {
    setChatHistory((prev) => [
      ...prev,
      { role: "user", message: "Generate an image for this slide" },
    ]);

    const imageUrl = await generateImage(currentSlide, brief);

    if (imageUrl) {
      onImageUpdate(currentSlide.id, imageUrl);
      setChatHistory((prev) => [
        ...prev,
        { role: "assistant", message: "✅ Image generated successfully!" },
      ]);
    } else {
      setChatHistory((prev) => [
        ...prev,
        { role: "assistant", message: "❌ Failed to generate image. Please try again." },
      ]);
    }
  };

  const handleRegenerate = async () => {
    setChatHistory((prev) => [
      ...prev,
      { role: "user", message: "Regenerate this image" },
    ]);

    const imageUrl = await regenerateImage(currentSlide, brief);

    if (imageUrl) {
      onImageUpdate(currentSlide.id, imageUrl);
      setChatHistory((prev) => [
        ...prev,
        { role: "assistant", message: "✅ Image regenerated with a fresh take!" },
      ]);
    } else {
      setChatHistory((prev) => [
        ...prev,
        { role: "assistant", message: "❌ Failed to regenerate image. Please try again." },
      ]);
    }
  };

  const handleEdit = async () => {
    if (!editPrompt.trim() || !currentImage) return;

    setChatHistory((prev) => [
      ...prev,
      { role: "user", message: editPrompt },
    ]);

    const imageUrl = await editImage(currentSlide.id, currentImage, editPrompt);

    if (imageUrl) {
      onImageUpdate(currentSlide.id, imageUrl);
      setChatHistory((prev) => [
        ...prev,
        { role: "assistant", message: "✅ Image edited successfully!" },
      ]);
      setEditPrompt("");
    } else {
      setChatHistory((prev) => [
        ...prev,
        { role: "assistant", message: "❌ Failed to edit image. Please try again." },
      ]);
    }
  };

  const handleQuickEdit = async (prompt: string) => {
    setEditPrompt(prompt);
    
    if (!currentImage) return;

    setChatHistory((prev) => [
      ...prev,
      { role: "user", message: prompt },
    ]);

    const imageUrl = await editImage(currentSlide.id, currentImage, prompt);

    if (imageUrl) {
      onImageUpdate(currentSlide.id, imageUrl);
      setChatHistory((prev) => [
        ...prev,
        { role: "assistant", message: "✅ Style updated!" },
      ]);
    }
  };

  return (
    <div 
      ref={panelRef}
      tabIndex={-1}
      role="dialog"
      aria-labelledby="nano-banana-title"
      aria-modal="true"
      className="w-96 bg-white border-l border-gray-200 flex flex-col h-full"
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-600" />
          <h2 id="nano-banana-title" className="text-lg font-bold text-gray-900">Nano Banana</h2>
        </div>
        <button
          ref={closeButtonRef}
          type="button"
          onClick={onClose}
          className="p-2 hover:bg-gray-100 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-purple-600"
          aria-label="Close Nano Banana panel"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Current Slide Info */}
      <div className="p-4 bg-gray-50 border-b border-gray-200">
        <div className="text-sm font-semibold text-gray-700 mb-1">Current Slide</div>
        <div className="text-lg font-bold text-gray-900">{currentSlide.title}</div>
        <div className="text-xs text-gray-500 capitalize mt-1">
          {currentSlide.type.replace(/-/g, " ")}
        </div>
      </div>

      {/* Current Image Preview */}
      {currentImage && (
        <div className="p-4 border-b border-gray-200">
          <div className="text-sm font-semibold text-gray-700 mb-2">Current Image</div>
          <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-100">
            <img
              src={currentImage}
              alt={`Generated image for ${currentSlide.title}${currentSlide.content.subtitle ? `: ${currentSlide.content.subtitle}` : ''}`}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      )}

      {/* Chat History */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {chatHistory.map((item, index) => (
          <div
            key={index}
            className={`flex ${item.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] rounded-lg px-4 py-2 ${
                item.role === "user"
                  ? "bg-purple-600 text-white"
                  : "bg-gray-100 text-gray-900"
              }`}
            >
              <div className="text-sm">{item.message}</div>
            </div>
          </div>
        ))}

        {state.isGenerating && (
          <div className="flex justify-start">
            <div 
              className="bg-gray-100 rounded-lg px-4 py-2 flex items-center gap-2"
              role="status"
              aria-live="polite"
            >
              <Loader2 className="w-4 h-4 animate-spin text-purple-600" />
              <span className="text-sm text-gray-700">Generating image...</span>
            </div>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="p-4 border-t border-gray-200 space-y-2">
        <div className="text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">
          Quick Actions
        </div>
        
        {!currentImage ? (
          <button
            type="button"
            onClick={handleGenerate}
            disabled={state.isGenerating}
            className="w-full px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ImageIcon className="w-4 h-4" />
            Generate Image
          </button>
        ) : (
          <>
            <button
              type="button"
              onClick={handleRegenerate}
              disabled={state.isGenerating}
              className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium flex items-center justify-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw className="w-4 h-4" />
              Regenerate
            </button>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickEdit("Make it more professional and corporate")}
                disabled={state.isGenerating}
                className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-xs font-medium disabled:opacity-50"
              >
                Professional
              </button>
              <button
                type="button"
                onClick={() => handleQuickEdit("Make it more vibrant and colorful")}
                disabled={state.isGenerating}
                className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-xs font-medium disabled:opacity-50"
              >
                Vibrant
              </button>
              <button
                type="button"
                onClick={() => handleQuickEdit("Make it more minimal and clean")}
                disabled={state.isGenerating}
                className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-xs font-medium disabled:opacity-50"
              >
                Minimal
              </button>
              <button
                type="button"
                onClick={() => handleQuickEdit("Add more dynamic energy and movement")}
                disabled={state.isGenerating}
                className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-xs font-medium disabled:opacity-50"
              >
                Dynamic
              </button>
            </div>
          </>
        )}
      </div>

      {/* Custom Edit Input */}
      {currentImage && (
        <div className="p-4 border-t border-gray-200">
          <div className="flex gap-2">
            <input
              type="text"
              value={editPrompt}
              onChange={(e) => setEditPrompt(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleEdit()}
              placeholder="Describe your changes..."
              disabled={state.isGenerating}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 text-sm disabled:opacity-50"
            />
            <button
              type="button"
              onClick={handleEdit}
              disabled={state.isGenerating || !editPrompt.trim()}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Sparkles className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Error Display */}
      {state.error && (
        <div className="p-4 bg-red-50 border-t border-red-200">
          <div className="text-sm text-red-700">{state.error}</div>
        </div>
      )}

      {/* Offline Indicator */}
      {!state.isOnline && (
        <div className="p-3 bg-yellow-50 border-t border-yellow-200">
          <div className="flex items-center gap-2">
            <span className="text-yellow-600">⚠️</span>
            <div className="text-sm text-yellow-800">
              You're offline. Image features are unavailable.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NanoBananaPanel;
