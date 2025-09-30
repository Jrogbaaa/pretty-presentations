"use client";

import { useState, useEffect } from "react";
import type { ClientBrief, Platform } from "@/types";
import type { TemplateId } from "@/types/templates";
import { TEMPLATES } from "@/types/templates";

interface BriefFormProps {
  onSubmit: (brief: ClientBrief) => void;
  isProcessing: boolean;
  initialData?: ClientBrief;
}

const BriefForm = ({ onSubmit, isProcessing, initialData }: BriefFormProps) => {
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
      templateId: "default",
    }
  );

  const [currentGoal, setCurrentGoal] = useState("");
  const [currentRequirement, setCurrentRequirement] = useState("");
  const [currentTheme, setCurrentTheme] = useState("");
  const [currentLocation, setCurrentLocation] = useState("");
  const [currentInterest, setCurrentInterest] = useState("");

  const platforms: Platform[] = ["Instagram", "TikTok", "YouTube", "Twitter", "Facebook", "LinkedIn", "Twitch"];

  // Update form when initialData changes
  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

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
      formData.campaignGoals &&
      formData.campaignGoals.length > 0 &&
      formData.budget &&
      formData.targetDemographics?.ageRange &&
      formData.platformPreferences &&
      formData.platformPreferences.length > 0
    ) {
      onSubmit(formData as ClientBrief);
    } else {
      alert("Please fill in all required fields");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-8 p-8 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800">
      <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Client Brief</h2>
        <p className="mt-2 text-gray-600 dark:text-gray-400">Fill in the campaign details to generate your presentation</p>
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
          Campaign Goals *
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

      {/* Target Demographics */}
      <div className="space-y-4 p-6 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Target Demographics *</h3>
        
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
              required
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
          Platform Preferences *
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
            placeholder="e.g., No alcohol mention, Family-friendly content"
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

      {/* Presentation Template Selection */}
      <div className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl border-2 border-purple-200 dark:border-purple-800">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
          🎨 Presentation Template
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Choose a template that matches your campaign style. We&apos;ll auto-recommend based on your brief.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.entries(TEMPLATES).map(([id, template]) => (
            <button
              key={id}
              type="button"
              onClick={() => setFormData({ ...formData, templateId: id as TemplateId })}
              className={`p-4 rounded-xl border-2 transition-all text-left ${
                formData.templateId === id
                  ? "border-purple-600 dark:border-purple-400 bg-purple-50 dark:bg-purple-900/30 ring-2 ring-purple-200 dark:ring-purple-800 shadow-lg"
                  : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:border-purple-400 dark:hover:border-purple-500"
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-semibold text-gray-900 dark:text-white">{template.name}</h4>
                {formData.templateId === id && (
                  <span className="text-purple-600 dark:text-purple-400 text-xl">✓</span>
                )}
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">{template.description}</p>
              <div className="flex items-center gap-2 text-xs">
                <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-gray-700 dark:text-gray-300">
                  {template.mood.split(",")[0]}
                </span>
              </div>
              <div className="mt-3 flex gap-1">
                {Object.values(template.colorPalette).slice(0, 4).map((color, idx) => (
                  <div
                    key={idx}
                    className="w-6 h-6 rounded border border-gray-200 dark:border-gray-600"
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
            </button>
          ))}
        </div>

        {formData.templateId && (
          <div className="mt-4 p-3 bg-white dark:bg-gray-800 rounded-lg border border-purple-200 dark:border-purple-800">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              <strong>Selected:</strong> {TEMPLATES[formData.templateId as TemplateId].name}
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              {TEMPLATES[formData.templateId as TemplateId].mood}
            </p>
          </div>
        )}
      </div>

      {/* Submit Button */}
      <div className="flex justify-end gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
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
          {isProcessing ? "Generating Presentation..." : "Generate Presentation"}
        </button>
      </div>
    </form>
  );
};

export default BriefForm;