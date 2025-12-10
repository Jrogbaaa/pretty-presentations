"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, FileCheck, Target, Brain, FileText, CheckCircle } from "lucide-react";

interface ProcessingStep {
  id: string;
  label: string;
  icon: React.ReactNode;
  color: string;
  estimatedDuration?: number; // in ms
}

const BRIEF_RESPONSE_STEPS: ProcessingStep[] = [
  {
    id: "parse",
    label: "Analyzing brief requirements",
    icon: <FileCheck className="w-4 h-4" />,
    color: "text-green-600 dark:text-green-400",
    estimatedDuration: 2000,
  },
  {
    id: "brand",
    label: "Searching brand intelligence",
    icon: <Brain className="w-4 h-4" />,
    color: "text-blue-600 dark:text-blue-400",
    estimatedDuration: 2000,
  },
  {
    id: "match",
    label: "Finding perfect influencer matches",
    icon: <Target className="w-4 h-4" />,
    color: "text-purple-600 dark:text-purple-400",
    estimatedDuration: 5000,
  },
  {
    id: "generate",
    label: "Writing comprehensive recommendations",
    icon: <Sparkles className="w-4 h-4" />,
    color: "text-pink-600 dark:text-pink-400",
    estimatedDuration: 35000,
  },
  {
    id: "refine",
    label: "Refining quality and brand alignment",
    icon: <Sparkles className="w-4 h-4" />,
    color: "text-indigo-600 dark:text-indigo-400",
    estimatedDuration: 30000,
  },
  {
    id: "finalize",
    label: "Formatting final response",
    icon: <FileText className="w-4 h-4" />,
    color: "text-orange-600 dark:text-orange-400",
    estimatedDuration: 3000,
  },
];

const ProcessingOverlay = () => {
  const steps = BRIEF_RESPONSE_STEPS;
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Auto-progress through steps based on estimated durations
    const totalDuration = steps.reduce((sum, step) => sum + (step.estimatedDuration || 3000), 0);
    let elapsed = 0;

    const interval = setInterval(() => {
      elapsed += 100;
      const currentProgress = Math.min((elapsed / totalDuration) * 100, 95); // Cap at 95%
      setProgress(currentProgress);

      // Calculate which step we should be on
      let cumulativeDuration = 0;
      for (let i = 0; i < steps.length; i++) {
        cumulativeDuration += steps[i].estimatedDuration || 3000;
        if (elapsed < cumulativeDuration) {
          setCurrentStepIndex(i);
          break;
        }
      }

      // Mark steps as completed
      const newCompleted = new Set<string>();
      let stepElapsed = 0;
      for (let i = 0; i < steps.length; i++) {
        stepElapsed += steps[i].estimatedDuration || 3000;
        if (elapsed > stepElapsed) {
          newCompleted.add(steps[i].id);
        }
      }
      setCompletedSteps(newCompleted);
    }, 100);

    return () => clearInterval(interval);
  }, [steps]);

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="bg-white dark:bg-gray-900 rounded-2xl p-8 max-w-md w-full mx-4 text-center shadow-2xl border border-gray-200 dark:border-gray-800"
      >
        {/* Animated Icon */}
        <div className="relative mb-6">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-200 dark:border-purple-900 border-t-purple-600 dark:border-t-purple-400 mx-auto" />
          <Sparkles className="w-6 h-6 text-purple-600 dark:text-purple-400 absolute top-5 left-1/2 -translate-x-1/2 animate-pulse" />
        </div>

        {/* Title */}
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
          Creating Your Brief Response
        </h3>

        {/* Subtitle */}
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Our AI is analyzing your brief and finding the perfect influencer matches...
        </p>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Progress
            </span>
            <span className="text-sm font-bold text-purple-600 dark:text-purple-400">
              {Math.round(progress)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-purple-600 to-pink-600 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            />
          </div>
        </div>

        {/* Steps List */}
        <div className="space-y-3 text-sm">
          <AnimatePresence mode="wait">
            {steps.map((step, index) => {
              const isCompleted = completedSteps.has(step.id);
              const isCurrent = index === currentStepIndex;

              return (
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`flex items-center gap-3 justify-start px-4 py-2 rounded-lg transition-all ${
                    isCompleted
                      ? "bg-green-50 dark:bg-green-900/20"
                      : isCurrent
                      ? "bg-purple-50 dark:bg-purple-900/20"
                      : "bg-gray-50 dark:bg-gray-800/50"
                  }`}
                >
                  <div className={`flex-shrink-0 ${isCompleted ? "text-green-600 dark:text-green-400" : step.color}`}>
                    {isCompleted ? <CheckCircle className="w-4 h-4" /> : step.icon}
                  </div>
                  <p
                    className={`text-left ${
                      isCompleted
                        ? "text-green-700 dark:text-green-300 line-through"
                        : isCurrent
                        ? "text-gray-900 dark:text-white font-medium"
                        : "text-gray-600 dark:text-gray-400"
                    }`}
                  >
                    {step.label}
                  </p>
                  {isCurrent && (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="ml-auto"
                    >
                      <div className="w-3 h-3 border-2 border-purple-600 dark:border-purple-400 border-t-transparent rounded-full" />
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Tip */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
          className="mt-6 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800"
        >
          <p className="text-xs text-blue-700 dark:text-blue-300">
            💡 <strong>Tip:</strong> This usually takes 60-90 seconds
          </p>
          <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
            ✨ Our AI reviews and refines its work for maximum quality
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default ProcessingOverlay;
