"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Download, Copy, ArrowLeft, Check, FileText, Edit, Save, X, Pencil, ExternalLink, Sparkles } from "lucide-react";
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
  const [showGammaModal, setShowGammaModal] = useState(false);
  const [gammaCopied, setGammaCopied] = useState(false);

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

      // Modern Executive Style - Deep Navy with Gold/Amber Accents
      const colors = {
        bgMain: "#fafafa",           // Clean light gray background
        bgWhite: "#ffffff",          // Pure white for cards
        bgNavy: "#0f172a",           // Deep navy (primary dark)
        bgNavyLight: "#1e293b",      // Lighter navy
        bgNavyMedium: "#334155",     // Medium slate
        accentGold: "#f59e0b",       // Amber gold accent
        accentGoldLight: "#fbbf24",  // Light gold
        accentGradientStart: "#f59e0b",
        accentGradientEnd: "#d97706",
        textDark: "#0f172a",         // Navy text
        textMedium: "#475569",       // Slate text
        textLight: "#94a3b8",        // Light slate
        textOnDark: "#ffffff",       // White text on dark
        textGold: "#b45309",         // Dark gold text
        border: "#e2e8f0",           // Light border
        borderGold: "#fcd34d",       // Gold border
      };
      
      // Wait a moment for any layout to settle
      await new Promise(resolve => setTimeout(resolve, 100));

      // Create canvas from the content
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: colors.bgWhite,
        imageTimeout: 0,
        onclone: (clonedDoc) => {
          const clonedElement = clonedDoc.getElementById("response-content");
          if (clonedElement) {
            // *** KEY FIX: Add pdf-export-mode class to use CSS-defined PDF styles ***
            clonedElement.classList.add('pdf-export-mode');
            
            // Find the response-content div and add pdf-export-mode class
            const responseContent = clonedElement.querySelector('.response-content');
            if (responseContent) {
              responseContent.classList.add('pdf-export-mode');
              (responseContent as HTMLElement).style.backgroundColor = colors.bgMain;
              (responseContent as HTMLElement).style.padding = '48px 56px';
            }
            
            // Apply clean styling - avoid complex gradients for html2canvas compatibility
            clonedElement.style.backgroundColor = colors.bgWhite;
            clonedElement.style.padding = "0";
            clonedElement.style.borderRadius = "0";
            clonedElement.style.position = "relative";
            clonedElement.style.fontFamily = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
            
            // ===== HEADER SECTION - Simple solid colors for compatibility =====
            const headerSection = clonedDoc.createElement('div');
            headerSection.style.cssText = `
              min-height: 280px;
              background-color: ${colors.bgNavy};
              padding: 0;
              position: relative;
            `;
            
            // Gold accent bar at top (simple solid color)
            const goldBar = clonedDoc.createElement('div');
            goldBar.style.cssText = `
              width: 100%;
              height: 6px;
              background-color: ${colors.accentGold};
            `;
            headerSection.appendChild(goldBar);
            
            // Header content container
            const headerContent = clonedDoc.createElement('div');
            headerContent.style.cssText = `
              padding: 48px 56px;
            `;
            
            // Brand badge
            const brandBadge = clonedDoc.createElement('div');
            brandBadge.style.cssText = `
              display: inline-block;
              background-color: rgba(245, 158, 11, 0.2);
              border-radius: 20px;
              padding: 8px 16px;
              margin-bottom: 20px;
              font-size: 11px;
              font-weight: 700;
              letter-spacing: 2px;
              text-transform: uppercase;
              color: ${colors.accentGold};
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            `;
            brandBadge.textContent = "● LOOK AFTER YOU";
            headerContent.appendChild(brandBadge);
            
            // Document type label
            const docType = clonedDoc.createElement('div');
            docType.style.cssText = `
              font-size: 12px;
              font-weight: 600;
              letter-spacing: 3px;
              text-transform: uppercase;
              color: ${colors.textLight};
              margin-bottom: 12px;
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            `;
            docType.textContent = "INFLUENCER MARKETING PROPOSAL";
            headerContent.appendChild(docType);
            
            // Client name (large title)
            const clientTitle = clonedDoc.createElement('div');
            clientTitle.style.cssText = `
              font-size: 42px;
              font-weight: 800;
              color: ${colors.textOnDark};
              margin-bottom: 12px;
              line-height: 1.2;
              letter-spacing: -1px;
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            `;
            clientTitle.textContent = response.clientName;
            headerContent.appendChild(clientTitle);
            
            // Campaign name subtitle
            const campaignSubtitle = clonedDoc.createElement('div');
            campaignSubtitle.style.cssText = `
              font-size: 16px;
              font-weight: 400;
              color: ${colors.textLight};
              margin-bottom: 28px;
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            `;
            campaignSubtitle.textContent = response.campaignName || "Influencer Campaign Strategy";
            headerContent.appendChild(campaignSubtitle);
            
            // Stats row
            const statsRow = clonedDoc.createElement('div');
            statsRow.style.cssText = `
              display: flex;
              gap: 48px;
            `;
            
            // Stat 1: Influencers
            const stat1 = clonedDoc.createElement('div');
            stat1.style.cssText = `display: block;`;
            
            const stat1Value = clonedDoc.createElement('div');
            stat1Value.style.cssText = `
              font-size: 32px;
              font-weight: 800;
              color: ${colors.accentGold};
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              line-height: 1;
            `;
            stat1Value.textContent = String(response.influencers?.length || 0);
            stat1.appendChild(stat1Value);
            
            const stat1Label = clonedDoc.createElement('div');
            stat1Label.style.cssText = `
              font-size: 11px;
              font-weight: 500;
              letter-spacing: 1px;
              text-transform: uppercase;
              color: ${colors.textLight};
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              margin-top: 4px;
            `;
            stat1Label.textContent = "Selected Influencers";
            stat1.appendChild(stat1Label);
            statsRow.appendChild(stat1);
            
            // Stat 2: Date
            const stat2 = clonedDoc.createElement('div');
            stat2.style.cssText = `display: block;`;
            const dateStr = new Date(response.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
            
            const stat2Value = clonedDoc.createElement('div');
            stat2Value.style.cssText = `
              font-size: 16px;
              font-weight: 600;
              color: ${colors.textOnDark};
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              line-height: 1.4;
            `;
            stat2Value.textContent = dateStr;
            stat2.appendChild(stat2Value);
            
            const stat2Label = clonedDoc.createElement('div');
            stat2Label.style.cssText = `
              font-size: 11px;
              font-weight: 500;
              letter-spacing: 1px;
              text-transform: uppercase;
              color: ${colors.textLight};
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              margin-top: 4px;
            `;
            stat2Label.textContent = "Document Date";
            stat2.appendChild(stat2Label);
            statsRow.appendChild(stat2);
            
            headerContent.appendChild(statsRow);
            headerSection.appendChild(headerContent);
            
            // Insert header section at the beginning
            clonedElement.insertBefore(headerSection, clonedElement.firstChild);
            
            // ===== CONTENT SECTION =====
            // Create content wrapper
            const contentWrapper = clonedDoc.createElement('div');
            contentWrapper.style.cssText = `
              padding: 48px 56px 48px 56px;
              background-color: ${colors.bgMain};
            `;
            
            // Move all content except header into wrapper
            const children = Array.from(clonedElement.children);
            children.forEach((child, index) => {
              if (index > 0) { // Skip the header section
                contentWrapper.appendChild(child);
              }
            });
            clonedElement.appendChild(contentWrapper);
            
            // Reset all complex backgrounds to avoid html2canvas issues
            const allElements = clonedElement.querySelectorAll('*');
            allElements.forEach((el) => {
              const htmlEl = el as HTMLElement;
              // Force remove any background images that might cause issues
              if (htmlEl.style.backgroundImage && htmlEl.style.backgroundImage.includes('gradient')) {
                // Keep it only if it's a simple element we control
              } else {
                htmlEl.style.backgroundImage = 'none';
              }
            });
            
            // Track section numbers for numbered headers
            let sectionNumber = 1;
            
            // Style H1 headings - Simple numbered headers
            clonedElement.querySelectorAll('h1').forEach((el) => {
              const h1 = el as HTMLElement;
              const text = h1.textContent || '';
              const cleanText = text.replace(/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu, '').trim();
              
              // Create a numbered section header container
              const sectionContainer = clonedDoc.createElement('div');
              sectionContainer.style.cssText = `
                display: block;
                margin-top: 40px;
                margin-bottom: 20px;
                padding-bottom: 16px;
                border-bottom: 3px solid ${colors.accentGold};
              `;
              
              // Section number + title in one line
              const headerLine = clonedDoc.createElement('div');
              headerLine.style.cssText = `
                display: block;
              `;
              
              // Section number badge (simpler - just text)
              const numberSpan = clonedDoc.createElement('span');
              numberSpan.style.cssText = `
                display: inline-block;
                background-color: ${colors.accentGold};
                color: ${colors.bgNavy};
                padding: 6px 12px;
                border-radius: 6px;
                font-size: 14px;
                font-weight: 800;
                margin-right: 12px;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              `;
              numberSpan.textContent = String(sectionNumber).padStart(2, '0');
              sectionNumber++;
              
              // Section title
              const titleSpan = clonedDoc.createElement('span');
              titleSpan.style.cssText = `
                font-size: 20px;
                font-weight: 700;
                color: ${colors.textDark};
                text-transform: uppercase;
                letter-spacing: 1px;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              `;
              titleSpan.textContent = cleanText;
              
              headerLine.appendChild(numberSpan);
              headerLine.appendChild(titleSpan);
              sectionContainer.appendChild(headerLine);
              
              // Replace h1 with the new container
              h1.parentNode?.replaceChild(sectionContainer, h1);
            });
            
            // Style H2 headings - Subsection headers (must reset gradient text effects)
            clonedElement.querySelectorAll('h2').forEach((el) => {
              const h2 = el as HTMLElement;
              const text = h2.textContent || '';
              const cleanText = text.replace(/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu, '').trim();
              h2.textContent = cleanText;
              // Reset gradient text effects first
              h2.style.background = 'none';
              h2.style.backgroundImage = 'none';
              h2.style.webkitBackgroundClip = 'unset';
              h2.style.webkitTextFillColor = colors.textDark;
              h2.style.backgroundClip = 'unset';
              // Apply solid styling
              h2.style.fontSize = '18px';
              h2.style.fontWeight = '800';
              h2.style.color = colors.textDark;
              h2.style.marginTop = '32px';
              h2.style.marginBottom = '16px';
              h2.style.paddingBottom = '10px';
              h2.style.borderBottom = `2px solid ${colors.accentGold}`;
              h2.style.letterSpacing = '1px';
              h2.style.textTransform = 'uppercase';
              h2.style.fontFamily = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
            });
            
            // Style H3 headings (must reset gradient effects)
            clonedElement.querySelectorAll('h3').forEach((el) => {
              const h3 = el as HTMLElement;
              const text = h3.textContent || '';
              const cleanText = text.replace(/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu, '').trim();
              h3.textContent = cleanText;
              // Reset gradient text effects
              h3.style.background = 'none';
              h3.style.backgroundImage = 'none';
              h3.style.webkitBackgroundClip = 'unset';
              h3.style.webkitTextFillColor = colors.textDark;
              h3.style.backgroundClip = 'unset';
              // Apply solid styling
              h3.style.fontSize = '16px';
              h3.style.fontWeight = '700';
              h3.style.color = colors.textDark;
              h3.style.marginTop = '24px';
              h3.style.marginBottom = '12px';
              h3.style.fontFamily = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
            });
            
            // Style H4 headings (must reset gradient effects)
            clonedElement.querySelectorAll('h4').forEach((el) => {
              const h4 = el as HTMLElement;
              const text = h4.textContent || '';
              const cleanText = text.replace(/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu, '').trim();
              h4.textContent = cleanText;
              // Reset gradient text effects
              h4.style.background = 'none';
              h4.style.backgroundImage = 'none';
              h4.style.webkitBackgroundClip = 'unset';
              h4.style.webkitTextFillColor = colors.textDark;
              h4.style.backgroundClip = 'unset';
              // Apply solid styling
              h4.style.fontSize = '14px';
              h4.style.fontWeight = '600';
              h4.style.color = colors.textDark;
              h4.style.marginTop = '20px';
              h4.style.marginBottom = '10px';
              h4.style.fontFamily = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
            });
            
            // Style paragraphs (must reset any gradient effects)
            clonedElement.querySelectorAll('p').forEach((el) => {
              const p = el as HTMLElement;
              // Skip if inside blockquote (handled separately)
              if (p.closest('blockquote')) return;
              // Reset gradient text effects
              p.style.background = 'none';
              p.style.backgroundImage = 'none';
              p.style.webkitBackgroundClip = 'unset';
              p.style.webkitTextFillColor = colors.textDark;
              p.style.backgroundClip = 'unset';
              // Apply solid styling
              p.style.fontSize = '14px';
              p.style.lineHeight = '1.8';
              p.style.color = colors.textDark;
              p.style.marginBottom = '16px';
              p.style.fontFamily = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
            });
            
            // Style list items (must reset gradient effects)
            clonedElement.querySelectorAll('li').forEach((el) => {
              const li = el as HTMLElement;
              // Skip if inside blockquote (handled separately)
              if (li.closest('blockquote')) return;
              // Reset gradient text effects
              li.style.background = 'none';
              li.style.backgroundImage = 'none';
              li.style.webkitBackgroundClip = 'unset';
              li.style.webkitTextFillColor = colors.textDark;
              li.style.backgroundClip = 'unset';
              // Apply solid styling
              li.style.fontSize = '14px';
              li.style.lineHeight = '1.8';
              li.style.color = colors.textDark;
              li.style.marginBottom = '10px';
              li.style.fontFamily = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
            });
            
            // Style unordered lists
            clonedElement.querySelectorAll('ul').forEach((el) => {
              const ul = el as HTMLElement;
              ul.style.cssText = `
                margin: 14px 0;
                padding-left: 24px;
              `;
            });
            
            // Style strong text (must reset gradient effects)
            clonedElement.querySelectorAll('strong').forEach((el) => {
              const strong = el as HTMLElement;
              // Skip if inside blockquote (handled separately)
              if (strong.closest('blockquote')) return;
              // Reset gradient text effects
              strong.style.background = 'none';
              strong.style.backgroundImage = 'none';
              strong.style.webkitBackgroundClip = 'unset';
              strong.style.webkitTextFillColor = colors.textDark;
              strong.style.backgroundClip = 'unset';
              // Apply solid styling
              strong.style.color = colors.textDark;
              strong.style.fontWeight = '700';
            });
            
            // Style links (must reset gradient effects)
            clonedElement.querySelectorAll('a').forEach((el) => {
              const a = el as HTMLElement;
              // Reset gradient text effects
              a.style.background = 'none';
              a.style.backgroundImage = 'none';
              a.style.webkitBackgroundClip = 'unset';
              a.style.webkitTextFillColor = colors.accentGold;
              a.style.backgroundClip = 'unset';
              // Apply solid styling
              a.style.color = colors.accentGold;
              a.style.textDecoration = 'underline';
              a.style.fontWeight = '600';
              a.style.fontFamily = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
            });
            
            // Style tables - Simple navy header (solid color, no gradient)
            clonedElement.querySelectorAll('table').forEach((el) => {
              const table = el as HTMLElement;
              table.style.cssText = `
                width: 100%;
                margin: 20px 0;
                border-collapse: collapse;
                background-color: ${colors.bgWhite};
                border: 1px solid ${colors.border};
              `;
            });
            
            // Style table headers (solid color)
            clonedElement.querySelectorAll('th').forEach((el) => {
              const th = el as HTMLElement;
              th.style.cssText = `
                background-color: ${colors.bgNavy};
                color: ${colors.textOnDark};
                font-weight: 700;
                font-size: 11px;
                text-transform: uppercase;
                letter-spacing: 1px;
                padding: 14px 16px;
                text-align: left;
                border: 1px solid ${colors.bgNavyLight};
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              `;
            });
            
            // Style table cells (must reset gradient effects)
            clonedElement.querySelectorAll('tr').forEach((el, rowIndex) => {
              const tr = el as HTMLElement;
              const isEvenRow = rowIndex % 2 === 0;
              const cells = tr.querySelectorAll('td');
              cells.forEach((cell) => {
                const td = cell as HTMLElement;
                // Reset gradient text effects
                td.style.background = isEvenRow ? colors.bgWhite : '#f8fafc';
                td.style.backgroundImage = 'none';
                td.style.webkitBackgroundClip = 'unset';
                td.style.webkitTextFillColor = colors.textDark;
                td.style.backgroundClip = 'unset';
                // Apply solid styling
                td.style.padding = '12px 16px';
                td.style.fontSize = '13px';
                td.style.color = colors.textDark;
                td.style.backgroundColor = isEvenRow ? colors.bgWhite : '#f8fafc';
                td.style.border = `1px solid ${colors.border}`;
                td.style.fontFamily = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
              });
            });
            
            // Style blockquotes - reset everything and apply navy background
            clonedElement.querySelectorAll('blockquote').forEach((el) => {
              const bq = el as HTMLElement;
              // Reset all background properties first
              bq.style.background = colors.bgNavy;
              bq.style.backgroundColor = colors.bgNavy;
              bq.style.backgroundImage = 'none';
              bq.style.borderLeft = `4px solid ${colors.accentGold}`;
              bq.style.borderTop = 'none';
              bq.style.borderRight = 'none';
              bq.style.borderBottom = 'none';
              bq.style.padding = '20px 24px';
              bq.style.margin = '20px 0';
              bq.style.color = colors.textOnDark;
              bq.style.fontStyle = 'normal';
              bq.style.borderRadius = '0 8px 8px 0';
              
              // Style ALL child elements inside blockquote
              bq.querySelectorAll('*').forEach((child) => {
                const childEl = child as HTMLElement;
                childEl.style.color = colors.textOnDark;
                childEl.style.background = 'transparent';
                childEl.style.backgroundColor = 'transparent';
                childEl.style.backgroundImage = 'none';
                childEl.style.webkitBackgroundClip = 'unset';
                childEl.style.webkitTextFillColor = colors.textOnDark;
              });
              
              // Style paragraphs inside blockquote
              bq.querySelectorAll('p').forEach((p) => {
                const pEl = p as HTMLElement;
                pEl.style.color = colors.textOnDark;
                pEl.style.fontSize = '13px';
                pEl.style.lineHeight = '1.6';
                pEl.style.marginBottom = '0';
                pEl.style.fontFamily = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
                pEl.style.background = 'transparent';
              });
              
              // Style strong text inside blockquote
              bq.querySelectorAll('strong').forEach((s) => {
                const sEl = s as HTMLElement;
                sEl.style.color = colors.accentGoldLight;
                sEl.style.fontWeight = '700';
              });
            });
            
            // Style horizontal rules (simple solid color)
            clonedElement.querySelectorAll('hr').forEach((el) => {
              const hr = el as HTMLElement;
              hr.style.cssText = `
                border: none;
                height: 2px;
                background-color: ${colors.accentGold};
                margin: 32px 0;
                width: 80px;
              `;
            });
            
            // Style code elements
            clonedElement.querySelectorAll('code').forEach((el) => {
              const code = el as HTMLElement;
              if (!code.closest('pre')) {
                code.style.cssText = `
                  background-color: #fef3c7;
                  color: ${colors.textGold};
                  padding: 2px 6px;
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
                background-color: ${colors.bgNavy};
                border: none;
                border-radius: 8px;
                padding: 16px;
                overflow-x: auto;
                margin: 20px 0;
              `;
              const code = pre.querySelector('code');
              if (code) {
                (code as HTMLElement).style.cssText = `
                  background-color: transparent;
                  padding: 0;
                  color: ${colors.textLight};
                  font-family: 'SF Mono', Monaco, Consolas, monospace;
                `;
              }
            });
            
            // ===== GAMMA CTA SECTION =====
            const gammaCta = clonedDoc.createElement('div');
            gammaCta.style.cssText = `
              margin-top: 40px;
              padding: 28px;
              background-color: #fffbeb;
              border: 2px dashed ${colors.accentGold};
              border-radius: 12px;
              text-align: center;
            `;
            
            const gammaTitle = clonedDoc.createElement('div');
            gammaTitle.style.cssText = `
              font-size: 16px;
              font-weight: 700;
              color: ${colors.textDark};
              margin-bottom: 8px;
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            `;
            gammaTitle.textContent = "✨ Turn This Into a Presentation";
            gammaCta.appendChild(gammaTitle);
            
            const gammaDesc = clonedDoc.createElement('div');
            gammaDesc.style.cssText = `
              font-size: 13px;
              color: ${colors.textMedium};
              margin-bottom: 14px;
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            `;
            gammaDesc.textContent = "Use Gamma.app to instantly transform this document into beautiful presentation slides with AI.";
            gammaCta.appendChild(gammaDesc);
            
            const gammaLink = clonedDoc.createElement('div');
            gammaLink.style.cssText = `
              display: inline-block;
              background-color: ${colors.bgNavy};
              color: ${colors.textOnDark};
              padding: 10px 20px;
              border-radius: 6px;
              font-size: 13px;
              font-weight: 600;
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            `;
            gammaLink.textContent = "🎯 gamma.app/create →";
            gammaCta.appendChild(gammaLink);
            
            contentWrapper.appendChild(gammaCta);
            
            // ===== FOOTER SECTION =====
            const footer = clonedDoc.createElement('div');
            footer.style.cssText = `
              margin-top: 40px;
              background-color: ${colors.bgNavy};
              border-radius: 8px;
              padding: 24px 32px;
            `;
            
            // Footer content - simple text layout
            const footerText = clonedDoc.createElement('div');
            footerText.style.cssText = `
              display: block;
              text-align: center;
            `;
            
            const brandText = clonedDoc.createElement('div');
            brandText.style.cssText = `
              font-size: 12px;
              font-weight: 700;
              letter-spacing: 2px;
              text-transform: uppercase;
              color: ${colors.accentGold};
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              margin-bottom: 8px;
            `;
            brandText.textContent = "● LOOK AFTER YOU";
            footerText.appendChild(brandText);
            
            const footerInfo = clonedDoc.createElement('div');
            footerInfo.style.cssText = `
              font-size: 11px;
              color: ${colors.textLight};
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            `;
            footerInfo.textContent = `Confidential Document • Prepared for ${response.clientName}`;
            footerText.appendChild(footerInfo);
            
            footer.appendChild(footerText);
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
            ctx.fillStyle = colors.bgMain;
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
      
      // Show Gamma modal after successful export
      setShowGammaModal(true);
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("There was an issue generating the PDF. Please try again or use the copy function to copy the content.");
    } finally {
      setIsExporting(false);
    }
  };

  const handleOpenGamma = () => {
    window.open('https://gamma.app/create', '_blank', 'noopener,noreferrer');
    setShowGammaModal(false);
  };

  const handleCloseGammaModal = () => {
    setShowGammaModal(false);
  };

  const handleCopyToGamma = async () => {
    if (!response) return;

    try {
      // Copy markdown content to clipboard
      await navigator.clipboard.writeText(response.markdownContent);
      setGammaCopied(true);
      
      // Open Gamma.app in new tab
      window.open('https://gamma.app/create', '_blank', 'noopener,noreferrer');
      
      // Reset copied state after 3 seconds
      setTimeout(() => setGammaCopied(false), 3000);
    } catch (err) {
      console.error("Failed to copy to clipboard:", err);
      // Still try to open Gamma even if copy fails
      window.open('https://gamma.app/create', '_blank', 'noopener,noreferrer');
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
                  <button
                    onClick={handleCopyToGamma}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg hover:from-amber-600 hover:to-orange-600 transition-all font-medium shadow-md hover:shadow-lg"
                    aria-label="Copy content and open Gamma.app to create presentation"
                    tabIndex={0}
                  >
                    {gammaCopied ? (
                      <>
                        <Check className="w-4 h-4" />
                        Copied! Opening Gamma...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        Gamma
                        <ExternalLink className="w-3 h-3 opacity-70" />
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

      {/* Gamma.app Success Modal */}
      {showGammaModal && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={handleCloseGammaModal}
          role="dialog"
          aria-modal="true"
          aria-labelledby="gamma-modal-title"
        >
          <div 
            className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl max-w-md w-full overflow-hidden transform animate-in fade-in zoom-in duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Success Header */}
            <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-6 text-center">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-white" />
              </div>
              <h2 id="gamma-modal-title" className="text-2xl font-bold text-white">
                PDF Downloaded!
              </h2>
              <p className="text-amber-100 mt-2">
                Your proposal is ready
              </p>
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 mb-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-amber-500 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-6 h-6 text-slate-900" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white mb-1">
                      Create a Presentation
                    </h3>
                    <p className="text-slate-300 text-sm leading-relaxed">
                      Use <span className="text-amber-400 font-semibold">Gamma.app</span> to instantly transform your PDF into beautiful, animated presentation slides with AI.
                    </p>
                  </div>
                </div>
              </div>

              {/* Steps */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
                  <span className="w-6 h-6 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-full flex items-center justify-center text-xs font-bold">1</span>
                  <span>Go to gamma.app/create</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
                  <span className="w-6 h-6 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-full flex items-center justify-center text-xs font-bold">2</span>
                  <span>Choose "Import" and upload your PDF</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
                  <span className="w-6 h-6 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-full flex items-center justify-center text-xs font-bold">3</span>
                  <span>AI generates your slides instantly</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={handleCloseGammaModal}
                  className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-medium"
                  aria-label="Close modal"
                >
                  Maybe Later
                </button>
                <button
                  onClick={handleOpenGamma}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl hover:from-amber-600 hover:to-orange-600 transition-colors font-medium flex items-center justify-center gap-2"
                  aria-label="Open Gamma.app in new tab"
                >
                  <span>Open Gamma</span>
                  <ExternalLink className="w-4 h-4" />
                </button>
              </div>

              {/* Direct Link */}
              <div className="mt-4 text-center">
                <a 
                  href="https://gamma.app/create" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-amber-600 dark:text-amber-400 hover:underline"
                  tabIndex={0}
                  aria-label="Direct link to gamma.app/create"
                >
                  gamma.app/create →
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResponsePage;

