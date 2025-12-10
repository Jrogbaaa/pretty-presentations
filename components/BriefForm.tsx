"use client";

import { useState, useEffect, useRef } from "react";
import { FileText, Upload, X, File } from "lucide-react";
import type { ClientBrief, Platform } from "@/types";

interface BriefFormProps {
  onGenerateBriefResponse: (brief: ClientBrief) => void;
  isProcessing: boolean;
  initialData?: ClientBrief;
}

interface AdditionalContextFile {
  id: string;
  name: string;
  type: "pdf" | "text" | "presentation";
  content: string;
}

const BriefForm = ({ onGenerateBriefResponse, isProcessing, initialData }: BriefFormProps) => {
  const [formData, setFormData] = useState<Partial<ClientBrief>>(
    initialData || {
      clientName: "",
      campaignGoals: [],
      budget: 0,
      targetDemographics: {
        ageRange: "",
        gender: "",
        location: [],
        interests: [],
      },
      brandRequirements: [],
      timeline: "",
      platformPreferences: [],
      contentThemes: [],
      additionalNotes: "",
      manualInfluencers: [],
      additionalContext: [],
    }
  );

  const [currentGoal, setCurrentGoal] = useState("");
  const [currentRequirement, setCurrentRequirement] = useState("");
  const [currentTheme, setCurrentTheme] = useState("");
  const [currentLocation, setCurrentLocation] = useState("");
  const [currentInterest, setCurrentInterest] = useState("");
  const [currentManualInfluencer, setCurrentManualInfluencer] = useState("");
  const [additionalContextFiles, setAdditionalContextFiles] = useState<AdditionalContextFile[]>([]);
  const [additionalContextText, setAdditionalContextText] = useState("");
  const [isExtractingPdf, setIsExtractingPdf] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const platforms: Platform[] = ["Instagram", "TikTok", "YouTube", "Twitter", "Facebook", "LinkedIn", "Twitch"];

  // Update form when initialData changes
  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  // Handle PDF file upload and text extraction
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsExtractingPdf(true);

    for (const file of Array.from(files)) {
      try {
        let content = "";
        let fileType: "pdf" | "text" | "presentation" = "text";

        if (file.type === "application/pdf") {
          fileType = "pdf";
          // Extract text from PDF using pdf.js
          const arrayBuffer = await file.arrayBuffer();
          const pdfjsLib = await import("pdfjs-dist");
          
          // Set worker source
          pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
          
          const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
          const textParts: string[] = [];
          
          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const pageText = textContent.items
              .map((item: any) => item.str)
              .join(" ");
            textParts.push(pageText);
          }
          
          content = textParts.join("\n\n");
        } else if (file.type === "text/plain" || file.name.endsWith(".txt")) {
          fileType = "text";
          content = await file.text();
        } else if (file.name.endsWith(".pptx") || file.name.endsWith(".ppt")) {
          fileType = "presentation";
          // For presentations, we'll note that manual review is needed
          content = `[Presentation file: ${file.name}] - Please describe the key points from this presentation in the Additional Notes field above.`;
        } else {
          // Try to read as text
          content = await file.text();
        }

        const newFile: AdditionalContextFile = {
          id: `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          name: file.name,
          type: fileType,
          content: content.trim(),
        };

        setAdditionalContextFiles(prev => [...prev, newFile]);
      } catch (error) {
        console.error(`Error processing file ${file.name}:`, error);
        // Add as placeholder if extraction fails
        const fallbackFile: AdditionalContextFile = {
          id: `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          name: file.name,
          type: "text",
          content: `[File: ${file.name}] - Could not extract text. Please describe the contents in the Additional Notes field.`,
        };
        setAdditionalContextFiles(prev => [...prev, fallbackFile]);
      }
    }

    setIsExtractingPdf(false);
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRemoveContextFile = (id: string) => {
    setAdditionalContextFiles(prev => prev.filter(f => f.id !== id));
  };

  const handleAddContextText = () => {
    if (additionalContextText.trim()) {
      const newFile: AdditionalContextFile = {
        id: `text-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: "Additional Context",
        type: "text",
        content: additionalContextText.trim(),
      };
      setAdditionalContextFiles(prev => [...prev, newFile]);
      setAdditionalContextText("");
    }
  };

  const handleAddItem = (
    field: "campaignGoals" | "brandRequirements" | "contentThemes",
    value: string,
    setter: (value: string) => void
  ) => {
    if (value.trim()) {
      setFormData({
        ...formData,
        [field]: [...(formData[field] || []), value.trim()],
      });
      setter("");
    }
  };

  const handleAddLocation = () => {
    if (currentLocation.trim() && formData.targetDemographics) {
      setFormData({
        ...formData,
        targetDemographics: {
          ...formData.targetDemographics,
          location: [...formData.targetDemographics.location, currentLocation.trim()],
        },
      });
      setCurrentLocation("");
    }
  };

  const handleAddInterest = () => {
    if (currentInterest.trim() && formData.targetDemographics) {
      setFormData({
        ...formData,
        targetDemographics: {
          ...formData.targetDemographics,
          interests: [...formData.targetDemographics.interests, currentInterest.trim()],
        },
      });
      setCurrentInterest("");
    }
  };

  const handleRemoveItem = (
    field: "campaignGoals" | "brandRequirements" | "contentThemes",
    index: number
  ) => {
    const newArray = [...(formData[field] || [])];
    newArray.splice(index, 1);
    setFormData({ ...formData, [field]: newArray });
  };

  const togglePlatform = (platform: Platform) => {
    const current = formData.platformPreferences || [];
    const newPlatforms = current.includes(platform)
      ? current.filter(p => p !== platform)
      : [...current, platform];
    setFormData({ ...formData, platformPreferences: newPlatforms });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (
      formData.clientName &&
      formData.budget &&
      formData.budget > 0
    ) {
      // Include additional context files in the form data
      const briefWithContext: ClientBrief = {
        ...(formData as ClientBrief),
        additionalContext: additionalContextFiles.map(f => ({
          id: f.id,
          name: f.name,
          type: f.type,
          content: f.content,
        })),
      };
      onGenerateBriefResponse(briefWithContext);
    } else {
      alert("Please provide at least a client name and budget");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-8 p-8 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800">
      <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Client Brief</h2>
        <p className="mt-2 text-gray-600 dark:text-gray-400">Fill in the campaign details to generate your influencer recommendations</p>
      </div>

      {/* Client Name */}
      <div>
        <label htmlFor="clientName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Client Name *
        </label>
        <input
          type="text"
          id="clientName"
          value={formData.clientName}
          onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
          className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
          placeholder="e.g., Starbucks, Nike, Red Bull"
          required
        />
      </div>

      {/* Campaign Goals */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Campaign Goals
        </label>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={currentGoal}
            onChange={(e) => setCurrentGoal(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAddItem("campaignGoals", currentGoal, setCurrentGoal);
              }
            }}
            className="flex-1 px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
            placeholder="e.g., Increase brand awareness, Drive product sales"
          />
          <button
            type="button"
            onClick={() => handleAddItem("campaignGoals", currentGoal, setCurrentGoal)}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all font-medium shadow-lg hover:shadow-xl"
          >
            Add
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {formData.campaignGoals?.map((goal, index) => (
            <span
              key={index}
              className="inline-flex items-center gap-2 px-3 py-1.5 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 rounded-full text-sm border border-purple-200 dark:border-purple-800"
            >
              {goal}
              <button
                type="button"
                onClick={() => handleRemoveItem("campaignGoals", index)}
                className="text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-200"
                aria-label="Remove goal"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      </div>

      {/* Budget */}
      <div>
        <label htmlFor="budget" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Budget (€) *
        </label>
        
        {/* Budget Warning Banner */}
        {(formData.budget === 0 || !formData.budget) && (
          <div className="mb-4 p-4 bg-amber-50 dark:bg-amber-900/20 border-2 border-amber-300 dark:border-amber-700 rounded-lg">
            <div className="flex items-start gap-3">
              <span className="text-amber-600 dark:text-amber-400 text-xl flex-shrink-0">⚠️</span>
              <div>
                <h4 className="font-semibold text-amber-900 dark:text-amber-300">Budget Required</h4>
                <p className="text-sm text-amber-700 dark:text-amber-400 mt-1">
                  No budget found in your brief. Please enter a campaign budget below to generate influencer recommendations.
                </p>
              </div>
            </div>
          </div>
        )}
        
        <input
          type="number"
          id="budget"
          value={formData.budget || ""}
          onChange={(e) => setFormData({ ...formData, budget: parseFloat(e.target.value) })}
          className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
          placeholder="e.g., 50000"
          min="0"
          step="1000"
          required
        />
      </div>

      {/* Influencer Requirements */}
      <div className="space-y-4 p-6 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl border border-purple-200 dark:border-purple-800">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <span>👥</span> Influencer Requirements
          {formData.influencerRequirements?.totalCount && (
            <span className="ml-2 px-3 py-1 bg-purple-600 text-white text-sm rounded-full">
              {formData.influencerRequirements.totalCount} requested
            </span>
          )}
        </h3>
        
        {/* Show parsed requirements if available */}
        {formData.influencerRequirements?.breakdown && formData.influencerRequirements.breakdown.length > 0 && (
          <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-purple-200 dark:border-purple-700">
            <p className="text-sm font-medium text-purple-700 dark:text-purple-300 mb-2">Parsed from brief:</p>
            <div className="flex flex-wrap gap-2">
              {formData.influencerRequirements.breakdown.map((tier, idx) => (
                <span key={idx} className="px-3 py-1.5 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 rounded-full text-sm">
                  {tier.count} {tier.tier}
                  {tier.gender && ` (${tier.gender.female}F/${tier.gender.male}M)`}
                </span>
              ))}
            </div>
            {formData.influencerRequirements.locationDistribution && (
              <div className="mt-2 flex flex-wrap gap-2">
                {formData.influencerRequirements.locationDistribution.map((loc, idx) => (
                  <span key={idx} className="px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full text-sm">
                    {loc.percentage}% {loc.city}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="totalInfluencers" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Total Influencers Needed
            </label>
            <input
              type="number"
              id="totalInfluencers"
              value={formData.influencerRequirements?.totalCount || ""}
              onChange={(e) => {
                const count = parseInt(e.target.value) || undefined;
                setFormData({
                  ...formData,
                  influencerRequirements: {
                    ...formData.influencerRequirements,
                    totalCount: count,
                  },
                });
              }}
              className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
              placeholder="e.g., 8 (leave empty for automatic selection)"
              min="1"
              max="50"
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Override the parsed count or set manually
            </p>
          </div>

          <div>
            <label htmlFor="influencerNotes" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Special Requirements
            </label>
            <input
              type="text"
              id="influencerNotes"
              value={formData.influencerRequirements?.notes || ""}
              onChange={(e) => {
                setFormData({
                  ...formData,
                  influencerRequirements: {
                    ...formData.influencerRequirements,
                    notes: e.target.value,
                  },
                });
              }}
              className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
              placeholder="e.g., 50% macro, 50% micro"
            />
          </div>
        </div>
      </div>

      {/* Target Demographics */}
      <div className="space-y-4 p-6 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Target Demographics</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="ageRange" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Age Range
            </label>
            <input
              type="text"
              id="ageRange"
              value={formData.targetDemographics?.ageRange || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  targetDemographics: {
                    ...formData.targetDemographics!,
                    ageRange: e.target.value,
                  },
                })
              }
              className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
              placeholder="e.g., 18-35"
            />
          </div>

          <div>
            <label htmlFor="gender" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Gender
            </label>
            <input
              type="text"
              id="gender"
              value={formData.targetDemographics?.gender || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  targetDemographics: {
                    ...formData.targetDemographics!,
                    gender: e.target.value,
                  },
                })
              }
              className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
              placeholder="e.g., All genders, 60% Female"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Locations
          </label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={currentLocation}
              onChange={(e) => setCurrentLocation(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddLocation();
                }
              }}
              className="flex-1 px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
              placeholder="e.g., Spain, Madrid, Barcelona"
            />
            <button
              type="button"
              onClick={handleAddLocation}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all font-medium shadow-lg hover:shadow-xl"
            >
              Add
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {formData.targetDemographics?.location.map((loc, index) => (
              <span
                key={index}
                className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full text-sm border border-blue-200 dark:border-blue-800"
              >
                {loc}
                <button
                  type="button"
                  onClick={() => {
                    const newLocations = [...formData.targetDemographics!.location];
                    newLocations.splice(index, 1);
                    setFormData({
                      ...formData,
                      targetDemographics: {
                        ...formData.targetDemographics!,
                        location: newLocations,
                      },
                    });
                  }}
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200"
                  aria-label="Remove location"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Interests
          </label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={currentInterest}
              onChange={(e) => setCurrentInterest(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddInterest();
                }
              }}
              className="flex-1 px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
              placeholder="e.g., Fashion, Technology, Sports"
            />
            <button
              type="button"
              onClick={handleAddInterest}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all font-medium shadow-lg hover:shadow-xl"
            >
              Add
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {formData.targetDemographics?.interests.map((interest, index) => (
              <span
                key={index}
                className="inline-flex items-center gap-2 px-3 py-1.5 bg-pink-100 dark:bg-pink-900/30 text-pink-800 dark:text-pink-300 rounded-full text-sm border border-pink-200 dark:border-pink-800"
              >
                {interest}
                <button
                  type="button"
                  onClick={() => {
                    const newInterests = [...formData.targetDemographics!.interests];
                    newInterests.splice(index, 1);
                    setFormData({
                      ...formData,
                      targetDemographics: {
                        ...formData.targetDemographics!,
                        interests: newInterests,
                      },
                    });
                  }}
                  className="text-pink-600 dark:text-pink-400 hover:text-pink-800 dark:hover:text-pink-200"
                  aria-label="Remove interest"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Platform Preferences */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          Platform Preferences
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {platforms.map((platform) => (
            <button
              key={platform}
              type="button"
              onClick={() => togglePlatform(platform)}
              className={`px-4 py-3 rounded-lg border-2 transition-all font-medium ${
                formData.platformPreferences?.includes(platform)
                  ? "border-purple-500 dark:border-purple-400 bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 shadow-md"
                  : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:border-purple-400 dark:hover:border-purple-500"
              }`}
            >
              {platform}
            </button>
          ))}
        </div>
      </div>

      {/* Brand Requirements */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Brand Requirements
        </label>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={currentRequirement}
            onChange={(e) => setCurrentRequirement(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAddItem("brandRequirements", currentRequirement, setCurrentRequirement);
              }
            }}
            className="flex-1 px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
            placeholder="e.g., No alcohol mentions, Family-friendly content"
          />
          <button
            type="button"
            onClick={() => handleAddItem("brandRequirements", currentRequirement, setCurrentRequirement)}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all font-medium shadow-lg hover:shadow-xl"
          >
            Add
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {formData.brandRequirements?.map((req, index) => (
            <span
              key={index}
              className="inline-flex items-center gap-2 px-3 py-1.5 bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 rounded-full text-sm border border-orange-200 dark:border-orange-800"
            >
              {req}
              <button
                type="button"
                onClick={() => handleRemoveItem("brandRequirements", index)}
                className="text-orange-600 dark:text-orange-400 hover:text-orange-800 dark:hover:text-orange-200"
                aria-label="Remove requirement"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      </div>

      {/* Content Themes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Content Themes
        </label>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={currentTheme}
            onChange={(e) => setCurrentTheme(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAddItem("contentThemes", currentTheme, setCurrentTheme);
              }
            }}
            className="flex-1 px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
            placeholder="e.g., Authenticity, Sustainability, Innovation"
          />
          <button
            type="button"
            onClick={() => handleAddItem("contentThemes", currentTheme, setCurrentTheme)}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all font-medium shadow-lg hover:shadow-xl"
          >
            Add
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {formData.contentThemes?.map((theme, index) => (
            <span
              key={index}
              className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-full text-sm border border-green-200 dark:border-green-800"
            >
              {theme}
              <button
                type="button"
                onClick={() => handleRemoveItem("contentThemes", index)}
                className="text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-200"
                aria-label="Remove theme"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      </div>

      {/* Manual Influencers */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Manually Requested Influencers
        </label>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
          Add specific influencer names or Instagram handles you want to include. Formats: "name", "@handle", or "name (@handle)"
        </p>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={currentManualInfluencer}
            onChange={(e) => setCurrentManualInfluencer(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                if (currentManualInfluencer.trim()) {
                  setFormData({
                    ...formData,
                    manualInfluencers: [...(formData.manualInfluencers || []), currentManualInfluencer.trim()],
                  });
                  setCurrentManualInfluencer("");
                }
              }
            }}
            className="flex-1 px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
            placeholder="e.g., Maria Garcia, @maria_garcia, or Maria Garcia (@maria_garcia)"
          />
          <button
            type="button"
            onClick={() => {
              if (currentManualInfluencer.trim()) {
                setFormData({
                  ...formData,
                  manualInfluencers: [...(formData.manualInfluencers || []), currentManualInfluencer.trim()],
                });
                setCurrentManualInfluencer("");
              }
            }}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all font-medium shadow-lg hover:shadow-xl"
          >
            Add
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {formData.manualInfluencers?.map((influencer, index) => (
            <span
              key={index}
              className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-300 rounded-full text-sm border border-indigo-200 dark:border-indigo-800"
            >
              {influencer}
              <button
                type="button"
                onClick={() => {
                  const newInfluencers = [...(formData.manualInfluencers || [])];
                  newInfluencers.splice(index, 1);
                  setFormData({
                    ...formData,
                    manualInfluencers: newInfluencers,
                  });
                }}
                className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-200"
                aria-label="Remove influencer"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      </div>

      {/* Timeline */}
      <div>
        <label htmlFor="timeline" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Timeline
        </label>
        <input
          type="text"
          id="timeline"
          value={formData.timeline}
          onChange={(e) => setFormData({ ...formData, timeline: e.target.value })}
          className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
          placeholder="e.g., Q1 2025, March-May 2025, 8 weeks"
        />
      </div>

      {/* Additional Notes */}
      <div>
        <label htmlFor="additionalNotes" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Additional Notes
        </label>
        <textarea
          id="additionalNotes"
          value={formData.additionalNotes}
          onChange={(e) => setFormData({ ...formData, additionalNotes: e.target.value })}
          rows={4}
          className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
          placeholder="Any additional information or special requirements..."
        />
      </div>

      {/* Additional Context Upload Section */}
      <div className="space-y-4 p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border-2 border-blue-200 dark:border-blue-800">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Additional Context
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Upload PDFs, presentations, or add text with extra campaign details
            </p>
          </div>
        </div>

        {/* File Upload */}
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.txt,.pptx,.ppt,.doc,.docx"
            multiple
            onChange={handleFileUpload}
            className="hidden"
            id="context-file-upload"
          />
          <label
            htmlFor="context-file-upload"
            className={`flex items-center justify-center gap-3 w-full px-6 py-4 border-2 border-dashed rounded-lg cursor-pointer transition-all ${
              isExtractingPdf 
                ? "border-blue-400 bg-blue-50 dark:bg-blue-900/30" 
                : "border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20"
            }`}
          >
            {isExtractingPdf ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-500 border-t-transparent" />
                <span className="text-blue-600 dark:text-blue-400 font-medium">Extracting text...</span>
              </>
            ) : (
              <>
                <Upload className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                <span className="text-gray-700 dark:text-gray-300">
                  <strong className="text-blue-600 dark:text-blue-400">Click to upload</strong> or drag and drop
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-500">PDF, TXT, PPTX</span>
              </>
            )}
          </label>
        </div>

        {/* Text Input for Additional Context */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Or paste additional context text
          </label>
          <div className="flex gap-2">
            <textarea
              value={additionalContextText}
              onChange={(e) => setAdditionalContextText(e.target.value)}
              rows={3}
              className="flex-1 px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm"
              placeholder="Paste any extra context about the campaign, brand guidelines, creative direction, etc..."
            />
            <button
              type="button"
              onClick={handleAddContextText}
              disabled={!additionalContextText.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed self-end"
            >
              Add
            </button>
          </div>
        </div>

        {/* Uploaded Context Files List */}
        {additionalContextFiles.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Attached Context ({additionalContextFiles.length} {additionalContextFiles.length === 1 ? "file" : "files"})
            </p>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {additionalContextFiles.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      file.type === "pdf" 
                        ? "bg-red-100 dark:bg-red-900/30" 
                        : file.type === "presentation"
                        ? "bg-orange-100 dark:bg-orange-900/30"
                        : "bg-blue-100 dark:bg-blue-900/30"
                    }`}>
                      <File className={`w-4 h-4 ${
                        file.type === "pdf" 
                          ? "text-red-600 dark:text-red-400" 
                          : file.type === "presentation"
                          ? "text-orange-600 dark:text-orange-400"
                          : "text-blue-600 dark:text-blue-400"
                      }`} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-gray-900 dark:text-white text-sm truncate">
                        {file.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {file.content.length > 100 
                          ? `${file.content.substring(0, 100)}...` 
                          : file.content}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveContextFile(file.id)}
                    className="ml-2 p-1.5 text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors flex-shrink-0"
                    aria-label="Remove file"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Help Text */}
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          💡 <strong>Tip:</strong> Upload client presentations, brand guidelines, or previous campaign reports. 
          Our AI will use this extra context to provide better-tailored recommendations.
        </p>
      </div>

      {/* Submit Buttons */}
      <div className="flex flex-col sm:flex-row justify-end gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="px-6 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
        >
          Reset
        </button>
        
        <button
          type="submit"
          disabled={isProcessing}
          className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isProcessing ? "Generating..." : "Generate Brief Response"}
        </button>
      </div>
    </form>
  );
};

export default BriefForm;
