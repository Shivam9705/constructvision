"use client";

import Link from "next/link";
import { PlusCircle, ArrowRight, Zap } from "lucide-react";
import { useProjects, useDashboardStats } from "@/hooks/useProjects";
import StatsBar from "@/components/dashboard/StatsBar";
import RecentActivity from "@/components/dashboard/RecentActivity";
import EmptyState from "@/components/dashboard/EmptyState";
import { useSession } from "next-auth/react";

export default function DashboardPage() {
  const { data: session } = useSession();
  const { data: statsData, isLoading: loadingStats } = useDashboardStats();
  const { data: projectsData, isLoading: loadingProjects } = useProjects();

  const projects = projectsData?.projects ?? [];
  const firstName = session?.user?.name?.split(" ")[0] ?? "there";

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold">
            Good {getGreeting()}, {firstName} 👋
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Here's your construction project overview.
          </p>
        </div>
        <Link
          href="/dashboard/projects/new"
          className="flex items-center gap-2 h-9 px-4 bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold rounded-lg transition-colors shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          New Project
        </Link>
      </div>

      {/* Stats */}
      <StatsBar stats={statsData} loading={loadingStats} />

      {/* Content */}
      {!loadingProjects && projects.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
          {/* Recent activity */}
          <div className="xl:col-span-2">
            <RecentActivity projects={projects} />
          </div>

          {/* Quick start panel */}
          <div className="bg-card border border-border rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-semibold">Quick Start</h3>

            <div className="space-y-2">
              <Link
                href="/dashboard/projects/new"
                className="flex items-center justify-between p-3 rounded-lg border border-border hover:border-brand-300 dark:hover:border-brand-700 hover:bg-brand-50/50 dark:hover:bg-brand-950/20 transition-all group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-md bg-brand-100 dark:bg-brand-900/40 flex items-center justify-center">
                    <PlusCircle className="w-3.5 h-3.5 text-brand-500" />
                  </div>
                  <span className="text-xs font-medium">Create new project</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-brand-500 transition-colors" />
              </Link>

              <Link
                href="/dashboard/projects"
                className="flex items-center justify-between p-3 rounded-lg border border-border hover:border-brand-300 dark:hover:border-brand-700 hover:bg-brand-50/50 dark:hover:bg-brand-950/20 transition-all group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-md bg-secondary flex items-center justify-center">
                    <Zap className="w-3.5 h-3.5 text-muted-foreground" />
                  </div>
                  <span className="text-xs font-medium">View all projects</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-brand-500 transition-colors" />
              </Link>
            </div>

            {/* Tip card */}
            <div className="bg-concrete-50 dark:bg-concrete-900/40 rounded-lg p-3.5 border border-concrete-200 dark:border-concrete-800">
              <p className="text-[11px] font-semibold text-concrete-700 dark:text-concrete-300 mb-1">
                💡 Tip
              </p>
              <p className="text-[11px] text-concrete-600 dark:text-concrete-400 leading-relaxed">
                Add your city and state for the most accurate regional rates. Uploading a floor plan
                image enables Gemini Vision analysis.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "morning";
  if (h < 17) return "afternoon";
  return "evening";
}
