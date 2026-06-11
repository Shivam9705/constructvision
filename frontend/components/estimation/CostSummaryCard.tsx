"use client";

import { TrendingUp, AlertTriangle, CheckCircle, Info } from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import type { Estimation } from "@/types";

interface CostSummaryCardProps {
  estimation: Estimation;
  areaSqft?: number;
}

const CONFIDENCE_CONFIG = {
  high:   { label: "High confidence",   icon: CheckCircle,    color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-950/40", border: "border-emerald-200 dark:border-emerald-800" },
  medium: { label: "Medium confidence", icon: Info,           color: "text-amber-500",   bg: "bg-amber-50 dark:bg-amber-950/40",   border: "border-amber-200 dark:border-amber-800" },
  low:    { label: "Low confidence",    icon: AlertTriangle,  color: "text-red-500",     bg: "bg-red-50 dark:bg-red-950/40",       border: "border-red-200 dark:border-red-800" },
};

const BREAKDOWN_ITEMS = [
  { key: "civil_work_cost",  label: "Civil Work",     color: "bg-blue-500"   },
  { key: "finishing_cost",   label: "Finishing",      color: "bg-purple-500" },
  { key: "electrical_cost",  label: "Electrical",     color: "bg-amber-500"  },
  { key: "plumbing_cost",    label: "Plumbing",       color: "bg-cyan-500"   },
  { key: "contingency_cost", label: "Contingency 5%", color: "bg-slate-400"  },
] as const;

export default function CostSummaryCard({ estimation, areaSqft }: CostSummaryCardProps) {
  const total = estimation.total_cost ?? 0;
  const conf = CONFIDENCE_CONFIG[estimation.ai_confidence ?? "medium"];
  const ConfIcon = conf.icon;

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      {/* Header — total cost */}
      <div className="bg-concrete-950 dark:bg-concrete-900 px-6 py-5">
        <p className="text-xs text-concrete-400 uppercase tracking-widest mb-1">Total Project Cost</p>
        <p className="text-4xl font-display font-bold text-white">
          {formatCurrency(total)}
        </p>
        <div className="flex items-center gap-4 mt-2">
          {estimation.cost_per_sqft && (
            <span className="text-sm text-concrete-300">
              ₹{Math.round(estimation.cost_per_sqft).toLocaleString("en-IN")}/sq.ft
            </span>
          )}
          <span className="text-xs text-concrete-500">
            v{estimation.version} · {new Date(estimation.created_at).toLocaleDateString("en-IN")}
          </span>
        </div>
      </div>

      <div className="p-5 space-y-5">
        {/* Confidence badge */}
        <div className={cn("flex items-center gap-2 rounded-lg border px-3 py-2.5", conf.bg, conf.border)}>
          <ConfIcon className={cn("w-4 h-4 shrink-0", conf.color)} />
          <div>
            <p className={cn("text-xs font-semibold", conf.color)}>{conf.label}</p>
            {estimation.ai_notes && (
              <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
                {estimation.ai_notes}
              </p>
            )}
          </div>
        </div>

        {/* Cost breakdown bars */}
        <div className="space-y-2.5">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Cost Breakdown
          </p>
          {BREAKDOWN_ITEMS.map(({ key, label, color }) => {
            const value = (estimation as any)[key] ?? 0;
            const pct = total > 0 ? Math.round((value / total) * 100) : 0;
            return (
              <div key={key} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <span className={cn("w-2 h-2 rounded-full", color)} />
                    {label}
                  </span>
                  <span className="font-medium tabular-nums">
                    {formatCurrency(value)}
                    <span className="text-muted-foreground ml-1">({pct}%)</span>
                  </span>
                </div>
                <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                  <div
                    className={cn("h-full rounded-full transition-all duration-700", color)}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
