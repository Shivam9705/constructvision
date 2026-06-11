"use client";

import { FolderOpen, FileEdit, CheckCircle, Download, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsBarProps {
  stats: {
    total_projects: number;
    draft: number;
    estimated: number;
    exported: number;
  } | undefined;
  loading?: boolean;
}

const cards = [
  {
    key: "total_projects" as const,
    label: "Total Projects",
    icon: FolderOpen,
    color: "text-concrete-600 dark:text-concrete-300",
    bg: "bg-concrete-100 dark:bg-concrete-800",
  },
  {
    key: "draft" as const,
    label: "In Draft",
    icon: FileEdit,
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-50 dark:bg-amber-950/40",
  },
  {
    key: "estimated" as const,
    label: "Estimated",
    icon: CheckCircle,
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-50 dark:bg-emerald-950/40",
  },
  {
    key: "exported" as const,
    label: "Exported",
    icon: Download,
    color: "text-brand-600 dark:text-brand-400",
    bg: "bg-brand-50 dark:bg-brand-950/40",
  },
];

function SkeletonCard() {
  return (
    <div className="bg-card border border-border rounded-xl p-5 animate-pulse">
      <div className="flex items-center justify-between mb-3">
        <div className="w-8 h-8 rounded-lg bg-muted" />
        <div className="w-12 h-4 rounded bg-muted" />
      </div>
      <div className="w-10 h-7 rounded bg-muted mb-1" />
      <div className="w-20 h-3 rounded bg-muted" />
    </div>
  );
}

export default function StatsBar({ stats, loading }: StatsBarProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map(({ key, label, icon: Icon, color, bg }) => (
        <div
          key={key}
          className="bg-card border border-border rounded-xl p-5 hover:border-brand-200 dark:hover:border-brand-800 transition-colors"
        >
          <div className="flex items-center justify-between mb-3">
            <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", bg)}>
              <Icon className={cn("w-4 h-4", color)} />
            </div>
            {key === "estimated" && (stats?.estimated ?? 0) > 0 && (
              <span className="flex items-center gap-1 text-[10px] text-emerald-600 font-medium">
                <TrendingUp className="w-3 h-3" />
                Active
              </span>
            )}
          </div>
          <p className="text-2xl font-display font-bold leading-none mb-1">
            {stats?.[key] ?? 0}
          </p>
          <p className="text-xs text-muted-foreground">{label}</p>
        </div>
      ))}
    </div>
  );
}
