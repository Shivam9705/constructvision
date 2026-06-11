"use client";

import { Package, TrendingUp, Loader2 } from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import { useMaterialSchedule } from "@/hooks/useEstimation";

const CATEGORY_DOT: Record<string, string> = {
  civil:        "bg-blue-500",
  civil_work:   "bg-blue-500",
  finishing:    "bg-purple-500",
  electrical:   "bg-amber-500",
  plumbing:     "bg-cyan-500",
  external:     "bg-green-500",
  external_work:"bg-green-500",
};

interface MaterialScheduleTabProps {
  estimationId: string;
}

export default function MaterialScheduleTab({ estimationId }: MaterialScheduleTabProps) {
  const { data, isLoading, isError } = useMaterialSchedule(estimationId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16 gap-3 text-muted-foreground">
        <Loader2 className="w-5 h-5 animate-spin" />
        <span className="text-sm">Loading material schedule…</span>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="text-center py-16 text-sm text-muted-foreground">
        Could not load material schedule.
      </div>
    );
  }

  if (data.items.length === 0) {
    return (
      <div className="text-center py-16 text-sm text-muted-foreground">
        <Package className="w-10 h-10 mx-auto mb-3 opacity-30" />
        No material data extracted from this BOQ.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Total cost bar */}
      <div className="bg-concrete-950 dark:bg-concrete-900 rounded-xl px-5 py-4 flex items-center justify-between">
        <div>
          <p className="text-xs text-concrete-400 uppercase tracking-widest mb-0.5">
            Total Material Cost
          </p>
          <p className="text-2xl font-display font-bold text-white">
            {formatCurrency(data.total_material_cost)}
          </p>
        </div>
        <div className="flex items-center gap-2 text-concrete-400 text-xs">
          <TrendingUp className="w-4 h-4" />
          {data.items.length} materials identified
        </div>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border bg-secondary/30">
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Material</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground hidden sm:table-cell">Specification</th>
                <th className="text-center px-4 py-3 font-semibold text-muted-foreground">Unit</th>
                <th className="text-right px-4 py-3 font-semibold text-muted-foreground">Quantity</th>
                <th className="text-right px-4 py-3 font-semibold text-muted-foreground">Rate (₹)</th>
                <th className="text-right px-4 py-3 font-semibold text-muted-foreground">Amount</th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((item, idx) => (
                <tr
                  key={idx}
                  className={cn(
                    "border-b border-border/40 hover:bg-secondary/30 transition-colors",
                    idx % 2 === 0 ? "bg-card" : "bg-secondary/10"
                  )}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        "w-2 h-2 rounded-full shrink-0",
                        CATEGORY_DOT[item.category] ?? "bg-slate-400"
                      )} />
                      <span className="font-medium leading-tight">{item.material}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground leading-snug max-w-xs hidden sm:table-cell">
                    {item.specification}
                  </td>
                  <td className="px-4 py-3 text-center text-muted-foreground uppercase tracking-wide">
                    {item.unit}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">
                    {item.quantity?.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">
                    {item.rate?.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                  </td>
                  <td className="px-4 py-3 text-right font-semibold tabular-nums">
                    {formatCurrency(item.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-concrete-950 dark:bg-concrete-900">
                <td colSpan={5} className="px-4 py-3 text-right text-xs font-bold text-concrete-200">
                  TOTAL MATERIAL COST
                </td>
                <td className="px-4 py-3 text-right text-xs font-bold text-brand-400 tabular-nums">
                  {formatCurrency(data.total_material_cost)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      <p className="text-[11px] text-muted-foreground text-center">
        Material quantities extracted from BOQ. Verify before procurement.
      </p>
    </div>
  );
}
