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
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-8 p-8 bg-white rounded-lg shadow-lg">
      <div className="border-b pb-6">
        <h2 className="text-3xl font-bold text-gray-900">Client Brief</h2>
        <p className="mt-2 text-gray-600">Fill in the campaign details to generate your presentation</p>
      </div>

      {/* Client Name */}
      <div>
        <label htmlFor="clientName" className="block text-sm font-medium text-gray-700 mb-2">
          Client Name *
        </label>
        <input
          type="text"
          id="clientName"
          value={formData.clientName}
          onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="e.g., Starbucks, Nike, Red Bull"
          required
        />
      </div>

      {/* Campaign Goals */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
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
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="e.g., Increase brand awareness, Drive product sales"
          />
          <button
            type="button"
            onClick={() => handleAddItem("campaignGoals", currentGoal, setCurrentGoal)}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Add
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {formData.campaignGoals?.map((goal, index) => (
            <span
              key={index}
              className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
            >
              {goal}
              <button
                type="button"
                onClick={() => handleRemoveItem("campaignGoals", index)}
                className="text-blue-600 hover:text-blue-800"
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
        <label htmlFor="budget" className="block text-sm font-medium text-gray-700 mb-2">
          Budget (€) *
        </label>
        <input
          type="number"
          id="budget"
          value={formData.budget || ""}
          onChange={(e) => setFormData({ ...formData, budget: parseFloat(e.target.value) })}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="e.g., 50000"
          min="0"
          step="1000"
          required
        />
      </div>

      {/* Target Demographics */}
      <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-900">Target Demographics *</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="ageRange" className="block text-sm font-medium text-gray-700 mb-2">
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
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., 18-35"
              required
            />
          </div>

          <div>
            <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-2">
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
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., All genders, 60% Female"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
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
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., Spain, Madrid, Barcelona"
            />
            <button
              type="button"
              onClick={handleAddLocation}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Add
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {formData.targetDemographics?.location.map((loc, index) => (
              <span
                key={index}
                className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
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
                  className="text-green-600 hover:text-green-800"
                  aria-label="Remove location"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
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
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., Fashion, Technology, Sports"
            />
            <button
              type="button"
              onClick={handleAddInterest}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Add
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {formData.targetDemographics?.interests.map((interest, index) => (
              <span
                key={index}
                className="inline-flex items-center gap-2 px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm"
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
                  className="text-purple-600 hover:text-purple-800"
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
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Platform Preferences *
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {platforms.map((platform) => (
            <button
              key={platform}
              type="button"
              onClick={() => togglePlatform(platform)}
              className={`px-4 py-3 rounded-lg border-2 transition-all ${
                formData.platformPreferences?.includes(platform)
                  ? "border-blue-500 bg-blue-50 text-blue-700 font-semibold"
                  : "border-gray-300 bg-white text-gray-700 hover:border-gray-400"
              }`}
            >
              {platform}
            </button>
          ))}
        </div>
      </div>

      {/* Brand Requirements */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
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
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="e.g., No alcohol mention, Family-friendly content"
          />
          <button
            type="button"
            onClick={() => handleAddItem("brandRequirements", currentRequirement, setCurrentRequirement)}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Add
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {formData.brandRequirements?.map((req, index) => (
            <span
              key={index}
              className="inline-flex items-center gap-2 px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm"
            >
              {req}
              <button
                type="button"
                onClick={() => handleRemoveItem("brandRequirements", index)}
                className="text-red-600 hover:text-red-800"
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
        <label className="block text-sm font-medium text-gray-700 mb-2">
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
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="e.g., Authenticity, Sustainability, Innovation"
          />
          <button
            type="button"
            onClick={() => handleAddItem("contentThemes", currentTheme, setCurrentTheme)}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Add
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {formData.contentThemes?.map((theme, index) => (
            <span
              key={index}
              className="inline-flex items-center gap-2 px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm"
            >
              {theme}
              <button
                type="button"
                onClick={() => handleRemoveItem("contentThemes", index)}
                className="text-yellow-600 hover:text-yellow-800"
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
        <label htmlFor="timeline" className="block text-sm font-medium text-gray-700 mb-2">
          Timeline
        </label>
        <input
          type="text"
          id="timeline"
          value={formData.timeline}
          onChange={(e) => setFormData({ ...formData, timeline: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="e.g., Q1 2025, March-May 2025, 8 weeks"
        />
      </div>

      {/* Additional Notes */}
      <div>
        <label htmlFor="additionalNotes" className="block text-sm font-medium text-gray-700 mb-2">
          Additional Notes
        </label>
        <textarea
          id="additionalNotes"
          value={formData.additionalNotes}
          onChange={(e) => setFormData({ ...formData, additionalNotes: e.target.value })}
          rows={4}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Any additional information or special requirements..."
        />
      </div>

      {/* Presentation Template Selection */}
      <div className="p-6 bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg border border-purple-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">
          🎨 Presentation Template
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Choose a template that matches your campaign style. We&apos;ll auto-recommend based on your brief.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.entries(TEMPLATES).map(([id, template]) => (
            <button
              key={id}
              type="button"
              onClick={() => setFormData({ ...formData, templateId: id as TemplateId })}
              className={`p-4 rounded-lg border-2 transition-all text-left ${
                formData.templateId === id
                  ? "border-purple-600 bg-purple-50 ring-2 ring-purple-200"
                  : "border-gray-300 bg-white hover:border-purple-400"
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-semibold text-gray-900">{template.name}</h4>
                {formData.templateId === id && (
                  <span className="text-purple-600 text-xl">✓</span>
                )}
              </div>
              <p className="text-xs text-gray-600 mb-3">{template.description}</p>
              <div className="flex items-center gap-2 text-xs">
                <span className="px-2 py-1 bg-gray-100 rounded text-gray-700">
                  {template.mood.split(",")[0]}
                </span>
              </div>
              <div className="mt-3 flex gap-1">
                {Object.values(template.colorPalette).slice(0, 4).map((color, idx) => (
                  <div
                    key={idx}
                    className="w-6 h-6 rounded border border-gray-200"
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
            </button>
          ))}
        </div>

        {formData.templateId && (
          <div className="mt-4 p-3 bg-white rounded border border-purple-200">
            <p className="text-sm text-gray-700">
              <strong>Selected:</strong> {TEMPLATES[formData.templateId as TemplateId].name}
            </p>
            <p className="text-xs text-gray-600 mt-1">
              {TEMPLATES[formData.templateId as TemplateId].mood}
            </p>
          </div>
        )}
      </div>

      {/* Submit Button */}
      <div className="flex justify-end gap-4 pt-6 border-t">
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="px-6 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
        >
          Reset
        </button>
        <button
          type="submit"
          disabled={isProcessing}
          className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-md hover:from-blue-700 hover:to-purple-700 transition-all font-semibold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isProcessing ? "Generating Presentation..." : "Generate Presentation"}
        </button>
      </div>
    </form>
  );
};

export default BriefForm;
