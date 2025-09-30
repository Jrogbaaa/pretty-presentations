"use client";

import { useState } from "react";
import { parseBriefDocument, extractBriefSummary, SAMPLE_BRIEF } from "@/lib/brief-parser";
import type { ClientBrief } from "@/types";

interface BriefUploadProps {
  onParsed: (brief: ClientBrief) => void;
}

const BriefUpload = ({ onParsed }: BriefUploadProps) => {
  const [briefText, setBriefText] = useState("");
  const [isParsing, setIsParsing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<{
    hasClient: boolean;
    hasBudget: boolean;
    hasTarget: boolean;
    hasTimeline: boolean;
    confidence: number;
  } | null>(null);

  const handleTextChange = (text: string) => {
    setBriefText(text);
    setError(null);
    
    if (text.length > 50) {
      const briefSummary = extractBriefSummary(text);
      setSummary(briefSummary);
    } else {
      setSummary(null);
    }
  };

  const handleParse = async () => {
    if (!briefText.trim()) {
      setError("Please enter or paste a brief first");
      return;
    }

    setIsParsing(true);
    setError(null);

    try {
      const parsed = await parseBriefDocument(briefText);
      onParsed(parsed);
    } catch (err) {
      console.error("Parse error:", err);
      setError(err instanceof Error ? err.message : "Failed to parse brief");
    } finally {
      setIsParsing(false);
    }
  };

  const handleLoadSample = () => {
    setBriefText(SAMPLE_BRIEF);
    const briefSummary = extractBriefSummary(SAMPLE_BRIEF);
    setSummary(briefSummary);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
      <div className="mb-4">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Upload Brief Document
        </h3>
        <p className="text-gray-600 text-sm">
          Paste your brief text below. Works with English, Spanish, or mixed language briefs.
        </p>
      </div>

      {/* Text Area */}
      <div className="mb-4">
        <textarea
          value={briefText}
          onChange={(e) => handleTextChange(e.target.value)}
          placeholder="Paste your brief here... (e.g., client briefs in Spanish or English)"
          rows={12}
          className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
        />
      </div>

      {/* Brief Summary */}
      {summary && (
        <div className="mb-4 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-semibold text-blue-900 mb-2">Brief Analysis</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            <div className={`flex items-center gap-2 ${summary.hasClient ? "text-green-700" : "text-gray-500"}`}>
              <span>{summary.hasClient ? "✓" : "○"}</span>
              <span>Client Info</span>
            </div>
            <div className={`flex items-center gap-2 ${summary.hasBudget ? "text-green-700" : "text-gray-500"}`}>
              <span>{summary.hasBudget ? "✓" : "○"}</span>
              <span>Budget</span>
            </div>
            <div className={`flex items-center gap-2 ${summary.hasTarget ? "text-green-700" : "text-gray-500"}`}>
              <span>{summary.hasTarget ? "✓" : "○"}</span>
              <span>Target</span>
            </div>
            <div className={`flex items-center gap-2 ${summary.hasTimeline ? "text-green-700" : "text-gray-500"}`}>
              <span>{summary.hasTimeline ? "✓" : "○"}</span>
              <span>Timeline</span>
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all"
                  style={{ width: `${summary.confidence}%` }}
                />
              </div>
              <span className="text-sm font-medium text-blue-900">
                {summary.confidence}% Complete
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start gap-3">
            <span className="text-red-600 text-xl">⚠️</span>
            <div>
              <h4 className="font-semibold text-red-900">Parsing Error</h4>
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          onClick={handleParse}
          disabled={isParsing || !briefText.trim()}
          className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-md hover:from-blue-700 hover:to-purple-700 transition-all font-semibold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isParsing ? (
            <span className="flex items-center justify-center gap-2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
              Parsing with AI...
            </span>
          ) : (
            "Parse Brief & Auto-Fill Form"
          )}
        </button>

        <button
          onClick={handleLoadSample}
          className="px-6 py-3 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors font-medium"
        >
          Load Sample
        </button>

        {briefText && (
          <button
            onClick={() => {
              setBriefText("");
              setSummary(null);
              setError(null);
            }}
            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
            aria-label="Clear"
          >
            Clear
          </button>
        )}
      </div>

      {/* Help Text */}
      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
        <p className="text-sm text-gray-600">
          <strong>💡 Tip:</strong> Our AI can parse briefs in any format. Just paste the text, and we&apos;ll extract:
          client name, budget, target demographics, campaign goals, timeline, and more.
        </p>
      </div>
    </div>
  );
};

export default BriefUpload;
