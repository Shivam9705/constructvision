"use client";

import Link from "next/link";
import { ArrowRight, Clock } from "lucide-react";
import { cn, formatRelativeDate, PROJECT_TYPE_LABELS, STATUS_LABELS } from "@/lib/utils";
import type { Project } from "@/types";

const STATUS_DOT: Record<string, string> = {
  draft: "bg-amber-400",
  estimated: "bg-emerald-400",
  exported: "bg-brand-400",
};

interface RecentActivityProps {
  projects: Project[];
}

export default function RecentActivity({ projects }: RecentActivityProps) {
  const recent = [...projects]
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
    .slice(0, 6);

  return (
    <div className="bg-card border border-border rounded-xl">
      <div className="flex items-center justify-between px-5 py-4 border-b border-border">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold">Recent Activity</h3>
        </div>
        <Link
          href="/dashboard/projects"
          className="flex items-center gap-1 text-xs text-brand-500 hover:text-brand-600 font-medium transition-colors"
        >
          View all <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      {recent.length === 0 ? (
        <div className="px-5 py-10 text-center text-sm text-muted-foreground">
          No activity yet
        </div>
      ) : (
        <ul className="divide-y divide-border">
          {recent.map((p) => (
            <li key={p.id}>
              <Link
                href={`/dashboard/projects/${p.id}`}
                className="flex items-center gap-3 px-5 py-3.5 hover:bg-secondary/50 transition-colors"
              >
                <span className={cn("w-2 h-2 rounded-full shrink-0", STATUS_DOT[p.status])} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{p.name}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {PROJECT_TYPE_LABELS[p.project_type]}
                    {p.city ? ` · ${p.city}` : ""}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-[10px] text-muted-foreground">
                    {formatRelativeDate(p.updated_at)}
                  </p>
                  <p className="text-[10px] font-medium text-muted-foreground capitalize">
                    {STATUS_LABELS[p.status]}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
