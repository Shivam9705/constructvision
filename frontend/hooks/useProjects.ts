"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { projectsApi } from "@/lib/projects";
import type { CreateProjectPayload } from "@/types";

export const PROJECTS_KEY = ["projects"] as const;
export const STATS_KEY = ["projects", "stats"] as const;

export function useProjects() {
  return useQuery({
    queryKey: PROJECTS_KEY,
    queryFn: () => projectsApi.list().then((r) => r.data),
  });
}

export function useProject(id: string) {
  return useQuery({
    queryKey: ["projects", id],
    queryFn: () => projectsApi.get(id).then((r) => r.data),
    enabled: !!id,
  });
}

export function useDashboardStats() {
  return useQuery({
    queryKey: STATS_KEY,
    queryFn: () => projectsApi.stats().then((r) => r.data),
  });
}

export function useCreateProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateProjectPayload) =>
      projectsApi.create(payload).then((r) => r.data),
    onSuccess: (project) => {
      qc.invalidateQueries({ queryKey: PROJECTS_KEY });
      qc.invalidateQueries({ queryKey: STATS_KEY });
      toast.success(`Project "${project.name}" created!`);
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to create project");
    },
  });
}

export function useUpdateProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<CreateProjectPayload> }) =>
      projectsApi.update(id, payload).then((r) => r.data),
    onSuccess: (project) => {
      qc.invalidateQueries({ queryKey: PROJECTS_KEY });
      qc.invalidateQueries({ queryKey: ["projects", project.id] });
      toast.success("Project updated");
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to update project");
    },
  });
}

export function useDeleteProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => projectsApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: PROJECTS_KEY });
      qc.invalidateQueries({ queryKey: STATS_KEY });
      toast.success("Project deleted");
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to delete project");
    },
  });
}

export function useUploadBlueprint() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, file }: { id: string; file: File }) =>
      projectsApi.uploadBlueprint(id, file).then((r) => r.data),
    onSuccess: (project) => {
      qc.invalidateQueries({ queryKey: ["projects", project.id] });
      toast.success("Blueprint uploaded successfully");
    },
    onError: (err: Error) => {
      toast.error(err.message || "Upload failed");
    },
  });
}
