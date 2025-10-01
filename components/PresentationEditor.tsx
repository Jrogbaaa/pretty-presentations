"use client";

import { useState, useRef, useEffect } from "react";
import type { Presentation } from "@/types";
import SlideRenderer from "./SlideRenderer";
import { ChevronLeft, ChevronRight, PanelLeftClose, PanelRightClose } from "lucide-react";

interface PresentationEditorProps {
  presentation: Presentation;
  onSave?: (presentation: Presentation) => void;
  onExport?: (format: "pdf" | "pptx") => void;
}

const PresentationEditor = ({ presentation, onSave, onExport }: PresentationEditorProps) => {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [zoom, setZoom] = useState(0.5);
  const [showSidebar, setShowSidebar] = useState(true);
  const [showProperties, setShowProperties] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLDivElement>(null);

  const currentSlide = presentation.slides[currentSlideIndex];

  const handlePrevSlide = () => {
    if (currentSlideIndex > 0) {
      setCurrentSlideIndex(currentSlideIndex - 1);
    }
  };

  const handleNextSlide = () => {
    if (currentSlideIndex < presentation.slides.length - 1) {
      setCurrentSlideIndex(currentSlideIndex + 1);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") {
      handlePrevSlide();
    } else if (e.key === "ArrowRight") {
      handleNextSlide();
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({
      x: e.clientX - panOffset.x,
      y: e.clientY - panOffset.y,
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPanOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleResetPan = () => {
    setPanOffset({ x: 0, y: 0 });
  };

  return (
    <div
      className="flex flex-col min-h-screen bg-gray-100"
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="application"
      aria-label="Presentation Editor"
    >
      {/* Top Toolbar */}
      <div className="bg-white border-b shadow-sm px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => setShowSidebar(!showSidebar)}
            className="p-2 hover:bg-gray-100 rounded transition-colors"
            aria-label="Toggle slides sidebar"
            tabIndex={0}
          >
            <PanelLeftClose className={`w-5 h-5 transition-transform ${showSidebar ? '' : 'rotate-180'}`} />
          </button>
          <h1 className="text-xl font-bold text-gray-900">{presentation.campaignName}</h1>
          <span className="text-sm text-gray-500">for {presentation.clientName}</span>
        </div>

        <div className="flex items-center gap-4">
          {/* Zoom Controls */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setZoom(Math.max(0.25, zoom - 0.1))}
              className="px-3 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors font-semibold"
              aria-label="Zoom out"
              tabIndex={0}
            >
              −
            </button>
            <span className="text-sm font-medium min-w-[4rem] text-center">
              {Math.round(zoom * 100)}%
            </span>
            <button
              type="button"
              onClick={() => setZoom(Math.min(2, zoom + 0.1))}
              className="px-3 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors font-semibold"
              aria-label="Zoom in"
              tabIndex={0}
            >
              +
            </button>
            <button
              type="button"
              onClick={handleResetPan}
              className="px-3 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors text-sm"
              aria-label="Reset view"
              tabIndex={0}
            >
              Reset
            </button>
          </div>

          {/* Export Options */}
          <button
            type="button"
            onClick={() => onExport?.("pdf")}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors font-medium"
            tabIndex={0}
            aria-label="Export presentation to PDF"
          >
            Export to PDF
          </button>
          
          {onSave && (
            <button
              type="button"
              onClick={() => onSave(presentation)}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors font-medium"
              tabIndex={0}
              aria-label="Save presentation"
            >
              Save
            </button>
          )}
          
          <button
            type="button"
            onClick={() => setShowProperties(!showProperties)}
            className="p-2 hover:bg-gray-100 rounded transition-colors"
            aria-label="Toggle properties panel"
            tabIndex={0}
          >
            <PanelRightClose className={`w-5 h-5 transition-transform ${showProperties ? '' : 'rotate-180'}`} />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Slide Thumbnails Sidebar */}
        {showSidebar && (
          <div className="w-64 bg-white border-r overflow-y-auto p-4">
          <h2 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wide">
            Slides ({presentation.slides.length})
          </h2>
          <div className="space-y-3">
            {presentation.slides.map((slide, index) => (
              <button
                key={slide.id}
                type="button"
                onClick={() => setCurrentSlideIndex(index)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setCurrentSlideIndex(index);
                  }
                }}
                className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                  currentSlideIndex === index
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                }`}
                tabIndex={0}
                aria-label={`Go to slide ${index + 1}: ${slide.title}`}
                aria-current={currentSlideIndex === index ? "true" : "false"}
              >
                <div className="flex items-center gap-3">
                  <span className="flex items-center justify-center w-8 h-8 rounded bg-gray-200 text-sm font-semibold">
                    {index + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 truncate">
                      {slide.title}
                    </div>
                    <div className="text-xs text-gray-500 capitalize">
                      {slide.type.replace(/-/g, " ")}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
        )}

        {/* Slide Canvas */}
        <div 
          ref={canvasRef}
          className="flex-1 overflow-hidden bg-gray-50 relative"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
        >
          <div 
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
            style={{
              transform: `translate(${panOffset.x}px, ${panOffset.y}px)`,
            }}
          >
            <div className="pointer-events-auto">
              <SlideRenderer slide={currentSlide} scale={zoom} />
            </div>
          </div>

          {/* Helper Text */}
          <div className="absolute bottom-4 left-4 bg-black bg-opacity-60 text-white px-3 py-2 rounded text-sm pointer-events-none">
            Drag to pan • Scroll to zoom • Arrow keys to navigate
          </div>
        </div>

        {/* Properties Panel */}
        {showProperties && (
          <div className="w-80 bg-white border-l overflow-y-auto p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Slide Properties</h2>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Slide Title
              </label>
              <input
                type="text"
                value={currentSlide.title}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Slide Type
              </label>
              <input
                type="text"
                value={currentSlide.type}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 capitalize"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Background Color
              </label>
              <div className="flex items-center gap-2">
                <div
                  className="w-12 h-12 rounded border border-gray-300"
                  style={{ backgroundColor: currentSlide.design.backgroundColor }}
                />
                <input
                  type="text"
                  value={currentSlide.design.backgroundColor}
                  readOnly
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Text Color
              </label>
              <div className="flex items-center gap-2">
                <div
                  className="w-12 h-12 rounded border border-gray-300"
                  style={{ backgroundColor: currentSlide.design.textColor }}
                />
                <input
                  type="text"
                  value={currentSlide.design.textColor}
                  readOnly
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Accent Color
              </label>
              <div className="flex items-center gap-2">
                <div
                  className="w-12 h-12 rounded border border-gray-300"
                  style={{ backgroundColor: currentSlide.design.accentColor }}
                />
                <input
                  type="text"
                  value={currentSlide.design.accentColor}
                  readOnly
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                />
              </div>
            </div>

            <div className="pt-4 border-t">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Content Summary</h3>
              <div className="space-y-2 text-sm">
                {currentSlide.content.bullets && (
                  <div>
                    <span className="font-medium">Bullet points:</span> {currentSlide.content.bullets.length}
                  </div>
                )}
                {currentSlide.content.influencers && (
                  <div>
                    <span className="font-medium">Influencers:</span> {currentSlide.content.influencers.length}
                  </div>
                )}
                {currentSlide.content.metrics && (
                  <div>
                    <span className="font-medium">Metrics:</span> {currentSlide.content.metrics.length}
                  </div>
                )}
                {currentSlide.content.timeline && (
                  <div>
                    <span className="font-medium">Timeline items:</span> {currentSlide.content.timeline.length}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <div className="bg-white border-t px-6 py-4 flex items-center justify-between">
        <button
          type="button"
          onClick={handlePrevSlide}
          disabled={currentSlideIndex === 0}
          className="px-6 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          tabIndex={0}
          aria-label="Previous slide"
        >
          ← Previous
        </button>

        <div className="text-sm font-medium text-gray-600">
          Slide {currentSlideIndex + 1} of {presentation.slides.length}
        </div>

        <button
          type="button"
          onClick={handleNextSlide}
          disabled={currentSlideIndex === presentation.slides.length - 1}
          className="px-6 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          tabIndex={0}
          aria-label="Next slide"
        >
          Next →
        </button>
      </div>
    </div>
  );
};

export default PresentationEditor;
