"use client";

import { useQuery, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import api from "@/lib/api";

export interface IntelligenceReport {
  executive_summary: string;
  cost_analysis: {
    benchmark: string;
    major_cost_drivers: string[];
    cost_optimization: string[];
  };
  risk_assessment: {
    overall_risk: "low" | "medium" | "high";
    risks: Array<{ risk: string; impact: "low" | "medium" | "high"; mitigation: string }>;
  };
  timeline_estimate: {
    total_duration_months: number;
    phases: Array<{ phase: string; duration_weeks: number; cost_pct: number }>;
  };
  recommendations: string[];
  market_insights: string;
  project_name: string;
  total_cost: number;
  cost_per_sqft: number;
  generated_at: string;
}

export interface CompareData {
  projects: Array<{
    id: string;
    name: string;
    project_type: string;
    city?: string;
    state?: string;
    total_area_sqft: number;
    num_floors: number;
    finish_quality: string;
    status: string;
    estimation: {
      total_cost: number;
      cost_per_sqft: number;
      civil_work_cost: number;
      finishing_cost: number;
      electrical_cost: number;
      plumbing_cost: number;
      contingency_cost: number;
      ai_confidence: string;
      item_count: number;
    } | null;
  }>;
  count: number;
}

export function useIntelligenceReport(projectId: string, enabled = false) {
  return useQuery({
    queryKey: ["intelligence", projectId],
    queryFn: () =>
      api.get<IntelligenceReport>(`/intelligence/report/${projectId}`).then(r => r.data),
    enabled: enabled && !!projectId,
    staleTime: 10 * 60 * 1000, // cache 10 min — expensive AI call
    retry: false,
  });
}

export function useCompareProjects() {
  return useMutation({
    mutationFn: (projectIds: string[]) =>
      api.post<CompareData>("/intelligence/compare", { project_ids: projectIds }).then(r => r.data),
    onError: (e: Error) => toast.error(e.message || "Comparison failed"),
  });
}
