"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { Presentation } from "@/types";

const PresentationsPage = () => {
  const router = useRouter();
  const [presentations, setPresentations] = useState<Presentation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPresentations = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/presentations");
        const data = await response.json();

        if (data.success) {
          setPresentations(data.presentations || []);
        } else {
          setError(data.error || "Failed to load presentations");
        }
      } catch (err) {
        console.error("Error loading presentations:", err);
        setError("Failed to load presentations");
      } finally {
        setLoading(false);
      }
    };

    fetchPresentations();
  }, []);

  const handleCreateNew = () => {
    router.push("/");
  };

  const handleOpenPresentation = (id: string) => {
    router.push(`/editor/${id}`);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this presentation?")) {
      return;
    }

    try {
      const response = await fetch(`/api/presentations/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        setPresentations(presentations.filter(p => p.id !== id));
      } else {
        alert("Failed to delete presentation");
      }
    } catch (err) {
      console.error("Error deleting presentation:", err);
      alert("Failed to delete presentation");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Presentations</h1>
              <p className="text-gray-600 mt-1">Manage your generated presentations</p>
            </div>
            <button
              onClick={handleCreateNew}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-md hover:from-blue-700 hover:to-purple-700 transition-all font-semibold shadow-lg"
            >
              + Create New
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        {loading ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">⏳</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Loading presentations...
            </h2>
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-red-600 mb-2">
              Error Loading Presentations
            </h2>
            <p className="text-gray-600 mb-8">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-8 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-semibold"
            >
              Retry
            </button>
          </div>
        ) : presentations.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">📊</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              No presentations yet
            </h2>
            <p className="text-gray-600 mb-8">
              Create your first AI-powered presentation to get started
            </p>
            <button
              onClick={handleCreateNew}
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-md hover:from-blue-700 hover:to-purple-700 transition-all font-semibold shadow-lg"
            >
              Create Presentation
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {presentations.map((presentation) => (
              <div
                key={presentation.id}
                className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow overflow-hidden"
              >
                {/* Thumbnail Preview */}
                <div className="h-48 bg-gradient-to-br from-gray-800 to-gray-600 flex items-center justify-center">
                  <div className="text-center text-white">
                    <div className="text-4xl mb-2">📊</div>
                    <div className="text-lg font-semibold">
                      {presentation.slides.length} Slides
                    </div>
                  </div>
                </div>

                {/* Presentation Info */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2 truncate">
                    {presentation.campaignName}
                  </h3>
                  <p className="text-gray-600 mb-1">
                    Client: {presentation.clientName}
                  </p>
                  <p className="text-sm text-gray-500 mb-4">
                    Created: {new Date(presentation.createdAt).toLocaleDateString()}
                  </p>
                  
                  <div className="flex items-center gap-2 mb-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        presentation.status === "draft"
                          ? "bg-yellow-100 text-yellow-800"
                          : presentation.status === "approved"
                          ? "bg-green-100 text-green-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {presentation.status.charAt(0).toUpperCase() + presentation.status.slice(1)}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleOpenPresentation(presentation.id)}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm font-medium"
                    >
                      Open
                    </button>
                    <button
                      onClick={() => handleDelete(presentation.id)}
                      className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-sm font-medium"
                      aria-label="Delete presentation"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default PresentationsPage;
