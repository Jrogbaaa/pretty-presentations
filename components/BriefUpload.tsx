"use client";

import { useState } from "react";
import { parseBriefDocument } from "@/lib/brief-parser-openai.server";
import { extractBriefSummary, SAMPLE_BRIEF } from "@/lib/brief-parser";
import { Upload, FileText, Sparkles } from "lucide-react";
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

  const handleLoadSample = async () => {
    setBriefText(SAMPLE_BRIEF);
    const briefSummary = extractBriefSummary(SAMPLE_BRIEF);
    setSummary(briefSummary);
    
    // Automatically parse the sample brief
    setIsParsing(true);
    setError(null);
    
    try {
      const parsed = await parseBriefDocument(SAMPLE_BRIEF);
      onParsed(parsed);
    } catch (err) {
      console.error("Parse error:", err);
      setError(err instanceof Error ? err.message : "Failed to parse sample brief");
    } finally {
      setIsParsing(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-8 mb-8 border border-gray-200 dark:border-gray-800">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
            <Upload className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
              Upload Brief Document
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Paste your brief text below. Works with English, Spanish, or mixed language briefs.
            </p>
          </div>
        </div>
      </div>

      {/* Text Area */}
      <div className="mb-6">
        <textarea
          value={briefText}
          onChange={(e) => handleTextChange(e.target.value)}
          placeholder="Paste your brief here... (e.g., client briefs in Spanish or English)"
          rows={12}
          className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 font-mono text-sm transition-colors"
        />
      </div>

      {/* Brief Summary */}
      {summary && (
        <div className="mb-6 p-5 bg-purple-50 dark:bg-purple-900/20 rounded-xl border border-purple-200 dark:border-purple-800">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <h4 className="font-semibold text-purple-900 dark:text-purple-300">Brief Analysis</h4>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm mb-4">
            <div className={`flex items-center gap-2 ${summary.hasClient ? "text-green-700 dark:text-green-400" : "text-gray-500 dark:text-gray-500"}`}>
              <span className="text-lg">{summary.hasClient ? "✓" : "○"}</span>
              <span>Client Info</span>
            </div>
            <div className={`flex items-center gap-2 ${summary.hasBudget ? "text-green-700 dark:text-green-400" : "text-gray-500 dark:text-gray-500"}`}>
              <span className="text-lg">{summary.hasBudget ? "✓" : "○"}</span>
              <span>Budget</span>
            </div>
            <div className={`flex items-center gap-2 ${summary.hasTarget ? "text-green-700 dark:text-green-400" : "text-gray-500 dark:text-gray-500"}`}>
              <span className="text-lg">{summary.hasTarget ? "✓" : "○"}</span>
              <span>Target</span>
            </div>
            <div className={`flex items-center gap-2 ${summary.hasTimeline ? "text-green-700 dark:text-green-400" : "text-gray-500 dark:text-gray-500"}`}>
              <span className="text-lg">{summary.hasTimeline ? "✓" : "○"}</span>
              <span>Timeline</span>
            </div>
          </div>
          <div>
            <div className="flex items-center gap-3">
              <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-purple-600 to-pink-600 h-3 rounded-full transition-all"
                  style={{ width: `${summary.confidence}%` }}
                />
              </div>
              <span className="text-sm font-semibold text-purple-900 dark:text-purple-300 min-w-[80px] text-right">
                {summary.confidence}% Complete
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="mb-6 p-5 bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-xl">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-xl">⚠️</span>
            </div>
            <div>
              <h4 className="font-semibold text-red-900 dark:text-red-300 mb-1">Parsing Error</h4>
              <p className="text-red-700 dark:text-red-400 text-sm">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <button
          onClick={handleParse}
          disabled={isParsing || !briefText.trim()}
          className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isParsing ? (
            <span className="flex items-center justify-center gap-2">
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
              Parsing with AI...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <Sparkles className="w-5 h-5" />
              Parse Brief & Auto-Fill Form
            </span>
          )}
        </button>

        <button
          onClick={handleLoadSample}
          className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium flex items-center justify-center gap-2"
        >
          <FileText className="w-5 h-5" />
          Load Sample
        </button>

        {briefText && (
          <button
            onClick={() => {
              setBriefText("");
              setSummary(null);
              setError(null);
            }}
            className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium"
            aria-label="Clear"
          >
            Clear
          </button>
        )}
      </div>

      {/* Help Text */}
      <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/10 dark:to-purple-900/10 rounded-xl border border-blue-200 dark:border-blue-900">
        <p className="text-sm text-gray-700 dark:text-gray-300">
          <strong className="text-blue-600 dark:text-blue-400">💡 Tip:</strong> Our AI can parse briefs in any format. Just paste the text, and we&apos;ll extract:
          client name, budget, target demographics, campaign goals, timeline, and more.
        </p>
      </div>
    </div>
  );
};

export default BriefUpload;