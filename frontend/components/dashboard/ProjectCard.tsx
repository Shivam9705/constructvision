"use client";

import Link from "next/link";
import {
  Building2, Home, Factory, School,
  MapPin, Layers, Maximize2, Calendar,
  MoreVertical, Pencil, Trash2, ArrowRight,
} from "lucide-react";
import { cn, formatDate, formatRelativeDate, formatArea,
         PROJECT_TYPE_LABELS, FINISH_QUALITY_LABELS, STATUS_LABELS } from "@/lib/utils";
import type { Project } from "@/types";
import { useDeleteProject } from "@/hooks/useProjects";
import { useState } from "react";

const TYPE_ICONS: Record<string, React.ElementType> = {
  residential: Home,
  commercial: Building2,
  industrial: Factory,
  institutional: School,
};

const STATUS_STYLES: Record<string, string> = {
  draft: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800",
  estimated: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800",
  exported: "bg-brand-50 text-brand-700 border-brand-200 dark:bg-brand-950/40 dark:text-brand-400 dark:border-brand-800",
};

const QUALITY_DOTS: Record<string, string> = {
  basic: "bg-slate-400",
  standard: "bg-emerald-500",
  premium: "bg-blue-500",
  luxury: "bg-amber-500",
};

interface ProjectCardProps {
  project: Project;
}

export default function ProjectCard({ project }: ProjectCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const deleteProject = useDeleteProject();

  const TypeIcon = TYPE_ICONS[project.project_type] ?? Building2;

  const handleDelete = () => {
    if (!confirmDelete) { setConfirmDelete(true); return; }
    deleteProject.mutate(project.id);
    setMenuOpen(false);
    setConfirmDelete(false);
  };

  return (
    <div className="group bg-card border border-border rounded-xl overflow-hidden hover:border-brand-200 dark:hover:border-brand-800 hover:shadow-sm transition-all">
      {/* Colour bar by type */}
      <div className={cn(
        "h-1",
        project.project_type === "residential" && "bg-emerald-400",
        project.project_type === "commercial"  && "bg-blue-400",
        project.project_type === "industrial"  && "bg-orange-400",
        project.project_type === "institutional" && "bg-purple-400",
      )} />

      <div className="p-5">
        {/* Header row */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center shrink-0">
              <TypeIcon className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold leading-tight truncate">{project.name}</p>
              <p className="text-[11px] text-muted-foreground">
                {PROJECT_TYPE_LABELS[project.project_type]}
              </p>
            </div>
          </div>

          {/* Status badge + menu */}
          <div className="flex items-center gap-1.5 shrink-0 relative">
            <span className={cn(
              "text-[10px] font-medium px-2 py-0.5 rounded-full border",
              STATUS_STYLES[project.status]
            )}>
              {STATUS_LABELS[project.status]}
            </span>
            <button
              onClick={() => { setMenuOpen(!menuOpen); setConfirmDelete(false); }}
              className="w-6 h-6 rounded flex items-center justify-center text-muted-foreground hover:bg-secondary transition-colors"
            >
              <MoreVertical className="w-3.5 h-3.5" />
            </button>

            {/* Dropdown */}
            {menuOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => { setMenuOpen(false); setConfirmDelete(false); }} />
                <div className="absolute right-0 top-7 z-20 w-40 bg-card border border-border rounded-lg shadow-lg py-1">
                  <Link
                    href={`/dashboard/projects/${project.id}/edit`}
                    className="flex items-center gap-2 px-3 py-2 text-xs hover:bg-secondary transition-colors"
                    onClick={() => setMenuOpen(false)}
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    Edit project
                  </Link>
                  <button
                    onClick={handleDelete}
                    disabled={deleteProject.isPending}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-50"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    {confirmDelete ? "Tap again to confirm" : "Delete project"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Meta row */}
        <div className="grid grid-cols-2 gap-y-1.5 gap-x-3 mb-4">
          {project.city && (
            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <MapPin className="w-3 h-3 shrink-0" />
              <span className="truncate">{project.city}{project.state ? `, ${project.state}` : ""}</span>
            </div>
          )}
          {project.num_floors && (
            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <Layers className="w-3 h-3 shrink-0" />
              <span>{project.num_floors} {project.num_floors === 1 ? "floor" : "floors"}</span>
            </div>
          )}
          {project.total_area_sqft && (
            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <Maximize2 className="w-3 h-3 shrink-0" />
              <span>{formatArea(Number(project.total_area_sqft))}</span>
            </div>
          )}
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <Calendar className="w-3 h-3 shrink-0" />
            <span>{formatDate(project.created_at)}</span>
          </div>
        </div>

        {/* Finish quality */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <span className={cn("w-2 h-2 rounded-full", QUALITY_DOTS[project.finish_quality])} />
            {FINISH_QUALITY_LABELS[project.finish_quality]} finish
          </div>
          <Link
            href={`/dashboard/projects/${project.id}`}
            className="flex items-center gap-1 text-[11px] text-brand-500 hover:text-brand-600 font-medium transition-colors opacity-0 group-hover:opacity-100"
          >
            Open <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </div>
  );
}
