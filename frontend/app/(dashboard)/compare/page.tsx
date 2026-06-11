"use client";

import { useState } from "react";
import { GitCompare, CheckSquare, Square, Loader2, BarChart3 } from "lucide-react";
import { cn, formatCurrency, formatArea, PROJECT_TYPE_LABELS, FINISH_QUALITY_LABELS } from "@/lib/utils";
import { useProjects } from "@/hooks/useProjects";
import { useCompareProjects, type CompareData } from "@/hooks/useIntelligence";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, Cell
} from "recharts";

const COMPARE_COLOURS = ["#FF7510","#3B82F6","#8B5CF6","#10B981"];

function MetaRow({ label, values }: { label: string; values: (string | number | null)[] }) {
  return (
    <tr className="border-b border-border/50 hover:bg-secondary/20 transition-colors">
      <td className="px-4 py-3 text-xs font-medium text-muted-foreground bg-secondary/20 sticky left-0 min-w-[140px]">
        {label}
      </td>
      {values.map((v, i) => (
        <td key={i} className="px-4 py-3 text-sm text-center font-medium">
          {v ?? <span className="text-muted-foreground text-xs">—</span>}
        </td>
      ))}
    </tr>
  );
}

function ComparisonTable({ data }: { data: CompareData }) {
  const projects = data.projects;

  const rows = [
    { label: "Project Type",   values: projects.map(p => PROJECT_TYPE_LABELS[p.project_type]) },
    { label: "Location",       values: projects.map(p => [p.city, p.state].filter(Boolean).join(", ") || "—") },
    { label: "Built-up Area",  values: projects.map(p => p.total_area_sqft ? formatArea(p.total_area_sqft) : "—") },
    { label: "Floors",         values: projects.map(p => p.num_floors) },
    { label: "Finish Quality", values: projects.map(p => FINISH_QUALITY_LABELS[p.finish_quality]) },
    { label: "Status",         values: projects.map(p => p.status) },
    { label: "Total Cost",     values: projects.map(p => p.estimation ? formatCurrency(p.estimation.total_cost) : "No estimate") },
    { label: "Cost / sq.ft",   values: projects.map(p => p.estimation ? `₹${Math.round(p.estimation.cost_per_sqft).toLocaleString("en-IN")}` : "—") },
    { label: "Civil Work",     values: projects.map(p => p.estimation ? formatCurrency(p.estimation.civil_work_cost) : "—") },
    { label: "Finishing",      values: projects.map(p => p.estimation ? formatCurrency(p.estimation.finishing_cost) : "—") },
    { label: "Electrical",     values: projects.map(p => p.estimation ? formatCurrency(p.estimation.electrical_cost) : "—") },
    { label: "Plumbing",       values: projects.map(p => p.estimation ? formatCurrency(p.estimation.plumbing_cost) : "—") },
    { label: "BOQ Items",      values: projects.map(p => p.estimation ? p.estimation.item_count : "—") },
    { label: "AI Confidence",  values: projects.map(p => p.estimation?.ai_confidence?.toUpperCase() ?? "—") },
  ];

  // Chart data — cost breakdown
  const chartData = [
    { name: "Civil", ...Object.fromEntries(projects.map((p, i) => [p.name.slice(0,15), p.estimation?.civil_work_cost ?? 0])) },
    { name: "Finish",...Object.fromEntries(projects.map((p, i) => [p.name.slice(0,15), p.estimation?.finishing_cost ?? 0])) },
    { name: "Elec",  ...Object.fromEntries(projects.map((p, i) => [p.name.slice(0,15), p.estimation?.electrical_cost ?? 0])) },
    { name: "Plumb", ...Object.fromEntries(projects.map((p, i) => [p.name.slice(0,15), p.estimation?.plumbing_cost ?? 0])) },
  ];

  return (
    <div className="space-y-5">
      {/* Cost comparison chart */}
      <div className="bg-card border border-border rounded-xl p-5">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
          <BarChart3 className="w-4 h-4" /> Cost Breakdown Comparison
        </p>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={chartData} margin={{ left: 0, right: 16 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="name" tick={{ fontSize: 11 }} />
            <YAxis
              tickFormatter={v => v >= 100000 ? `₹${(v/100000).toFixed(0)}L` : `₹${(v/1000).toFixed(0)}K`}
              tick={{ fontSize: 10 }}
            />
            <Tooltip
              formatter={(v: number) => formatCurrency(v)}
              contentStyle={{ fontSize: 12, borderRadius: 8 }}
            />
            <Legend iconType="circle" iconSize={8} />
            {projects.map((p, i) => (
              <Bar key={p.id} dataKey={p.name.slice(0,15)} fill={COMPARE_COLOURS[i]} radius={[4,4,0,0]} />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Side-by-side table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground bg-secondary/30 sticky left-0 min-w-[140px]">
                  Metric
                </th>
                {projects.map((p, i) => (
                  <th key={p.id} className="px-4 py-3 text-center min-w-[160px]">
                    <div className="flex flex-col items-center gap-1">
                      <span
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: COMPARE_COLOURS[i] }}
                      />
                      <span className="text-xs font-semibold truncate max-w-[140px]">{p.name}</span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map(row => (
                <MetaRow key={row.label} label={row.label} values={row.values} />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default function ComparePage() {
  const { data: projectsData, isLoading } = useProjects();
  const [selected, setSelected] = useState<string[]>([]);
  const compare = useCompareProjects();

  const projects = projectsData?.projects ?? [];

  const toggle = (id: string) => {
    setSelected(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : prev.length < 4 ? [...prev, id] : prev
    );
  };

  const handleCompare = () => {
    if (selected.length >= 2) compare.mutate(selected);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold">Project Comparison</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Select 2–4 projects to compare costs and specifications side by side
          </p>
        </div>
        <button
          onClick={handleCompare}
          disabled={selected.length < 2 || compare.isPending}
          className="flex items-center gap-2 h-9 px-4 bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
        >
          {compare.isPending
            ? <><Loader2 className="w-4 h-4 animate-spin" />Comparing…</>
            : <><GitCompare className="w-4 h-4" />Compare ({selected.length})</>}
        </button>
      </div>

      {/* Selection grid */}
      {!compare.data && (
        <div>
          <p className="text-xs text-muted-foreground mb-3">
            {selected.length === 0
              ? "Select projects below"
              : `${selected.length} selected — ${selected.length < 2 ? "select at least 1 more" : "ready to compare"}`}
          </p>
          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-24 rounded-xl bg-secondary animate-pulse" />
              ))}
            </div>
          ) : projects.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-12">No projects yet.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {projects.map((p, i) => {
                const sel = selected.includes(p.id);
                const maxed = selected.length >= 4 && !sel;
                return (
                  <button
                    key={p.id}
                    onClick={() => !maxed && toggle(p.id)}
                    disabled={maxed}
                    className={cn(
                      "flex flex-col items-start gap-1.5 p-3.5 rounded-xl border-2 text-left transition-all",
                      sel ? "border-brand-500 bg-brand-50 dark:bg-brand-950/30"
                          : maxed ? "border-border opacity-40 cursor-not-allowed"
                          : "border-border hover:border-brand-300 dark:hover:border-brand-700"
                    )}
                  >
                    <div className="flex items-center justify-between w-full">
                      {sel
                        ? <CheckSquare className="w-4 h-4 text-brand-500" />
                        : <Square className="w-4 h-4 text-muted-foreground" />}
                      {sel && (
                        <span
                          className="w-5 h-5 rounded-full text-white text-[10px] font-bold flex items-center justify-center"
                          style={{ backgroundColor: COMPARE_COLOURS[selected.indexOf(p.id)] }}
                        >
                          {selected.indexOf(p.id) + 1}
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-semibold leading-tight line-clamp-2">{p.name}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {p.status === "estimated" ? "Has estimate" : p.status}
                    </p>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Comparison result */}
      {compare.data && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold">
              Comparing {compare.data.count} projects
            </p>
            <button
              onClick={() => { compare.reset(); setSelected([]); }}
              className="text-xs text-brand-500 hover:underline"
            >
              Start over
            </button>
          </div>
          <ComparisonTable data={compare.data} />
        </div>
      )}
    </div>
  );
}
