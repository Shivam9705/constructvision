"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useProject } from "@/hooks/useProjects";
import ProjectForm from "@/components/projects/ProjectForm";
import { cn } from "@/lib/utils";

function Skeleton({ className }: { className?: string }) {
  return <div className={cn("rounded bg-secondary animate-pulse", className)} />;
}

export default function EditProjectPage() {
  const params    = useParams();
  const projectId = params.id as string;
  const { data: project, isLoading } = useProject(projectId);

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href={`/dashboard/projects/${projectId}`}
          className="text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-display font-bold">Edit Project</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Update project details — changes will affect next AI estimation
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-6">
          {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-20" />)}
        </div>
      ) : !project ? (
        <p className="text-muted-foreground">Project not found.</p>
      ) : (
        <ProjectForm project={project} />
      )}
    </div>
  );
}
