"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Download, Copy, ArrowLeft, Check, FileText, Edit, Save, X, Pencil } from "lucide-react";
import type { BriefResponse } from "@/types";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import EditableMarkdown from "@/components/EditableMarkdown";
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
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

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
    if (!response || isExporting) return;

    setIsExporting(true);

    try {
      // Dynamically import jsPDF and html2canvas
      const { jsPDF } = await import("jspdf");
      const html2canvas = (await import("html2canvas")).default;
      
      const element = document.getElementById("response-content");
      if (!element) {
        console.error("Could not find response-content element");
        setIsExporting(false);
        return;
      }

      // Force light mode styles for PDF
      element.classList.add("pdf-export-mode");
      
      // Wait for styles to apply
      await new Promise(resolve => setTimeout(resolve, 200));

      // Create canvas from the content
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
        onclone: (clonedDoc) => {
          const clonedElement = clonedDoc.getElementById("response-content");
          if (clonedElement) {
            clonedElement.style.backgroundColor = "#ffffff";
            clonedElement.style.padding = "40px";
            // Apply light mode to all elements
            const allElements = clonedElement.querySelectorAll('*');
            allElements.forEach((el) => {
              const htmlEl = el as HTMLElement;
              if (htmlEl.style) {
                // Don't override table headers or special colored elements
                const tagName = htmlEl.tagName.toLowerCase();
                if (tagName !== 'th' && !htmlEl.classList.contains('bg-purple-600')) {
                  htmlEl.style.color = "#1f2937";
                }
              }
            });
            // Fix table headers
            const tableHeaders = clonedElement.querySelectorAll('th');
            tableHeaders.forEach((th) => {
              (th as HTMLElement).style.color = "#ffffff";
              (th as HTMLElement).style.backgroundColor = "rgb(147, 51, 234)";
            });
          }
        }
      });

      // Restore original styles
      element.classList.remove("pdf-export-mode");

      // PDF dimensions
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "px",
        format: "a4",
        hotfixes: ["px_scaling"]
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 40;
      const contentWidth = pageWidth - (margin * 2);
      
      // Calculate scaled dimensions
      const imgWidth = contentWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      // Calculate how many pages we need
      const contentHeight = pageHeight - (margin * 2);
      const totalPages = Math.ceil(imgHeight / contentHeight);
      
      // For each page, create a cropped canvas and add it
      for (let page = 0; page < totalPages; page++) {
        if (page > 0) {
          pdf.addPage();
        }
        
        // Calculate source y position in the original canvas
        const sourceY = page * (canvas.height / totalPages) * (contentHeight / imgHeight) * (canvas.height / imgHeight);
        const sourceHeight = (contentHeight / imgHeight) * canvas.height;
        
        // Create a temporary canvas for this page section
        const pageCanvas = document.createElement('canvas');
        pageCanvas.width = canvas.width;
        pageCanvas.height = Math.min(sourceHeight, canvas.height - (page * sourceHeight));
        
        const ctx = pageCanvas.getContext('2d');
        if (ctx) {
          // Draw the portion of the original canvas for this page
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
          ctx.drawImage(
            canvas,
            0, page * sourceHeight, // Source x, y
            canvas.width, pageCanvas.height, // Source width, height
            0, 0, // Destination x, y
            pageCanvas.width, pageCanvas.height // Destination width, height
          );
        }
        
        const pageImgData = pageCanvas.toDataURL("image/png", 1.0);
        const pageImgHeight = (pageCanvas.height * imgWidth) / pageCanvas.width;
        
        pdf.addImage(pageImgData, "PNG", margin, margin, imgWidth, pageImgHeight);
      }

      // Save with proper filename
      const filename = `${response.clientName.replace(/\s+/g, "-")}-influencer-recommendations.pdf`;
      pdf.save(filename);
      
      console.log(`✅ PDF exported successfully: ${filename}`);
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("There was an issue generating the PDF. Please try again or use the copy function to copy the content.");
    } finally {
      setIsExporting(false);
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
    setHasUnsavedChanges(false);
  };

  const handleContentChange = useCallback((newContent: string) => {
    setEditedContent(newContent);
    setHasUnsavedChanges(true);
  }, []);

  const handleSave = useCallback(() => {
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
    setHasUnsavedChanges(false);
  }, [response, editedContent, params.id]);

  const handleCancel = useCallback(() => {
    if (hasUnsavedChanges) {
      const confirmed = window.confirm("You have unsaved changes. Are you sure you want to discard them?");
      if (!confirmed) return;
    }
    setEditedContent(response?.markdownContent || "");
    setIsEditing(false);
    setHasUnsavedChanges(false);
  }, [hasUnsavedChanges, response?.markdownContent]);

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
                    disabled={isExporting}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors font-medium ${
                      isExporting 
                        ? 'bg-purple-400 cursor-not-allowed' 
                        : 'bg-purple-600 hover:bg-purple-700'
                    } text-white`}
                  >
                    {isExporting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Exporting...
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4" />
                        Export PDF
                      </>
                    )}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Editing Mode Banner */}
        {isEditing && (
          <div className="mb-6 p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                <Pencil className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-purple-900 dark:text-purple-100">
                  Editing Mode Active
                </h3>
                <p className="text-sm text-purple-700 dark:text-purple-300">
                  Click on any section below to edit it directly. Changes are highlighted with a purple border.
                </p>
              </div>
              {hasUnsavedChanges && (
                <span className="px-3 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 text-sm font-medium rounded-full">
                  Unsaved changes
                </span>
              )}
            </div>
          </div>
        )}

        <div 
          id="response-content"
          className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-10 md:p-16"
        >
          {isEditing ? (
            <EditableMarkdown
              content={editedContent}
              onChange={handleContentChange}
              onSave={handleSave}
              className="min-h-[60vh]"
            />
          ) : (
            <div className="response-content prose prose-xl max-w-none dark:prose-invert">
              <ReactMarkdown 
                key="content-markdown"
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw]}
                components={{
                  p: ({node, ...props}) => <p {...props} />,
                  div: ({node, ...props}) => <div {...props} />,
                }}
              >
                {response.markdownContent}
              </ReactMarkdown>
            </div>
          )}
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

