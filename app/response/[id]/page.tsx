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

      // Corporate Brochure Style - Royal Purple with Cream
      const colors = {
        bgCream: "#f5f3ef",         // Warm cream background
        bgWhite: "#ffffff",          // Pure white
        bgPurple: "#4c1d95",         // Deep royal purple (primary accent)
        bgPurpleLight: "#7c3aed",    // Lighter purple
        bgPurpleDark: "#3b0764",     // Darker purple
        textDark: "#1f2937",         // Dark text
        textMedium: "#4b5563",       // Medium gray text
        textLight: "#9ca3af",        // Light gray text
        textOnPurple: "#ffffff",     // White text on purple
        textPurple: "#5b21b6",       // Purple text
        border: "#e5e7eb",           // Light border
        borderPurple: "#a78bfa",     // Purple border
      };
      
      // Wait a moment for any layout to settle
      await new Promise(resolve => setTimeout(resolve, 100));

      // Create canvas from the content
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: colors.bgCream,
        onclone: (clonedDoc) => {
          const clonedElement = clonedDoc.getElementById("response-content");
          if (clonedElement) {
            // Apply corporate brochure styling
            clonedElement.style.backgroundColor = colors.bgCream;
            clonedElement.style.padding = "0";
            clonedElement.style.borderRadius = "0";
            clonedElement.style.position = "relative";
            clonedElement.style.fontFamily = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
            
            // ===== TITLE PAGE / HEADER SECTION =====
            const headerSection = clonedDoc.createElement('div');
            headerSection.style.cssText = `
              display: flex;
              min-height: 280px;
              background-color: ${colors.bgCream};
            `;
            
            // Left purple sidebar panel (40% width like in the reference)
            const leftPanel = clonedDoc.createElement('div');
            leftPanel.style.cssText = `
              width: 40%;
              background: linear-gradient(180deg, ${colors.bgPurple} 0%, ${colors.bgPurpleDark} 100%);
              padding: 48px 32px;
              display: flex;
              flex-direction: column;
              justify-content: center;
              position: relative;
              overflow: hidden;
            `;
            
            // Decorative geometric shapes on purple panel
            const decorShape1 = clonedDoc.createElement('div');
            decorShape1.style.cssText = `
              position: absolute;
              top: 20px;
              right: -30px;
              width: 100px;
              height: 100px;
              border: 3px solid rgba(255,255,255,0.15);
              border-radius: 50%;
            `;
            leftPanel.appendChild(decorShape1);
            
            const decorShape2 = clonedDoc.createElement('div');
            decorShape2.style.cssText = `
              position: absolute;
              bottom: 40px;
              left: -20px;
              width: 80px;
              height: 80px;
              background: rgba(255,255,255,0.08);
              transform: rotate(45deg);
            `;
            leftPanel.appendChild(decorShape2);
            
            // Vertical text on left panel
            const verticalText = clonedDoc.createElement('div');
            verticalText.style.cssText = `
              position: absolute;
              left: 16px;
              top: 50%;
              transform: translateY(-50%) rotate(-90deg);
              font-size: 10px;
              font-weight: 700;
              letter-spacing: 4px;
              color: rgba(255,255,255,0.5);
              text-transform: uppercase;
              white-space: nowrap;
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            `;
            verticalText.textContent = "INFLUENCER PROPOSAL";
            leftPanel.appendChild(verticalText);
            
            // Brand mark in left panel
            const brandMark = clonedDoc.createElement('div');
            brandMark.style.cssText = `
              font-size: 10px;
              font-weight: 700;
              letter-spacing: 3px;
              text-transform: uppercase;
              color: rgba(255,255,255,0.7);
              margin-bottom: 24px;
              padding-left: 24px;
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            `;
            brandMark.textContent = "LOOK AFTER YOU";
            leftPanel.appendChild(brandMark);
            
            // Year/Date big number
            const yearDisplay = clonedDoc.createElement('div');
            yearDisplay.style.cssText = `
              font-size: 64px;
              font-weight: 900;
              color: ${colors.textOnPurple};
              line-height: 1;
              margin-bottom: 8px;
              padding-left: 24px;
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            `;
            yearDisplay.textContent = new Date().getFullYear().toString();
            leftPanel.appendChild(yearDisplay);
            
            // Month display
            const monthDisplay = clonedDoc.createElement('div');
            monthDisplay.style.cssText = `
              font-size: 14px;
              font-weight: 600;
              letter-spacing: 2px;
              text-transform: uppercase;
              color: rgba(255,255,255,0.8);
              padding-left: 24px;
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            `;
            monthDisplay.textContent = new Date().toLocaleDateString('en-US', { month: 'long' });
            leftPanel.appendChild(monthDisplay);
            
            headerSection.appendChild(leftPanel);
            
            // Right content panel (60% width)
            const rightPanel = clonedDoc.createElement('div');
            rightPanel.style.cssText = `
              width: 60%;
              padding: 48px 40px;
              display: flex;
              flex-direction: column;
              justify-content: center;
              background-color: ${colors.bgCream};
            `;
            
            // Document type label
            const docType = clonedDoc.createElement('div');
            docType.style.cssText = `
              font-size: 11px;
              font-weight: 700;
              letter-spacing: 3px;
              text-transform: uppercase;
              color: ${colors.textPurple};
              margin-bottom: 16px;
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            `;
            docType.textContent = "MARKETING PROPOSAL";
            rightPanel.appendChild(docType);
            
            // Client name (large title)
            const clientTitle = clonedDoc.createElement('div');
            clientTitle.style.cssText = `
              font-size: 42px;
              font-weight: 900;
              color: ${colors.textDark};
              margin-bottom: 12px;
              line-height: 1.1;
              letter-spacing: -1px;
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            `;
            clientTitle.textContent = response.clientName;
            rightPanel.appendChild(clientTitle);
            
            // Campaign name subtitle
            const campaignSubtitle = clonedDoc.createElement('div');
            campaignSubtitle.style.cssText = `
              font-size: 16px;
              font-weight: 500;
              color: ${colors.textMedium};
              margin-bottom: 24px;
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            `;
            campaignSubtitle.textContent = response.campaignName || "Influencer Campaign";
            rightPanel.appendChild(campaignSubtitle);
            
            // Divider line
            const dividerLine = clonedDoc.createElement('div');
            dividerLine.style.cssText = `
              width: 60px;
              height: 4px;
              background-color: ${colors.bgPurple};
              margin-bottom: 24px;
            `;
            rightPanel.appendChild(dividerLine);
            
            // Stats row
            const statsRow = clonedDoc.createElement('div');
            statsRow.style.cssText = `
              display: flex;
              gap: 32px;
            `;
            
            // Stat 1: Influencers
            const stat1 = clonedDoc.createElement('div');
            stat1.innerHTML = `
              <div style="font-size: 28px; font-weight: 800; color: ${colors.bgPurple}; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">${response.influencers?.length || 0}</div>
              <div style="font-size: 11px; font-weight: 600; letter-spacing: 1px; text-transform: uppercase; color: ${colors.textLight}; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">Influencers</div>
            `;
            statsRow.appendChild(stat1);
            
            // Stat 2: Date
            const stat2 = clonedDoc.createElement('div');
            const dateStr = new Date(response.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            stat2.innerHTML = `
              <div style="font-size: 28px; font-weight: 800; color: ${colors.bgPurple}; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">${dateStr}</div>
              <div style="font-size: 11px; font-weight: 600; letter-spacing: 1px; text-transform: uppercase; color: ${colors.textLight}; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">Created</div>
            `;
            statsRow.appendChild(stat2);
            
            rightPanel.appendChild(statsRow);
            headerSection.appendChild(rightPanel);
            
            // Insert header section at the beginning
            clonedElement.insertBefore(headerSection, clonedElement.firstChild);
            
            // ===== CONTENT SECTION =====
            // Create content wrapper
            const contentWrapper = clonedDoc.createElement('div');
            contentWrapper.style.cssText = `
              padding: 48px 48px 48px 48px;
              background-color: ${colors.bgCream};
            `;
            
            // Move all content except header into wrapper
            const children = Array.from(clonedElement.children);
            children.forEach((child, index) => {
              if (index > 0) { // Skip the header section
                contentWrapper.appendChild(child);
              }
            });
            clonedElement.appendChild(contentWrapper);
            
            // Style all text elements
            const allElements = clonedElement.querySelectorAll('*');
            allElements.forEach((el) => {
              const htmlEl = el as HTMLElement;
              // Reset any gradients that html2canvas can't handle in content
              const computed = window.getComputedStyle(htmlEl);
              if (computed.backgroundImage && computed.backgroundImage !== 'none' && !htmlEl.closest('[style*="linear-gradient"]')) {
                // Only reset if not part of our header design
                if (!htmlEl.closest('div[style*="display: flex"]')) {
                  htmlEl.style.backgroundImage = 'none';
                }
              }
            });
            
            // Track section numbers for numbered headers
            let sectionNumber = 1;
            
            // Style H1 headings - Big section headers with numbers
            clonedElement.querySelectorAll('h1').forEach((el) => {
              const h1 = el as HTMLElement;
              const text = h1.textContent || '';
              const cleanText = text.replace(/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu, '').trim();
              
              // Create a numbered section header container
              const sectionContainer = clonedDoc.createElement('div');
              sectionContainer.style.cssText = `
                display: flex;
                align-items: flex-start;
                gap: 20px;
                margin-top: 48px;
                margin-bottom: 24px;
                padding-bottom: 16px;
                border-bottom: 3px solid ${colors.bgPurple};
              `;
              
              // Section number
              const numberEl = clonedDoc.createElement('div');
              numberEl.style.cssText = `
                font-size: 48px;
                font-weight: 900;
                color: ${colors.bgPurple};
                line-height: 1;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              `;
              numberEl.textContent = String(sectionNumber).padStart(2, '0');
              sectionNumber++;
              
              // Section title
              const titleEl = clonedDoc.createElement('div');
              titleEl.style.cssText = `
                font-size: 24px;
                font-weight: 800;
                color: ${colors.textDark};
                text-transform: uppercase;
                letter-spacing: 2px;
                padding-top: 12px;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              `;
              titleEl.textContent = cleanText;
              
              sectionContainer.appendChild(numberEl);
              sectionContainer.appendChild(titleEl);
              
              // Replace h1 with the new container
              h1.parentNode?.replaceChild(sectionContainer, h1);
            });
            
            // Style H2 headings - Subsection headers
            clonedElement.querySelectorAll('h2').forEach((el) => {
              const h2 = el as HTMLElement;
              const text = h2.textContent || '';
              const cleanText = text.replace(/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu, '').trim();
              h2.textContent = cleanText;
              h2.style.cssText = `
                font-size: 14px;
                font-weight: 700;
                color: ${colors.bgPurple};
                margin-top: 32px;
                margin-bottom: 16px;
                padding-bottom: 10px;
                border-bottom: 2px solid ${colors.borderPurple};
                letter-spacing: 2px;
                text-transform: uppercase;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              `;
            });
            
            // Style H3 headings
            clonedElement.querySelectorAll('h3').forEach((el) => {
              const h3 = el as HTMLElement;
              const text = h3.textContent || '';
              const cleanText = text.replace(/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu, '').trim();
              h3.textContent = cleanText;
              h3.style.cssText = `
                font-size: 16px;
                font-weight: 700;
                color: ${colors.textDark};
                margin-top: 24px;
                margin-bottom: 12px;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              `;
            });
            
            // Style H4 headings
            clonedElement.querySelectorAll('h4').forEach((el) => {
              const h4 = el as HTMLElement;
              const text = h4.textContent || '';
              const cleanText = text.replace(/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu, '').trim();
              h4.textContent = cleanText;
              h4.style.cssText = `
                font-size: 14px;
                font-weight: 600;
                color: ${colors.textMedium};
                margin-top: 18px;
                margin-bottom: 8px;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              `;
            });
            
            // Style paragraphs
            clonedElement.querySelectorAll('p').forEach((el) => {
              const p = el as HTMLElement;
              if (!p.closest('[style*="display: flex"]')) {
                p.style.cssText = `
                  font-size: 13px;
                  line-height: 1.8;
                  color: ${colors.textMedium};
                  margin-bottom: 16px;
                  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                `;
              }
            });
            
            // Style list items
            clonedElement.querySelectorAll('li').forEach((el) => {
              const li = el as HTMLElement;
              li.style.cssText = `
                font-size: 13px;
                line-height: 1.8;
                color: ${colors.textMedium};
                margin-bottom: 10px;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              `;
            });
            
            // Style unordered lists
            clonedElement.querySelectorAll('ul').forEach((el) => {
              const ul = el as HTMLElement;
              ul.style.cssText = `
                margin: 16px 0;
                padding-left: 24px;
              `;
            });
            
            // Style strong text
            clonedElement.querySelectorAll('strong').forEach((el) => {
              (el as HTMLElement).style.color = colors.textDark;
              (el as HTMLElement).style.fontWeight = '700';
            });
            
            // Style links
            clonedElement.querySelectorAll('a').forEach((el) => {
              const a = el as HTMLElement;
              a.style.cssText = `
                color: ${colors.bgPurple};
                text-decoration: none;
                font-weight: 600;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              `;
            });
            
            // Style tables - Corporate style with purple header
            clonedElement.querySelectorAll('table').forEach((el) => {
              const table = el as HTMLElement;
              table.style.cssText = `
                width: 100%;
                margin: 24px 0;
                border-collapse: collapse;
                background-color: ${colors.bgWhite};
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
              `;
            });
            
            // Style table headers
            clonedElement.querySelectorAll('th').forEach((el) => {
              const th = el as HTMLElement;
              th.style.cssText = `
                background-color: ${colors.bgPurple};
                color: ${colors.textOnPurple};
                font-weight: 700;
                font-size: 11px;
                text-transform: uppercase;
                letter-spacing: 1px;
                padding: 16px 20px;
                text-align: left;
                border: none;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              `;
            });
            
            // Style table cells
            clonedElement.querySelectorAll('tr').forEach((el, rowIndex) => {
              const tr = el as HTMLElement;
              const isEvenRow = rowIndex % 2 === 0;
              const cells = tr.querySelectorAll('td');
              cells.forEach((cell) => {
                const td = cell as HTMLElement;
                td.style.cssText = `
                  padding: 14px 20px;
                  font-size: 13px;
                  color: ${colors.textMedium};
                  background-color: ${isEvenRow ? colors.bgWhite : colors.bgCream};
                  border-bottom: 1px solid ${colors.border};
                  border-left: none;
                  border-right: none;
                  border-top: none;
                  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                `;
              });
            });
            
            // Style blockquotes - callout boxes like in corporate brochures
            clonedElement.querySelectorAll('blockquote').forEach((el) => {
              const bq = el as HTMLElement;
              bq.style.cssText = `
                background-color: ${colors.bgPurple};
                border-left: none;
                border-radius: 0;
                padding: 24px 28px;
                margin: 24px 0;
                color: ${colors.textOnPurple};
                font-style: normal;
                position: relative;
              `;
              
              // Style paragraphs inside blockquote
              bq.querySelectorAll('p').forEach((p) => {
                (p as HTMLElement).style.cssText = `
                  color: ${colors.textOnPurple};
                  font-size: 14px;
                  line-height: 1.7;
                  margin-bottom: 0;
                  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                `;
              });
            });
            
            // Style horizontal rules
            clonedElement.querySelectorAll('hr').forEach((el) => {
              const hr = el as HTMLElement;
              hr.style.cssText = `
                border: none;
                height: 2px;
                background-color: ${colors.bgPurple};
                margin: 40px 0;
                width: 60px;
              `;
            });
            
            // Style code elements
            clonedElement.querySelectorAll('code').forEach((el) => {
              const code = el as HTMLElement;
              if (!code.closest('pre')) {
                code.style.cssText = `
                  background-color: rgba(76, 29, 149, 0.1);
                  color: ${colors.bgPurple};
                  padding: 3px 8px;
                  border-radius: 4px;
                  font-size: 12px;
                  font-family: 'SF Mono', Monaco, Consolas, monospace;
                `;
              }
            });
            
            // Style pre elements
            clonedElement.querySelectorAll('pre').forEach((el) => {
              const pre = el as HTMLElement;
              pre.style.cssText = `
                background-color: ${colors.bgWhite};
                border: 1px solid ${colors.border};
                border-left: 4px solid ${colors.bgPurple};
                padding: 20px;
                overflow-x: auto;
                margin: 24px 0;
              `;
              const code = pre.querySelector('code');
              if (code) {
                (code as HTMLElement).style.cssText = `
                  background: transparent;
                  border: none;
                  padding: 0;
                  color: ${colors.textMedium};
                  font-family: 'SF Mono', Monaco, Consolas, monospace;
                `;
              }
            });
            
            // ===== FOOTER SECTION =====
            const footer = clonedDoc.createElement('div');
            footer.style.cssText = `
              display: flex;
              margin-top: 48px;
              background-color: ${colors.bgCream};
            `;
            
            // Left footer panel (matches header)
            const footerLeft = clonedDoc.createElement('div');
            footerLeft.style.cssText = `
              width: 40%;
              background: linear-gradient(180deg, ${colors.bgPurpleDark} 0%, ${colors.bgPurple} 100%);
              padding: 32px;
              display: flex;
              align-items: center;
              justify-content: center;
            `;
            
            const footerBrand = clonedDoc.createElement('div');
            footerBrand.style.cssText = `
              font-size: 12px;
              font-weight: 700;
              letter-spacing: 3px;
              text-transform: uppercase;
              color: ${colors.textOnPurple};
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            `;
            footerBrand.textContent = "LOOK AFTER YOU";
            footerLeft.appendChild(footerBrand);
            
            // Right footer panel
            const footerRight = clonedDoc.createElement('div');
            footerRight.style.cssText = `
              width: 60%;
              padding: 32px 40px;
              display: flex;
              justify-content: space-between;
              align-items: center;
              background-color: ${colors.bgCream};
              border-top: 1px solid ${colors.border};
            `;
            
            const footerConfidential = clonedDoc.createElement('div');
            footerConfidential.style.cssText = `
              font-size: 11px;
              font-style: italic;
              color: ${colors.textLight};
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            `;
            footerConfidential.textContent = "Confidential Document";
            
            const footerClient = clonedDoc.createElement('div');
            footerClient.style.cssText = `
              font-size: 11px;
              font-weight: 600;
              color: ${colors.textMedium};
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            `;
            footerClient.textContent = `Prepared for ${response.clientName}`;
            
            footerRight.appendChild(footerConfidential);
            footerRight.appendChild(footerClient);
            
            footer.appendChild(footerLeft);
            footer.appendChild(footerRight);
            contentWrapper.appendChild(footer);
          }
        }
      });

      // Create PDF
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
      });

      const pageWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const margin = 0; // No margin for full-bleed design
      const usableWidth = pageWidth;
      const usableHeight = pageHeight;
      
      // Calculate image dimensions to fit width
      const imgWidth = usableWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      // If image fits on one page, just add it
      if (imgHeight <= usableHeight) {
        const imgData = canvas.toDataURL("image/png", 1.0);
        pdf.addImage(imgData, "PNG", margin, margin, imgWidth, imgHeight);
      } else {
        // Multi-page: slice the canvas into page-sized chunks
        const scaleFactor = canvas.width / imgWidth;
        const pageCanvasHeight = usableHeight * scaleFactor;
        const totalPages = Math.ceil(canvas.height / pageCanvasHeight);
        
        for (let page = 0; page < totalPages; page++) {
          if (page > 0) {
            pdf.addPage();
          }
          
          // Calculate source position
          const sourceY = page * pageCanvasHeight;
          const sourceHeight = Math.min(pageCanvasHeight, canvas.height - sourceY);
          
          // Create a canvas for this page
          const pageCanvas = document.createElement('canvas');
          pageCanvas.width = canvas.width;
          pageCanvas.height = sourceHeight;
          
          const ctx = pageCanvas.getContext('2d');
          if (ctx) {
            // Fill with background color
            ctx.fillStyle = colors.bgCream;
            ctx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
            
            // Draw the slice
            ctx.drawImage(
              canvas,
              0, sourceY,
              canvas.width, sourceHeight,
              0, 0,
              pageCanvas.width, pageCanvas.height
            );
          }
          
          const pageImgData = pageCanvas.toDataURL("image/png", 1.0);
          const pageImgHeight = (sourceHeight / scaleFactor);
          
          pdf.addImage(pageImgData, "PNG", margin, margin, imgWidth, pageImgHeight);
        }
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

