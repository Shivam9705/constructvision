"use client";

import { useState } from "react";
import {
  Brain, TrendingUp, AlertTriangle, Clock,
  Lightbulb, Globe2, ChevronDown, ChevronUp,
  CheckCircle2, XCircle, MinusCircle, Loader2, Zap
} from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import { useIntelligenceReport, type IntelligenceReport } from "@/hooks/useIntelligence";

const RISK_CONFIG = {
  low:    { icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-950/40", border: "border-emerald-200 dark:border-emerald-800",  label: "Low Risk"    },
  medium: { icon: MinusCircle,  color: "text-amber-600",   bg: "bg-amber-50   dark:bg-amber-950/40",   border: "border-amber-200   dark:border-amber-800",   label: "Medium Risk" },
  high:   { icon: XCircle,      color: "text-red-600",     bg: "bg-red-50     dark:bg-red-950/40",     border: "border-red-200     dark:border-red-800",     label: "High Risk"   },
};

const PHASE_COLOURS = ["bg-blue-500","bg-purple-500","bg-amber-500","bg-emerald-500"];

interface IntelligenceReportProps {
  projectId: string;
}

export default function IntelligenceReportPanel({ projectId }: IntelligenceReportProps) {
  const [triggered, setTriggered] = useState(false);
  const { data, isLoading, isError, error } = useIntelligenceReport(projectId, triggered);

  if (!triggered) {
    return (
      <div className="bg-card border border-border rounded-xl p-8 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-brand-500/10 border border-brand-200 dark:border-brand-800 mx-auto flex items-center justify-center">
          <Brain className="w-8 h-8 text-brand-500" />
        </div>
        <div>
          <h3 className="text-base font-semibold mb-1">AI Intelligence Report</h3>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed">
            Get a deep-dive analysis: cost benchmarking, risk assessment, construction
            timeline, and actionable recommendations powered by Gemini AI.
          </p>
        </div>
        <button
          onClick={() => setTriggered(true)}
          className="inline-flex items-center gap-2 h-10 px-6 bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold rounded-lg transition-colors"
        >
          <Zap className="w-4 h-4" />
          Generate Intelligence Report
        </button>
        <p className="text-xs text-muted-foreground">Takes ~15 seconds · Uses your estimation data</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="bg-card border border-border rounded-xl p-8 text-center space-y-4">
        <div className="relative w-16 h-16 mx-auto">
          <svg className="animate-spin w-16 h-16" viewBox="0 0 64 64">
            <circle cx="32" cy="32" r="28" fill="none" stroke="currentColor" strokeWidth="3" className="text-brand-100 dark:text-brand-900"/>
            <circle cx="32" cy="32" r="28" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeDasharray="60 116" className="text-brand-500"/>
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <Brain className="w-6 h-6 text-brand-500" />
          </div>
        </div>
        <p className="text-sm font-semibold">Analysing your project…</p>
        <p className="text-xs text-muted-foreground">Benchmarking costs · Assessing risks · Building timeline</p>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="bg-card border border-destructive/30 rounded-xl p-6 text-center space-y-3">
        <XCircle className="w-8 h-8 text-destructive mx-auto" />
        <p className="text-sm font-medium">Report generation failed</p>
        <p className="text-xs text-muted-foreground">{(error as Error)?.message || "Please try again"}</p>
        <button onClick={() => setTriggered(false)}
          className="text-xs text-brand-500 hover:underline">Try again</button>
      </div>
    );
  }

  return <ReportContent data={data} />;
}


function ReportContent({ data }: { data: IntelligenceReport }) {
  const [expandedRisk, setExpandedRisk] = useState<number | null>(null);
  const overallRisk = RISK_CONFIG[data.risk_assessment.overall_risk] ?? RISK_CONFIG.medium;
  const OverallIcon = overallRisk.icon;

  return (
    <div className="space-y-4">
      {/* Executive Summary */}
      <div className="bg-concrete-950 dark:bg-concrete-900 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-3">
          <Brain className="w-4 h-4 text-brand-400" />
          <h3 className="text-sm font-semibold text-white">Executive Summary</h3>
        </div>
        <p className="text-sm text-concrete-200 leading-relaxed">{data.executive_summary}</p>
        <div className="flex items-center gap-4 mt-3 pt-3 border-t border-concrete-700">
          <div>
            <p className="text-[10px] text-concrete-500 uppercase tracking-wider">Total Cost</p>
            <p className="text-lg font-display font-bold text-brand-400">{formatCurrency(data.total_cost)}</p>
          </div>
          <div>
            <p className="text-[10px] text-concrete-500 uppercase tracking-wider">Per sq.ft</p>
            <p className="text-lg font-display font-bold text-white">₹{Math.round(data.cost_per_sqft).toLocaleString("en-IN")}</p>
          </div>
        </div>
      </div>

      {/* Cost Analysis */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="flex items-center gap-2 px-5 py-3.5 border-b border-border bg-secondary/30">
          <TrendingUp className="w-4 h-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold">Cost Analysis</h3>
        </div>
        <div className="p-5 space-y-4">
          <div className="bg-secondary/40 rounded-lg p-3.5">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Market Benchmark</p>
            <p className="text-sm leading-relaxed">{data.cost_analysis.benchmark}</p>
          </div>

          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Major Cost Drivers</p>
            <ul className="space-y-1.5">
              {data.cost_analysis.major_cost_drivers.map((d, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <span className="w-5 h-5 rounded-full bg-brand-500/10 text-brand-600 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  {d}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Cost Optimisation Tips</p>
            <ul className="space-y-1.5">
              {data.cost_analysis.cost_optimization.map((tip, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-emerald-700 dark:text-emerald-400">
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Risk Assessment */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-border bg-secondary/30">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-muted-foreground" />
            <h3 className="text-sm font-semibold">Risk Assessment</h3>
          </div>
          <span className={cn("flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border",
            overallRisk.bg, overallRisk.border, overallRisk.color)}>
            <OverallIcon className="w-3.5 h-3.5" />
            {overallRisk.label}
          </span>
        </div>
        <div className="divide-y divide-border">
          {data.risk_assessment.risks.map((risk, i) => {
            const cfg = RISK_CONFIG[risk.impact] ?? RISK_CONFIG.medium;
            const RiskIcon = cfg.icon;
            const open = expandedRisk === i;
            return (
              <div key={i}>
                <button
                  onClick={() => setExpandedRisk(open ? null : i)}
                  className="w-full flex items-center gap-3 px-5 py-3.5 text-left hover:bg-secondary/30 transition-colors"
                >
                  <RiskIcon className={cn("w-4 h-4 shrink-0", cfg.color)} />
                  <span className="flex-1 text-sm">{risk.risk}</span>
                  <span className={cn("text-[10px] font-medium px-2 py-0.5 rounded-full border capitalize shrink-0",
                    cfg.bg, cfg.border, cfg.color)}>
                    {risk.impact}
                  </span>
                  {open ? <ChevronUp className="w-3.5 h-3.5 text-muted-foreground" />
                         : <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />}
                </button>
                {open && (
                  <div className="px-5 pb-3.5 pl-12">
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      <span className="font-semibold text-foreground">Mitigation: </span>
                      {risk.mitigation}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Construction Timeline */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-border bg-secondary/30">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <h3 className="text-sm font-semibold">Construction Timeline</h3>
          </div>
          <span className="text-xs text-muted-foreground">
            ~{data.timeline_estimate.total_duration_months} months total
          </span>
        </div>
        <div className="p-5 space-y-3">
          {/* Gantt-style bar */}
          <div className="flex rounded-full overflow-hidden h-3">
            {data.timeline_estimate.phases.map((ph, i) => (
              <div
                key={i}
                className={cn("h-full transition-all", PHASE_COLOURS[i % PHASE_COLOURS.length])}
                style={{ width: `${ph.cost_pct}%` }}
                title={`${ph.phase}: ${ph.duration_weeks}w`}
              />
            ))}
          </div>
          <div className="space-y-2">
            {data.timeline_estimate.phases.map((ph, i) => (
              <div key={i} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className={cn("w-2.5 h-2.5 rounded-full", PHASE_COLOURS[i % PHASE_COLOURS.length])} />
                  <span className="font-medium">{ph.phase}</span>
                </div>
                <div className="flex items-center gap-3 text-muted-foreground">
                  <span>{ph.duration_weeks} weeks</span>
                  <span className="w-10 text-right">{ph.cost_pct}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="flex items-center gap-2 px-5 py-3.5 border-b border-border bg-secondary/30">
          <Lightbulb className="w-4 h-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold">Recommendations</h3>
        </div>
        <ul className="divide-y divide-border">
          {data.recommendations.map((rec, i) => (
            <li key={i} className="flex items-start gap-3 px-5 py-3.5">
              <span className="w-5 h-5 rounded-full bg-brand-500/10 text-brand-600 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                {i + 1}
              </span>
              <p className="text-sm leading-relaxed">{rec}</p>
            </li>
          ))}
        </ul>
      </div>

      {/* Market Insights */}
      <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <Globe2 className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-semibold text-blue-700 dark:text-blue-300 mb-1">Market Insights</p>
            <p className="text-sm text-blue-600/90 dark:text-blue-400/90 leading-relaxed">
              {data.market_insights}
            </p>
          </div>
        </div>
      </div>

      <p className="text-[11px] text-muted-foreground text-center">
        Generated by Gemini AI · {new Date(data.generated_at).toLocaleString("en-IN")}
      </p>
    </div>
  );
}
