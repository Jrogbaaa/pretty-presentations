"use client";

import { useState, useEffect } from "react";
import { Sparkles, Zap, CheckCircle2, XCircle, Loader2 } from "lucide-react";

export type PresentationEngine = "standard" | "presenton";

interface PresentationEngineSelectorProps {
  selectedEngine: PresentationEngine;
  onEngineChange: (engine: PresentationEngine) => void;
  disabled?: boolean;
}

const PresentationEngineSelector = ({
  selectedEngine,
  onEngineChange,
  disabled = false,
}: PresentationEngineSelectorProps) => {
  const [presentonAvailable, setPresentonAvailable] = useState<boolean | null>(null);
  const [checkingStatus, setCheckingStatus] = useState(true);

  // Check if Presenton is enabled and available
  useEffect(() => {
    const checkPresenton = async () => {
      setCheckingStatus(true);
      try {
        const enabled = process.env.NEXT_PUBLIC_ENABLE_PRESENTON === "true";
        
        if (!enabled) {
          setPresentonAvailable(false);
          setCheckingStatus(false);
          return;
        }

        // Check if Presenton container is running
        const response = await fetch("/api/presenton/health", {
          method: "GET",
        });
        
        setPresentonAvailable(response.ok);
      } catch (error) {
        console.error("Failed to check Presenton status:", error);
        setPresentonAvailable(false);
      } finally {
        setCheckingStatus(false);
      }
    };

    checkPresenton();
    
    // Recheck every 30 seconds
    const interval = setInterval(checkPresenton, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const handleEngineSelect = (engine: PresentationEngine) => {
    if (disabled) return;
    
    // Don't allow selecting Presenton if it's not available
    if (engine === "presenton" && !presentonAvailable) {
      return;
    }
    
    onEngineChange(engine);
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        Motor de Presentación
      </label>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Standard Generator */}
        <button
          type="button"
          onClick={() => handleEngineSelect("standard")}
          disabled={disabled}
          className={`
            relative p-4 rounded-lg border-2 transition-all
            ${
              selectedEngine === "standard"
                ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20"
                : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
            }
            ${
              disabled
                ? "opacity-50 cursor-not-allowed"
                : "hover:border-purple-300 dark:hover:border-purple-700 cursor-pointer"
            }
          `}
        >
          <div className="flex items-start gap-3">
            <div
              className={`
                flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center
                ${
                  selectedEngine === "standard"
                    ? "bg-purple-500 text-white"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                }
              `}
            >
              <Zap className="w-5 h-5" />
            </div>
            
            <div className="flex-1 text-left">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                Generador Estándar
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Plantillas de calidad agencia con imágenes Nano Banana
              </p>
              <div className="flex flex-wrap gap-2 mt-2">
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                  Inteligencia de Marca
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                  Plantillas Personalizadas
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400">
                  Imágenes IA
                </span>
              </div>
            </div>
            
            {selectedEngine === "standard" && (
              <CheckCircle2 className="flex-shrink-0 w-5 h-5 text-purple-500" />
            )}
          </div>
        </button>

        {/* Presenton Generator */}
        <button
          type="button"
          onClick={() => handleEngineSelect("presenton")}
          disabled={disabled || !presentonAvailable}
          className={`
            relative p-4 rounded-lg border-2 transition-all
            ${
              selectedEngine === "presenton"
                ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20"
                : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
            }
            ${
              disabled || !presentonAvailable
                ? "opacity-50 cursor-not-allowed"
                : "hover:border-purple-300 dark:hover:border-purple-700 cursor-pointer"
            }
          `}
        >
          <div className="flex items-start gap-3">
            <div
              className={`
                flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center
                ${
                  selectedEngine === "presenton"
                    ? "bg-purple-500 text-white"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                }
              `}
            >
              <Sparkles className="w-5 h-5" />
            </div>
            
            <div className="flex-1 text-left">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                Presenton (IA Mejorada)
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Motor IA de código abierto con diseños dinámicos
              </p>
              <div className="flex flex-wrap gap-2 mt-2">
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                  Imágenes Gratis
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                  Plantillas HTML/CSS
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
                  75% Ahorro de Costos
                </span>
              </div>
            </div>
            
            {selectedEngine === "presenton" && (
              <CheckCircle2 className="flex-shrink-0 w-5 h-5 text-purple-500" />
            )}
          </div>
          
          {/* Status indicator */}
          <div className="absolute top-2 right-2">
            {checkingStatus ? (
              <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
            ) : presentonAvailable ? (
              <div className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                <CheckCircle2 className="w-3 h-3" />
                <span className="hidden sm:inline">En Línea</span>
              </div>
            ) : (
              <div className="flex items-center gap-1 text-xs text-red-600 dark:text-red-400">
                <XCircle className="w-3 h-3" />
                <span className="hidden sm:inline">Fuera de Línea</span>
              </div>
            )}
          </div>
        </button>
      </div>
      
      {/* Status message */}
      {!checkingStatus && !presentonAvailable && (
        <div className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
          <p className="font-medium">Presenton no está disponible</p>
          <p className="text-xs mt-1">
            Para habilitar: Inicia el contenedor Docker con{" "}
            <code className="px-1 py-0.5 bg-gray-200 dark:bg-gray-700 rounded">
              ./scripts/presenton-docker.sh start
            </code>
          </p>
        </div>
      )}
    </div>
  );
};

export default PresentationEngineSelector;

