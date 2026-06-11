"use client";

import { useState, useEffect } from "react";
import { Zap, Loader2, RefreshCw, ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRunEstimation } from "@/hooks/useEstimation";
import type { Project } from "@/types";

const STEPS = [
  "Analyzing project specifications...",
  "Loading regional rate schedules...",
  "Computing structural quantities...",
  "Calculating material costs...",
  "Generating BOQ line items...",
  "Applying contingency...",
  "Finalizing estimate...",
];

interface EstimateButtonProps {
  project: Project;
  hasEstimation: boolean;
}

export default function EstimateButton({ project, hasEstimation }: EstimateButtonProps) {
  const [stepIdx, setStepIdx] = useState(0);
  const runEstimation = useRunEstimation(project.id);
  const isLoading = runEstimation.isPending;

  // Cycle through steps while loading
  useEffect(() => {
    if (!isLoading) { setStepIdx(0); return; }
    const interval = setInterval(() => {
      setStepIdx((i) => (i + 1) % STEPS.length);
    }, 3500);
    return () => clearInterval(interval);
  }, [isLoading]);

  if (isLoading) {
    return (
      <div className="rounded-xl border border-brand-200 bg-brand-50 dark:bg-brand-950/30 dark:border-brand-800 p-6 text-center space-y-4">
        {/* Animated ring */}
        <div className="relative w-16 h-16 mx-auto">
          <svg className="animate-spin w-16 h-16" viewBox="0 0 64 64">
            <circle cx="32" cy="32" r="28" fill="none" stroke="currentColor"
              strokeWidth="3" className="text-brand-100 dark:text-brand-900" />
            <circle cx="32" cy="32" r="28" fill="none" stroke="currentColor"
              strokeWidth="3" strokeLinecap="round"
              strokeDasharray="60 116"
              className="text-brand-500" />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <Zap className="w-6 h-6 text-brand-500" />
          </div>
        </div>

        <div>
          <p className="text-sm font-semibold text-brand-700 dark:text-brand-300">
            Gemini AI is estimating...
          </p>
          <p className="text-xs text-brand-500 mt-1 transition-all duration-500">
            {STEPS[stepIdx]}
          </p>
        </div>

        <div className="flex justify-center gap-1">
          {STEPS.map((_, i) => (
            <span
              key={i}
              className={cn(
                "w-1.5 h-1.5 rounded-full transition-all duration-300",
                i === stepIdx ? "bg-brand-500 scale-125" : "bg-brand-200 dark:bg-brand-800"
              )}
            />
          ))}
        </div>

        <p className="text-[11px] text-muted-foreground">
          This takes 15–45 seconds. Don't close this tab.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-4">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-lg bg-brand-500/10 flex items-center justify-center shrink-0">
          <Zap className="w-5 h-5 text-brand-500" />
        </div>
        <div>
          <p className="text-sm font-semibold">
            {hasEstimation ? "Re-run AI Estimation" : "Run AI Estimation"}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {hasEstimation
              ? "Generate a new estimate with updated project data. Previous version is saved."
              : "Generate a complete BOQ with 40–55 line items using Gemini 1.5 Pro."}
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        <button
          onClick={() => runEstimation.mutate(false)}
          className="flex-1 flex items-center justify-center gap-2 h-10 bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold rounded-lg transition-colors"
        >
          {hasEstimation ? (
            <><RefreshCw className="w-4 h-4" /> Re-estimate</>
          ) : (
            <><Zap className="w-4 h-4" /> Run Estimation</>
          )}
        </button>

        {project.blueprint_url && (
          <button
            onClick={() => runEstimation.mutate(true)}
            className="flex-1 flex items-center justify-center gap-2 h-10 border border-brand-300 dark:border-brand-700 text-brand-600 dark:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-950/30 text-sm font-medium rounded-lg transition-colors"
          >
            <ImageIcon className="w-4 h-4" />
            With Blueprint
          </button>
        )}
      </div>
    </div>
  );
}
