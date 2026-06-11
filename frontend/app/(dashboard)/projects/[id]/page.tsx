"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Pencil, Layers, Maximize2,
  Calendar, Trash2, TableProperties,
  BarChart3, Package, Download, Brain, FileImage
} from "lucide-react";
import { useProject, useDeleteProject } from "@/hooks/useProjects";
import { useLatestEstimation } from "@/hooks/useEstimation";
import EstimateButton from "@/components/estimation/EstimateButton";
import CostSummaryCard from "@/components/estimation/CostSummaryCard";
import BOQTable from "@/components/estimation/BOQTable";
import CostChart from "@/components/estimation/CostChart";
import MaterialScheduleTab from "@/components/estimation/MaterialScheduleTab";
import ExportPanel from "@/components/estimation/ExportPanel";
import IntelligenceReport from "@/components/intelligence/IntelligenceReport";
import BlueprintUpload from "@/components/upload/BlueprintUpload";
import { cn, formatArea, formatDate, PROJECT_TYPE_LABELS, FINISH_QUALITY_LABELS, STATUS_LABELS } from "@/lib/utils";

const STATUS_STYLES: Record<string,string> = {
  draft:     "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800",
  estimated: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800",
  exported:  "bg-brand-50 text-brand-700 border-brand-200 dark:bg-brand-950/40 dark:text-brand-400 dark:border-brand-800",
};

const TABS = [
  { id: "boq",           label: "BOQ",           icon: TableProperties },
  { id: "charts",        label: "Charts",        icon: BarChart3       },
  { id: "materials",     label: "Materials",     icon: Package         },
  { id: "intelligence",  label: "AI Report",     icon: Brain           },
  { id: "export",        label: "Export",        icon: Download        },
] as const;

type TabId = typeof TABS[number]["id"];

function Skeleton({ className }: { className?: string }) {
  return <div className={cn("rounded bg-secondary animate-pulse", className)} />;
}

export default function ProjectDetailPage() {
  const params    = useParams();
  const router    = useRouter();
  const projectId = params.id as string;
  const [activeTab, setActiveTab] = useState<TabId>("boq");

  const { data: project,    isLoading: loadingProject } = useProject(projectId);
  const { data: estimation }                             = useLatestEstimation(projectId);
  const deleteProject = useDeleteProject();

  if (loadingProject) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 space-y-4"><Skeleton className="h-32"/><Skeleton className="h-[500px]"/></div>
          <div className="space-y-4"><Skeleton className="h-44"/><Skeleton className="h-80"/></div>
        </div>
      </div>
    );
  }
  if (!project) return (
    <div className="text-center py-24">
      <p className="text-muted-foreground mb-2">Project not found.</p>
      <Link href="/dashboard/projects" className="text-brand-500 text-sm hover:underline">← Back</Link>
    </div>
  );

  const handleDelete = async () => {
    if (!confirm(`Delete "${project.name}"? This cannot be undone.`)) return;
    await deleteProject.mutateAsync(project.id);
    router.push("/dashboard/projects");
  };

  return (
    <div className="space-y-5">
      {/* Top bar */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3 min-w-0">
          <Link href="/dashboard/projects" className="text-muted-foreground hover:text-foreground transition-colors shrink-0">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-display font-bold truncate">{project.name}</h1>
              <span className={cn("text-[11px] font-medium px-2 py-0.5 rounded-full border shrink-0", STATUS_STYLES[project.status])}>
                {STATUS_LABELS[project.status]}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              {PROJECT_TYPE_LABELS[project.project_type]}
              {project.city  ? ` · ${project.city}` : ""}
              {project.state ? `, ${project.state}`  : ""}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Link href={`/dashboard/projects/${project.id}/edit`}
            className="flex items-center gap-1.5 h-8 px-3 text-xs font-medium border border-border rounded-lg hover:bg-secondary transition-colors">
            <Pencil className="w-3.5 h-3.5"/> Edit
          </Link>
          <button onClick={handleDelete}
            className="h-8 w-8 flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors">
            <Trash2 className="w-3.5 h-3.5"/>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 items-start">
        {/* Left */}
        <div className="xl:col-span-2 space-y-4">
          {/* Meta */}
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {project.total_area_sqft && (
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Area</p>
                  <div className="flex items-center gap-1.5">
                    <Maximize2 className="w-3.5 h-3.5 text-muted-foreground"/>
                    <p className="text-sm font-semibold">{formatArea(Number(project.total_area_sqft))}</p>
                  </div>
                </div>
              )}
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Floors</p>
                <div className="flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-muted-foreground"/>
                  <p className="text-sm font-semibold">{project.num_floors}</p>
                </div>
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Finish</p>
                <p className="text-sm font-semibold">{FINISH_QUALITY_LABELS[project.finish_quality]}</p>
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Created</p>
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-muted-foreground"/>
                  <p className="text-sm font-semibold">{formatDate(project.created_at)}</p>
                </div>
              </div>
            </div>
            {project.description && (
              <div className="mt-3 pt-3 border-t border-border">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Description</p>
                <p className="text-sm text-muted-foreground leading-relaxed">{project.description}</p>
              </div>
            )}
          </div>

          {/* Tabs */}
          {estimation ? (
            <>
              <div className="flex gap-1 bg-secondary/50 rounded-xl p-1 overflow-x-auto">
                {TABS.map(({ id, label, icon: Icon }) => (
                  <button key={id} onClick={() => setActiveTab(id)}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-1.5 h-8 text-xs font-medium rounded-lg transition-all whitespace-nowrap px-2",
                      activeTab === id ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                    )}>
                    <Icon className="w-3.5 h-3.5"/>
                    <span className="hidden sm:inline">{label}</span>
                  </button>
                ))}
              </div>
              {activeTab === "boq"          && <BOQTable estimation={estimation} />}
              {activeTab === "charts"       && <CostChart estimation={estimation} />}
              {activeTab === "materials"    && <MaterialScheduleTab estimationId={estimation.id} />}
              {activeTab === "intelligence" && <IntelligenceReport projectId={project.id} />}
              {activeTab === "export"       && <ExportPanel estimation={estimation} project={project} />}
            </>
          ) : (
            <div className="bg-card border border-dashed border-border rounded-xl p-12 text-center">
              <p className="text-sm font-medium text-muted-foreground mb-1">No estimation yet</p>
              <p className="text-xs text-muted-foreground">Click "Run Estimation" to generate your BOQ and full analysis.</p>
            </div>
          )}
        </div>

        {/* Right sidebar */}
        <div className="space-y-4">
          <EstimateButton project={project} hasEstimation={!!estimation} />
          <BlueprintUpload project={project} />
          {estimation && (
            <CostSummaryCard
              estimation={estimation}
              areaSqft={project.total_area_sqft ? Number(project.total_area_sqft) : undefined}
            />
          )}
        </div>
      </div>
    </div>
  );
}
