"use client";

import { useState } from "react";
import Link from "next/link";
import { PlusCircle, Search, SlidersHorizontal } from "lucide-react";
import { useProjects } from "@/hooks/useProjects";
import ProjectCard from "@/components/dashboard/ProjectCard";
import EmptyState from "@/components/dashboard/EmptyState";
import { cn } from "@/lib/utils";

const FILTER_OPTIONS = [
  { value: "all",       label: "All" },
  { value: "draft",     label: "Draft" },
  { value: "estimated", label: "Estimated" },
  { value: "exported",  label: "Exported" },
];

const TYPE_OPTIONS = [
  { value: "all",          label: "All types" },
  { value: "residential",  label: "Residential" },
  { value: "commercial",   label: "Commercial" },
  { value: "industrial",   label: "Industrial" },
  { value: "institutional",label: "Institutional" },
];

function CardSkeleton() {
  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden animate-pulse">
      <div className="h-1 bg-secondary" />
      <div className="p-5 space-y-3">
        <div className="flex gap-2">
          <div className="w-8 h-8 rounded-lg bg-secondary" />
          <div className="space-y-1 flex-1">
            <div className="h-4 w-3/4 bg-secondary rounded" />
            <div className="h-3 w-1/2 bg-secondary rounded" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {[...Array(4)].map((_, i) => <div key={i} className="h-3 bg-secondary rounded" />)}
        </div>
      </div>
    </div>
  );
}

export default function ProjectsPage() {
  const { data, isLoading } = useProjects();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  const projects = data?.projects ?? [];

  const filtered = projects.filter((p) => {
    const matchSearch =
      !search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.city ?? "").toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || p.status === statusFilter;
    const matchType = typeFilter === "all" || p.project_type === typeFilter;
    return matchSearch && matchStatus && matchType;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold">Projects</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {projects.length} project{projects.length !== 1 ? "s" : ""} total
          </p>
        </div>
        <Link
          href="/dashboard/projects/new"
          className="flex items-center gap-2 h-9 px-4 bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold rounded-lg transition-colors"
        >
          <PlusCircle className="w-4 h-4" />
          New Project
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by name or city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-9 pl-9 pr-3 text-sm border border-border rounded-lg bg-card placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
          />
        </div>

        {/* Status filter */}
        <div className="flex gap-1 bg-secondary rounded-lg p-1">
          {FILTER_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setStatusFilter(opt.value)}
              className={cn(
                "h-7 px-3 text-xs font-medium rounded-md transition-all",
                statusFilter === opt.value
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Type filter */}
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="h-9 px-3 text-sm border border-border rounded-lg bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all"
        >
          {TYPE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      ) : filtered.length === 0 && projects.length === 0 ? (
        <EmptyState />
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-sm text-muted-foreground">
          No projects match your filters.
          <button onClick={() => { setSearch(""); setStatusFilter("all"); setTypeFilter("all"); }}
            className="ml-2 text-brand-500 hover:underline">
            Clear filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </div>
  );
}
