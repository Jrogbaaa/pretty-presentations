"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Download, Copy, ArrowLeft, Check, FileText, Edit, Save, X } from "lucide-react";
import type { BriefResponse } from "@/types";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import "./response-styles.css";

const ResponsePage = () => {
  const params = useParams();
  const router = useRouter();
  const [response, setResponse] = useState<BriefResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState("");

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
          setEditedContent(data.data.markdownContent);
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

  const handleDownload = async () => {
    if (!response) return;

    try {
      // Dynamically import jsPDF and html2canvas
      const { jsPDF } = await import("jspdf");
      const html2canvas = (await import("html2canvas")).default;
      
      const element = document.getElementById("response-content");
      if (!element) return;

      // Create canvas from the content
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff"
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
      });

      const imgWidth = 210; // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      // Add first page
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= 297; // A4 height in mm

      // Add additional pages if needed
      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= 297;
      }

      pdf.save(`${response.clientName.replace(/\s+/g, "-")}-influencer-recommendations.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
      // Fallback to markdown download if PDF fails
      const blob = new Blob([response.markdownContent], { type: "text/markdown" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${response.clientName.replace(/\s+/g, "-")}-influencer-recommendations.md`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
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

  const handleEdit = () => {
    setIsEditing(true);
    setEditedContent(response?.markdownContent || "");
  };

  const handleSave = () => {
    if (!response) return;
    
    // Update the response object with edited content
    const updatedResponse = {
      ...response,
      markdownContent: editedContent
    };
    setResponse(updatedResponse);
    
    // Update sessionStorage if it exists
    const id = params.id as string;
    const sessionData = sessionStorage.getItem(`response-${id}`);
    if (sessionData) {
      sessionStorage.setItem(`response-${id}`, JSON.stringify(updatedResponse));
    }
    
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedContent(response?.markdownContent || "");
    setIsEditing(false);
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
              {isEditing ? (
                <>
                  <button
                    onClick={handleCancel}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-medium"
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                  >
                    <Save className="w-4 h-4" />
                    Save Changes
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={handleEdit}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-medium"
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </button>
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
                    Export PDF
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {isEditing ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Editor */}
            <div className="bg-white rounded-3xl shadow-xl p-6">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Edit Markdown
                </h3>
                <p className="text-sm text-gray-600">
                  Make changes to the content. Markdown formatting is supported.
                </p>
              </div>
              <textarea
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                className="w-full h-[calc(100vh-300px)] p-4 border border-gray-300 rounded-lg font-mono text-sm resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Enter markdown content..."
              />
            </div>
            
            {/* Preview */}
            <div className="bg-white rounded-3xl shadow-xl p-10">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Live Preview
                </h3>
                <p className="text-sm text-gray-600">
                  See how your changes will look
                </p>
              </div>
              <div className="response-content prose prose-xl max-w-none overflow-y-auto h-[calc(100vh-300px)]">
                <ReactMarkdown 
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeRaw]}
                >
                  {editedContent}
                </ReactMarkdown>
              </div>
            </div>
          </div>
        ) : (
          <div 
            id="response-content"
            className="bg-white rounded-3xl shadow-xl p-10 md:p-16"
          >
            <div className="response-content prose prose-xl max-w-none">
              <ReactMarkdown 
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw]}
              >
                {response.markdownContent}
              </ReactMarkdown>
            </div>
          </div>
        )}

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

