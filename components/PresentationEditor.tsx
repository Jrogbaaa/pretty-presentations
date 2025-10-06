"use client";

import { useState, useRef } from "react";
import type { Presentation } from "@/types";
import SlideRenderer from "./SlideRenderer";
import { 
  PanelLeftClose, 
  PanelRightClose,
  Undo2,
  Redo2,
  Type,
  Image as ImageIcon,
  Square,
  BarChart3,
  Share2,
  MoreVertical,
  Plus,
  ZoomIn,
  ZoomOut,
  Maximize2
} from "lucide-react";

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

  const handleZoomIn = () => setZoom(Math.min(2, zoom + 0.1));
  const handleZoomOut = () => setZoom(Math.max(0.25, zoom - 0.1));
  const handleZoomFit = () => {
    setZoom(0.5);
    setPanOffset({ x: 0, y: 0 });
  };

  return (
    <div
      className="flex flex-col h-screen bg-background"
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="application"
      aria-label="Presentation Editor"
    >
      {/* Top Navigation Bar - 60px height */}
      <div className="h-[60px] bg-background-surface border-b border-border flex items-center justify-between px-6">
        {/* Left Section */}
        <div className="flex items-center gap-6">
          <h1 className="text-sm font-semibold text-text-primary whitespace-nowrap">Pretty Presentations</h1>
          <div className="h-5 w-px bg-border" />
          <div className="text-sm text-text-secondary truncate max-w-md">
            {presentation.campaignName}
          </div>
        </div>

        {/* Center Section - Toolbar */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            className="w-9 h-9 flex items-center justify-center rounded hover:bg-background transition-fast text-text-secondary"
            aria-label="Undo"
            tabIndex={0}
          >
            <Undo2 className="w-5 h-5" />
          </button>
          <button
            type="button"
            className="w-9 h-9 flex items-center justify-center rounded hover:bg-background transition-fast text-text-secondary"
            aria-label="Redo"
            tabIndex={0}
          >
            <Redo2 className="w-5 h-5" />
          </button>

          <div className="w-px h-5 bg-border mx-2" />

          <button
            type="button"
            className="w-9 h-9 flex items-center justify-center rounded hover:bg-background transition-fast text-text-secondary"
            aria-label="Text tool"
            tabIndex={0}
          >
            <Type className="w-5 h-5" />
          </button>
          <button
            type="button"
            className="w-9 h-9 flex items-center justify-center rounded hover:bg-background transition-fast text-text-secondary"
            aria-label="Image tool"
            tabIndex={0}
          >
            <ImageIcon className="w-5 h-5" />
          </button>
          <button
            type="button"
            className="w-9 h-9 flex items-center justify-center rounded hover:bg-background transition-fast text-text-secondary"
            aria-label="Shape tool"
            tabIndex={0}
          >
            <Square className="w-5 h-5" />
          </button>
          <button
            type="button"
            className="w-9 h-9 flex items-center justify-center rounded hover:bg-background transition-fast text-text-secondary"
            aria-label="Chart tool"
            tabIndex={0}
          >
            <BarChart3 className="w-5 h-5" />
          </button>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => onExport?.("pdf")}
            className="h-9 px-4 bg-primary text-white rounded hover:bg-primary-hover active:bg-primary-active transition-fast text-sm font-medium shadow-sm hover:shadow"
            tabIndex={0}
            aria-label="Export presentation to PDF"
          >
            <div className="flex items-center gap-2">
              <Share2 className="w-4 h-4" />
              <span>Export</span>
            </div>
          </button>
          
          <div className="h-5 w-px bg-border" />
          
          <div className="w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center text-xs font-semibold cursor-pointer hover:bg-primary-hover transition-fast">
            JE
          </div>
          
          <button
            type="button"
            className="w-9 h-9 flex items-center justify-center rounded hover:bg-background transition-fast text-text-secondary"
            aria-label="More options"
            tabIndex={0}
          >
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Slide Panel (Left Sidebar) - 240px width */}
        {showSidebar && (
          <div className="w-[240px] bg-background border-r border-border overflow-y-auto p-lg">
            <div className="flex items-center justify-between mb-md">
              <div className="text-label text-text-muted uppercase">Slides</div>
              <button
                type="button"
                className="w-6 h-6 flex items-center justify-center rounded hover:bg-background-surface transition-base text-text-muted"
                aria-label="Add slide"
                tabIndex={0}
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            
            <div className="space-y-md">
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
                  className={`w-full group transition-base rounded overflow-hidden ${
                    currentSlideIndex === index
                      ? "ring-2 ring-primary"
                      : "hover:shadow-hover"
                  }`}
                  tabIndex={0}
                  aria-label={`Go to slide ${index + 1}: ${slide.title}`}
                  aria-current={currentSlideIndex === index ? "true" : "false"}
                >
                  {/* Slide Thumbnail - 16:9 aspect ratio with actual slide preview */}
                  <div className="relative aspect-video bg-background-surface border border-border rounded overflow-hidden">
                    {/* Slide number badge */}
                    <div className="absolute top-1 left-1 z-20 text-[10px] text-text-primary bg-white/95 px-1.5 py-0.5 rounded shadow-sm font-semibold">
                      {index + 1}
                    </div>
                    
                    {/* Actual slide preview using SlideRenderer */}
                    <div className="w-full h-full">
                      <SlideRenderer slide={slide} scale={0.108} />
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Canvas Area */}
        <div className="flex-1 flex flex-col overflow-hidden relative">
          <div 
            ref={canvasRef}
            className="flex-1 bg-background relative overflow-hidden"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            style={{ cursor: isDragging ? 'grabbing' : 'default' }}
          >
            <div 
              className="absolute inset-0 flex items-center justify-center p-12"
              style={{
                transform: `translate(${panOffset.x}px, ${panOffset.y}px)`,
              }}
            >
              {/* Slide Container with shadow */}
              <div className="bg-background-surface rounded-lg shadow-subtle" style={{ pointerEvents: 'auto' }}>
                <SlideRenderer slide={currentSlide} scale={zoom} />
              </div>
            </div>
          </div>

          {/* Zoom Controls - Bottom Right */}
          <div className="absolute bottom-4 right-4 z-10 bg-background-surface border border-border rounded flex items-center divide-x divide-border shadow-subtle">
            <button
              type="button"
              onClick={handleZoomOut}
              className="h-8 px-3 hover:bg-background transition-fast text-text-secondary flex items-center justify-center"
              aria-label="Zoom out"
              tabIndex={0}
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <div className="h-8 px-3 flex items-center justify-center min-w-[60px] text-xs text-text-secondary font-medium">
              {Math.round(zoom * 100)}%
            </div>
            <button
              type="button"
              onClick={handleZoomIn}
              className="h-8 px-3 hover:bg-background transition-fast text-text-secondary flex items-center justify-center"
              aria-label="Zoom in"
              tabIndex={0}
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleZoomFit}
              className="h-8 px-3 hover:bg-background transition-fast text-xs text-text-secondary font-medium flex items-center justify-center"
              aria-label="Fit to screen"
              tabIndex={0}
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>

          {/* Toggle sidebar buttons */}
          <button
            type="button"
            onClick={() => setShowSidebar(!showSidebar)}
            className="absolute top-4 left-4 z-10 w-9 h-9 flex items-center justify-center rounded bg-background-surface border border-border hover:bg-background transition-base text-text-secondary shadow-subtle"
            aria-label="Toggle slides panel"
            tabIndex={0}
          >
            <PanelLeftClose className={`w-5 h-5 transition-transform ${showSidebar ? '' : 'rotate-180'}`} />
          </button>

          <button
            type="button"
            onClick={() => setShowProperties(!showProperties)}
            className="absolute top-4 right-4 z-10 w-9 h-9 flex items-center justify-center rounded bg-background-surface border border-border hover:bg-background transition-base text-text-secondary shadow-subtle"
            aria-label="Toggle properties panel"
            tabIndex={0}
          >
            <PanelRightClose className={`w-5 h-5 transition-transform ${showProperties ? '' : 'rotate-180'}`} />
          </button>
        </div>

        {/* Properties Panel (Right Sidebar) - 280px width */}
        {showProperties && (
          <div className="w-[280px] bg-background-surface border-l border-border overflow-y-auto p-xl">
            <h2 className="text-heading-3 text-text-primary mb-xl">Properties</h2>
            
            <div className="space-y-xl">
              {/* Slide Title */}
              <div>
                <label className="block text-caption text-text-muted font-semibold mb-md uppercase tracking-wide">
                  Slide Title
                </label>
                <input
                  type="text"
                  value={currentSlide.title}
                  readOnly
                  className="w-full h-9 px-md border border-border rounded text-body text-text-primary bg-background focus:outline-none focus:border-primary focus:ring-[3px] focus:ring-primary/10 transition-fast"
                />
              </div>

              {/* Slide Type */}
              <div>
                <label className="block text-caption text-text-muted font-semibold mb-md uppercase tracking-wide">
                  Slide Type
                </label>
                <input
                  type="text"
                  value={currentSlide.type.replace(/-/g, " ")}
                  readOnly
                  className="w-full h-9 px-md border border-border rounded text-body text-text-primary bg-background capitalize focus:outline-none focus:border-primary focus:ring-[3px] focus:ring-primary/10 transition-fast"
                />
              </div>

              {/* Background Color */}
              <div>
                <label className="block text-caption text-text-muted font-semibold mb-md uppercase tracking-wide">
                  Background Color
                </label>
                <div className="flex items-center gap-md">
                  <div
                    className="w-9 h-9 rounded border border-border flex-shrink-0"
                    style={{ backgroundColor: currentSlide.design.backgroundColor }}
                  />
                  <input
                    type="text"
                    value={currentSlide.design.backgroundColor}
                    readOnly
                    className="flex-1 h-9 px-md border border-border rounded text-body text-text-primary bg-background focus:outline-none focus:border-primary focus:ring-[3px] focus:ring-primary/10 transition-fast"
                  />
                </div>
              </div>

              {/* Text Color */}
              <div>
                <label className="block text-caption text-text-muted font-semibold mb-md uppercase tracking-wide">
                  Text Color
                </label>
                <div className="flex items-center gap-md">
                  <div
                    className="w-9 h-9 rounded border border-border flex-shrink-0"
                    style={{ backgroundColor: currentSlide.design.textColor }}
                  />
                  <input
                    type="text"
                    value={currentSlide.design.textColor}
                    readOnly
                    className="flex-1 h-9 px-md border border-border rounded text-body text-text-primary bg-background focus:outline-none focus:border-primary focus:ring-[3px] focus:ring-primary/10 transition-fast"
                  />
                </div>
              </div>

              {/* Accent Color */}
              <div>
                <label className="block text-caption text-text-muted font-semibold mb-md uppercase tracking-wide">
                  Accent Color
                </label>
                <div className="flex items-center gap-md">
                  <div
                    className="w-9 h-9 rounded border border-border flex-shrink-0"
                    style={{ backgroundColor: currentSlide.design.accentColor }}
                  />
                  <input
                    type="text"
                    value={currentSlide.design.accentColor}
                    readOnly
                    className="flex-1 h-9 px-md border border-border rounded text-body text-text-primary bg-background focus:outline-none focus:border-primary focus:ring-[3px] focus:ring-primary/10 transition-fast"
                  />
                </div>
              </div>

              {/* Content Summary */}
              <div className="pt-lg border-t border-border">
                <h3 className="text-caption text-text-muted font-semibold mb-md uppercase tracking-wide">
                  Content Summary
                </h3>
                <div className="space-y-md text-body text-text-secondary">
                  {currentSlide.content.bullets && (
                    <div className="flex justify-between">
                      <span>Bullet points</span>
                      <span className="font-medium text-text-primary">{currentSlide.content.bullets.length}</span>
                    </div>
                  )}
                  {currentSlide.content.influencers && (
                    <div className="flex justify-between">
                      <span>Influencers</span>
                      <span className="font-medium text-text-primary">{currentSlide.content.influencers.length}</span>
                    </div>
                  )}
                  {currentSlide.content.metrics && (
                    <div className="flex justify-between">
                      <span>Metrics</span>
                      <span className="font-medium text-text-primary">{currentSlide.content.metrics.length}</span>
                    </div>
                  )}
                  {currentSlide.content.timeline && (
                    <div className="flex justify-between">
                      <span>Timeline items</span>
                      <span className="font-medium text-text-primary">{currentSlide.content.timeline.length}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PresentationEditor;
