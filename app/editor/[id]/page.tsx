"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import PresentationEditor from "@/components/PresentationEditor";
import type { Presentation } from "@/types";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const EditorPage = () => {
  const params = useParams();
  const router = useRouter();
  const [presentation, setPresentation] = useState<Presentation | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    const fetchPresentation = async () => {
      try {
        const response = await fetch(`/api/presentations/${params.id}`);
        const data = await response.json();

        if (data.success && data.presentation) {
          setPresentation(data.presentation);
        } else {
          console.error("Presentation not found");
          router.push("/presentations");
        }
      } catch (error) {
        console.error("Error loading presentation:", error);
        router.push("/presentations");
      }
    };

    fetchPresentation();
  }, [params.id, router]);

  const handleSave = async (updatedPresentation: Presentation) => {
    try {
      const response = await fetch(`/api/presentations/${updatedPresentation.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedPresentation),
      });

      const data = await response.json();

      if (data.success) {
        setPresentation(updatedPresentation);
        alert("Presentation saved successfully!");
      } else {
        alert("Failed to save presentation");
      }
    } catch (error) {
      console.error("Error saving presentation:", error);
      alert("Failed to save presentation");
    }
  };

  const handleExport = async (format: "pdf" | "pptx") => {
    if (!presentation) return;

    setIsExporting(true);

    try {
      if (format === "pdf") {
        await exportToPDF(presentation);
      } else {
        alert("PowerPoint export coming soon!");
      }
    } catch (error) {
      console.error("Export error:", error);
      alert("Failed to export presentation. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  const exportToPDF = async (pres: Presentation) => {
    const pdf = new jsPDF({
      orientation: "landscape",
      unit: "px",
      format: [1920, 1080],
    });

    // For each slide, render it and add to PDF
    for (let i = 0; i < pres.slides.length; i++) {
      const slideElement = document.getElementById(`slide-${i}`);
      
      if (slideElement) {
        const canvas = await html2canvas(slideElement, {
          width: 1920,
          height: 1080,
          scale: 1,
        });

        const imgData = canvas.toDataURL("image/png");
        
        if (i > 0) {
          pdf.addPage();
        }
        
        pdf.addImage(imgData, "PNG", 0, 0, 1920, 1080);
      }
    }

    pdf.save(`${pres.campaignName}-${pres.clientName}.pdf`);
  };

  if (!presentation) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading presentation...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <PresentationEditor
        presentation={presentation}
        onSave={handleSave}
        onExport={handleExport}
      />

      {/* Export Overlay */}
      {isExporting && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Exporting Presentation
            </h3>
            <p className="text-gray-600">
              Please wait while we generate your PDF...
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default EditorPage;
