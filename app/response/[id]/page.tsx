"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Download, Copy, ArrowLeft, Check, FileText } from "lucide-react";
import type { BriefResponse } from "@/types";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const ResponsePage = () => {
  const params = useParams();
  const router = useRouter();
  const [response, setResponse] = useState<BriefResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const loadResponse = async () => {
      const id = params.id as string;
      
      // Try sessionStorage first
      const sessionData = sessionStorage.getItem(`response-${id}`);
      if (sessionData) {
        try {
          const parsed = JSON.parse(sessionData);
          setResponse(parsed);
          setLoading(false);
          return;
        } catch (err) {
          console.error("Error parsing session data:", err);
        }
      }

      // Fetch from API
      try {
        const res = await fetch(`/api/responses?id=${id}`);
        const data = await res.json();

        if (data.success) {
          setResponse(data.data);
        } else {
          setError(data.error || "Failed to load response");
        }
      } catch (err) {
        console.error("Error loading response:", err);
        setError("Failed to load response");
      } finally {
        setLoading(false);
      }
    };

    loadResponse();
  }, [params.id]);

  const handleDownload = () => {
    if (!response) return;

    const blob = new Blob([response.markdownContent], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${response.clientName.replace(/\s+/g, "-")}-influencer-recommendations.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopy = async () => {
    if (!response) return;

    try {
      await navigator.clipboard.writeText(response.markdownContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleBack = () => {
    router.push("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading response...</p>
        </div>
      </div>
    );
  }

  if (error || !response) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 max-w-md w-full">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Response Not Found
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {error || "The response you're looking for doesn't exist or has been removed."}
            </p>
            <button
              onClick={handleBack}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
            >
              Return Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={handleBack}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                aria-label="Go back"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  {response.clientName} - Influencer Recommendations
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {response.campaignName}
                </p>
              </div>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={handleCopy}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-medium"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copy
                  </>
                )}
              </button>
              <button
                onClick={handleDownload}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
              >
                <Download className="w-4 h-4" />
                Download MD
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 md:p-12">
          <div className="prose prose-lg dark:prose-invert max-w-none
            prose-headings:font-bold prose-headings:tracking-tight
            prose-h1:text-4xl prose-h1:mb-8 prose-h1:text-gray-900 dark:prose-h1:text-white prose-h1:border-b prose-h1:border-gray-200 dark:prose-h1:border-gray-700 prose-h1:pb-4
            prose-h2:text-3xl prose-h2:mt-12 prose-h2:mb-6 prose-h2:text-gray-900 dark:prose-h2:text-white prose-h2:border-b prose-h2:border-gray-200 dark:prose-h2:border-gray-700 prose-h2:pb-3
            prose-h3:text-2xl prose-h3:mt-8 prose-h3:mb-4 prose-h3:text-purple-700 dark:prose-h3:text-purple-400
            prose-h4:text-xl prose-h4:mt-6 prose-h4:mb-3 prose-h4:text-gray-800 dark:prose-h4:text-gray-200
            prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-p:leading-relaxed prose-p:mb-4
            prose-ul:my-4 prose-ul:space-y-2
            prose-li:text-gray-700 dark:prose-li:text-gray-300 prose-li:leading-relaxed
            prose-strong:text-gray-900 dark:prose-strong:text-white prose-strong:font-semibold
            prose-a:text-purple-600 dark:prose-a:text-purple-400 prose-a:no-underline hover:prose-a:underline
            prose-code:text-purple-600 dark:prose-code:text-purple-400 prose-code:bg-purple-50 dark:prose-code:bg-purple-900/20 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:font-normal prose-code:text-sm prose-code:before:content-none prose-code:after:content-none
            prose-pre:bg-gray-100 dark:prose-pre:bg-gray-900 prose-pre:border prose-pre:border-gray-200 dark:prose-pre:border-gray-700
            prose-blockquote:border-l-4 prose-blockquote:border-purple-500 prose-blockquote:bg-purple-50 dark:prose-blockquote:bg-purple-900/10 prose-blockquote:py-2 prose-blockquote:px-4 prose-blockquote:my-4
            prose-hr:border-gray-300 dark:prose-hr:border-gray-600 prose-hr:my-8
            prose-table:w-full prose-table:border-collapse prose-table:my-6
            prose-th:bg-purple-100 dark:prose-th:bg-purple-900/30 prose-th:px-4 prose-th:py-3 prose-th:text-left prose-th:font-semibold prose-th:text-gray-900 dark:prose-th:text-white prose-th:border prose-th:border-gray-300 dark:prose-th:border-gray-600
            prose-td:px-4 prose-td:py-3 prose-td:border prose-td:border-gray-300 dark:prose-td:border-gray-600 prose-td:text-gray-700 dark:prose-td:text-gray-300
            prose-tr:border-b prose-tr:border-gray-200 dark:prose-tr:border-gray-700
            [&_*]:break-words
          ">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {response.markdownContent}
            </ReactMarkdown>
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Generated on {new Date(response.createdAt).toLocaleDateString()} at{" "}
            {new Date(response.createdAt).toLocaleTimeString()}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {response.influencers.length} influencer{response.influencers.length !== 1 ? "s" : ""} matched
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResponsePage;

