"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import PresentationEditor from "@/components/PresentationEditor";
import type { Presentation } from "@/types";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import pptxgen from "pptxgenjs";

const EditorPage = () => {
  const params = useParams();
  const router = useRouter();
  const [presentation, setPresentation] = useState<Presentation | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    const fetchPresentation = async () => {
      try {
        // First, check sessionStorage for immediate display
        const cachedKey = `presentation-${params.id}`;
        const cachedData = sessionStorage.getItem(cachedKey);
        
        if (cachedData) {
          try {
            const cachedPresentation = JSON.parse(cachedData);
            setPresentation(cachedPresentation);
            // Clear from sessionStorage after using it
            sessionStorage.removeItem(cachedKey);
            // Don't return - still fetch from Firestore in background
          } catch (parseError) {
            console.warn("Could not parse cached presentation:", parseError);
          }
        }

        // Fetch from Firestore (has uploaded images with URLs)
        const response = await fetch(`/api/presentations/${params.id}`);
        const data = await response.json();

        if (data.success && data.presentation) {
          setPresentation(data.presentation);
        } else if (!cachedData) {
          // Only redirect if we don't have cached data
          console.error("Presentation not found");
          router.push("/presentations");
        }
      } catch (error) {
        console.error("Error loading presentation:", error);
        // Only redirect if we don't already have a presentation loaded
        if (!presentation) {
          router.push("/presentations");
        }
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
      } else if (format === "pptx") {
        await exportToPPTX(presentation);
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

    // Fetch image through proxy to avoid CORS
    const proxyImage = async (url: string): Promise<string> => {
      try {
        const response = await fetch(`/api/proxy-image?url=${encodeURIComponent(url)}`);
        const data = await response.json();
        return data.dataUrl || '';
      } catch (error) {
        console.error('Error proxying image:', error);
        return '';
      }
    };

    // Aggressively sanitize element - strip ALL styles that could cause issues
    const sanitizeForExport = async (originalElement: HTMLElement) => {
      // Get all original elements and their computed styles FIRST
      const originalElements = [originalElement, ...Array.from(originalElement.querySelectorAll('*'))] as HTMLElement[];
      const styleMap = new Map<HTMLElement, CSSStyleDeclaration>();
      
      originalElements.forEach((el) => {
        styleMap.set(el, window.getComputedStyle(el));
      });
      
      // NOW clone
      const clone = originalElement.cloneNode(true) as HTMLElement;
      const clonedElements = [clone, ...Array.from(clone.querySelectorAll('*'))] as HTMLElement[];
      
      // Collect image proxy promises
      const imageProxies: Promise<void>[] = [];
      
      // Process each cloned element
      clonedElements.forEach((clonedEl, index) => {
        const originalEl = originalElements[index];
        const computed = styleMap.get(originalEl);
        
        if (!computed) return;
        
        // FORCE remove ALL background properties first
        clonedEl.style.background = 'none';
        clonedEl.style.backgroundImage = 'none';
        clonedEl.style.backgroundBlendMode = 'normal';
        
        // Check for background image URL
        const bgImage = computed.backgroundImage;
        if (bgImage && bgImage !== 'none') {
          const urlMatch = bgImage.match(/url\(["']?([^"')]+)["']?\)/);
          if (urlMatch && urlMatch[1]) {
            const imageUrl = urlMatch[1];
            if (imageUrl.startsWith('https://') || imageUrl.startsWith('http://')) {
              imageProxies.push(
                proxyImage(imageUrl).then((dataUrl) => {
                  if (dataUrl) {
                    clonedEl.style.backgroundImage = `url("${dataUrl}")`;
                    clonedEl.style.backgroundSize = computed.backgroundSize;
                    clonedEl.style.backgroundPosition = computed.backgroundPosition;
                    clonedEl.style.backgroundRepeat = computed.backgroundRepeat;
                  }
                })
              );
            }
          }
        }
        
        // Set background color (use rgb/hex only)
        const bgColor = computed.backgroundColor;
        if (bgColor && bgColor !== 'rgba(0, 0, 0, 0)') {
          clonedEl.style.backgroundColor = bgColor;
        }
        
        // Set text color
        const textColor = computed.color;
        if (textColor) {
          clonedEl.style.color = textColor;
        }
        
        // Convert IMG elements
        if (clonedEl.tagName === 'IMG') {
          const img = clonedEl as HTMLImageElement;
          const originalImg = originalEl as HTMLImageElement;
          if (originalImg.src && (originalImg.src.startsWith('https://') || originalImg.src.startsWith('http://'))) {
            imageProxies.push(
              proxyImage(originalImg.src).then((dataUrl) => {
                if (dataUrl) {
                  img.src = dataUrl;
                }
              })
            );
          }
        }
      });
      
      // Wait for all images to be proxied
      await Promise.all(imageProxies);
      
      return clone;
    };

    // Small delay to ensure DOM is fully rendered
    await new Promise(resolve => setTimeout(resolve, 500));

    // For each slide, render it and add to PDF
    for (let i = 0; i < pres.slides.length; i++) {
      const slideElement = document.getElementById(`slide-${i}`);
      
      if (slideElement) {
        try {
          // Sanitize the slide for export
          const sanitizedSlide = await sanitizeForExport(slideElement);
          
          // Temporarily append to DOM for html2canvas (hidden)
          sanitizedSlide.style.position = 'fixed';
          sanitizedSlide.style.left = '-10000px';
          sanitizedSlide.style.top = '-10000px';
          document.body.appendChild(sanitizedSlide);
          
          try {
            // Wait a moment for images to settle
            await new Promise(resolve => setTimeout(resolve, 100));
            
            const canvas = await html2canvas(sanitizedSlide, {
              width: 1920,
              height: 1080,
              scale: 1,
              useCORS: false,
              allowTaint: true,
              backgroundColor: '#ffffff',
              logging: false,
              onclone: (clonedDoc) => {
                // Remove any remaining gradients in the cloned document
                const allEls = clonedDoc.querySelectorAll('*') as NodeListOf<HTMLElement>;
                allEls.forEach((el) => {
                  if (el.style.backgroundImage && el.style.backgroundImage.includes('gradient')) {
                    el.style.backgroundImage = 'none';
                  }
                });
              },
            });

            const imgData = canvas.toDataURL("image/png");
            
            if (i > 0) {
              pdf.addPage();
            }
            
            pdf.addImage(imgData, "PNG", 0, 0, 1920, 1080);
          } finally {
            // Clean up cloned element
            document.body.removeChild(sanitizedSlide);
          }
        } catch (error) {
          console.error(`Error exporting slide ${i}:`, error);
          // Continue with next slide
        }
      }
    }

    pdf.save(`${pres.campaignName}-${pres.clientName}.pdf`);
  };

  const exportToPPTX = async (pres: Presentation) => {
    const pptx = new pptxgen();
    
    // Set presentation properties
    pptx.author = "Look After You - Influencer Talent Agency";
    pptx.company = "Look After You";
    pptx.subject = pres.campaignName;
    pptx.title = `${pres.clientName} - ${pres.campaignName}`;
    
    // Define slide dimensions (16:9 widescreen)
    pptx.layout = "LAYOUT_WIDE";
    
    // Helper to convert hex to RGB object
    const hexToRgb = (hex: string) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      } : { r: 255, g: 255, b: 255 };
    };
    
    // Helper to fetch image as base64
    const fetchImageAsBase64 = async (url: string): Promise<string> => {
      try {
        const response = await fetch(`/api/proxy-image?url=${encodeURIComponent(url)}`);
        const data = await response.json();
        return data.dataUrl || '';
      } catch (error) {
        console.error('Error fetching image:', error);
        return '';
      }
    };
    
    // Process each slide
    for (const slide of pres.slides) {
      const pptxSlide = pptx.addSlide();
      
      // Set background color
      const bgColor = hexToRgb(slide.design.backgroundColor);
      pptxSlide.background = { color: slide.design.backgroundColor.replace('#', '') };
      
      // Add background image if exists
      if (slide.content.images && slide.content.images.length > 0) {
        const imageUrl = slide.content.images[0];
        if (imageUrl.startsWith('https://') || imageUrl.startsWith('http://')) {
          const base64Image = await fetchImageAsBase64(imageUrl);
          if (base64Image) {
            pptxSlide.addImage({
              data: base64Image,
              x: 0,
              y: 0,
              w: '100%',
              h: '100%',
              sizing: { type: 'cover', w: '100%', h: '100%' },
              transparency: 80, // 20% opacity
            });
          }
        }
      }
      
      // Add title
      if (slide.content.title) {
        pptxSlide.addText(slide.content.title, {
          x: 0.5,
          y: 0.5,
          w: '90%',
          h: 1.5,
          fontSize: slide.type === 'cover' ? 60 : 44,
          bold: true,
          color: slide.design.textColor.replace('#', ''),
          fontFace: slide.design.fontFamily || 'Arial',
          align: 'left',
        });
      }
      
      // Add subtitle
      if (slide.content.subtitle) {
        pptxSlide.addText(String(slide.content.subtitle), {
          x: 0.5,
          y: 2.2,
          w: '90%',
          h: 0.8,
          fontSize: 24,
          color: slide.design.textColor.replace('#', ''),
          fontFace: slide.design.fontFamily || 'Arial',
          align: 'left',
        });
      }
      
      // Add body text
      if (slide.content.body) {
        pptxSlide.addText(slide.content.body, {
          x: 0.5,
          y: slide.content.subtitle ? 3.2 : 2.2,
          w: '90%',
          h: 2,
          fontSize: 20,
          color: slide.design.textColor.replace('#', ''),
          fontFace: slide.design.fontFamily || 'Arial',
          align: 'left',
        });
      }
      
      // Add bullets
      if (slide.content.bullets && slide.content.bullets.length > 0) {
        const bulletText = slide.content.bullets.map(bullet => ({
          text: bullet,
          options: { bullet: true }
        }));
        
        pptxSlide.addText(bulletText, {
          x: 0.5,
          y: slide.content.body ? 5.5 : (slide.content.subtitle ? 3.2 : 2.2),
          w: '90%',
          h: 2,
          fontSize: 18,
          color: slide.design.textColor.replace('#', ''),
          fontFace: slide.design.fontFamily || 'Arial',
        });
      }
      
      // Add metrics
      if (slide.content.metrics && slide.content.metrics.length > 0) {
        let yPos = 2.5;
        slide.content.metrics.forEach((metric, idx) => {
          pptxSlide.addText([
            { text: metric.label + ': ', options: { fontSize: 16, bold: false } },
            { text: metric.value, options: { fontSize: 24, bold: true, color: slide.design.accentColor.replace('#', '') } }
          ], {
            x: 0.5 + (idx % 2) * 5,
            y: yPos + Math.floor(idx / 2) * 1.2,
            w: 4.5,
            h: 1,
            color: slide.design.textColor.replace('#', ''),
            fontFace: slide.design.fontFamily || 'Arial',
          });
        });
      }
      
      // Add influencers
      if (slide.content.influencers && slide.content.influencers.length > 0) {
        let yPos = 2.5;
        slide.content.influencers.forEach((influencer, idx) => {
          // Influencer name and handle
          pptxSlide.addText([
            { text: influencer.name, options: { fontSize: 20, bold: true } },
            { text: `\n@${influencer.handle}`, options: { fontSize: 14 } },
            { text: `\n${influencer.followers} followers`, options: { fontSize: 12 } }
          ], {
            x: 0.5 + (idx % 3) * 3.3,
            y: yPos + Math.floor(idx / 3) * 2,
            w: 3,
            h: 1.8,
            color: slide.design.textColor.replace('#', ''),
            fontFace: slide.design.fontFamily || 'Arial',
          });
        });
      }
      
      // Add footer
      pptxSlide.addText('Look After You - Influencer Talent Agency', {
        x: 0.5,
        y: 7,
        w: '90%',
        h: 0.3,
        fontSize: 12,
        color: slide.design.textColor.replace('#', ''),
        fontFace: slide.design.fontFamily || 'Arial',
        align: 'left',
        transparency: 50,
      });
    }
    
    // Save the presentation
    await pptx.writeFile({ fileName: `${pres.campaignName}-${pres.clientName}.pptx` });
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
